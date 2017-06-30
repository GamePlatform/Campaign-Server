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
      res.status(400).send('GET ALL, api/apps/ DB select error.');
    }
    apps = appRows;

    if(Array.isArray(apps)){
      queryCount = apps.length;
    }else if(apps){
      queryCount = 1;
    }else{
      //이 부분 에러 처리 할지?
      queryCount = 0;
    }

    res.json({
      'count':queryCount,
        apps
    });
  });
});

router.post('/', function(req, res){
  //논의 사항 - 요청하는 json 방식
  // var app_info = {
  //   'title': req.body.app_info[0].title
  // };
  var appQuery;
  var insertApp = req.body.app_info[0].title;

  appQuery = connection.query('insert into app_info (title) values (?)', insertApp, function(err, appRows){
    if (err) {
      console.error(err);
      res.status(400).json({'error':'POST, api/apps/, DB insert, error'});
    }
    res.status(200).json({'result':'Your app has been successfully registered.'});
  });
});

router.put('/:aid', function(req, res){
  var appQuery;
  var aid = req.params.aid;
  var updateApp = req.body.app_info[0].title;

  appQuery = connection.query('update app_info set title=? where id=?', [updateApp, aid], function(err, appRows){
    if(err){
      console.error(err);
      res.status(400).json({'error':'PUT ONE, api/apps/, DB update, error'});
    }
    if(appRows.affectedRows == 0){
      res.status(400).json({'error':'PUT ONE, api/apps/, DB update, no data'});
    }else{
      res.status(200).json({'result':'Your app has been successfully updated.'});
    }
  });
});

router.delete('/:aid', function(req, res){
  var appQuery;
  var aid = req.params.aid;

  appQuery = connection.query('delete from app_info where id=?', aid, function(err, appRows){
    if(err){
      console.error(err);
      res.status(400).json({'error':'DELETE ONE, api/apps/, DB delete, error'});
    }
    if(appRows.affectedRows == 0){
      res.status(400).json({'error':'DELETE ONE, api/apps/, DB delete, no data'});
    }else{
      res.status(200).json({'result':'Your app has been successfully deleted.'});
    }
  });
});

router.get('/:aid', function(req, res, next) {
  var appQuery;
  var aid = req.params.aid;

  appQuery = connection.query('select title from app_info where id=?', aid, function(err, appRows){
    if (err) {
      console.error(err);
      res.status(400).json({'error':'GET ONE, api/apps/, DB select, error'});
    }
    if(appRows == 0){
      res.status(400).json({'error':'GET ONE, api/apps/, DB select, no data'});
    }else{
      res.status(200).json(appRows[0]);
    }
  });
});

router.get('/:appid/locations/:locationid/campaigns', function(req, res, next){
// var dId = req.query.did;
  var aId = req.params.appid;
  var lId = req.params.locationid;
  var ecArr = [];
  var campaigns = [];
  var ecLength = 0;

  if(req.query.ec !== undefined){
    ecLength = req.query.ec.length;
  }

  for(var i = 0; i < ecLength; i++){
    ecArr.push(parseInt(req.query.ec[i]));
  }

  var campaignQuery;
  var queryCount;

  var campaignsJoinQuery = 'select cl.campaign_id, cl.campaign_order, ci.title, ci.url, ci.ad_expire_day ' +
          'from campaign_for_location as cl inner join location_for_app as la on cl.location_id=la.location_id ' +
          'inner join campaign_info as ci on cl.campaign_id=ci.id ' +
          'where la.app_id=? and la.location_id=?';
  campaignQuery = connection.query(campaignsJoinQuery, [aId, lId], function(err, camRows){
    if (err) {
      console.error(err);
      res.status(400).send('GET Campaigns, DB select error.');
    }
    else{
      if(ecLength > 0){
        for(var i = 0; i < camRows.length; i++){
          if(ecArr.indexOf(camRows[i].campaign_id) < 0){
            campaigns.push(camRows[i]);
          }
        }
      }else{
        campaigns = camRows;
      }

      if(Array.isArray(campaigns)){
        queryCount = campaigns.length;
      }else if(campaignsArr){
        queryCount = 1;
      }else{
        queryCount = 0;
      }

      res.json({
        'count':queryCount,
          campaigns
      });
    }
  });
});

router.post('/:appid/locations/:locationid/campaigns', function(req, res){
  var aId = parseInt(req.params.appid);
  var lId = parseInt(req.params.locationid);
  var campaigns = req.body.campaigns;
  var enrollCampaigns = [];
  var campaignsQuery;
  var campaignsEnrollQuery;

  for(var i=0;i<campaigns.length;i++){
    enrollCampaigns.push([lId, campaigns[i].campaign_id, campaigns[i].campaign_order]);
  }

  campaignsEnrollQuery = 'insert into campaign_for_location (location_id, campaign_id, campaign_order) values ?';
  campaignsQuery = connection.query(campaignsEnrollQuery, [enrollCampaigns], function(err, appRows){
    if (err) {
      console.error(err);
      res.status(400).json({'error':'POST, api/apps/, DB insert, error'});
    }
    else{
      res.status(200).json({'result':'Your campaigns have been successfully registered.'});
    }
  });
});

module.exports = router;
