var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'campaigndb'
});

router.get('/:campaignid', function (req, res, next) {
  let campaignId = req.params.campaignid;

  var sql = 'select * from campaign_info where id = ?';

  if(app_id = null){

  }

  if
