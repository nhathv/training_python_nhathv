define([
	'dojo/_base/declare',
	'dojo/_base/window',
	'dojo/_base/config',
	'dojo/dom-class',
	'../widget/GuestbookWidget'
], function(declare, win, config, domClass, GuestbookWidget) {
	return function() {
		gadgets.util.registerOnLoadHandler(function() {
			var view = new GuestbookWidget(),
				body = win.body();
			domClass.add(body, 'bank ' + 'jp');
			view.placeAt(body);
			view.startup();
		});
	};
});
