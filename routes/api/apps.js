var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host:'localhost',
  port:3306,
  user:'root',
  password:'root',
  database:'campaigndb'
});

router.get('/', function(req, res, next) {
  var appQuery;
  var apps;
  var queryCount;

  appQuery = connection.query('select id, title from app_info', function(err, appRows){
    if (err) {
      console.error(err);
      throw err;
    }
    apps = appRows;

    if(Array.isArray(apps)){
      queryCount = apps.length;
    }else if(apps){
      queryCount = 1;
    }else{
      queryCount = 0;
    }

    res.json({'count':queryCount,
                apps
            });
  });
});

router.post('/', function(req, res){
  var app_info = {
    'title': req.body.app_info[0].title
  };

  var query = connection.query('insert into app_info set ?', app_info,function(err,rows){
    if (err) {
      console.error(err);
      throw err;
    }
    res.status(200).send('Your app registration was successful.');
  });
});

router.get('/:aid', function(req, res, next) {
  var appQuery;
  var aid = req.params.aid;

  appQuery = connection.query('select title from app_info where id=?', aid, function(err, appRows){
    if (err) {
      console.error(err);
      throw err;
    }

    //need error
    // if(!apps){
    //   throw err;
    // }

    res.json(appRows[0]);
  });
});

module.exports = router;
