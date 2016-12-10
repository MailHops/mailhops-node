var _ = require("lodash");
var assert = require("assert");
var request = require("request");
var fs = require('fs');
var configuration = require([__dirname, "..", "config"].join("/"));
var MailHops = require([__dirname, "..", "main"].join("/"));

describe("main", function(){

    describe("new MailHops()", function(){

        var mailhops = new MailHops(configuration);

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

    });

    describe("lookup endpoint", function(){

        var mailhops = new MailHops(configuration);

        it('string route should return a 200 response with private ip', function(done){
            mailhops.lookup('127.0.0.1', function(err, res, body){
                assert.equal(res.statusCode,200);
                assert.equal(body.response.route[0]['private'],true);
                done();
            });
        });

        it('array route should return a 200 response with private ip', function(done){
            mailhops.lookup(['127.0.0.1','216.58.217.46','98.138.253.109'], function(err, res, body){
                assert.equal(res.statusCode,200);
                assert.equal(body.response.route[0]['private'],true);
                done();
            });
        });

        it('string route should return a 401 response for invalid api_key', function(done){
            mailhops.lookup('127.0.0.1', {'api_key':'aWN8Pb27Xj6GfV8D6ARsjokonYwbWUNbz9rM'}, function(err, res, body){
                assert.equal(res.statusCode,401);
                done();
            });
        });

    });

    describe("map endpoint", function(){

        var mailhops = new MailHops(configuration);

        it('should return a 200 response', function(done){
            request(mailhops.mapUrl('127.0.0.1'), function (err, res, body) {
                assert.equal(res.statusCode,200);
                done();
            });
        });

    });

    describe("parse header and lookup", function(){

        var mailhops = new MailHops(configuration);

        //read header form file
        var header = fs.readFileSync(__dirname+'/header-test.eml',{ encoding: 'utf8' });
        var ips = mailhops.getIPsFromHeader(header);
        it('should return an array of 9 Received IPs', function(done){
            assert.equal(ips.length,9);
            done();
        });

        it('should return a time of 10000 milliseconds', function(done){
            var ips = mailhops.getIPsFromHeader(header);
            assert.equal(mailhops.time_traveled,10000);
            done();
        });

        it('should find 9 Received IPs', function(done){
            assert.deepEqual(ips,['130.235.227.36',
                                      '130.235.56.196',
                                      '130.236.48.25',
                                      '130.235.59.236',
                                      '130.235.56.196',
                                      '127.0.0.1',
                                      '54.157.138.253',
                                      '198.21.5.108',
                                      '2607:fb90:50f:5547:0:46:e46a:bd01']);
            done();
        });

        it('should return a 200 response and route of 10 hops', function(done){
          mailhops.lookup(mailhops.getIPsFromHeader(header), function(err, res, body){
              assert.equal(res.statusCode,200);
              assert.equal(body.response['route'].length,10);
              done();
          });
        });

    });

    describe("parse header", function(){

        var mailhops = new MailHops(configuration);

        //read header form file
        var header = fs.readFileSync(__dirname+'/header-test-no-ips.eml',{ encoding: 'utf8' });
        var ips = mailhops.getIPsFromHeader(header);

        it('should return an array of 0 IP addresses', function(done){
            assert.equal(ips.length,0);
            done();
        });

        it('should return a time of 0 milliseconds', function(done){
            assert.equal(mailhops.timeTraveled(),null);
            done();
        });

    });

    describe("get IPs form mailparser", function(){

        var mailhops = new MailHops(configuration);

        //read header form file
        var message = fs.readFileSync(__dirname+'/mailparser.json',{ encoding: 'utf8' });
        var ips = mailhops.getIPsFromMailParser(JSON.parse(message));

        it('should return an array of 0 IP addresses', function(done){
            assert.equal(ips.length,3);
            done();
        });

        it('should return a time of 0 milliseconds', function(done){
            assert.equal(mailhops.timeTraveled(),2000);
            done();
        });

    });

});
