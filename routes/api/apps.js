var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'campaigndb'
});

router.get('/', function (req, res, next) {
  var appQuery;
  var apps;
  var queryCount;

  appQuery = connection.query('select id, title from app_info', function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }
    apps = appRows;

    if (Array.isArray(apps)) {
      queryCount = apps.length;
    } else if (apps) {
      queryCount = 1;
    } else {
      //이 부분 에러 처리 할지?
      queryCount = 0;
    }

    res.status(200).json({
      'code': 0,
      'msg': 'suc',
      'result': {
        'count': queryCount,
        apps
      }
    });
  });
});

router.post('/', function (req, res) {
  //논의 사항 - 요청하는 json 방식
  // var app_info = {
  //   'title': req.body.app_info[0].title
  // };
  var insertApp = req.body.app_info[0].title;
  var appQuery;

  appQuery = connection.query('insert into app_info (title) values (?)', insertApp, function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }
    res.status(200).json({
      'code': 0,
      'msg': 'suc'
    });
  });
});

router.put('/:appId', function (req, res) {
  var appId = req.params.appId;
  var updateApp = req.body.app_info[0].title;
  var appQuery;

  appQuery = connection.query('update app_info set title=? where id=?', [updateApp, appId], function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else if (appRows.affectedRows == 0) {
      res.status(400).json({
        'code': -2,
        'msg': 'nothing changed'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.delete('/:appId', function (req, res) {
  var appId = req.params.appId;
  var appQuery;

  appQuery = connection.query('delete from app_info where id=?', appId, function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else if (appRows.affectedRows == 0) {
      res.status(400).json({
        'code': -2,
        'msg': 'nothing changed'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.get('/:appId', function (req, res, next) {
  var appId = req.params.appId;
  var appQuery;

  appQuery = connection.query('select title from app_info where id=?', appId, function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else if (appRows == 0) {
      res.status(400).json({
        'code': -6,
        'msg': 'noting to get'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': appRows[0]
      });
    }
  });
});

router.get('/:appid/locations/:locationid/campaigns', function (req, res, next) {
  var appId = req.params.appid;
  var locationId = req.params.locationid;
  var ecArr = [];
  var campaigns = [];
  var ecLength = 0;

  if (req.query.ec !== undefined) {
    ecLength = req.query.ec.length;
  }

  for (var i = 0; i < ecLength; i++) {
    ecArr.push(parseInt(req.query.ec[i]));
  }

  var campaignQuery;
  var queryCount;

  var campaignsJoinQuery = 'select cl.campaign_id, cl.campaign_order, ci.title, ci.url, ci.ad_expire_day ' +
    'from campaign_for_location as cl inner join location_for_app as la on cl.location_id=la.location_id ' +
    'inner join campaign_info as ci on cl.campaign_id=ci.id ' +
    'where la.app_id=? and la.location_id=?';
  campaignQuery = connection.query(campaignsJoinQuery, [appId, locationId], function (err, camRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      if (ecLength > 0) {
        for (var i = 0; i < camRows.length; i++) {
          if (ecArr.indexOf(camRows[i].campaign_id) < 0) {
            campaigns.push(camRows[i]);
          }
        }
      } else {
        campaigns = camRows;
      }

      if (Array.isArray(campaigns)) {
        queryCount = campaigns.length;
      } else if (campaignsArr) {
        queryCount = 1;
      } else {
        queryCount = 0;
      }

      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': {
          'count': queryCount,
          campaigns
        }
      });
    }
  });
});

router.post('/:appid/locations/:locationid/campaigns', function (req, res) {
  var appId = parseInt(req.params.appid);
  var locationId = parseInt(req.params.locationid);
  var campaigns = req.body.campaigns;
  var enrollCampaigns = [];
  var campaignsQuery;
  var enrollCampaignsQuery;

  for (var i = 0; i < campaigns.length; i++) {
    enrollCampaigns.push([locationId, campaigns[i].campaign_id, campaigns[i].campaign_order]);
  }

  enrollCampaignsQuery = 'insert into campaign_for_location (location_id, campaign_id, campaign_order) values ?';
  campaignsQuery = connection.query(enrollCampaignsQuery, [enrollCampaigns], function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.delete('/:appid/locations/:locationid/campaigns', function (req, res) {
  var appId = parseInt(req.params.appid);
  var locationId = parseInt(req.params.locationid);
  var campaigns = req.body.campaigns;
  var deleteCampaigns = [];
  var campaignsQuery;
  var deleteCampaignsQuery;

  for (var i = 0; i < campaigns.length; i++) {
    deleteCampaigns.push([locationId, campaigns[i].campaign_id]);
  }

  deleteCampaignsQuery = 'delete from campaign_for_location where (location_id, campaign_id) in (?)';
  campaignsQuery = connection.query(deleteCampaignsQuery, [deleteCampaigns], function (err, appRows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else if (appRows.affectedRows == 0) {
      res.status(400).json({
        'code': -2,
        'msg': 'nothing changed'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.get('/:appid/locations', function (req, res) {
  campaignsQuery = connection.query('select location_id from location_for_app where app_id=?', [req.params.appid], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': rows
      });
    }
  });
});

router.get('/:appid/locations/:locationid', function (req, res) {
  campaignsQuery = connection.query('select * from location_for_app where app_id=? and location_id=?', [req.params.appid, req.params.locationid], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': rows
      });
    }
  });
});

router.post('/:appid/locations', function (req, res) {
  campaignsQuery = connection.query('insert into location_for_app (app_id, location_id, title) values (?, ?, ?)', [req.params.appid, req.body.locationid, req.body.title], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.delete('/:appid/locations', function (req, res) {
  var locationids = [];

  for (var i = 0; i < req.body.locationids.length; i++) {
    locationids.push([req.params.appid, req.body.locationids[i]]);
  }

  campaignsQuery = connection.query('delete from location_for_app where (app_id, location_id) IN (?)', [locationids], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else if (!rows.affectedRows) {
      res.status(400).json({
        'code': -2,
        'msg': 'nothing changed'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.get('/:appid/devices', function (req, res) {
  campaignsQuery = connection.query('select device_id from device_for_app where app_id=?', [req.params.appid], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': rows
      });
    }
  });
});

router.get('/:appid/devices/:deviceid', function (req, res) {
  campaignsQuery = connection.query('select * from device_for_app where app_id=? and device_id=?', [req.params.appid, req.params.deviceid], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': rows
      });
    }
  });
});

router.post('/:appid/devices', function (req, res) {
  campaignsQuery = connection.query('insert into device_for_app (app_id, device_id) values (?, ?)', [req.params.appid, req.body.deviceid], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.delete('/:appid/devices/:deviceid', function (req, res) {
  //todo: 배열을 안만들고 한다면?
  var devices = [];
  devices.push([req.params.appid, req.params.deviceid]);
  campaignsQuery = connection.query('delete from device_for_app where (app_id, device_id) in (?)', [devices], function (err, rows) {
    if (err) {
      console.error(err);
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    } else if (!rows.affectedRows) {
      res.status(400).json({
        'code': -2,
        'msg': 'nothing changed'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

module.exports = router;