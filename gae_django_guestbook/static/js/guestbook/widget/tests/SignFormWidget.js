define([
	"doh/runner",
	"dojo/dom",
	"/static/js/sinon/sinon.js",
	"/static/js/guestbook/widget/SignFormWidget.js"
], function (doh, dom, sinon, SignFormWidget) {
	doh.register("TestSignFormWidget", [
		{
			name: "Button_Sign_onclick_count",
			setUp: function () {
			},
			runTest: function () {
				var signFormWidget = new SignFormWidget();
				var mock = sinon.mock(signFormWidget);

				// expect: Called once
				mock.expects("_onclickSignBtn").once();
				// trigger
				signFormWidget.signButtonNode.onClick();
				mock.verify();
			}
		}]);
});