var mysql = require("mysql");
var Config = require('./config'), conf = new Config();

var MySQLPool = mysql.createPool(conf.mysql);

module.exports.GetMySqlConnection = function (callback) {
  MySQLPool.getConnection(function (err, connection) {
    callback(err, connection);
  });
};