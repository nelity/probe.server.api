var cassandra = require("cassandra-driver");
var Config = require('./config'), conf = new Config();
var cassandra_client = new cassandra.Client({
  contactPoints: conf.cassandra.contactPoints,
  keyspace: "n3l1tyCass",
  pooling: {
    coreConnectionsPerHost: {
      [cassandra.types.distance.local]: 2,
      [cassandra.types.distance.remote]: 1
    }
  }
});
module.exports.CassExecute = function (query, params, callback) {
  cassandra_client.execute(query, params, { prepare: true }, function (err, result) {
    if (err) {
      callback(true, err);
    } else {
      callback(null, result);
    }
  });
};
module.exports.CassMultipleExecute = function (queries, callback) {
  cassandra_client.batch(queries, { prepare: true }, function (err, result) {
    if (err) {
      callback(true, err);
    } else {
      callback(null, result);
    }
  });
}
module.exports.CassGetRandomUUID = function () {
  return cassandra.types.Uuid.random();
};
