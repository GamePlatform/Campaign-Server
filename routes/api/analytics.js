var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var dbModule = require('../../config/db.js');


router.get('/:campaignid/report', function (req, res) {
  var getRows;
  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from campaign_report where campaign_id=?', [req.params.campaignid], function (err, rows) {
      if (err) {
        return next(err, 'GET report, api/campaigns/:campaignid/report DB select error.');
      }
      getRows = rows;
      return next(err);
    });
  }, function (err, message) {
    if (err) {
      res.status(400).send(message);
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': getRows
      });
    }
  });
});

router.get('/:campaignid/report/:clickType', function (req, res) {
  var clickType = req.params.clickType;
  clickType = Number(clickType);
  clickType = !isNaN(clickType) && clickType > 0 ? clickType : req.params.clickType;
  var getRows;

  dbModule.withConnection(dbModule.pool, function (connection, next) {
    connection.query('select * from campaign_click where campaign_id=? and type=?', [req.params.campaignid, clickType], function (err, rows) {
      if (err) {
        return next(err, 'GET report, api/campaigns/:campaignid/report/:clickType DB select error.');
      }
      getRows = rows;
      return next(err);
    });
  }, function (err, message) {
    if (err) {
      res.status(400).send(message);
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc',
        'result': getRows
      });
    }
  });
});

// router.post('/:appid/analytics', function (req, res) {

//   var campaignID;
//   var deviceID = req.body.deviceID;
//   var deviceSeq;
//   var clickType = req.body.clickType;

//   var selectDeviceSeqSql = 'select device_seq from device_info where id=?';
//   var insertDeviceIDSql = 'insert into device_info (id) values (?)';
//   var getRows;

//   dbModule.inTransaction(dbModule.pool, function (connection, next) {
//     connection.query(insertDeviceIDSql, [deviceID], function (err, rows) {
//       if (err) {
//         connection.query(selectDeviceSeqSql, [deviceID], function (err, rows) {
//           if (err) {
//             return next(err, 'post analytics, api/apps/:appid/analytics DeviceID select error.');
//           }
//           console.log('select: ', rows);
//           return next(err);
//         });
//         return next(err, 'post analytics, api/apps/:appid/analytics DeviceID select error.');
//       }
//       console.log('insert: ', rows);
//       return next(err);
//     });
//   }, function (err, message) {
//     if (err) {
//       res.status(400).send(message);
//     } else {
//       res.status(200).send('OK');
//       // if (getRows.length) {
//       //   console.log(getRows);
//       // } else {
//       //   res.status(200).send('OK');
//       // }
//       // var numbers = 1;
//       // var sql;
//       // if (getRows.length) {
//       //   sql = 'update campaign_report SET number = ? where campaign_id=? and device_id=? and type=?';
//       //   numbers += getRows[0].number;
//       // } else {
//       //   sql = 'insert into campaign_report (number, campaign_id, device_id, type) values (?, ?, ?, ?)';
//       // }

//       // dbModule.withConnection(dbModule.pool, function (connection, next) {
//       //   connection.query(sql, [numbers, req.params.campaignid, req.body.deviceid, clickType], function (err, rows) {
//       //     if (err) {
//       //       return next(err, 'POST report, api/campaigns/:campaignid/report, DB insert, error');
//       //     }
//       //     return next(err);
//       //   });
//       // }, function (err2, message2) {
//       //   if (err2 || message2 !== undefined) {
//       //     res.status(400).json({
//       //       'error': message2
//       //     });
//       //   } else {
//       //     res.status(200).json({
//       //       'code': 0,
//       //       'msg': 'suc'
//       //     });
//       //   }
//       // });
//     }
//   });
// });


// router.post('/:appid/analytics', function (req, res) {
//     var deviceID = req.body.deviceID;
//     var clickType = req.body.clickType;

//     var selectDeviceSeqSql = 'select device_seq from device_info where id=?';
//     var insertDeviceIDSql = 'insert into device_info (id) values (?)';
//     var getRows;

//     dbModule.inTransaction(dbModule.pool, function (connection, next) {
//       connection.query(insertDeviceIDSql, [deviceID], function (err, rows) {
//         if (err) {
//           connection.query(selectDeviceSeqSql, [deviceID], function (err, rows) {
//             if (err) {
//               return next(err, 'post analytics, api/apps/:appid/analytics DeviceID select error.');
//             }
//             console.log('select: ', rows);
//             return next(err);
//           });
//           return next(err, 'post analytics, api/apps/:appid/analytics DeviceID select error.');
//         }
//         console.log('insert: ', rows);
//         return next(err);
//       });
//     }, function (err, message) {
//       if (err) {
//         res.status(400).send(message);
//       } else {
//         res.status(200).send('OK');

//         if (getRows.length) {
//           console.log(getRows);
//         } else {
//           res.status(200).send('OK');
//         }
//       }
//     });
//   });

router.post('/:appid/analytics', function (req, res) {

  var appID = req.params.appid;
  appID = parseInt(appID);
  var deviceID = req.body.deviceID;
  var deviceSeq;
  var analytics = req.body.analytics;
  analytics = JSON.parse(analytics);

  var campaignIDArr = [];
  var typeArr = [];
  var appIDArr = [];
  var deviceSeqArr = [];

  var insertValues = [];

  var selectDeviceSeqSql = 'select device_seq from device_info where id=?';
  var insertDeviceIDSql = 'insert into device_info (id) values (?)';

  var selectAnalyticsSql = 'select number from campaign_analytics \
  where campaign_id IN (?) and type IN (?) and app_id IN (?) and device_seq IN (?)';

  var insertAnalyticsSql = 'insert into campaign_analytics \
    (campaign_id, type, app_id, device_seq, number) values(?)\
    ON DUPLICATE KEY UPDATE campaign_id=VALUES(campaign_id), \
    type=VALUES(type), app_id=VALUES(app_id), device_seq=VALUES(device_seq), number=VALUES(number)';

  dbModule.inTransaction(dbModule.pool, function (connection, next) {
    connection.query(insertDeviceIDSql, [deviceID], function (insertDeviceErr, insertDeviceRows) {
      // insert에 실패한 경우가 디바이스아이디가 있는경우가 아닌 다른 케이스에 어떻게 처리할지??
      // if (insertDeviceErr) {
      //   connection.query(selectDeviceSeqSql, [deviceID], function (selectErr, selectRows) {
      //     if (selectErr) {
      //       return next(selectErr, 'post analytics, api/apps/:appid/analytics DeviceID select error.');
      //     }
      //     return next(null, null, selectRows[0].device_seq);
      //   });
      // }

      connection.query(selectDeviceSeqSql, [deviceID], function (selectDeviceErr, selectDeviceRows) {
        if (selectDeviceErr) {
          return next(selectDeviceErr, 'post analytics, api/apps/:appid/analytics DeviceID select error.');
        }
        deviceSeq = selectDeviceRows[0].device_seq;

        for (var i = 0; i < analytics.length; i++) {
          var tempCampaignID = analytics[i].campaign_id;
          var tempType = analytics[i].type;
          var isExist = false;
          for (var j = 0; j < insertValues.length; j++) {
            if (insertValues[j][0] == tempCampaignID && insertValues[j][1] == tempType) {
              isExist = true;
              insertValues[j][4] += 1;
              break;
            }
          }
          if (!isExist) {
            insertValues.push([tempCampaignID, tempType, appID, deviceSeq, 1]);
          }
        }
        console.log('insertValues', insertValues);

        for (var i = 0; i < insertValues.length; i++) {
          campaignIDArr.push(insertValues[i][0]);
          typeArr.push(insertValues[i][1]);
          appIDArr.push(appID);
          deviceSeqArr.push(deviceSeq);
        }

        console.log(campaignIDArr, typeArr, appIDArr, deviceSeqArr);

        connection.query(selectAnalyticsSql, [campaignIDArr, typeArr, appIDArr, deviceSeqArr],
          function (selectAnalyticsErr, selectAnalyticsRows) {
            if (selectAnalyticsErr) {
              console.log('1', selectAnalyticsErr);
              return next(selectAnalyticsErr, 'post analytics, api/apps/:appid/analytics campaign_analytics select error.');
            }
            //모든 row가 존재하는건 아닐경우 가져온 number가 어떤 row의 number 인지 모름.. ??
            console.log('2', selectAnalyticsRows)
            connection.query(insertAnalyticsSql, insertValues, function (insertAnalyticsErr, insertAnalyticsRows) {
              if (insertAnalyticsErr) {
                //Connection already released ??
                console.log('3', insertAnalyticsErr);
                return next(insertAnalyticsErr, 'post analytics, api/apps/:appid/analytics campaign_analytics insert error.');
              }
              console.log('4', insertAnalyticsRows);
              return next(null, null);
            });
            return next(null, null);
          });
      });
    });
  }, function (err, message) {
    if (err) {
      res.status(400).send(message);
    } else {
      res.status(200).json({
        'code': 0,
        'msg': 'suc'
      });
    }
  });
});

module.exports = router;