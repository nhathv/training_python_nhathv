define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
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
	"/static/js/guestbook/widget/GreetingWidget.js",
	"/static/js/guestbook/widget/SignFormWidget.js",
	"/static/js/guestbook/widget/models/GreetingStore.js",
	"dojo/text!./templates/GuestbookWidget.html",
	"/static/js/guestbook/widget/models/app.js"
], function(declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
			request, on, dom, domAttr, domConstruct, domStyle, arrayUtil, router, hash, topic,
			GreetingWidget, SignFormWidget, GreetingStore, template, appModel){
	return declare("guestbook.GuestbookWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		// Our template - important!
		templateString: template,
		widgetsInTemplate: true,
		autoLoadData: true,

		// Defaut value
		guestbookName: "default_guestbook",
		// store the last requested page so we do not make multiple requests for the same content
		lastPage: "list",

		model: appModel.getDefaultInstance(),

		postCreate: function () {
			this.inherited(arguments);

			this.GreetingStore = new GreetingStore();

			// handle event
			this.own(
				on(this.switchButtonNode, "click", lang.hitch(this, "_onclickSwitchBtn")),
				on(dom.byId("menu"), "a:click", function(event){
					// prevent loading a new page - we're doing a single page app
					event.preventDefault();
					var page = domAttr.get(this, "href");
					hash(page);
				})
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

			var thisObj = this;
			this.model.watch('route', function(name, oldValue, value) {
				thisObj.render(value);
			});
		},

		render: function(value){
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

		_showListGreeting: function(guestbookName){
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

			this.GreetingStore.getListGreeting(guestbookName).then(function(results){
				var _newDocFrag = document.createDocumentFragment();
				arrayUtil.forEach(results.greetings, function(greeting){
					var greetingWidget = new GreetingWidget(greeting);
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
					greetingWidget.setGuestbookName(guestbookName);
					greetingWidget.setGuestbookParent(_guestbookWidgetParent);

					greetingWidget.placeAt(_newDocFrag);
				});
				domConstruct.place(_newDocFrag, _guestbookWidgetParent.greetingsContainerNode);
			}, function(err){
				console.log(err.message);
			}, function(progress){
				console.log(progress);
			});
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
			this.greetingsContainerNode.innerHTML = "";
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
		}
	});
});