# MailHops API node
[www.MailHops.com](http://www.mailhops.com)

[![Build Status](https://travis-ci.org/avantassel/mailhops-node.svg)](https://travis-ci.org/avantassel/mailhops-node)
[![NPM version](https://img.shields.io/npm/v/mailhops.svg)](https://www.npmjs.com/package/mailhops)

<img src="https://www.mailhops.com/images/logos/logo.png" alt="MailHops logo" title="MailHops" align="right" />

A nodejs module for interacting with the MailHops API.

## Getting Started

### Installation

```
$ npm install mailhops
```

### Configuration
Simply require the mailhops module, instantiate a new MailHops object.  

New MailHops objects can be instantiated with configuration parameters. Here is an example:

```javascript
var MailHops = require("mailhops");
var mailhops = new MailHops({
    api_key: "aWN8Pb27Xj6GfV8D6ARsjokonYwbWUNbz9rM",
    api_version: 2,
    proxy: "http://myproxy:3128",
    app_name: "Node App v2.0.0",
    forecastio_api_key: ""
});
```

MailHops objects can also be configured via the `.configure(options)` method. Here is an exmaple:

```javascript
var MailHops = require("mailhops");
var mailhops = new MailHops();

var options = {
    api_key: "aWN8Pb27Xj6GfV8D6ARsjokonYwbWUNbz9rM"
}

mailhops.configure(options);

// get IPs from a full header where headerText is the full header
var ips = mailhops.getIPsFromHeader(headerText);

// or pass in an array of IP addresses
var ips = ['216.58.217.46','98.138.253.109'];

mailhops.lookup(ips,function(err, res, body){
  if(err)
    console.log('MailHops Error',err);
	console.log(body);
});

var mapUrl = mailhops.mapUrl('216.58.217.46,98.138.253.109');

```

### Running Tests
```
$ npm test
```

## Other MailHops projects
- https://github.com/mailhops
