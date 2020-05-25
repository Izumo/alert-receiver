var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rules = require('./alerting_rules.json');


var app = express();


//------------------------------------------------------------
// Convert JSON timestamp object to timestamp string
//------------------------------------------------------------
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

//------------------------------------------------------------
// convert alert object to string
//------------------------------------------------------------
function formatAlert(alert) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           alert.alertname +
           ': ' +
           alert.severity + 
           ': ' +
           alert.message;
}

//------------------------------------------------------------
// convert alert object (for watchdog) to string
//------------------------------------------------------------
function formatWatchdog(alert) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           alert.alertname;
}

//------------------------------------------------------------
// build alert object from POST message
//------------------------------------------------------------
function buildAlertObject(alertmessage) {
    var alert = {};

    alert.status      = alertmessage.status;
    alert.startsAt    = alertmessage.startsAt;
    alert.fingerprint = alertmessage.fingerprint;
    alert.alertname   = alertmessage.labels.alertname;
    alert.severity    = alertmessage.labels.severity;
    alert.message     = alertmessage.annotations.message;

    return alert;
}

//------------------------------------------------------------
// express setting
//------------------------------------------------------------
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//------------------------------------------------------------
// POST handler for alert webhook
//------------------------------------------------------------
app.post('/webhook/', (req, res) => {
  res.sendStatus(200);

  for (var i in req.body.alerts) {
    var alert = buildAlertObject(req.body.alerts[i]);

    console.log(formatAlert(alert))
  }
});

//------------------------------------------------------------
// POST handler for watchdog
//------------------------------------------------------------
app.post('/watchdog/', (req, res) => {
  res.sendStatus(200);

  for (var i in req.body.alerts) {
    var alert = buildAlertObject(req.body.alerts[i]);

    console.log(formatWatchdog(alert));
  }
});

//------------------------------------------------------------
// HTTP server
//------------------------------------------------------------
var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});

