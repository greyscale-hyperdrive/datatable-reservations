const Promise = require('bluebird');
const nano = require('nano')('http://localhost:5984/'); // This will be an ENV variable later

Promise.promisifyAll(nano);

let couchdbInterface = {
  _database: nano.db.use('datatable_reservations')
};

// The following can be added to increase connection through-put,
// noting here for use later during optimization
// 
// http.globalAgent.maxSockets = 20;
//
// var agentkeepalive = require('agentkeepalive');
// var myagent = new agentkeepalive({
//   maxSockets: 50,
//   maxKeepAliveRequests: 0,
//   maxKeepAliveTime: 30000
// });
//
// const nano = require('nano')({
//   url: "http://localhost:5984/",
//   requestDefaults: { "agent": myagent }
// });

// Document Methods
couchdbInterface.bulkInsert = function(documents) {
  console.log(couchdbInterface._database);
  return couchdbInterface._database.bulkAsync({ docs: documents });
}

module.exports = couchdbInterface;
