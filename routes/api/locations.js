var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');

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
  var getRows;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select location_id from location_for_app where app_id=?', [req.params.appid], function (err, rows) {
      if (err) {
        return next(err, 'GET ALL, api/apps/:appid/locations DB select error.');
      }
      getRows = rows;
      return next(err);
    });
  }, function (err, message) {
    if (err) {
      res.status(400).send(message);
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': getRows
      });
    }
  });
});

router.get('/:appid/locations/:locationid', function (req, res) {
  var getRow;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from location_for_app where app_id=? and location_id=?', [req.params.appid, req.params.locationid], function (err, rows) {
      if (err) {
        return next(err, 'GET ONE, api/apps/:appid/locations/:locationid DB select error.');
      }
      getRow = rows;
      return next(err);
    });
  }, function (err, message) {
    if (err) {
      res.status(400).send(message);
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': getRow
      });
    }
  });
});

router.post('/:appid/locations', function (req, res) {
  dbModule.inTransaction(dbModule.pool, function (connection, next) {
    connection.query('insert into location_for_app (app_id, location_id, title) values (?, ?, ?)', [req.params.appid, req.body.locationid, req.body.title], function (err, rows) {
      if (err) {
        return next(err, 'POST locations, api/apps/:appid/locations, DB insert, error');
      }
      return next(err);
    });
  }, function (err, message) {
    if (err || message !== undefined) {
      res.status(400).json({
        'error': message
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

  dbModule.inTransaction(dbModule.pool, function (connection, next) {
    connection.query('delete from location_for_app where (app_id, location_id) IN (?)', [locationids], function (err, rows) {
      if (err) {
        return next(err, 'DELETE ALL, api/apps/:appid/locations, DB delete, error');
      } else if (!rows.affectedRows) {
        return next(err, 'DELETE ALL, api/apps/:appid/locations, DB delete, no data');
      } else {
        return next(err);
      }
    });
  }, function (err, message) {
    if (err || message !== undefined) {
      res.status(400).json({
        'error': message
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