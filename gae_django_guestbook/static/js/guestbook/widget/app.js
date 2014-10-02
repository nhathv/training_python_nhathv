define([
	'dojo/_base/declare',
	'dojo/_base/config',
	'dojo/ready',
	'dojo/hash',
	"dojo/router",
	'/static/js/guestbook/widget/models/app.js',
	'/static/js/guestbook/widget/models/Route.js',
	'dojo/Stateful'
], function(declare, config, ready, hash, router, app, Route) {

	router.register('list', function(evt) {
		app.set('route', new Route({
			screen: 'list'
		}));
	});
	router.register('sign', function(evt) {
		app.set('route', new Route({
			screen: 'sign'
		}));
	});
	router.register('/post/:guestbook_name/:id', function(evt) {
		app.set('route', new Route({
			screen: 'post',
			greetingId: evt.params.id,
			guestbookName: evt.params.guestbook_name
		}));
	});

	return function() {
		ready(function() {
			if (!config.parseOnLoad) {
				parser.parse();
			}

			router.startup();

			if (!hash() || !(app.get('route') instanceof Route)) {
				app.set('route', new Route({
					screen: 'list'
				}));
			}
		});
	};
});
