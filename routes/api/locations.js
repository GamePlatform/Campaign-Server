var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');

router.get('/:appid/locations', function (req, res) {
  var getRows;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from location_for_app where app_id=?', [req.params.appid], function (err, rows) {
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