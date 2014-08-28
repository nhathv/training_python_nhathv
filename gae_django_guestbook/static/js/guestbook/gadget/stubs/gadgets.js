define([
	'dojo/_base/kernel',
	'dojo/text!./gadgets.stub.js'
], function(kernel, srcText) {
	return (function() {
		return eval(srcText + '; this.gadgets;');
	}).call(kernel.global);
});
