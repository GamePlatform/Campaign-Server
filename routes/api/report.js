var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');


router.get('/:campaignid/report', function (req, res) {
  var getRows;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from campaign_report where campaign_id=?', [req.params.campaignid], function (err, rows) {
      if (err) {
        return next(err, 'GET report, api/campaigns/:campaignid/report DB select error.');
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

router.get('/:campaignid/report/:clickType', function (req, res) {
  var clickType = req.params.clickType;
  clickType = Number(clickType);
  clickType = !isNaN(clickType) && clickType>0 ? clickType : req.params.clickType;
  var getRows;
  
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from campaign_click where campaign_id=? and type=?', [req.params.campaignid, clickType], function (err, rows) {
      if (err) {
        return next(err, 'GET report, api/campaigns/:campaignid/report/:clickType DB select error.');
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

router.post('/:campaignid/report', function (req, res) {
  var clickType = req.body.clickType;
  clickType = Number(clickType);
  clickType = !isNaN(clickType) && clickType>0 ? clickType : req.body.clickType;
  var getRows;
  dbModule.inTransaction(dbModule.pool, function (connection, next) {
    connection.query('select number from campaign_report where campaign_id=? and device_id=? and type=?', [req.params.campaignid, req.body.deviceid, clickType], function (err, rows) {
      if (err) {
        return next(err, 'GET report, api/campaigns/:campaignid/report DB select error.');
      }
      getRows = rows;
      return next(err);
    });
  }, function (err, message) {
    if (err) {
      res.status(400).send(message);
    } else {
      var numbers = 1;
      var sql;
      if (getRows.length) {
        sql = 'update campaign_report SET number = ? where campaign_id=? and device_id=? and type=?';
        numbers += getRows[0].number;
      } else {
        sql = 'insert into campaign_report (number, campaign_id, device_id, type) values (?, ?, ?, ?)';
      }

      dbModule.withConnection(dbModule.pool, function (connection, next) {
        connection.query(sql, [numbers, req.params.campaignid, req.body.deviceid, clickType], function (err, rows) {
          if (err) {
            return next(err, 'POST report, api/campaigns/:campaignid/report, DB insert, error');
          }
          return next(err);
        });
      }, function (err2, message2) {
        if (err2 || message2 !== undefined) {
          res.status(400).json({
            'error': message2
          });
        } else {
          res.status(200).json({
            'code': 0,
            'msg': 'suc'
          });
        }
      });
    }
  });
});

module.exports = router;