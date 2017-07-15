var express = require('express');

var logErrors = function(err, req, res, next) {
  console.error(err.stack);
  next(err); //pass to next error handler
}

var errorHandler = function(err,req,res,next){
	switch(err.message){
		case 'DB':
			res.status(408);
			res.send('error: Connection Time over');
			break;
		case 'NoData':
		case 'BadRequest':
		case 'Upload':
			res.status(400);
			res.send('error: Bad Request');
			break;
		case 'NotFound':
			res.status(404);
			res.send('error: Not Found');
			break;
		default:
			res.status(500);
			res.send('error: Unknown Error')
			break;
	}
}

module.exports = {
	logErrors,
	errorHandler
}