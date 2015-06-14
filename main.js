var _ = require("lodash");
var MailHops = require([__dirname, "mailhops"].join("/"));
var pkg = require([__dirname, "package"].join("/"));

exports = module.exports = function(config){
    var mailhops = new MailHops(config);
    mailhops.version = pkg.version;
    return mailhops;
}
