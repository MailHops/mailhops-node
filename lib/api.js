var _ = require("lodash");
var async = require("async");
var querystring = require("qs");
var request = require([__dirname, "request"].join("/"));

module.exports = {

    time_traveled: null,

    lookup: function(route, options, fn){
        if(_.isFunction(options) && _.isUndefined(fn)){
            fn = options;
            options = {};
        }

        var qs = options;
        qs.api_key = qs.api_key || this.api_key || '';
        qs.c = this.show_client || 1;
        qs.r = Array.isArray(route) ? route.join(',').replace(" ", "") : route.replace(" ", "");
        if(!!this.forecastio_api_key)
          qs.fkey = this.forecastio_api_key;
        if(!!this.time_traveled)
          qs.t = this.time_traveled;

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
        qs.api_key = qs.api_key || this.api_key || '';
        qs.c = this.show_client || 1;
        qs.r = Array.isArray(route) ? route.join(',').replace(" ", "") : route.replace(" ", "");

        if(!!this.forecastio_api_key)
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
                ips.unshift( line.match(regexIPV6)[0] );
                return;
            }

            var received_ips = line.match(regexAllIp);

            if(!received_ips)
              return;

            //get unique IPs for each Received header
            received_ips = received_ips.filter(function(item, pos) {
              return received_ips.indexOf(item) == pos;
            });

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
                    && regexIp.test(ip)){

                    ips.unshift( ip );

                } else if(regexIp.test(ip)
                  && line.indexOf(ip) !== line.lastIndexOf(ip)){
                  //check for duplicate IPs in one line
                  ips.unshift( ip );

                }
            });
        });

        return ips;
    },

    getReceivedHeaders: function(header){
        var receivedHeaders = [];
        var rline = '',firstDate,lastDate;

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

                        // first and last dates are  used to calculate time_traveled Traveled
                        if(rline.indexOf(';')!==-1){
                          if(!lastDate)
                            lastDate = rline.substring(rline.indexOf(';')+1).trim();
                          firstDate = rline.substring(rline.indexOf(';')+1).trim();
                        }

                        rline = '';
                        return;
                    }
                }
            });
            if(rline != '')
                receivedHeaders.push(rline);
          }

          // parse dates
          if(firstDate && firstDate.indexOf('(')!==-1)
            firstDate = firstDate.substring(0,firstDate.indexOf('(')).trim();
          if(lastDate && lastDate.indexOf('(')!==-1)
            lastDate = lastDate.substring(0,lastDate.indexOf('(')).trim();
          if(firstDate && lastDate){
            try {
              firstDate = new Date(firstDate);
              lastDate = new Date(lastDate);
              this.time_traveled = parseInt(lastDate-firstDate);
            } catch(e){
              this.time_traveled = null;
            }
        } else {
          this.time_traveled = null;
        }

        return receivedHeaders;
    }
}
