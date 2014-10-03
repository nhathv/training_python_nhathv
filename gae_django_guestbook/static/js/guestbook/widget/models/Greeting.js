define([
	'dojo/_base/declare',
	'dojo/Stateful'
], function(declare, Stateful) {

	return declare(Stateful, {
		id: undefined,
		content: null
	});
});
