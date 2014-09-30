define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/url',
	'dojo/io-query',
	'/static/js/common/support/dojo/Stateful.js'
], function(declare, lang, url, ioQuery, Stateful) {

	return declare(Stateful, {

		cursor: null,
		hasNext: false,
		hasPrev: false,
		limit: 20,
		nextLink: null,
		prevLink: null,
		selfLink: null,
		totalItems: null,

		getNextQueryOption: function() {
			var nextLink = this.get('nextLink');
			if (!nextLink) return;

			var query = ioQuery.queryToObject(new url(nextLink).query);
			return {
				start: query.cursor,
				count: query.limit
			};
		}
	});
});
