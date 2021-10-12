let MIN_GAP = 0.5;
let DELTA = 0.5;

let api = new API ();
api.handlers.onStatus = handleStatusUpdate;
api.handlers.onSettings = handleSettingsUpdate;

var $temp;
var $tempError;
var $tempLoading;
var $tempMain;
var $tempDigits;
var $tempMin;
var $tempMax;

var $minDecBtn;
var $minIncBtn;
var $maxDecBtn;
var $maxIncBtn;

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

function handleSettingsUpdate () {
	$tempMin.text (`${api.settings.min}°`);
	$tempMax.text (`${api.settings.max}°`);
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

function minDecrement () { bumpMin (-DELTA); }
function minIncrement () { bumpMin (DELTA); }
function maxDecrement () { bumpMax (-DELTA); }
function maxIncrement () { bumpMax (DELTA); }

function bumpMin (delta) {
	if (!api.settings || api.updating) return;
	min = api.settings.min + delta;
	max = api.settings.max;
	if (max - min < MIN_GAP) max = min + MIN_GAP;

	var update = {min: min, max: max};
	api.updateSettings (update);
	$tempMin.text ("");
	$tempMax.text ("");
}

function bumpMax (delta) {
	if (!api.settings || api.updating) return;
	max = api.settings.max + delta;
	min = api.settings.min;
	if (max - min < MIN_GAP) min = max - MIN_GAP;

	var update = {min: min, max: max};
	api.updateSettings (update);
	$tempMin.text ("");
	$tempMax.text ("");
}

function main () {
	$temp = jQuery("#temp");
	$tempError = $temp.find ("#temp-error");
	$tempMain = $temp.find ("#temp-main");
	$tempDigits = $temp.find ("#temp-digits");
	$tempMin = jQuery ("#temp-min");
	$tempMax = jQuery ("#temp-max");

	$minDecBtn = jQuery ("#temp-min-dec-btn");
	$minDecBtn.click (minDecrement);
	$minIncBtn = jQuery ("#temp-min-inc-btn");
	$minIncBtn.click (minIncrement);
	$maxDecBtn = jQuery ("#temp-max-dec-btn");
	$maxDecBtn.click (maxDecrement);
	$maxIncBtn = jQuery ("#temp-max-inc-btn");
	$maxIncBtn.click (maxIncrement);

	$tempLoading = jQuery("#current-temp > .loading");
	$tempLoading.show ();
}

jQuery (document).ready (main);