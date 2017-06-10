var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('respond with a campaign');
});

router.get('/locations/:locationID', function(req, res, next){
    // res.send('good!');
    res.json({'images':[{'url':'http://wallpaper-gallery.net/images/image/image-13.jpg'},{'url':'https://www.w3schools.com/css/img_fjords.jpg'}]});
});
// 밍밍

router.delete('/info', function(req, res, next){
    // request 안에서 campaignID'들'을 가져오기
    var campIDArray = req.body.campaignID;
    var ids = ""
    for(var i=0; i<campIDArray.length; i++){
        ids += " "+campIDArray[i];

    }

    //db access -> delete infomation using id

    //if (){
    res.send('success ids: ' + ids);


    //}else{}

    //}// if 성공
    // res.send('good!');
    // else 실패
    // res.send('fail!');
});

module.exports = router;
