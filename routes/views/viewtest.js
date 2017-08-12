var express = require('express');
var router = express.Router();

router.get("/",function(req,res,next){
	var title = 'View Test';
	var data = {'message':"hello world"};
	var viewPage = 'test';
	res.status(200);
	res.render('template/template',{viewPage,title,data});
});


module.exports = router;
