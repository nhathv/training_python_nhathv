define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/Deferred',
	"dojo/store/JsonRest",
	"dojo/cookie",
	"dojo/json",
	'dojo/store/util/QueryResults',
	'/static/js/common/stores/MemoryCache.js',
	'/static/js/common/stores/ModelBind.js',
	'/static/js/guestbook/widget/models/Greeting.js'
], function(declare, lang, array, Deferred, JsonRest, _cookie, json,
			QueryResults, MemoryCache, ModelBind, Greeting) {

	var GreetingStore = declare(JsonRest, {
		target: "/api/guestbook/default_guestbook/greeting/",
		headers: {
			"X-CSRFToken": _cookie('csrftoken')
		},
		guestbookName: "",
		itemsProperty: 'items',


		query: function(query, options) {
			if (query && query.guestbook_name && this.guestbookName != query.guestbook_name){
				console.log('guestbookName changed');
				this.guestbookName = query.guestbook_name;
				var url = "/api/guestbook/" + this.guestbookName + "/greeting/";
				this.target = url;
			}
			var newArgs = this._beforeQuery(query, options),
				results = this._addCallbacks(this.inherited(arguments, newArgs), newArgs[1])
					.then(lang.hitch(this, '_afterQuery'));
			return QueryResults(results);
		},

		_beforeQuery: function(query, options) {
			if (options) {
				query = query || {};
				query.cursor = query.cursor || options.start;
				query.limit = query.limit || options.count;
				delete options.cursor;
				delete options.limit;
			}
			return [query, options];
		},

		_afterQuery: function(response) {
			var queryData = {};
			for (var key in response) {
				if (key !== this.itemsProperty && response.hasOwnProperty(key)) {
					queryData[key] = response[key];
				}
			}
			// FIXME Ugly
			return array.map(response[this.itemsProperty], function(item) {
				item.queryData = queryData;
				return item;
			}, this);
		},

		_addCallbacks: function(d) {
			d.then(null, function(res) {
				if (res.responseText && res.responseText[0] == '{') {
					try {
						res.error = json.parse(res.responseText);
					} catch (e) {
					}
				}
			});
			return d;
		}
	});

	var instance;

	GreetingStore.getDefaultInstance = function() {
		if (!instance) {
			instance = ModelBind(MemoryCache(new GreetingStore({})), Greeting);
		}
		return instance;
	};

	return GreetingStore;
});
