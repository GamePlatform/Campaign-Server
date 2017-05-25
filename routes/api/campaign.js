var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a campaign');
});

router.get('/read/locations/:locationID', function(req, res, next){
  // res.send('good!');
  res.json({'images':[{'url':'http://abdc.com/a12398'},{'url':'http://abdc.com/a12312323'}]});
});

module.exports = router;
