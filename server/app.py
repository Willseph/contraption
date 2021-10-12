#!/usr/bin/python3

from flask import Flask, Response, request, render_template
import json
import os
import subprocess
from tinydb import TinyDB



### CONSTS

SCRIPT = os.path.join ("..", "run.py")
SETTINGS_FILE = os.path.join ("..", "settings.json")
STATUS_FILE = os.path.join ("..", "status.json")
MIN_DIFF = 0.5

app = Flask(__name__)



### HELPERS

def dbSettings ():
	return TinyDB (SETTINGS_FILE)

def dbStatus ():
	return TinyDB (STATUS_FILE)

def ensureTempGap (settings):
	if "min" in settings and "max" in settings:
		if settings["max"] < settings["min"]+MIN_DIFF:
			raise ValueError ("Insufficient gap between minimum and maximum temperatures.")

def jsonResponse (response, status=200):
	response["success"] = True
	return Response (json.dumps (response), status=status, mimetype="application/json")

def jsonError (message, code=None, status=400):
	response = {"error": str (message), "success": False}
	if code:
		response["code"] = code
	return Response (json.dumps (response), status=status, mimetype="application/json")

def defaultSettings ():
	return { "active":False, "forced":False, "min":68, "max":72 }

def defaultStatus ():
	return { "heating":False, "temp":0 }

def getSettingsOrDefault ():
	settings = defaultSettings ()
	try:
		settings = dbSettings ().all ()[0]
	except:
		pass
	return settings

def getStatusOrDefault ():
	status = defaultStatus ()
	try:
		status = dbStatus ().all ()[0]
	except:
		pass
	return status

def overwriteSettings (newSettings):
	settings = getSettingsOrDefault ()
	for k, v in newSettings.items ():
		if k in settings:
			settings[k] = v
	ensureTempGap (settings)
	db = dbSettings ()
	db.truncate ()
	db.insert (settings)



### ROUTES

# GET /v1/settings
@app.route ("/v1/settings", methods = ["GET"])
def api_settings_get ():
	try:
		settings = getSettingsOrDefault ()
		return jsonResponse ({"settings":settings})
	except Exception as ex:
		return jsonError (ex, status=500)


# POST/PUT /v1/settings
@app.route ("/v1/settings", methods = ["POST", "PUT"])
def api_settings_update ():
	try:
		body = request.json
		if not body:
			return jsonError ("No settings body provided in request.")
		overwriteSettings (body)
		subprocess.call (SCRIPT, shell=True)
		return api_settings_get ()
	except Exception as ex:
		return jsonError (ex, status=500)


# GET /v1/status
@app.route ("/v1/status", methods = ["GET"])
def api_status_get ():
	try:
		status = getStatusOrDefault ()
		return jsonResponse ({"status":status})
	except Exception as ex:
		return jsonError (ex, status=500)



### INDEX

@app.route ("/")
def index ():
	return render_template ("index.html")

if __name__ == "__main__":
	app.run ()
