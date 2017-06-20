var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host: 'localhost',
  password: 'root',
  port: 3306,
  user: 'root',
  database: 'campaigndb'
});

router.get('/', function (req, res, next) {
  res.send('respond with a campaign');
});

router.get('/locations/:locationID', function (req, res, next) {
  var lId = req.params.locationID;
  var aId = req.query.aid;
  var dId = req.query.did;
  var ecArr = req.query.ec;

  var campaignQuery;
  var campaigns;
  var queryCount;

  campaignQuery = connection.query('select campaign_order, campaign_id, url, ad_expire_day from campaign_for_app inner join campaign_info on campaign_for_app.campaign_id=campaign_info.id where app_id=? and location_id=? and campaign_id not in (?)', [aId, lId, ecArr], function (err, camRows) {
    campaigns = camRows;

    if (Array.isArray(campaigns)) {
      queryCount = campaigns.length;
    } else if (campaigns) {
      queryCount = 1;
    } else {
      queryCount = 0;
    }

    console.log(campaigns);
    console.log(queryCount);

    res.json({
      'count': queryCount,
      campaigns
    });
  });
});

router.post('/deviceForApp', function (req, res) {
  var queryErr = -1;
  var deviceID = 'device_id';
  var appID = 'app_id';

  if (!req.body[deviceID] || !req.body[appID]) {
    res.json({
      'result': -2,
      'msg': 'check ' + deviceID + ' and ' + appID
    });
    return;
  }

  connection.query('insert into device_for_app (app_id, device_id) values (?, ?)', [req.body[appID], req.body[deviceID]], function (err, rows) {
    if (err) {
      res.json({
        'result': queryErr,
        'msg': err
      });
    } else {
      res.json({
        'result': 0
      });
    }
  });
});

function getDeviceForApp(column, condition, req, res) {
  if (!req.query[condition]) {
    res.json({
      'result': -2,
      'msg': 'check ' + condition
    });
    return;
  }

  // connection.query("SELECT app_id FROM device_for_app where device_id="+mysql.escape(req.query[deviceID]), function (err, rows) {  //됨
  // connection.query("SELECT app_id FROM device_for_app where ?="+mysql.escape(req.query[deviceID]), [deviceID], function (err, rows) {  //왜 안되는거지..?
  // connection.query("SELECT app_id FROM device_for_app where ?='?'", [deviceID, req.query[deviceID]], function (err, rows) {  //왜 안되는거지..?

  connection.query("SELECT " + column + " FROM device_for_app where " + condition + "='" + req.query[condition] + "'", function (err, rows) {
    console.log('rows', rows);
    if (err) {
      res.json({
        'result': -1,
        'msg': err
      });
    } else {
      res.json({
        'result': 0,
        'rows': rows
      });
    }
  });
}

router.get('/device', function (req, res) {
  getDeviceForApp('device_id', 'app_id', req, res);
});

router.get('/app', function (req, res) {
  getDeviceForApp('app_id', 'device_id', req, res);
});

router.delete('/device', function (req, res) {
  var queryErr = -1;
  var deviceID = 'device_id';

  if (!req.body[deviceID]) {
    res.json({
      'result': -2,
      'msg': 'check ' + deviceID
    });
    return;
  }

  connection.query("delete FROM device_for_app where " + deviceID + "='" + req.body[deviceID] + "'", function (err, rows) {
    if (err) {
      res.json({
        'result': -1,
        'msg': err
      });
    } else {
      res.json({
        'result': 0
      });
    }
  });
});

module.exports = router;