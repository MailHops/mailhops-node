# Change Log
All notable changes to this project will be documented in this file.

## 2.1.1 - 2017-07-25

### Fixed
- IP test when IP regex finds a semantic version with a trailing colon

## 2.1.0 - 2017-02-21

### Fixed
- IP order when Received header has multiple IPs.  

## 2.0.2 - 2016-12-09

### Added
- Get Start Hop method
- Get End Hop method

### Fixed
- getIPsFromMailParser when only one received header that is a string.

## 2.0.1 - 2016-12-08

### Added
- getIPsFromMailParser method for parsed message from [mailparser](https://www.npmjs.com/package/mailparser)

## 2.0.0 - 2016-09-09

### Added
- MailHops SSL
- MailHops API v2
- Test for no IPs in header
- Time Traveled, total time it took for the email to reach you
- Bump version 2.0 to match API v2

### Fixed
- Received IP sorting
- Received IP duplicates

## 0.0.3 - 2015-06-15

### Added
- Header IP parsing

## 0.0.1 - 2015-06-14

### Added
- MailHops API lookup endpoint call
- MailHops API config
