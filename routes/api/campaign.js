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
    if (err) {
      console.error(err);
      throw err;
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

module.exports = router;
