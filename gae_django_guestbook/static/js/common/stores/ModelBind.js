define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/Deferred',
	'dojo/store/util/QueryResults',
	'/static/js/common/support/dojox/mvc/getStateful.js'
], function(lang, array, Deferred, QueryResults, getStateful) {

	return function(store, modelClass) {

		return lang.delegate(store, {
			query: function(query, directives) {
				var results = store.query(query, directives);
				results = Deferred.when(results, lang.hitch(this, function(objects) {
					var arrayModel = getStateful([]);
					array.forEach(objects, function(object) {
						arrayModel.push(this.newModel(object));
					}, this);
					return arrayModel;
				}));
				return QueryResults(results);
			},

			get: function(id, directives) {
				var result = store.get(id, directives);
				return Deferred.when(result, lang.hitch(this, function(object) {
					return this.newModel(object);
				}));
			},

			add: function(object, directives) {
				if (object.toPlainObject) {
					object = object.toPlainObject();
				}
				return store.add(object, directives);
			},

			put: function(object, directives) {
				if (object.toPlainObject) {
					object = object.toPlainObject();
				}
				return store.put(object, directives);
			},

			newModel: function(args) {
				var model = new modelClass(args);
				model.store = store;
				return model;
			}
		});
	};
});
