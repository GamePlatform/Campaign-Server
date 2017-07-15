var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');

// var connection = mysql.createConnection({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: 'root',
//   database: 'campaigndb'
// });


// router.get('/:appid/devices', function (req, res) {
//   campaignsQuery = connection.query('select device_id from device_for_app where app_id=?', [req.params.appid], function (err, rows) {
//     if (err) {
//       console.error(err);
//       res.status(400).json({
//         'code': -1,
//         'msg': 'query error',
//         'result': err
//       });
//     } else {
//       res.status(200).json({
//         'code': 0,
//         'msg': 'suc',
//         'result': rows
//       });
//     }
//   });
// });

router.get('/:appid/devices', function (req, res) {
  var getRows;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select device_id from device_for_app where app_id=?', [req.params.appid], function (err, rows) {
      if (err) {
        return next(err, 'GET ALL, api/apps/:appid/devices DB select error.');
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

// router.get('/:appid/devices/:deviceid', function (req, res) {
//   campaignsQuery = connection.query('select * from device_for_app where app_id=? and device_id=?', [req.params.appid, req.params.deviceid], function (err, rows) {
//     if (err) {
//       console.error(err);
//       res.status(400).json({
//         'code': -1,
//         'msg': 'query error',
//         'result': err
//       });
//     } else {
//       res.status(200).json({
//         'code': 0,
//         'msg': 'suc',
//         'result': rows
//       });
//     }
//   });
// });

router.get('/:appid/devices/:deviceid', function (req, res) {
  var getRow;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from device_for_app where app_id=? and device_id=?', [req.params.appid, req.params.deviceid], function (err, rows) {
      if (err) {
        return next(err, 'GET ONE, api/apps/:appid/devices/:deviceid DB select error.');
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

// router.post('/:appid/devices', function (req, res) {
//   campaignsQuery = connection.query('insert into device_for_app (app_id, device_id) values (?, ?)', [req.params.appid, req.body.deviceid], function (err, rows) {
//     if (err) {
//       console.error(err);
//       res.status(400).json({
//         'code': -1,
//         'msg': 'query error',
//         'result': err
//       });
//     } else {
//       res.status(200).json({
//         'code': 0,
//         'msg': 'suc'
//       });
//     }
//   });
// });

router.post('/:appid/devices', function (req, res) {
  dbModule.inTransaction(dbModule.pool, function (connection, next) {
    connection.query('insert into device_for_app (app_id, device_id) values (?, ?)', [req.params.appid, req.body.deviceid], function (err, rows) {
      if (err) {
        return next(err, 'POST devices, api/apps/:appid/devices, DB insert, error');
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

// router.delete('/:appid/devices/:deviceid', function (req, res) {
//   //todo: 배열을 안만들고 한다면?
//   var devices = [];
//   devices.push([req.params.appid, req.params.deviceid]);
//   campaignsQuery = connection.query('delete from device_for_app where (app_id, device_id) in (?)', [devices], function (err, rows) {
//     if (err) {
//       console.error(err);
//       res.status(400).json({
//         'code': -1,
//         'msg': 'query error',
//         'result': err
//       });
//     } else if (!rows.affectedRows) {
//       res.status(400).json({
//         'code': -2,
//         'msg': 'nothing changed'
//       });
//     } else {
//       res.status(200).json({
//         'code': 0,
//         'msg': 'suc'
//       });
//     }
//   });
// });

router.delete('/:appid/devices/:deviceid', function (req, res) {
  //todo: 배열을 안만들고 한다면?
  var devices = [];
  devices.push([req.params.appid, req.params.deviceid]);
  dbModule.inTransaction(dbModule.pool, function (connection, next) {
    connection.query('delete from device_for_app where (app_id, device_id) in (?)', [devices], function (err, rows) {
      if (err) {
        return next(err, 'DELETE ONE, api/apps/:appid/devices/:deviceid, DB delete, error');
      } else if (!rows.affectedRows) {
        return next(err, 'DELETE ONE, api/apps/:appid/devices/:deviceid, DB delete, no data');
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