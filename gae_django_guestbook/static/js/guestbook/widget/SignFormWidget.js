define([
	"dojo/_base/declare",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/on",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/ValidationTextBox",
	"dijit/form/Button",
	"dojo/text!./templates/SignFormWidget.html",
	"/static/js/guestbook/widget/models/GreetingStore.js"
], function(declare, baseFx, lang, domStyle, on, _WidgetBase,
			_TemplatedMixin, _WidgetsInTemplateMixin, ValidationTextBox, Button, template, GreetingStore){
	return declare("guestbook.SignFormWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {
		// Our template - important!
		templateString: template,
		widgetsInTemplate: true,

		// default value
		guestbookName: "default_guestbook",

		postCreate: function(){
			this.inherited(arguments);
			this.own(
				on(this.signButtonNode, "click", lang.hitch(this, "_onclickSignBtn"))
			);
			this.GreetingStore = new GreetingStore();
		},

		_onclickSignBtn : function(){
			this._signNewGreeting(this.GuestbookWidgetParent,
				this.guestbookNameNode.value,
				this.contentNode.value);
		},

		_signNewGreeting: function(guestbookWidget, guestbookName, greetingContent){
			var _contentLength = greetingContent.length;
			if (_contentLength > 0 && _contentLength <= 10){
				this.GreetingStore.createGreeting(guestbookName, greetingContent).then(function(results){
					guestbookWidget.reloadListGreeting(guestbookName);
					guestbookWidget.showGreetingDetail(guestbookName, results.greeting_id);
				},function(err){
					console.log(err.message);
				}, function(progress){
					console.log(progress);
				})
			} else {
				alert("Error: This content is empty or length > 10 chars");
			}
		},

		_setGuestbookNameAttr: function(guestbookName){
			this.guestbookNameNode.value = guestbookName;
		}
	});
});