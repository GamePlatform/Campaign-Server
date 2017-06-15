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
  res.send('respond with a campaign');
});

router.get('/locations/:locationID', function(req, res, next){

  var lId = req.params.locationID;
  var aId = req.query.aid;
  var dId = req.query.did;
  var ecArr = req.query.ec;

  var campaignQuery;
  var campaigns;
  var queryCount;

  campaignQuery = connection.query('select campaign_order, campaign_id, url, ad_expire_day from campaign_for_app inner join campaign_info on campaign_for_app.campaign_id=campaign_info.id where app_id=? and location_id=? and campaign_id not in (?)', [aId, lId, ecArr], function(err, camRows){
    campaigns = camRows;

    if(Array.isArray(campaigns)){
      queryCount = campaigns.length;
    }else if(campaigns){
      queryCount = 1;
    }else{
      queryCount = 0;
    }

    console.log(campaigns);
    console.log(queryCount);

    res.json({'count':queryCount,
                campaigns
            });
  });
});

router.post('/url', function(req, res, next){
  let title = req.body.title;
  let url = req.body.url;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'insert into campaign_info '
  +'(title,url,ad_expire_day,start_date,end_date)'
  +'values (?,?,?,?,?)';
  
  var query = connection.query(sql, [title,url,expireDay,startDate,endDate], function(err, result){
    if(err){
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).send('error'); // 에러처리에 대한 예비코드
      return;
    }

    console.log(query.sql);
    console.log("Number of records inserted: " + result.affectedRows);
    res.status(200).send('success');
    return;
  });
});

module.exports = router;
