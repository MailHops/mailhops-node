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
    },

    //parse the whole email header
    getIPsFromHeader: function(header){
        var receivedHeaders = this.getReceivedHeaders(header)
            ,ips = []
            ,regexIp=/(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/
            ,regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g
            ,regexIPV6 = /(::|(([a-fA-F0-9]{1,4}):){7}(([a-fA-F0-9]{1,4}))|(:(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){1,6}:)|((([a-fA-F0-9]{1,4}):)(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){2}(:([a-fA-F0-9]{1,4})){1,5})|((([a-fA-F0-9]{1,4}):){3}(:([a-fA-F0-9]{1,4})){1,4})|((([a-fA-F0-9]{1,4}):){4}(:([a-fA-F0-9]{1,4})){1,3})|((([a-fA-F0-9]{1,4}):){5}(:([a-fA-F0-9]{1,4})){1,2}))/;
         
        _.each(receivedHeaders, function(line){
            
            //IPV6 check
            if(line.match(regexIPV6)){
                ips.push( line.match(regexIPV6)[0] );
                return;
            }
             
            var received_ips = line.match(regexAllIp);

            //maybe multiple IPs in one Received: line
            _.each(received_ips, function(ip){

                var firstchar = line.substring(line.indexOf(ip)-1).substring(0,1);
                var lastchar = line.substring(line.indexOf(ip)+ip.length).substring(0,1);

                //do some checks on the first and last characters surrounding the IP
                // Microsoft SMTP Server id 14.3.195.1; something like this should not be included
                if(!firstchar.match(/\.|\d|\-/)
                    && !lastchar.match(/\.|\d|\-/)
                    && ( firstchar != '?' && lastchar != '?' ) 
                    && lastchar != ';'
                    && regexIp.test(ip) 
                    && ips.indexOf(ip)===-1){

                    ips.push( ip );

                }
            });
        });
         
        return ips;
    },

    getReceivedHeaders: function(header){
        var receivedHeaders = [];
        var rline = '';

         if ( header ){
            var headers = header.split("\n");
            _.each(headers,function(line){
                
                //if the header line begins with Received, X-Received or X-Originating-IP then push that to our array
                if(line.indexOf('Received:')===0 || line.indexOf('X-Received:')===0){
                    if(rline != ''){
                        receivedHeaders.push(rline);
                        rline = '';
                        rline += line;
                        return;
                    } else {
                        rline += line;
                    }
                } else if(line.indexOf('X-Originating-IP:')===0){
                    receivedHeaders.push(line);
                    return;
                } else if(rline != ''){
                    //keep concatting the receive header until we find a semicolon
                    if(line.indexOf(';')===-1){
                        rline += line;
                    } else {
                        rline += line;
                        receivedHeaders.push(rline);
                        rline = '';
                        return;
                    }
                }
            });
            if(rline != '')
                receivedHeaders.push(rline);
          }
        return receivedHeaders;
    }
}