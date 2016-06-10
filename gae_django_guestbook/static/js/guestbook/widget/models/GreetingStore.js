define([
	"dojo/_base/declare",
	"dojo/cookie",
	"dojo/Deferred",
	"dojo/store/JsonRest",
	'dojo/Stateful'
], function(declare, _cookie, Deferred, JsonRest, Stateful){
	return declare("guestbook.GreetingStore", [Deferred, Stateful], {
		guestbookName: "",
		store: null,

		constructor: function(){
			this.inherited(arguments);

			// update target when guestbookName change
			this.watch('guestbookName', function(name, oldValue, value){
				if(oldValue != value)
				{
					console.log('guestbookName changed');
					var url = "/api/guestbook/"+value+"/greeting/";
					this.store = new JsonRest({
						target: url,
						headers: {
							"X-CSRFToken": _cookie('csrftoken')
						}
					});
				}
			});
		},
		// Create a new greeting
		createGreeting: function(guestbookName, greetingContent){
			this.set('guestbookName', guestbookName);

			var deferred = new Deferred();
			var _contentLength = greetingContent.length;
			if (_contentLength > 0 && _contentLength <= 10){

				return this.store.add({
					guestbook_name: guestbookName,
					content: greetingContent
				});

			} else {
				var error = {message: "This content is empty or length > 10 char"};
				deferred.reject(error);
			}

			return deferred.promise;
		},

		// Update a greeting
		updateGreeting: function(guestbookName, greetingId, greetingContent){
			this.set('guestbookName', guestbookName);

			var deferred = new Deferred();
			var _contentLength = greetingContent.length;
			if (_contentLength > 0 && _contentLength <= 10){

				return this.store.put({
					greeting_content: greetingContent
				}, {
					id: greetingId
				});

			} else {
				var error = {message: "This content is empty or length > 10 char"};
				deferred.reject(error);
			}
			return deferred.promise;
		},

		// Delete a greeting
		deleteGreeting: function(guestbookName, greetingId){
			this.set('guestbookName', guestbookName);
			return this.store.remove(greetingId);
		},

		// Get detail of a greeting
		getGreeting: function(guestbookName, greetingId){
			this.set('guestbookName', guestbookName);
			return this.store.get(greetingId);
		},

		// get list greeting
		getListGreeting: function(guestbookName){
			this.set('guestbookName', guestbookName);
			return this.store.query();
		}
	})
});