class API {
	constructor () {
		let self = this;

		self._statusIntervalDelay = 1000;
		self._statusInterval = setInterval (function () {
			self._pollStatus ()
		}, self._statusIntervalDelay);

		self._settingsIntervalDelay = 1000;
		self._settingsInterval = setInterval (function () {
			self._pollSettings ()
		}, self._settingsIntervalDelay);

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
		self._apiPost ("settings", settings, function (r) {
			if (r.success && r.settings) {
				self._pollStatus ();
				self.settings = r.settings;
				if (self.handlers.onSettings) self.handlers.onSettings (r.settings);
			}
		}, error);
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
