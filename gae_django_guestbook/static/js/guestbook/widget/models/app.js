define([
	'dojo/_base/declare',
	'dojo/Stateful'
], function(declare, Stateful) {
	var app = declare(Stateful, {
		route: null
	});

	var instance;

	app.getDefaultInstance = function() {
		if (!instance) {
			instance = new app();
		}
		return instance;
	};

	return app.getDefaultInstance();
});