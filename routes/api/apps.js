var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');

router.get('/', function(req, res, next) {
  // console.log('get in');
  var queryCount;
  var getAllAppsQuery = 'select id, title from app_info';
  // console.log(getAllAppsQuery);
  dbModule.withConnection(dbModule.pool, function(connection, next){
    connection.query(getAllAppsQuery, function(err, appRows, fields){
      if (err)
        return next(err, 'GET ALL, api/apps/ DB select error.');
      if(Array.isArray(appRows)){
        queryCount = appRows.length;
      }else if(appRows){
        queryCount = 1;
      }else{
        queryCount = 0;
      }
      return next(err, appRows, queryCount);
    });
  }, function(err, message){
    console.log(err);
    var apps = arguments[1];
    var appCount = arguments[2];
    if(err)
      res.status(400).send(message);
    else
      res.json({
        'count':appCount,
        apps
      });
  });
});

router.post('/', function(req, res){
  var appTitle = req.body.app_info[0].title;
  var enrollAppQuery = 'insert into app_info (title) values (?)';

  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(enrollAppQuery, appTitle, function(err, appRows, fields){
      if (err)
        return next(err, 'POST, api/apps/, DB insert, error');
      return next(err);
    });
  }, function(err, message){
    if(err)
      res.status(400).json({'error':message});
    else
      res.status(200).json({'result':'Your app has been successfully registered.'});
  });
});

router.put('/:appId', function(req, res){
  var appId = req.params.appId;
  var updateApp = req.body.app_info[0].title;
  var updateAppQuery = 'update app_info set title=? where id=?';

  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(updateAppQuery, [updateApp, appId], function(err, appRows, fields){
      if(err){
        return next(err);
      }
      if(appRows.affectedRows == 0)
        return next(err, 'PUT, api/apps/, DB update, error');
      else
        return next(err);
    });
  }, function(err, message){
    if(err || message !== undefined)
      res.status(400).json({'error':message});
    else
      res.status(200).json({'result':'Your app has been successfully registered.'});
  });
});

router.delete('/', function(req, res){
  // var appId = req.params.appId;
  console.log('req.body: ');
  console.log(req.body);
  var apps = req.body.app_list;
  var deleteAppList = [];
  var deleteAppQuery = 'delete from app_info where (id) in (?)';

  for(var i=0;i<apps.length;i++){
    deleteAppList.push(apps[i].id);
  }

  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(deleteAppQuery, [deleteAppList], function(err, appRows, fields){
      if(err){
        return next(err, 'DELETE apps, api/apps/, DB delete, error');
      }
      if(appRows.affectedRows == 0)
        return next(err, 'DELETE apps, api/apps/, DB delete, no data');
      else
        return next(err);
    });
  }, function(err, message){
    if(err || message !== undefined)
      res.status(400).json({'error':message});
    else
      res.status(200).json({'result':'Your app has been successfully deleted.'});
  });
});

router.get('/:appId', function(req, res, next) {
  var appId = req.params.appId;
  var getAppQuery = 'select title from app_info where id=?';

  dbModule.withConnection(dbModule.pool, function(connection, next){
    connection.query(getAppQuery, appId, function(err, appRows, fields){
      if (err)
        return next(err, 'GET one app, api/apps/ DB select error.');

      return next(err, appRows);
    });
  }, function(err, message){
    var apps = arguments[1];
    if(err)
      res.status(400).send(message);
    else
      res.status(200).json(apps);
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
  var queryCount;
  var campaignsJoinQuery = 'select *' + //cl.campaign_id, cl.campaign_order, ci.title, ci.camp_desc, ci.url, ci.template, ci.ad_expire_day ' +
  'from campaign_for_location as cl inner join location_for_app as la on cl.location_seq=la.seq ' +
  'inner join campaign_info as ci on cl.campaign_id=ci.id ' +
  'where la.app_id=? and la.location_id=? and ci.start_date < NOW() and ci.end_date > NOW()';
  dbModule.withConnection(dbModule.pool, function(connection, next){
    connection.query(campaignsJoinQuery, [appId, locationId], function(err, camRows, fields){
      if (err)
        return next(err, 'GET Campaigns, DB select error.');
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
        return next(err, campaigns, queryCount);
      }
    });
  }, function(err, message){
    console.log(err);
    var campaigns = arguments[1];
    var queryCount = arguments[2];
    if(err)
      res.status(400).send(message);
    else
      res.json({
        'count':queryCount,
        campaigns
      });
  });
});

router.post('/:appid/locations/:locationid/campaigns', function(req, res){
  console.log(req.body);
  var appId = parseInt(req.params.appid);
  var locationId = req.params.locationid;
  var campaigns = req.body.campaigns;
  var enrollCampaigns = [];
  var enrollCampaignsQuery;
  var identitySql = "select seq from location_for_app where location_id=? and app_id=?";
  var locationSeq;

  enrollCampaignsQuery = 'insert ignore into campaign_for_location (location_seq, campaign_id, campaign_order)'
  +' values ?';

  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(identitySql, [locationId,appId], function(err, camRow, fields){
      if (err){
        return next(err, 'POST campaign of location, DB insert, error');
      }

      if(camRow){
        locationSeq = camRow[0].seq;
      }else{
        res.status(400).json({'error':'Not Found'});
      }

      for(var i=0;i<campaigns.length;i++){
        enrollCampaigns.push([locationSeq, campaigns[i].campaign_id, campaigns[i].campaign_order]);
        console.log(locationSeq);
      }

      connection.query(enrollCampaignsQuery, [enrollCampaigns], function(err, camRows, fields){
        if (err){
          return next(err, 'POST campaign of location, DB insert, error');
        }
        return next(err,camRows);
      });
    });
  }, function(err, message){
    if(err)
      res.status(400).json({'error':message});
    else
      res.status(200).json({'result':'Your campaigns have been successfully registered.'});
  });
});

router.delete('/:appid/locations/:locationseq/campaigns', function(req, res){
  var appId = parseInt(req.params.appid);
  var locationSeq = req.params.locationseq;
  var campaigns = req.body.campaigns;
  var deleteCampaigns = [];
  var deleteCampaignsQuery;

  for(var i=0;i<campaigns.length;i++){
    deleteCampaigns.push([locationSeq, campaigns[i].campaign_id]);
  }
  deleteCampaignsQuery = 'delete from campaign_for_location where (location_seq, campaign_id) in (?)';

  dbModule.inTransaction(dbModule.pool, function(connection, next){
    connection.query(deleteCampaignsQuery, [deleteCampaigns], function(err, appRows, fields){
      if(err){
        return next(err, 'DELETE, api/apps/, DB delete, error');
      }
      if(appRows.affectedRows == 0)
        return next(err, 'DELETE ONE, api/apps/, DB delete, no data');
      else
        return next(err);
    });
  }, function(err, message){
    console.log(err);
    if(err || message !== undefined)
      res.status(400).json({'error':message});
    else
      res.status(200).json({'result':'Your campaign has been successfully deleted.'});
  });
});

module.exports = router;
