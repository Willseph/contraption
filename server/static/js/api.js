class API {
	constructor () {
		let self = this;

		self.updating = false;
		self._statusIntervalDelay = 1000;
		self._settingsIntervalDelay = 1000;
		self._resetIntervals ();

		self.handlers = {
			onStatus: function (s) {},
			onSettings: function (s) {}
		};
	}

	getStatus (success, error) {
		let self = this;
		self._apiGet ("status", success, error);
	}

	getSettings (success, error) {
		let self = this;
		self._apiGet ("settings", success, error);
	}

	updateSettings (settings, success, error) {
		let self = this;

		if (self.updating) return;
		self.updating = true;
		self._clearIntervals ();

		self._apiPost ("settings", settings, function (r) {
			self.updating = false;
			self._resetIntervals ();
			if (r.success && r.settings) {
				self._pollStatus ();
				self.settings = r.settings;
				if (self.handlers.onSettings) self.handlers.onSettings (r.settings);
			}
		}, function (e) {
			self.updating = false;
			self._resetIntervals ();
			error (e);
		});
	}

	_clearIntervals () {
		let self = this;
		if (self._statusInterval) clearInterval (self._statusInterval);
		if (self._settingsInterval) clearInterval (self._settingsInterval);
	}

	_resetIntervals () {
		let self = this;
		self._clearIntervals ();

		self._settingsInterval = setInterval (function () {
			self._pollSettings ()
		}, self._settingsIntervalDelay);

		self._statusInterval = setInterval (function () {
			self._pollStatus ()
		}, self._statusIntervalDelay);
	}

	_pollStatus () {
		let self = this;
		self.getStatus (function (r) {
			if (r.status) {
				self.status = r.status;
				if (self.handlers.onStatus) self.handlers.onStatus (r.status);
			} else {
				self.status = null;
				self._handleError ("Could not get status info.");
			}
		}, self._handleError);
	}

	_pollSettings () {
		let self = this;
		self.getSettings (function (r) {
			if (r.settings) {
				self.settings = r.settings;
				if (self.handlers.onSettings) self.handlers.onSettings (r.settings);
			} else {
				self.settings = null;
				self._handleError ("Could not get settings.");
			}
		}, self._handleError);
	}

	_handleError (error) {
		console.error (error);
	}

	_apiGet (route, success, error) {
		let self = this;
		self._apiCall (route, "GET", {}, success, error);
	}

	_apiPost (route, data, success, error) {
		let self = this;
		self._apiCall (route, "POST", data, success, error);
	}

	_apiCall (route, method, data, success, error) {
		jQuery.ajax (this._getApiUrl (route), {
			type: method,
			data: JSON.stringify(data),
			success: function (d) {
				if (d && d.success) success (d);
				else error ("Could not get response.");
			},
			error: function (d) {
				if (d && d.error) error (d.error);
				else error ("Could not get response.");
			},
			dataType: "json",
			contentType: 'application/json',
			processData: false
		});
	}

	_getApiUrl (route) {
		return `/v1/${route}`;
	}
}
