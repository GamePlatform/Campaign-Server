var express = require('express');
var router = express.Router();

router.get("/",function(req,res,next){
	var title = 'Campaign List';
	var data = {};
	var viewPage = 'campaign_list';
	res.status(200);
	res.render('template/template',{viewPage,title,data});
});


module.exports = router;
