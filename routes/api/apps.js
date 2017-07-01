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
  var insertApp = req.body.app_info[0].title;
  var appQuery;

  appQuery = connection.query('insert into app_info (title) values (?)', insertApp, function(err, appRows){
    if (err) {
      console.error(err);
      res.status(400).json({'error':'POST, api/apps/, DB insert, error'});
    }
    res.status(200).json({'result':'Your app has been successfully registered.'});
  });
});

router.put('/:appId', function(req, res){
  var appId = req.params.appId;
  var updateApp = req.body.app_info[0].title;
  var appQuery;

  appQuery = connection.query('update app_info set title=? where id=?', [updateApp, appId], function(err, appRows){
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

router.delete('/:appId', function(req, res){
  var appId = req.params.appId;
  var appQuery;

  appQuery = connection.query('delete from app_info where id=?', appId, function(err, appRows){
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

router.get('/:appId', function(req, res, next) {
  var appId = req.params.appId;
  var appQuery;

  appQuery = connection.query('select title from app_info where id=?', appId, function(err, appRows){
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
  var appId = req.params.appid;
  var locationId = req.params.locationid;
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
  campaignQuery = connection.query(campaignsJoinQuery, [appId, locationId], function(err, camRows){
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
  var appId = parseInt(req.params.appid);
  var locationId = parseInt(req.params.locationid);
  var campaigns = req.body.campaigns;
  var enrollCampaigns = [];
  var campaignsQuery;
  var enrollCampaignsQuery;

  for(var i=0;i<campaigns.length;i++){
    enrollCampaigns.push([locationId, campaigns[i].campaign_id, campaigns[i].campaign_order]);
  }

  enrollCampaignsQuery = 'insert into campaign_for_location (location_id, campaign_id, campaign_order) values ?';
  campaignsQuery = connection.query(enrollCampaignsQuery, [enrollCampaigns], function(err, appRows){
    if (err) {
      console.error(err);
      res.status(400).json({'error':'POST, api/apps/, DB insert, error'});
    }
    else{
      res.status(200).json({'result':'Your campaigns have been successfully registered.'});
    }
  });
});

router.delete('/:appid/locations/:locationid/campaigns', function(req, res){
  var appId = parseInt(req.params.appid);
  var locationId = parseInt(req.params.locationid);
  var campaigns = req.body.campaigns;
  var deleteCampaigns = [];
  var campaignsQuery;
  var deleteCampaignsQuery;

  for(var i=0;i<campaigns.length;i++){
    deleteCampaigns.push([locationId, campaigns[i].campaign_id]);
  }

  deleteCampaignsQuery = 'delete from campaign_for_location where (location_id, campaign_id) in (?)';
  campaignsQuery = connection.query(deleteCampaignsQuery, [deleteCampaigns], function(err, appRows){
    if(err){
      console.error(err);
      res.status(400).json({'error':'DELETE, api/apps/, DB delete, error'});
    }
    if(appRows.affectedRows == 0){
      res.status(400).json({'error':'DELETE ONE, api/apps/, DB delete, no data'});
    }else{
      res.status(200).json({'result':'Your app has been successfully deleted.'});
    }
  });
});

module.exports = router;
