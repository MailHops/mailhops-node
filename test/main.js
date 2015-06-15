var _ = require("lodash");
var assert = require("assert");
var request = require("request");
var fs = require('fs');
var configuration = require([__dirname, "..", "config"].join("/"));
var pkg = require([__dirname, "..", "package"].join("/"));
var MailHops = require([__dirname, "..", "main"].join("/"));
var mailhops = new MailHops(configuration);

console.log('Using %s', mailhops.base_uri);

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

    describe("lookup endpoint", function(){

        it('string route should return a 200 response with private ip', function(done){
            mailhops.lookup('127.0.0.1', function(err, response){
                assert.equal(response.meta['code'],200);
                assert.equal(response.response.route[0]['private'],true);
                done();
            });
        });

        it('array route should return a 200 response with private ip', function(done){
            mailhops.lookup(['127.0.0.1','216.58.217.46','98.138.253.109'], function(err, response){
                assert.equal(response.meta['code'],200);
                assert.equal(response.response.route[0]['private'],true);
                done();
            });
        });

    });

    describe("map endpoint", function(){

        it('should return a 200 response', function(done){
            request(mailhops.mapUrl('127.0.0.1'), function (error, response, body) {
                assert.equal(response.statusCode,200);
                done();
            });
        });

    });

    describe("parse header", function(){

        it('should return an array of 8 IP addresses', function(done){
            //read header form file
            var header = fs.readFileSync(__dirname+'/header-test.eml',{ encoding: 'utf8' });
            assert.equal(mailhops.getIPsFromHeader(header).length,8);
            done();
        });

    });

});
