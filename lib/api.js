var _ = require("lodash");
var async = require("async");
var querystring = require("qs");
var request = require([__dirname, "request"].join("/"));

module.exports = {

    time_traveled: null,

    timeTraveled: function(time){
        if(typeof time != 'undefined')
          this.time_traveled = time;
        return this.time_traveled;
    },

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
        if(!!this.timeTraveled())
          qs.t = this.timeTraveled();

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
        var receivedHeaders = this.getReceivedHeaders(header);
        var ips = [];
        var regexIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/;
        var regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;
        var regexIPV6 = /s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*/g;

        _.each(receivedHeaders, function(line){

            //IPV6 check
            line = line.replace('[IPv6:','[');
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
            _.eachRight(received_ips, function(ip){

                var firstchar = line.substring(line.indexOf(ip)-1).substring(0,1);
                var lastchar = line.substring(line.indexOf(ip)+ip.length).substring(0,1);

                //do some checks on the first and last characters surrounding the IP
                // Microsoft SMTP Server id 14.3.195.1; something like this should not be included
                if(!firstchar.match(/\.|\d|\-/)
                    && !lastchar.match(/\.|\d|\-/)
                    && ( firstchar != '?' && lastchar != '?' )
                    && ( firstchar != ':' && lastchar != ':' )
                    && lastchar != ';'
                    && line.toLowerCase().indexOf(' id '+ip) === -1
                    && parseInt(ip.substring(0,ip.indexOf('.'))) < 240 //IANA-RESERVED
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

    getIPsFromMailParser: function(parsedmail){
      var ips = [];
      var regexIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/;
      var regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;
      var regexIPV6 = /s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*/g;

      if(typeof parsedmail.headers.received == 'undefined')
        return ips;
      else if(typeof parsedmail.headers.received == 'string')
        parsedmail.headers.received = [parsedmail.headers.received];

      _.each(parsedmail.headers.received,function(line){
        //IPV6 check
        line = line.replace('[IPv6:','[');
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
        _.eachRight(received_ips, function(ip){

            var firstchar = line.substring(line.indexOf(ip)-1).substring(0,1);
            var lastchar = line.substring(line.indexOf(ip)+ip.length).substring(0,1);

            //do some checks on the first and last characters surrounding the IP
            // Microsoft SMTP Server id 14.3.195.1; something like this should not be included
            if(!firstchar.match(/\.|\d|\-/)
                && !lastchar.match(/\.|\d|\-/)
                && ( firstchar != '?' && lastchar != '?' )
                && ( firstchar != ':' && lastchar != ':' )
                && lastchar != ';'
                && line.toLowerCase().indexOf(' id '+ip) === -1
                && parseInt(ip.substring(0,ip.indexOf('.'))) < 240 //IANA-RESERVED
                && regexIp.test(ip)){

                ips.unshift( ip );

            } else if(regexIp.test(ip)
              && line.indexOf(ip) !== line.lastIndexOf(ip)){
              //check for duplicate IPs in one line
              ips.unshift( ip );

            }
        });
      });

      if(parsedmail.date && parsedmail.receivedDate){
        try {
          var firstDate = new Date(parsedmail.date);
          var lastDate = new Date(parsedmail.receivedDate);
          this.timeTraveled(lastDate - firstDate);
        } catch(e){
          this.timeTraveled(null);
        }
      } else {
        this.timeTraveled(null);
      }

      return ips;
    },

    getReceivedHeaders: function(header){
        var receivedHeaders = [];
        var rline = '',firstDate,lastDate;

         if ( header ){
            var headers = header.split("\n");
            _.each(headers,function(line){

                //if the header line begins with Received, X-Received or X-Originating-IP then push that to our array
                if(line.indexOf('Date:')===0){
                  firstDate = line.substring(line.indexOf('Date:')+5).trim();
                }
                else if(line.indexOf('Received:')===0 || line.indexOf('X-Received:')===0){
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
                          if(!firstDate)
                            firstDate = rline.substring(rline.indexOf(';')+1).trim();
                          if(!lastDate)
                            lastDate = rline.substring(rline.indexOf(';')+1).trim();
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
              this.timeTraveled(lastDate - firstDate);
            } catch(e){
              this.timeTraveled(null);
            }
        } else {
          this.timeTraveled(null);
        }

        return receivedHeaders;
    },

    getStartHop: function(routeResponse){
      var route = _.filter(routeResponse, function(h){
        return ((!!h.lat && !!h.lng) || h.coords);
      });
      if(route.length)
        return route[0];
      return '';
    },

    getEndHop: function(routeResponse){
      var route = _.filter(routeResponse, function(h){
        return ((!!h.lat && !!h.lng) || h.coords);
      });
      if(route.length)
        return route[route.length-1];
      return '';
    }
}
