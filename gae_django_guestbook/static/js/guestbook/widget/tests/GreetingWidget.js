define([
	"doh/runner",
	"dojo/dom",
	'dojo/json',
	"/static/js/sinon/sinon.js",
	"/static/js/guestbook/widget/GreetingWidget.js",
	"/static/js/guestbook/widget/models/GreetingStore.js",
	"/static/js/guestbook/widget/GuestbookWidget.js"
], function (doh, dom, json, sinon, GreetingWidget, GreetingStore, GuestbookWidget) {
	doh.register("TestGreetingWidget", [
		{
			name: "Test_Button_Delete_Called_Count",
			runTest: function () {
				var greetingWidget = new GreetingWidget();
				var mock = sinon.mock(greetingWidget);

				// expect: Called once
				mock.expects("_onclickDeleteBtn").once();
				// trigger
				greetingWidget.deleteButtonNode.onClick();
				mock.verify();
				mock.restore();
			}
		},
		{
			name: "Test_Reload_GreetingList_After_Delete_Greeting",
			setUp: function () {
				var url = "/api/guestbook/default_guestbook/greeting/0";
				this.fakeSuccessData = {
					data: "test"
				}

				this.fakeserver = sinon.fakeServer.create();
				this.fakeserver.respondWith("DELETE", url, [
					204,
					{
						"Content-Type": "application/json"
					},
					json.stringify(this.fakeSuccessData)
				]);
			},
			runTest: function () {
				var deferred = new doh.Deferred();
				var guestbookWidget = new GuestbookWidget({autoLoadData: false});

				var mock = sinon.mock(guestbookWidget);
				var expectation = mock.expects("reloadListGreeting").once();

				// trigger
				var greetingWidget = new GreetingWidget({GuestbookWidgetParent: guestbookWidget});
				greetingWidget.deleteButtonNode.onClick();

				this.fakeserver.respond();
				mock.verify();
			}, timeout: 5000
		},
		{
			name: "Test_Do_Not_Reload_GreetingList_After_Delete_Wrong_Greeting",
			setUp: function () {
				var url = "/api/guestbook/default_guestbook/greeting/0";
				this.fakeSuccessData = {
					data: "test"
				}

				this.fakeserver = sinon.fakeServer.create();
				this.fakeserver.respondWith("DELETE", url, [
					404,
					{
						"Content-Type": "application/json"
					},
					json.stringify(this.fakeSuccessData)
				]);
			},
			runTest: function () {
				var deferred = new doh.Deferred();
				var guestbookWidget = new GuestbookWidget({autoLoadData: false});

				var mock = sinon.mock(guestbookWidget);
				var expectation = mock.expects("reloadListGreeting").never();

				// trigger
				var greetingWidget = new GreetingWidget({GuestbookWidgetParent: guestbookWidget});
				greetingWidget.deleteButtonNode.onClick();

				this.fakeserver.respond();
				mock.verify();
			}, timeout: 5000
		},
		{
			name: "Test_Button_Save_Called_Count",
			runTest: function () {
				var greetingWidget = new GreetingWidget();
				var mock = sinon.mock(greetingWidget);

				// expect: Called once
				mock.expects("_onclickSaveBtn").once();
				// trigger
				greetingWidget.contentNode.onChange();
				mock.verify();
				mock.restore();
			}
		},
		{
			name: "Test_Reload_GreetingList_After_Save_Greeting",
			setUp: function () {
				var url = "/api/guestbook/default_guestbook/greeting/0";
				this.fakeSuccessData = {
					data: "test"
				}

				this.fakeserver = sinon.fakeServer.create();
				this.fakeserver.respondWith("PUT", url, [
					204,
					{
						"Content-Type": "application/json"
					},
					json.stringify(this.fakeSuccessData)
				]);
			},
			runTest: function () {
				var deferred = new doh.Deferred();
				var guestbookWidget = new GuestbookWidget({autoLoadData: false});

				var mock = sinon.mock(guestbookWidget);
				var expectation = mock.expects("reloadListGreeting").once();

				// trigger
				var greetingWidget = new GreetingWidget({GuestbookWidgetParent: guestbookWidget});
				greetingWidget.contentNode.value = "123456789";
				greetingWidget.contentNode.onChange();

				this.fakeserver.respond();
				mock.verify();
			}, timeout: 5000
		},
		{
			name: "Test_Do_Not_Reload_GreetingList_After_Save_Wrong_Greeting",
			setUp: function () {
				var url = "/api/guestbook/default_guestbook/greeting/0";
				this.fakeSuccessData = {
					data: "test"
				}

				this.fakeserver = sinon.fakeServer.create();
				this.fakeserver.respondWith("PUT", url, [
					404,
					{
						"Content-Type": "application/json"
					},
					json.stringify(this.fakeSuccessData)
				]);
			},
			runTest: function () {
				var deferred = new doh.Deferred();
				var guestbookWidget = new GuestbookWidget({autoLoadData: false});

				var mock = sinon.mock(guestbookWidget);
				var expectation = mock.expects("reloadListGreeting").never();

				// trigger
				var greetingWidget = new GreetingWidget({GuestbookWidgetParent: guestbookWidget});
				greetingWidget.contentNode.value = "123456789";
				greetingWidget.contentNode.onChange();

				this.fakeserver.respond();
				mock.verify();
			}, timeout: 5000
		}]);
});