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

router.get('/:appid/locations/:locationID/campaigns', function(req, res, next){

// var dId = req.query.did;
  var aId = req.params.appid;
  var lId = req.params.locationID;
  var ecArr = req.query.ec;

  var campaignQuery;
  var campaigns;
  var queryCount;

  var campaignsJoinQuery = 'select cl.campaign_id, cl.campaign_order, ci.title, ci.url, ci.ad_expire_day ' +
          'from campaign_for_location as cl inner join location_for_app as la on cl.location_id=la.location_id ' +
          'inner join campaign_info as ci on cl.campaign_id=ci.id ' +
          'where la.app_id=? and la.location_id=? and ci.id not in (?)';
  campaignQuery = connection.query(campaignsJoinQuery, [aId, lId, ecArr], function(err, camRows){
    if (err) {
      console.error(err);
      res.status(400).send('GET Campaigns, DB select error.');
    }
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
  });
});

module.exports = router;
