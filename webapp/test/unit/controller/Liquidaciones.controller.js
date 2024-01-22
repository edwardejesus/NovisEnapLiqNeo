/*global QUnit*/

sap.ui.define([
	"liqhrenapcl/zhr_liquidaciones/controller/Liquidaciones.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Liquidaciones Controller");

	QUnit.test("I should test the Liquidaciones controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
