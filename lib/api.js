var _ = require("lodash");
var async = require("async");
var querystring = require("qs");
var request = require([__dirname, "request"].join("/"));

module.exports = {

    lookup: function(route, options, fn){
        if(_.isFunction(options) && _.isUndefined(fn)){
            fn = options;
            options = {};
        }

        var qs = options;
        qs.api_key = this.api_key || '';
        qs.c = this.show_client;
        qs.r = Array.isArray(route) ? route.join(',').replace(" ", "") : route.replace(" ", "");

        if(this.forecastio_api_key)
            qs.fkey = this.forecastio_api_key;

        var config = {
            uri: [this.api_version, "lookup"].join("/"),
            qs: qs,
            proxy: this.proxy
        }

        request.create(config, fn);
    },

    //just returns a map url that can be used as an iframe src
    mapUrl: function(route, options){
        var qs = options || {};
        qs.api_key = this.api_key || '';
        qs.c = this.show_client;
        qs.r = Array.isArray(route) ? route.join(',').replace(" ", "") : route.replace(" ", "");

        if(this.forecastio_api_key)
            qs.fkey = this.forecastio_api_key;

        return [this.base_uri, this.api_version, "map", '?'+querystring.stringify(qs)].join("/");
    }
}