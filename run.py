#!/usr/bin/python3

from dotenv import dotenv_values
import ds18b20
import json
import os
from outlet import Outlet


CONFIG = ".env"
SETTINGS_FILE = "settings.json"
STATUS_FILE = "status.json"


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
	overwriteFile (STATUS_FILE, statusText)


def getTempSettings ():
	"""Reads the current settings json file"""
	try:
		with open(SETTINGS_FILE) as f:
			return json.load(f)
	except:
		pass
	return None


def CtoF (celsius):
	"""Converts celsius to fahrenheit"""
	return (celsius * 9.0/5.0) + 32


def main ():
	print ("Retrieving config info...")
	config = dotenv_values (CONFIG)
	if not config:
		print ("Could not load config file.")
		return

	print ("Reading temperature from sensor...")
	currentTemp = int (ds18b20.readTemperature ())
	if not currentTemp or currentTemp <= 0:
		print ("Could not read current temperature, check DS18B20 sensor connected to BCM pin 4.")
		return

	celsius = currentTemp / 1000.0
	fahrenheit = CtoF (celsius)
	print ("Current temperature: %s°C / %s°F" % (str (celsius), str (fahrenheit)))

	print ("Getting settings from file...")
	settings = getTempSettings ()
	if not settings:
		print ("Could not load settings from file.")
		return

	if not "max" in settings:
		print ("Settings file missing maximum temp property.")
		return
	if not "min" in settings:
		print ("Settings file missing minimum temp property.")
		return

	max = int(settings["max"])
	min = int(settings["min"])
	print ("Settings: %s" % (json.dumps (settings)))

	if not "CODE_ON" in config:
		print ("Missing CODE_ON property in configuration file.")
		return
	if not "CODE_OFF" in config:
		print ("Missing CODE_OFF property in configuration file.")
		return
	if not "PULSE" in config:
		print ("Missing PULSE property in configuration file.")
		return

	outlet = Outlet (config["CODE_ON"], config["CODE_OFF"], config["PULSE"])
	if not outlet:
		print ("Error setting up 433 MHz outlet.")
		return

	if fahrenheit >= max:
		print ("Temperature is greater than max setting (%s°F)" % (str (max)))
		outlet.disable ()
	elif fahrenheit < min:
		print ("Temperature is less than min setting (%s°F)" % (str (min)))
		outlet.enable ()
	else:
		print ("Temperature in range, not changing heater setting.")


if __name__ == "__main__":
	main ()
