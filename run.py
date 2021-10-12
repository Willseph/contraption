#!/usr/bin/python3

from dotenv import dotenv_values
import ds18b20
import json
import os
from outlet import Outlet
import sys
import time
from tinydb import TinyDB


## CONSTS

DEFAULT_PULSE_LENGTH = 150
CONFIG = ".env"
SETTINGS_FILE = "settings.json"
STATUS_FILE = "status.json"

##

## HELPER METHODS

def dbSettings ():
	return TinyDB (os.path.join (getScriptDir (), SETTINGS_FILE))

def dbStatus ():
	return TinyDB (os.path.join (getScriptDir (), STATUS_FILE))

def writeToDB (db, content):
	"""Writes the content to the TinyDB specified, overwriting anything if it exists"""
	if not db:
		print ("Missing DB.")
	try:
		db.truncate ()
		db.insert (content)
	except:
		print ("Error writing info to DB.")


def updateStatus (enabled):
	"""Creates the status json file with the specified status information"""
	status = { "heating": (not not enabled), "temp": currentTemp, "updated": int (time.time ()) }
	statusText = json.dumps (status)
	print ("Updating status information to DB: %s" % statusText)
	writeToDB (dbStatus (), status)


def loadJsonFromDB (db):
	"""Reads the file at the provided path and returns the JSON-parsed dictionary.
	Returns None if exception occurs."""
	result = None
	try:
		result = db.all ()[0]
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
	print ("Fatal error, disabling outlet.")
	toggleOutlet (False)
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
	settings = loadJsonFromDB (dbSettings ())
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


def getCurrentStatus ():
	return loadJsonFromDB (dbStatus ())


def toggleOutletByTemperature (currentF, minF, maxF):
	"""Enables or disables the outlet based on the current temperature and the range provided."""
	if not outlet:
		print ("Outlet manager not provided.")
		fatalError ()
	if currentF >= maxF:
		print ("Temperature is greater than max setting (%s°F)" % (str (maxF)))
		toggleOutlet (False)
	elif currentF < minF:
		print ("Temperature is less than min setting (%s°F)" % (str (minF)))
		toggleOutlet (True)
	else:
		print ("Temperature in range, not changing heater setting.")
		currentStatus = getCurrentStatus ()
		if currentStatus and "heating" in currentStatus:
			updateStatus (currentStatus["heating"])


def toggleOutlet (enabled):
	if outlet:
		if enabled:
			print ("Enabling outlet...")
			outlet.enable ()
			updateStatus (True)
		else:
			print ("Disabling outlet...")
			outlet.disable ()
			updateStatus (False)


def checkSettingsAndToggleAppropriately ():
	# Settings
	print ("Getting settings from file...")
	settings = getSettings ()

	active = "active" in settings and settings["active"] is True
	forced = "forced" in settings and settings["forced"] is True
	min = float (settings["min"])
	max = float (settings["max"])

	# Sensor temp
	print ("Reading temperature from sensor...")
	global currentTemp
	currentTemp = 0
	try:
		currentTemp = int (ds18b20.readTemperature ())
	except Exception as ex:
		print ("Error occurred getting temperature: %s" % (ex))

	# Active setting
	if not active:
		print ("Active setting is not enabled, so cancelling.")
		toggleOutlet (False)
		return
	else:
		print ("Active setting is enabled.")

	# Forced setting
	if forced:
		print ("Forced setting is enabled.")
		toggleOutlet (True)
		return

	# If there was an issue getting the current temperature, exit now.
	if not currentTemp or currentTemp <= 0:
		print ("Could not read current temperature, check DS18B20 sensor connected to BCM pin 4.")
		fatalError ()

	# Convert temperature to Fahrenheit
	celsius = currentTemp / 1000.0
	fahrenheit = CtoF (celsius)
	print ("Current temperature: %s°C / %s°F" % (str (celsius), str (fahrenheit)))

	# Send signals
	toggleOutletByTemperature (fahrenheit, min, max)

##

## MAIN

config = None
outlet = None
currentTemp = 0

def main ():
	# Config
	global config
	print ("Retrieving config info...")
	config = getConfig ()

	if "PULSE" in config:
		pulseLength = int (config["PULSE"])
	if pulseLength <= 0:
		pulseLength = DEFAULT_PULSE_LENGTH

	# 433 MHz outlet
	global outlet
	outlet = Outlet (config["CODE_ON"], config["CODE_OFF"], pulseLength)
	if not outlet:
		print ("Error setting up 433 MHz outlet.")
		return

	try:
		checkSettingsAndToggleAppropriately ()
	except Exception as ex:
		print ("Exception occurred: %s" % (ex))
		fatalError ()

##

if __name__ == "__main__":
	main ()
