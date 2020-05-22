var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');


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

function formatAlert(alert, req) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           req.body.commonLabels.alertname +
           ': ' +
           req.body.commonLabels.severity + 
           ': ' +
           req.body.commonAnnotations.message;
}

function formatWatchdog(alert, req) {

    return getTimestampString((new Date()).toISOString()) + ' ' +
           '[' + getTimestampString(alert.startsAt) + '] ' + 
           '(' + alert.status + ') ' +
           req.body.commonLabels.alertname;
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/webhook/', (req, res) => {
  res.sendStatus(200)

  console.log(req.body);

  for (var i in req.body.alerts) {
    alert = req.body.alerts[i];
    console.log(formatAlert(alert, req))

  }
});

app.post('/watchdog/', (req, res) => {
  res.sendStatus(200)

  for (var i in req.body.alerts) {
    alert = req.body.alerts[i];
    console.log(formatWatchdog(alert, req))
  }
});

// HTTP server
var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

