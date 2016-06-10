define([
	"doh/runner",
	"dojo/dom",
	'dojo/json',
	"/static/js/sinon/sinon.js",
	"/static/js/guestbook/widget/GuestbookWidget.js",
	"/static/js/guestbook/widget/models/GreetingStore.js"
], function (doh, dom, json, sinon, GuestbookWidget, GreetingStore) {
	doh.register("TestGuestbookWidget", [
		{
			name: "Test_Button_Switch_onclick_count",
			runTest: function () {
				var deferred = new doh.Deferred();
				var guestbookWidget = new GuestbookWidget({autoLoadData: false});
				var onclickSwitchBtnSpy = sinon.spy(guestbookWidget, "_onclickSwitchBtn");

				setTimeout(deferred.getTestCallback(function () {
					guestbookWidget.switchButtonNode.onClick();
					doh.t(onclickSwitchBtnSpy.calledOnce);
					onclickSwitchBtnSpy.restore();
					guestbookWidget.destroy();
				}), 4000);

				return deferred;
			},
			timeout: 5000
		},
		{
			name: "Test_load_greetingContainer",
			setUp: function () {
				this.GreetingStore = new GreetingStore();
				var url = "/api/guestbook/default_guestbook/greeting/";
				this.fakeSuccessData = {
					"guestbook_name": this.guestbookName,
					"greetings": [
						{
							"updated_date": "2014-08-05 02:02 +0000",
							"date": "2014-08-05 01:58 +0000",
							"id_greeting": 1234567890,
							"author": "Anonymous",
							"content": "123456",
							"updated_by": "Anonymous@example.com"
						}],
					"cursor": "cursor",
					"is_more": false
				}

				this.fakeserver = sinon.fakeServer.create();
				this.fakeserver.respondWith("GET", url, [
					204,
					{
						"Content-Type": "application/json"
					},
					json.stringify(this.fakeSuccessData)
				])
			},
			runTest: function () {
				var deferred = new doh.Deferred();
				var guestbookwidget = new GuestbookWidget({autoLoadData: true});
				var greetingContainer = guestbookwidget.greetingsContainerNode;
				setTimeout(deferred.getTestCallback(function () {
					doh.is(1, greetingContainer.childElementCount);
					guestbookwidget.destroy();
				}), 4000);

				this.fakeserver.respond();
				return deferred;
			},
			timeout: 5000
		}]);
});