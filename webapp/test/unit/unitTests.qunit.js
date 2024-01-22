/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"liqhrenapcl/zhr_liquidaciones/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
