#!/usr/bin/python3

from dotenv import dotenv_values
import json
import os
import subprocess
import sys
import time


## CONSTS

CONFIG = ".env"
SCRIPT = "run.py"


## METHODS

def getScriptDir ():
	"""Returns the directory in which this script resides."""
	return os.path.dirname (os.path.realpath (sys.argv[0]))


def verifyProperty (dict, key):
	if not dict:
		print ("No dict provided when checking for key \"%s\"." % (key))
		return False
	if not key in dict:
		print ("Missing \"%s\" property in dict." % (key))
		return False
	return True


def getConfig ():
	"""Returns the current environment config."""
	configPath = os.path.join (getScriptDir (), CONFIG)
	print ("Config path: %s" % (configPath))

	config = dotenv_values (configPath)
	if not config:
		print ("Could not load config file.")
		return None

	# Required properties
	if not verifyProperty (config, "DELAY"):
		return None

	print ("Config: %s" % (json.dumps (config)))
	return config


def runScript ():
	script = os.path.join (getScriptDir (), SCRIPT)
	subprocess.call (script, shell=True)


## MAIN

def main ():
	# Config
	print ("Retrieving config info...")
	config = getConfig ()
	if not config:
		print ("Could not load config file.")
		sys.exit (1)

	delay = int (config["DELAY"])
	if not delay or delay <= 0:
		print ("Invalid delay interval.")
		sys.exit (1)

	print ()
	print ("Beginning loop...")

	
	try:
		while True:
			print ()
			runScript ()
			time.sleep (delay)

	except KeyboardInterrupt:
		print ()
		print ("Exiting.")
		sys.exit (0)

	except Exception as ex:
		print ("Error: %s" % (ex))

##

if __name__ == "__main__":
	main ()
