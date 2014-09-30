define([
	'dojo/_base/declare',
	'/static/js/common/support/dojo/Stateful.js'
], function(declare, Stateful) {

	return declare(Stateful, {
		id: undefined,
		content: null
	});
});
