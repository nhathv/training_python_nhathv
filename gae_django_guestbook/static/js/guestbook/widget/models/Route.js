define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Stateful'
], function(declare, lang, Stateful) {

	var Route = declare(Stateful, {

		screen: null,
		guestbookName: null,
		greetingId: null
	});

	return Route;
});
