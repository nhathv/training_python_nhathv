define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/request",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/_base/array",
	"dojo/router",
	"dojo/hash",
	"dojo/topic",
	"dojo/keys",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	'dijit/_Container',
	"/static/js/guestbook/widget/GreetingWidget.js",
	"/static/js/guestbook/widget/SignFormWidget.js",
	"/static/js/guestbook/widget/models/GreetingStore.js",
	"dojo/text!./templates/GuestbookWidget.html",
	"/static/js/common/views/_ListViewMixin.js",
	"/static/js/guestbook/widget/models/GreetingStoreSingleton.js",
	"/static/js/guestbook/widget/models/app.js",
	// read only
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane"
], function(declare, lang, request, on, dom, domAttr, domConstruct,
			domStyle, arrayUtil, router, hash, topic, keys,
			_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container,
			GreetingWidget, SignFormWidget, GreetingStore, template,
			_ListViewMixin, GreetingStoreSingleton, appModel){
	return declare("guestbook.GuestbookWidget",
		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, _ListViewMixin], {
		// Our template - important!
		templateString: template,
		widgetsInTemplate: true,
		autoLoadData: true,

		// Defaut value
		guestbookName: "default_guestbook",
		// store the last requested page so we do not make multiple requests for the same content
		lastPage: "list",
		autoPaging: 50,// distance of scroll and last item in showing list
		itemPerPage: 10,
		store: GreetingStoreSingleton.getDefaultInstance(),
		showedItems: 0,
		
		model: appModel,

		autoPaging: 20,
		store: GreetingStoreSingleton.getDefaultInstance(),

		postCreate: function () {
			this.inherited(arguments);

			this.GreetingStore = new GreetingStore();
			var thisObj = this;

			// handle event
			this.own(
				on(this.switchButtonNode, "click", lang.hitch(this, "_onclickSwitchBtn")),
				on(dom.byId("menu"), "a:click", function(event){
					// prevent loading a new page - we're doing a single page app
					event.preventDefault();
					var page = domAttr.get(this, "href");
					hash(page);
				}),
				// set up ENTER keyhandling for the search keyword input field
				on(this.searchInputNode, "keydown", function(event){
					if(event.keyCode === keys.ENTER){
						event.preventDefault();
						thisObj.doSearch();
					}
				}),
				// set up click handling for the search button
				on(this.searchButtonNode, "click", lang.hitch(this, "doSearch"))
			);
			topic.subscribe("/dojo/hashchange", function(newHash){
				hash(newHash);
			});
			hash(location.hash || this.lastPage, true); // set the default page hash

			if (this.autoLoadData){
				// load data
				this._showListGreeting(this.guestbookName);
			}
			this._showSignGreetingForm();

			this.model.watch('route', function(name, oldValue, value) {
				thisObj.renderScreen(value);
			});

			this.watch('showedItems', lang.hitch(this, function(name, oldValue, value) {
				if (oldValue != value){
					thisObj.updateShowedItems(value);
				}
			}));
		},

		renderScreen: function(value){
			switch (value.screen){
				case 'list':
					this.showList();
					break;
				case 'sign':
					this.showSign();
					break;
				case 'post':
					this.showGreeting(value);
					break;
				default :
					this.showList();
					break;
			}
		},

		showList: function(){
			var greetingsContainerNode = dom.byId("greetingsContainerNodeId");
			domStyle.set(greetingsContainerNode, 'display', 'block');

			var greetingDetailNode = dom.byId("greetingDetailNodeId");
			domStyle.set(greetingDetailNode, 'display', 'none');

			var signFormContainerNode = dom.byId("signFormContainerNodeId");
			domStyle.set(signFormContainerNode, 'display', 'none');
		},

		showSign: function(){
			var greetingsContainerNode = dom.byId("greetingsContainerNodeId");
			domStyle.set(greetingsContainerNode, 'display', 'none');

			var greetingDetailNode = dom.byId("greetingDetailNodeId");
			domStyle.set(greetingDetailNode, 'display', 'none');

			var signFormContainerNode = dom.byId("signFormContainerNodeId");
			domStyle.set(signFormContainerNode, 'display', 'block');
		},

		showGreeting: function(greeting){
			this._loadGreetingById(greeting.guestbookName, greeting.greetingId);
		},

		_showSignGreetingForm: function(){
			this.signFormWidget = new SignFormWidget({GuestbookWidgetParent:this});
			this.signFormWidget.placeAt(this.signFormContainerNode);
			this.signFormWidget.startup();
		},

		fetchItems: function(options) {
			console.log("fetchItems");
			return this.store.query({
				guestbook_name: this.guestbookName,
				limit: this.itemPerPage,
				contentFilter: this.searchInputNode.value
			}, options);
		},

		getItemView: function(greeting) {
			var _isAdmin = "false";
			var isUserAdminNode = dom.byId("is_user_admin");
			if (isUserAdminNode){
				_isAdmin = isUserAdminNode.value;
			}

			var _userLogin = "false";
			var userLoginNode = dom.byId("user_login");
			if (userLoginNode){
				_userLogin = userLoginNode.value;
			}

			var _guestbookWidgetParent = this;
			var data = {
				id_greeting: greeting.get('id_greeting'),
				content: greeting.get('content'),
				date: greeting.get('date')
			}
			var greetingWidget = new GreetingWidget(data);
			// show button delete for admin
			if (_isAdmin.toLowerCase() == "true"){
				greetingWidget.setHiddenDeleteNode(false);
				greetingWidget.setDisabledEditor(false);
			}
			// show button edit if author written
			if (_userLogin == greeting.author){
				greetingWidget.setDisabledEditor(false);
			}
			// set guestbook name
			greetingWidget.setGuestbookName(this.guestbookName);
			greetingWidget.setGuestbookParent(_guestbookWidgetParent);

			return greetingWidget;
		},

		render: function(items) {
			this.inherited(arguments);
			var showedItems = this.get('showedItems', 0);
			this.set('showedItems', showedItems + items.length);
		},

		updateShowedItems: function(count){
			if (this.showedItemsNode) {
				this.showedItemsNode.textContent = count;
			}
		},

		_showListGreeting: function(guestbookName){
			this.guestbookName = guestbookName;
			this.loadItems({forceNew: true});
		},

		_onclickSwitchBtn: function(){
			var _guestbookNameLength = this.guestbookNameNode.value.length;
			if (_guestbookNameLength > 0 && _guestbookNameLength <= 20){
				this.reloadListGreeting(this.guestbookNameNode.value);
				// set guestbook name for Sign form
				this.signFormWidget._setGuestbookNameAttr(this.guestbookNameNode.value);
			} else {
				alert("Error: Guestbook name is empty or length > 20 chars")
			}
		},

		_removeAllGreeting: function(){
			this.clearItems();
			this.set('showedItems', 0);
		},

		_setGuestbookNameAttr: function(guestbookName){
			this.guestbookNameNode.set("value", guestbookName);
		},

		reloadListGreeting:function(guestbookName){
			this._removeAllGreeting();
			this._showListGreeting(guestbookName);
		},

		showGreetingDetail: function(guestbookName, greeting_id){
			hash("/post/" + guestbookName+ "/" + greeting_id);
		},

		_loadGreetingById: function(guestbookName, greeting_id){
			var _guestbookWidgetParent = this;
			this.GreetingStore.getGreeting(guestbookName, greeting_id).then(function(result){
				if (result.content){
					var _isAdmin = "false";
					var isUserAdminNode = dom.byId("is_user_admin");
					if (isUserAdminNode){
						_isAdmin = isUserAdminNode.value;
					}

					var _userLogin = "false";
					var userLoginNode = dom.byId("user_login");
					if (userLoginNode){
						_userLogin = userLoginNode.value;
					}

					var _newDocFrag = document.createDocumentFragment();
					var greetingWidget = new GreetingWidget(result);
					// show button delete for admin
					if (_isAdmin.toLowerCase() == "true"){
						greetingWidget.setHiddenDeleteNode(false);
						greetingWidget.setDisabledEditor(false);
					}
					// show button edit if author written
					if (_userLogin == result.author){
						greetingWidget.setDisabledEditor(false);
					}
					// set guestbook name
					greetingWidget.setGuestbookName(guestbookName);
					greetingWidget.setGuestbookParent(_guestbookWidgetParent);

					greetingWidget.placeAt(_newDocFrag);

					var greetingsContainerNode = dom.byId("greetingsContainerNodeId");
					domStyle.set(greetingsContainerNode, 'display', 'none');

					var greetingDetailNode = dom.byId("greetingDetailNodeId");
					domStyle.set(greetingDetailNode, 'display', 'block');

					greetingDetailNode.innerHTML = "";
					domConstruct.place(_newDocFrag, greetingDetailNode);

					var signFormContainerNode = dom.byId("signFormContainerNodeId");
					domStyle.set(signFormContainerNode, 'display', 'none');
				} else {
					alert("Wrong id");
				}
			}, function(err){
				console.log(err.message);
			}, function(progress){
				console.log(progress);
			});
		},

		doSearch: function(){
			this.reloadListGreeting(this.guestbookName);
		}
	});
});