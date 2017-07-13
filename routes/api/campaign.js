var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('respond with a campaign');
});

router.get('/locations/:locationID', function(req, res, next){
    // res.send('good!');
    res.json({'images':[{'url':'http://wallpaper-gallery.net/images/image/image-13.jpg'},{'url':'https://www.w3schools.com/css/img_fjords.jpg'}]});
});


router.delete('/:campaignid', function(req, res, next){
    // request 안에서 campaignID'들'을 가져오기
    var campid = req.param.campaignid;


    //db access -> delete infomation using id
    "delete from campaign_info WHERE id = ? ", [campaignid]

    res.send('success ids: ' + ids);


    //}else{}

    //}// if 성공
    // res.send('good!');
    // else 실패
    // res.send('fail!');
});

module.exports = router;
