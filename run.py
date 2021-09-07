#!/usr/bin/python3

from dotenv import dotenv_values
import ds18b20
import json
import os
from outlet import Outlet
import sys


## CONSTS

DEFAULT_PULSE_LENGTH = 150
CONFIG = ".env"
SETTINGS_FILE = "settings.json"
STATUS_FILE = "status.json"

##

## HELPER METHODS

def overwriteFile (path, content):
	"""Writes the content to the path specified, overwriting anything if it exists"""
	if not path:
		print ("Missing path value.")
	try:
		with open (path, "w") as f:
			f.write (content)
	except:
		print ("Error writing file to: %s" % (path))


def updateStatusFile (enabled):
	"""Creates the status json file with the specified status information"""
	status = { "on": (not not enabled) }
	statusText = json.dumps (status)
	print ("Updating status information to file: %s" % statusText)
	overwriteFile (os.path.join (getScriptDir (), STATUS_FILE), statusText)


def loadJsonFromFile (path):
	"""Reads the file at the provided path and returns the JSON-parsed dictionary.
	Returns None if exception occurs."""
	result = None
	try:
		with open (path, "r") as f:
			result = json.load (f)
	except:
		pass
	return result


def CtoF (celsius):
	"""Converts celsius to fahrenheit"""
	return (celsius * 9.0/5.0) + 32


def getScriptDir ():
	"""Returns the directory in which this script resides."""
	return os.path.dirname (os.path.realpath (sys.argv[0]))


def verifyProperty (dict, key):
	if not dict:
		print ("No dict provided when checking for key \"%s\"." % (key))
		fatalError ()
	if not key in dict:
		print ("Missing \"%s\" property in dict." % (key))
		fatalError ()

##

## PRIMARY METHODS

def fatalError (code = 1):
	"""Ends the program in an erroneous state with the provided error code."""
	print ("Fatal error.")
	sys.exit (code)


def getConfig ():
	"""Returns the current environment config."""
	configPath = os.path.join (getScriptDir (), CONFIG)
	print ("Config path: %s" % (configPath))

	config = dotenv_values (configPath)
	if not config:
		print ("Could not load config file.")
		fatalError ()

	# Required properties
	verifyProperty (config, "CODE_ON")
	verifyProperty (config, "CODE_OFF")

	print ("Config: %s" % (json.dumps (config)))
	return config


def getSettings ():
	"""Returns the current user settings."""
	path = os.path.join (getScriptDir (), SETTINGS_FILE)
	settings = loadJsonFromFile (path)
	if not settings:
		print ("Could not load settings file.")
		fatalError ()

	# Required properties
	verifyProperty (settings, "min")
	verifyProperty (settings, "max")

	min = float (settings["min"])
	max = float (settings["max"])

	if min <= 0 or max <= 0:
		print ("Min and max values must be greater than zero.")
		fatalError ()
	if min >= max:
		print ("Max must be grater than min.")
		fatalError ()

	print ("Settings: %s" % (json.dumps (settings)))
	return settings


def toggleOutletByTemperature (outlet, currentF, minF, maxF):
	"""Enables or disables the outlet based on the current temperature and the range provided."""
	if not outlet:
		print ("Outlet manager not provided.")
		fatalError ()
	if currentF >= maxF:
		print ("Temperature is greater than max setting (%s°F)" % (str (maxF)))
		print ("Disabling outlet...")
		outlet.disable ()
		updateStatusFile (False)
	elif currentF < minF:
		print ("Temperature is less than min setting (%s°F)" % (str (minF)))
		print ("Enabling outlet...")
		outlet.enable ()
		updateStatusFile (True)
	else:
		print ("Temperature in range, not changing heater setting.")

##

## MAIN

def main ():
	# Config
	print ("Retrieving config info...")
	config = getConfig ()
	pulseLength = DEFAULT_PULSE_LENGTH
	if "PULSE" in config:
		pulseLength = int (config["PULSE"])
	if pulseLength <= 0:
		pulseLength = DEFAULT_PULSE_LENGTH

	# Settings
	print ("Getting settings from file...")
	settings = getSettings ()

	active = "active" in settings and settings["active"] is True
	forced = "forced" in settings and settings["forced"] is True
	min = float (settings["min"])
	max = float (settings["max"])

	if not active:
		print ("Active setting is not enabled, so cancelling.")
		return
	else:
		print ("Active setting is enabled.")

	# 433 MHz outlet
	outlet = Outlet (config["CODE_ON"], config["CODE_OFF"], pulseLength)
	if not outlet:
		print ("Error setting up 433 MHz outlet.")
		return

	# Forced setting
	if forced:
		print ("Forced setting is enabled, enabling outlet.")
		outlet.enable ()
		updateStatusFile (True)
		return

	# Sensor temp
	print ("Reading temperature from sensor...")
	currentTemp = int (ds18b20.readTemperature ())
	if not currentTemp or currentTemp <= 0:
		print ("Could not read current temperature, check DS18B20 sensor connected to BCM pin 4.")
		return

	celsius = currentTemp / 1000.0
	fahrenheit = CtoF (celsius)
	print ("Current temperature: %s°C / %s°F" % (str (celsius), str (fahrenheit)))

	# Send signals
	toggleOutletByTemperature (outlet, fahrenheit, min, max)

##

if __name__ == "__main__":
	main ()
