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
    'id': req.body.app_info[0].id,
    'title': req.body.app_info[0].title
  };

  var query = connection.query('insert into app_info set ?', app_info,function(err,rows){
    if (err) {
      console.error(err);
      throw err;
    }
    // console.log(query);
    res.status(200).send('Your app registration was successful.');
  });
});

module.exports = router;
