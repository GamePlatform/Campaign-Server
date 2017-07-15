var express = require('express');
var router = express.Router();
var mysql = require('mysql');


var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'campaigndb'
});

router.get('/', function(req, res, next) {
  res.send('respond with a campaign');
});

router.get('/locations/:locationID', function(req, res, next){
  // res.send('good!');
  res.json({'images':[{'url':'http://wallpaper-gallery.net/images/image/image-13.jpg'},{'url':'https://www.w3schools.com/css/img_fjords.jpg'}]});
});


router.delete('/:campaignid', function(req, res, next){
  // request 안에서 campaignID'들'을 가져오기
  var campid = req.params.campaignid;
  var sql = "delete from campaign_info WHERE id = ? ";
  var query = connection.query(sql, [campid], function (err, result){
    if (err){
      console.log(err);
      return;
    }
  

    res.status(200).json({
      'code': 0,
      'msg': 'suc'
    });
  });
});

router.delete('/', function(req, res, next){
  var campids = req.body.campaignids;

    var sql = "delete from campaign_info WHERE id in (?)";
    var query = connection.query(sql, [campids], function (err, result){
      if (err){
        console.log(err);
        return;
      }

      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    });
  });
  module.exports = router;
