var express = require('express');
var router = express.Router();

router.get("/",function(req,res,next){
	var title = 'App Location Page';
	var data = {};
	var viewPage = 'app-location';
	res.status(200);
	res.render('template/template',{viewPage,title,data});
});

module.exports = router;
