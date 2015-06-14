var _ = require("lodash");
var api = require([__dirname, "lib", "api"].join("/"));

function MailHops(config){
    this.configure(config || {});
}

MailHops.prototype.configure = function(config){
    this.base_uri = config.base_uri;
    this.api_key = config.api_key || undefined;
    this.proxy = config.proxy || undefined;
    this.api_version = config.api_version || 1;
    this.api_version = ["v", this.api_version].join("");
    this.app_name = config.app_name;
    this.forecastio_api_key = config.forecastio_api_key || undefined;
    this.show_client = config.show_client || 1;
}

_.each(api, function(method, name){
    MailHops.prototype[name] = method;
});

module.exports = MailHops;
