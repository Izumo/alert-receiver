var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rules = require('./alerting_rules.json');


var app = express();

function getTimestampString(timestamp) {

    // use JSON data as it is
    return timestamp;

    var date = new Date(timestamp);
    // These methods are return local time
    var YYYY = date.getFullYear();
    // make zero-padding string
    var MM = ('0' + (date.getMonth() + 1)).slice(-2);
    var DD = ('0' + date.getDate()).slice(-2);
    var hh = ('0' + date.getHours()).slice(-2);
    var mm = ('0' + date.getMinutes()).slice(-2);
    var ss = ('0' + date.getSeconds()).slice(-2);
    var milli = date.getMilliseconds();

    return YYYY + '-' + MM + '-' + DD + 'T' + hh + ':' + mm + ':' + ss + '.' + milli;
}

function formatAlert(alert) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.alert.startsAt) + '] ' + 
           '(' + alert.alert.status + ') ' +
           alert.alertname +
           ': ' +
           alert.severity + 
           ': ' +
           alert.message;
}

function formatWatchdog(alert) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           alert.alertname;
}

function findAlertMessage(alertname, annotations) {

    var message = annotations.message;

    if (typeof message == "undefined") {

        // alert doesn't have message, get from rules
        entries = rules.filter(function(item, index){
            if (item.name == alertname) return true;
        });
	if (entries.length == 0) {
	    console.log("no rules found");
	    console.log("alertname = " + alertname);
	    message = "hogehoge";
	}
	if (typeof entries[0].annotations == "undefined") {
	    console.log("no annotations in the rule");
	    console.log(entries);
        }
	message = entries[0].annotations.message;
    }
    return message;
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/webhook/', (req, res) => {
  res.sendStatus(200)

  console.log(req.body);

  for (var i in req.body.alerts) {
    var alert = {};
    alert.alert = req.body.alerts[i];
    alert.alertname = req.body.commonLabels.alertname;
    alert.severity = req.body.commonLabels.severity;
    alert.message = findAlertMessage(alert.alertname, req.body.commonAnnotations);

    console.log(formatAlert(alert))
  }
});

app.post('/watchdog/', (req, res) => {
  res.sendStatus(200)

  for (var i in req.body.alerts) {
    var alert = {};
    alert.alert = req.body.alerts[i];
    alert.alertname = req.body.commonLabels.alertname;
    console.log(formatWatchdog(alert))
  }
});

// HTTP server
var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});

