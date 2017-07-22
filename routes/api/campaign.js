var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');

router.get('/', function (req, res, next) {
  var queryCount;
  var sql = 'select * from campaign_info';
  dbModule.withConnection(dbModule.pool, function(connection, next){
    connection.query(sql, null, function (err, rows) {
      if (err) {
        return next(err);
      }

      if (Array.isArray(rows)) {
        queryCount = rows.length;
      } else if (rows) {
        queryCount = 1;
      } else {
        queryCount = 0;
      }
      return next(err,rows,queryCount);
    });
  },function(err,message){
    if(err){
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }else{
      var rows = arguments[1];
      var count = arguments[2];

      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': {
          'count': count,
          'campaigns': rows
        }
      });
    }
  });
});

router.get('/:campaignid', function (req, res, next) {
  var campaignId = req.params.campaignid;

  var sql = 'select * from campaign_info where id = ?';
  dbModule.withConnection(dbModule.pool, function(connection, next){
    connection.query(sql, [campaignId], function (err, rows) {
      if (err) {
       return next(err);
     }

     return next(err, rows);
   });
  },function(err){
    var rows = arguments[1];

    if(err){
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }else{
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
    }
  });
});

router.post('/url', function (req, res, next) {
  var title = req.body.title;
  var url = req.body.url;
  var expireDay = req.body.expireDay;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;

  var sql = 'insert into campaign_info ' +
  '(title,url,ad_expire_day,start_date,end_date)' +
  'values (?,?,?,?,?)';
  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(sql, [title, url, expireDay, startDate, endDate], function (err, result) {
      if (err) {
        return next(err);
      }
      return next(err);
    });
  },function(err){
    if(err){
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }else{
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.post('/image', function (req, res, next) {

  if (!req.files) {
    return res.status(400).json({
      'code': -3,
      'msg': 'invalid parameter'
    });
  }

  var title = req.body.title;
  var uploadImage = req.files.uploadImage;
  var filePath = "upload_images/" + Date.now() + '-' + uploadImage.name;
  var url = req.protocol + '://' + req.get('host') + "/" + filePath;
  var expireDay = req.body.expireDay;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;

  var sql = 'insert into campaign_info ' +
  '(title,url,ad_expire_day,start_date,end_date)' +
  'values (?,?,?,?,?)';
  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(sql, [title, url, expireDay, startDate, endDate], function (err, result) {
      if (err) {
        return next(err);
        res.status(400).json({
          'code': -1,
          'msg': 'query error',
          'result': err
        });
      }
        // Use the mv() method to place the file somewhere on your server 
        uploadImage.mv(filePath, function (err) {
          if (err) {
            return next(err);
          }
        });
      });
  },function(err){
    res.status(200).json({
      'code': 0,
      'msg': 'suc'
    });
  });
});


router.put('/:campaignid', function (req, res, next) {
  var campaignId = req.params.campaignid;
  var title = req.body.title;
  var url = req.body.url;
  var expireDay = req.body.expireDay;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;

  var sql = 'update campaign_info' +
  ' set title= ?,url=?,ad_expire_day=?,start_date=?,end_date=?' +
  ' where id = ?';
  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(sql, [title, url, expireDay, startDate, endDate, campaignId], function (err, result) {
      if (err) {
        return next(err);
      }
      return next(err);
    });
  },function(err){
    if(err){
      res.status(400).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }else{
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});


router.delete('/:campaignid', function(req, res, next){
  // request 안에서 campaignID'들'을 가져오기
  var campid = req.params.campaignid;
  var sql = "devare from campaign_info WHERE id = ? ";
  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(sql, [campid], function (err, result){
      if (err){
        return next(err);
      }
      return next(err);
    });
  },function(){
    if(err){
      res.status(200).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }else{
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

router.delete('/', function(req, res, next){
  var campids = req.body.campaignids;

  var sql = "devare from campaign_info WHERE id in (?)";
  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(sql, [campids], function (err, result){
      if (err){
        console.log(err);
        return;
      }
    });
  },function(err){
    if(err){
      res.status(200).json({
        'code': -1,
        'msg': 'query error',
        'result': err
      });
    }else{
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});
module.exports = router;

