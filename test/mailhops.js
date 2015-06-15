var _ = require("lodash");
var assert = require("assert");
var MailHops = require([__dirname, "..", "main"].join("/"));
var configuration = require([__dirname, "..", "config"].join("/"));
var mailhops;

describe("mailhops", function(){
    before(function(fn){
        mailhops = new MailHops(configuration);
        fn();
    });

    describe("MailHops()", function(){
        it("required api methods exist", function(){
            var required_keys = [
                "configure",
                "lookup",
                "mapUrl",
                "getIPsFromHeader",
                "getReceivedHeaders"
            ]

            assert.deepEqual(_.keys(mailhops.__proto__), required_keys);
        });

        it("default config parameters are set correctly", function(){
            assert.equal(mailhops.api_version, "v1");
            assert.equal(mailhops.api_key, undefined);
        });

    });

    describe("configure()", function(){
        it("sets config parameters correctly", function(){
            mailhops.configure({
                api_version: 1,
                api_key: "aWN8Pb27Xj6GfV8D6ARsjokonYwbWUNbz9rM",
                app_name: "Node App"
            });
            assert.equal(mailhops.api_version, "v1");
            assert.equal(mailhops.api_key, "aWN8Pb27Xj6GfV8D6ARsjokonYwbWUNbz9rM");
            assert.equal(mailhops.app_name, "Node App");
        });

    });
});
