var _ = require("lodash");
var request = require("request");
var configuration = require([__dirname, "..", "config"].join("/"));

exports.create = function(config, fn){
    var options = {
        uri: [configuration.base_uri, config.uri].join("/"),
        method: "GET",
        qs: config.qs || {},
        timeout: 4000
    };
    if(config.proxy)
      options.proxy = config.proxy;
    request(options, function(error, response, body){
        fn(error, response, JSON.parse(body));
    });
}
