var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a campaign');
});

router.get('/locations/:locationID', function(req, res, next){
  // res.send('good!');
  res.json({'images':[{'url':'http://wallpaper-gallery.net/images/image/image-13.jpg'},{'url':'https://www.w3schools.com/css/img_fjords.jpg'}]});
});

module.exports = router;
