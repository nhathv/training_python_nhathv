define([
	'dojo/store/Memory',
	'/static/js/common/stores/Cache.js'
], function(Memory, Cache) {

	return function(store, options) {
		var cachingStore = new Memory({
				idProperty: store.idProperty
			}, options),
			queryCachingStore = new Memory({
				idProperty: 'queryId'
			}, options);

		return Cache(store, cachingStore, queryCachingStore, options);
	};
});
