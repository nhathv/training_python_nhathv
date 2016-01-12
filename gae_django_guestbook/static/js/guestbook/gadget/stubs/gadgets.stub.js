/**
 * Stub for gadgets.{io,util} api for local development.
 *
 * Original code / interfaces (licensed under the Apache License 2.0) are
 * derived from:
 *   http://opensocial-resources.googlecode.com/svn/spec/0.8/gadgets/io.js
 *   http://opensocial-resources.googlecode.com/svn/spec/0.8/gadgets/prefs.js
 *   http://opensocial-resources.googlecode.com/svn/spec/0.8/gadgets/util.js
 *
 */

var gadgets = this.gadgets = {
	__global__: this  // only for this stub
};

/**
 * gadgets.io
 *
 */
gadgets.io = function() {
	return {
		makeRequest : function (url, callback, opt_params) {
			// convert gadgets.io request to XHR request.
			opt_params = opt_params || {};
			var dfd, xhrArgs = {},
				method = opt_params[gadgets.io.RequestParameters.METHOD];
			contentType = opt_params[gadgets.io.RequestParameters.CONTENT_TYPE] || gadgets.io.ContentType.JSON;

			if (opt_params[gadgets.io.RequestParameters.HEADERS]) {
				xhrArgs['headers'] = opt_params[gadgets.io.RequestParameters.HEADERS];
			}
			if (opt_params[gadgets.io.RequestParameters.POST_DATA]) {
				xhrArgs['postData'] = opt_params[gadgets.io.RequestParameters.POST_DATA];
			}

			xhrArgs['handleAs'] = contentType.toLowerCase(); // json or text
			xhrArgs['url'] = url + [
					(url.indexOf('?') > -1 ? '&' : '?'),
					'opensocial_owner_id=dummy',
					'&opensocial_viewer_id=dummy'
				].join('');

			dfd = dojo.xhr(method, xhrArgs);
			return dojo.Deferred.when(
				dfd,
				function(data) {
					var xhrObj = dfd.ioArgs.xhr,
						status = xhrObj.status,
						responseText = xhrObj.responseText;
					return callback({
						'data': data, 'rc': status,
						'text': responseText, 'errors': []});
				},
				function(error) {
					var res = {
						'errors': ['Error ' + error.status],  // dummy
						'rc': error.status,
						'text': error.responseText
					};
					return callback(res);
				}
			);
		},

		encodeValues : function (fields) {
		},

		getProxyUrl : function (url, opt_params) {
		}
	};
}();

gadgets.io.RequestParameters = {
	METHOD : 'METHOD',
	CONTENT_TYPE : "CONTENT_TYPE",
	POST_DATA : "POST_DATA",
	HEADERS : "HEADERS",
	AUTHORIZATION : 'AUTHORIZATION',
	NUM_ENTRIES : 'NUM_ENTRIES',
	GET_SUMMARIES : 'GET_SUMMARIES',
	REFRESH_INTERVAL : 'REFRESH_INTERVAL'
};

gadgets.io.MethodType = {
	GET : 'GET',
	POST : 'POST',
	PUT : 'PUT',
	DELETE : 'DELETE',
	HEAD : 'HEAD'
};

gadgets.io.ContentType = {
	TEXT : 'TEXT',
	DOM : 'DOM',
	JSON : 'JSON',
	FEED : 'FEED'
};

gadgets.io.AuthorizationType = {
	NONE : 'NONE',
	SIGNED : 'SIGNED',
	OAUTH : 'OAUTH'
};

gadgets.io.ProxyUrlRequestParameters = {
	REFRESH_INTERVAL : 'REFRESH_INTERVAL'
};


/**
 * gadgets.util
 *
 */
gadgets.util = function() {
	return {
		escapeString : function(str) {},
		getFeatureParameters : function (feature) {},
		hasFeature : function (feature) {},
		registerOnLoadHandler : function (callback) { dojo.ready(callback); },
		unescapeString : function(str) {},
		sanitizeHtml : function(text) {}
	};
}();


/**
 * gadgets.Prefs
 *
 */
gadgets.Prefs = function(opt_moduleId) {};
gadgets.Prefs.prototype.getString = function(key) {};
gadgets.Prefs.prototype.getInt = function(key) {};
gadgets.Prefs.prototype.getFloat = function(key) {};
gadgets.Prefs.prototype.getBool = function(key) {};
gadgets.Prefs.prototype.set = function(key, value) {};
gadgets.Prefs.prototype.getArray = function(key) {};
gadgets.Prefs.prototype.setArray = function(key, val) {};
gadgets.Prefs.prototype.getMsg = function(key) {};
gadgets.Prefs.prototype.getCountry = function() {};
gadgets.Prefs.prototype.getLang = function() {
	return gadgets.__global__.__LANG__;
};
gadgets.Prefs.prototype.getModuleId = function() {};
