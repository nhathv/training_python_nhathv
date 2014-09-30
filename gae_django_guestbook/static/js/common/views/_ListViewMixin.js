define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/window',
	'dojo/_base/Deferred',
	'dojo/on',
	'dojo/dom',
	'dojo/dom-class',
	'dojo/dom-construct',
	'dojo/dom-geometry',
	'dojo/query',
	'dojo/NodeList-manipulate',
	'dijit/registry',
	'/static/js/common/models/QueryData.js'
], function(declare, lang, array, win, Deferred, on, dom, domClass, domConstruct,
		domGeometry, query, NodeList_manipulate, registry, QueryData) {

	return declare(null, {
		// autoLoad: Boolean
		//	If true, then items are loaded when the view is constructed.
		autoLoad: false,

		// autoPaging: Number
		//	When the remain of scrollable height is lesser than the number, next items are loaded automatically.
		autoPaging: 0,

		// pagingOption: Object
		//	Options to be passed to Store#query for next page loading.
		pagingOption: null,

		// initialDisplayNode: DomNode
		//	Display when items were empty.
		initialDisplayNode : null,

		// emptyClass: String
		//	ClassName added to the root domNode when items were empty.
		emptyClass: 'noItems',

		countNode: null,
		scrollNode: null,

		totalItems: null,
		lastItems: null,
		_didScroll: null,
		_pagingHandle: null,

		postCreate: function() {
			var w;
			this.inherited(arguments);

			if (!this.scrollNode) {
				this.scrollNode = this.containerNode;
			} else if (typeof this.scrollNode === 'string') {
				// retrieves a dom from id
				w = registry.byId(this.scrollNode);
				this.scrollNode = w ? w.domNode : dom.byId(this.scrollNode);
			}

			this.watch('lastItems', lang.hitch(this, function(name, oldValue, value) {
				this.render(value);
			}));

			this.watch('totalItems', lang.hitch(this, function(name, oldValue, total) {
				this.renderCount(total);
			}));

			if (this.autoLoad) {
				this.loadItems();
			}

			if (this.autoPaging) {
				this.paging();
			}
		},

		destroy: function() {
			clearInterval(this._pagingHandle);
			this.inherited(arguments);
		},

		loadItems: function(options) {
			console.log("loadItems");
			var forceNew = options && options.forceNew;

			return Deferred.when(this.fetchItems(options), lang.hitch(this, function(items) {
				var item, queryData, totalItems;
				if (items.length) {
					// FIXME: Ugly (See also: _StoreBase)
					item = items[0];
					queryData = item.get('queryData');
					if (queryData) {
						queryData = new QueryData(queryData);
						this.set('pagingOption', queryData.getNextQueryOption());
						totalItems = queryData.get('totalItems');
					}
				}

				if (forceNew) {
					this.destroyDescendants();
				}

				this.set('totalItems', totalItems || 0);
				this.set('lastItems', items);
			}));
		},

		render: function(items) {
			var df = win.doc.createDocumentFragment(),
				views = [],
				hasChildren;

			array.forEach(items, function(item) {
				var view = this.getItemView(item);
				if (view) {
					views.push(view);
					domConstruct.place(view.domNode, df);
				}
			}, this);

			domConstruct.place(df, this.containerNode);
			array.forEach(views, function(view) {
				view.startup();
				if (view.resize) {
					view.resize();
				}
			}, this);

			if (this.emptyClass || this.initialDisplayNode) {
				hasChildren = !!this.getChildren().length;
				if (this.initialDisplayNode) {
					domClass.toggle(this.initialDisplayNode, 'dijitHidden', hasChildren);
				}
				if (this.emptyClass) {
					domClass.toggle(this.domNode, this.emptyClass, !hasChildren);
				}
			}
		},

		renderCount: function(count) {
			if (this.countNode) {
				query(this.countNode).text(count);
			}
		},

		paging: function() {
			console.log("paging");
			this.connect(this.scrollNode, 'onscroll', function() {
				this._didScroll = true;
			});

			this._pagingHandle = setInterval(lang.hitch(this, function() {
				if (!this._didScroll || !this.pagingOption) return;
				this._didScroll = false;

				if (this.shouldLoadNextPage()) {
					var pagingOption = lang.clone(this.pagingOption);
					this.set('pagingOption', null);
					Deferred.when(this.loadItems(pagingOption), lang.hitch(this, function(items) {
						// the case for when a scrollbar is not shown.
						this._didScroll = true;
					}));
				}
			}), 500);

			// to check whether we can load the next page right now.
			this._didScroll = true;
		},

		shouldLoadNextPage: function() {
			// Called from paging() and return whether or not to load next page now
			var scrollNode = this.scrollNode,
				position = domGeometry.position(scrollNode),
				remain;
			if (!position.h) {
				// scrollNode is probably hidden; Prevent wasteful loads
				return false;
			}
			remain = scrollNode.scrollHeight - scrollNode.scrollTop - position.h;
			return remain < this.autoPaging;
		},

		fetchItems: function(options) {
			// summary:
			//		Abstract methods that must be defined externally.
			// returns:
			//		items or Deferred
		},

		getItemView: function(item) {
			// Abstract methods that must be defined externally.
		},

		clearItems: function() {
			this.destroyDescendants();
			this.set('pagingOption', null);
		}
	});
});
