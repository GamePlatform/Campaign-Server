var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	next(new Error('NoData'));
});

module.exports = router;