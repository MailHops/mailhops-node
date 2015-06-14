var _ = require("lodash");
var assert = require("assert");
var configuration = require([__dirname, "..", "config"].join("/"));
var pkg = require([__dirname, "..", "package"].join("/"));
var MailHops = require([__dirname, "..", "main"].join("/"));
var mailhops = new MailHops(configuration);

describe("main", function(){
    
    describe("new MailHops()", function(){
        it("api_version parameter exists", function(){
            assert.ok(_.has(mailhops, "api_version"));
        });

        it("api_key parameter exists", function(){
            assert.ok(_.has(mailhops, "api_key"));
        });

        it("app_name parameter exists", function(){
            assert.ok(_.has(mailhops, "app_name"));
        });

        it("version parameter exists", function(){
            assert.ok(_.has(mailhops, "version"));
        });

        it("version parameter equals that defined in package.json", function(){
            assert.equal(mailhops.version, pkg.version);
        });
        
    });

    describe("GET lookup", function(){

        it('should return a 200 response with private ip', function(done){
            mailhops.lookup('127.0.0.1', function(err, response){
                assert.equal(response.meta['code'],200);
                assert.equal(response.response.route[0]['private'],true);
                done();
            });
        });
    });

});
