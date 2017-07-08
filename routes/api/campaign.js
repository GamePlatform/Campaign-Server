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

  var sql = 'select * from campaign_info';

  campaignQuery = connection.query(sql, null, function (err, rows) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
      return;
    }

    if (Array.isArray(rows)) {
      queryCount = rows.length;
    } else if (rows) {
      queryCount = 1;
    } else {
      queryCount = 0;
    }

    res.status(200).json({
      'code': 0,
      'msg': 'suc',
      'result': {
        'count': queryCount,
        'campaigns': rows
      }
    });
  });
});

router.get('/:campaignid', function (req, res, next) {
  let campaignId = req.params.campaignid;

  var sql = 'select * from campaign_info where id = ?';

  campaignQuery = connection.query(sql, [campaignId], function (err, rows) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
      return;
    }

    if (rows == 0) {
      res.status(400).json({
        'code': -6,
        'msg': 'noting to get'
      });
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': rows[0]
      });
    }
  });
});

router.post('/url', function (req, res, next) {
  let title = req.body.title;
  let url = req.body.url;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'insert into campaign_info ' +
    '(title,url,ad_expire_day,start_date,end_date)' +
    'values (?,?,?,?,?)';

  var query = connection.query(sql, [title, url, expireDay, startDate, endDate], function (err, result) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
      return;
    }

    res.status(200).json({
      'code': 0,
      'msg': 'suc'
    });
  });
});

router.post('/image', function (req, res, next) {

  if (!req.files) {
    return res.status(400).json({
      'code': -3,
      'msg': 'invalid parameter'
    });
  }

  let title = req.body.title;
  let uploadImage = req.files.uploadImage;
  let filePath = "upload_images/" + Date.now() + '-' + uploadImage.name;
  let url = req.protocol + '://' + req.get('host') + "/" + filePath;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'insert into campaign_info ' +
    '(title,url,ad_expire_day,start_date,end_date)' +
    'values (?,?,?,?,?)';
  connection.beginTransaction(function (err) {
    if (err) {
      console.error(err);
      connection.rollback(function () {
        //throw err; //처리가 필요함.
        res.status(400).json({
          'code': -4,
          'msg': 'transaction error',
          'result': err
        });
        return;
      });
    }

    var query = connection.query(sql, [title, url, expireDay, startDate, endDate], function (err, result) {
      if (err) {
        console.error(err);
        connection.rollback(function () {
          //throw err; //처리가 필요함.
          res.status(400).json({
            'code': -1,
            'msg': 'query error',
            'result': err
          });
          return;
        });
      }

      // Use the mv() method to place the file somewhere on your server 
      uploadImage.mv(filePath, function (err) {
        if (err) {
          console.error(err);
          connection.rollback(function () {
            //throw err; //처리가 필요함.
            //err code에 대한 수정 필요
            res.status(400).json({
              'code': -5,
              'msg': 'upload error'
            });
            return;
          });
        }
      });

      connection.commit(function (err) {
        if (err) {
          console.error(err);
          connection.rollback(function () {
            //throw err; //처리가 필요함.
            //err code에 대한 수정 필요
            res.status(400).json({
              'code': -5,
              'msg': 'upload error'
            });
            return;
          });
        }
      });
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    });
  });
});

router.put('/:campaignid', function (req, res, next) {
  let campaignId = req.params.campaignid;
  let title = req.body.title;
  let url = req.body.url;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'update campaign_info' +
    ' set title= ?,url=?,ad_expire_day=?,start_date=?,end_date=?' +
    ' where id = ?';

  var query = connection.query(sql, [title, url, expireDay, startDate, endDate, campaignId], function (err, result) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
      return;
    }

    res.status(200).json({
      'code': 0,
      'msg': 'suc'
    });
  });
});

module.exports = router;