var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'campaigndb',
    waitForConnections : false
});

function inTransaction(pool, body, callback){
  withConnection(pool, function(connection, done) {
        connection.beginTransaction(function(err){
            if(err)
              return done(err);
            body(connection, finished)
        });
        // Commit or rollback transaction, then proxy callback
        function finished(err) {
            var context = this;
            var args = arguments;

            if(err){
                if(err === 'rollback'){
                    args[0] = err = null;
                }
                connection.rollback(function(){ done.apply(context, args) });
            }else{
                connection.commit(function(err){
                    args[0] = err;
                    done.apply(context, args)
                });
            }
        }
    }, callback)
}

function withConnection(pool, body, callback){
  pool.getConnection(function(err, connection){
    if(err)
      return callback(err);
    body(connection, finished);

    function finished(){
      connection.release();
      callback.apply(this, arguments);
    }
  });
}

module.exports = {
  pool : pool,
  inTransaction : inTransaction,
  withConnection : withConnection
}
