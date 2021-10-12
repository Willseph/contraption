let api = new API ();
api.handlers.onStatus = handleStatusUpdate;

var $temp;
var $tempError;
var $tempLoading;
var $tempMain;
var $tempDigits;

function CtoF (celsius) {
	return (celsius * 9.0/5.0) + 32;
}

function handleStatusUpdate () {
	BlobSettings.colored = api.status.heating;
	BlobSettings.warning = api.status.temp < 1;

	if (BlobSettings.warning) {
		$tempMain.text (`0`);
		$tempDigits.text (`.00`);
		$temp.hide ();
		$tempError.show ();
		$tempLoading.hide ();
	} else {
		updateTemperature (api.status.temp);
	}
}

function updateTemperature (temp) {
	let c = temp/1000.0;
	let f = CtoF (c);

	var primary = Math.floor (f);
	var secondary = Math.floor ((f - primary) * 100);

	$temp.show ();
	$tempLoading.hide ();
	$tempError.hide ();
	$tempMain.text (`${primary}`);
	$tempDigits.text ('.'+String (secondary).padStart (2, '0'));
}

function main () {
	$temp = jQuery("#temp");
	$tempError = $temp.find ("#temp-error");
	$tempMain = $temp.find ("#temp-main");
	$tempDigits = $temp.find ("#temp-digits");

	$tempLoading = jQuery("#current-temp > .loading");
	$tempLoading.show ();
}

jQuery (document).ready (main);