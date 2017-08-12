var express = require('express');
var router = express.Router();

router.get("/",function(req,res,next){
	var title = 'Campaign-Advisor';
	var data = {};
	var viewPage = 'campaign';
	res.status(200);
	res.render('template/template',{viewPage,title,data});
});

module.exports = router;