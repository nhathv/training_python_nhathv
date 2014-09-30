define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/Deferred',
	'dojo/io-query',
	'dojo/store/Cache',
	'dojo/store/util/QueryResults'
],function(lang, array, Deferred, ioQuery, Cache, QueryResults) {

	return function(masterStore, cachingStore, queryCachingStore, options) {
		// summary:
		//		The Cache store wrapper takes a master store and two caching stores,
		//		doesn't only cache results of `get` but also does results of `query`.
		// masterStore:
		//		This is the authoritative store, all uncached requests or non-safe requests will
		//		be made against this store.
		// cachingStore:
		//		This is the caching store for `get` results.
		// queryCachingStore:
		//		This is the caching store for `query` results.
		// options:
		//		These are additional options for how caching is handled.
		//		Cached data are ignored when `forceNew` is true.
		var store = Cache(masterStore, cachingStore, options);

		return lang.delegate(store, {
			get: function(id, directives) {
				directives = directives || {};
				if (directives.forceNew) store.evict(id);
				return store.get(id, directives);
			},

			query: function(query, directives) {
				directives = directives || {};

				var queryId = this.queryId(query, directives),
					results;

				if (directives.forceNew) {
					queryCachingStore.remove(queryId);
				}

				results = Deferred.when(queryCachingStore.get(queryId), function(results) {
					return results || Deferred.when(store.query(query, directives), function(results) {
						if (results) {
							queryCachingStore.put(results, {id: queryId});
						}
						return results;
					});
				});
				return QueryResults(results);
			},

			queryOptionProps: ['start', 'count', 'sort'],

			queryId: function(query, directives) {
				query = query || {};
				directives = directives || {};

				var _directives = {};
				array.forEach(this.queryOptionProps, function(prop) {
					var opt = directives[prop];
					if (typeof opt !== 'undefined' && opt !== null) {
						_directives[prop] = directives[prop];
					}
				});

				var queryString = ioQuery.objectToQuery(this.sortObjectByKey(query)),
					directivesString = ioQuery.objectToQuery(this.sortObjectByKey(_directives));

				return [queryString, directivesString].join(':');
			},

			sortObjectByKey: function(obj) {
				var keys = [],
					o = {},
					k;
		
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						keys.push(k);
					}
				}
		
				dojo.forEach(keys.sort(), function(k) {
					o[k] = obj[k];
				});
		
				return o;
			}
		});
	};
});
