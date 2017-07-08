var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'campaigndb'
});

router.get('/', function (req, res, next) {

  var sql = 'select * from campaign_info';

  campaignQuery = connection.query(sql, null, function (err, rows) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).send('error'); // 에러처리에 대한 예비코드
      return;
    }

    if (Array.isArray(rows)) {
      queryCount = rows.length;
    } else if (rows) {
      queryCount = 1;
    } else {
      queryCount = 0;
    }

    console.log(rows);
    console.log(queryCount);

    res.json({
      'count': queryCount,
      'campaigns': rows
    });
  });
});

router.get('/:campaignid', function (req, res, next) {
  let campaignId = req.params.campaignid;

  var sql = 'select * from campaign_info where id = ?';

  campaignQuery = connection.query(sql, [campaignId], function (err, rows) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).send('error'); // 에러처리에 대한 예비코드
      return;
    }

    if (rows == 0) {
      res.status(400).json({ 'error': 'GET ONE, api/campaign/:campaingid, DB select, no data' });
    } else {
      res.status(200).json(rows[0]);
    }
  });
});

router.post('/url', function (req, res, next) {
  let title = req.body.title;
  let url = req.body.url;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'insert into campaign_info '
    + '(title,url,ad_expire_day,start_date,end_date)'
    + 'values (?,?,?,?,?)';

  var query = connection.query(sql, [title, url, expireDay, startDate, endDate], function (err, result) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).send('error'); // 에러처리에 대한 예비코드
      return;
    }

    console.log(query.sql);
    console.log("Number of records inserted: " + result.affectedRows);
    res.status(200).send('success');
  });
});

router.post('/image', function (req, res, next) {

  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  let title = req.body.title;
  let uploadImage = req.files.uploadImage;
  console.log(uploadImage.name);
  let filePath = "upload_images/" + Date.now() + '-' + uploadImage.name;
  let url = req.protocol + '://' + req.get('host') + "/" + filePath;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'insert into campaign_info '
    + '(title,url,ad_expire_day,start_date,end_date)'
    + 'values (?,?,?,?,?)';
  connection.beginTransaction(function (err) {
    if (err) {
      console.error(err);
      connection.rollback(function () {
        //throw err; //처리가 필요함.
        res.status(400).send('error'); // 에러처리에 대한 예비코드
        return;
      });
    }

    var query = connection.query(sql, [title, url, expireDay, startDate, endDate], function (err, result) {
      if (err) {
        console.error(err);
        connection.rollback(function () {
          //throw err; //처리가 필요함.
          res.status(400).send('error'); // 에러처리에 대한 예비코드
          return;
        });
      }

      // Use the mv() method to place the file somewhere on your server 
      uploadImage.mv(filePath, function (err) {
        if (err) {
          console.error(err);
          connection.rollback(function () {
            //throw err; //처리가 필요함.
            res.status(400).send('error'); // 에러처리에 대한 예비코드
            return;
          });
        }
        console.log('File Uploaded!');
      });

      console.log(query.sql);
      console.log("Number of records inserted: " + result.affectedRows);
      connection.commit(function (err) {
        if (err) {
          console.error(err);
          connection.rollback(function () {
            //throw err; //처리가 필요함.
            res.status(400).send('error'); // 에러처리에 대한 예비코드
            return;
          });
        }
        console.log('Transaction Complete.');
      });
      res.status(200).send('success');
    });
  });
});

router.put('/:campaignid', function (req, res, next) {
  let campaignId = req.params.campaignid;
  let title = req.body.title;
  let url = req.body.url;
  let expireDay = req.body.expireDay;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  var sql = 'update campaign_info'
    + ' set title= ?,url=?,ad_expire_day=?,start_date=?,end_date=?'
    + ' where id = ?';

  var query = connection.query(sql, [title, url, expireDay, startDate, endDate, campaignId], function (err, result) {
    if (err) {
      console.error(err);
      //throw err; //처리가 필요함.
      res.status(400).send('error'); // 에러처리에 대한 예비코드
      return;
    }

    console.log(query.sql);
    console.log("Number of records inserted: " + result.affectedRows);
    res.status(200).send('success');
  });
});

module.exports = router;
