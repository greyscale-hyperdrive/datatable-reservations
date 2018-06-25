const mysql = require('mysql');

const connectionOptions = {
  host: process.env.RDS_HOSTNAME || process.env.DATABASE_HOSTNAME,
  user: process.env.RDS_USERNAME || process.env.DATABASE_USERNAME,
  password: process.env.RDS_PASSWORD || process.env.DATABASE_PASSWORD,
  database: process.env.RDS_DB_NAME || process.env.DATABASE_DB_NAME,
  port: process.env.RDS_PORT || process.env.DATABASE_PORT
};
console.info(connectionOptions);
const connection = mysql.createConnection(connectionOptions);
let mariadbInterface = {};

// Create
mariadbInterface.postTimeSlot = (restaurant_id, date, time, party_size, party_size_max, cb) => {
  const q = 'INSERT INTO bookings SET ?';
  const booking = {
    restaurant_id,
    date,
    time,
    party_size,
    party_size_max
  };
  connection.query(q, booking, (error, results, fields) => cb(error, results));
};

// Bulk Create
mariadbInterface.bulkInsertIndividualBookingsArrayLines = function(arrayLines, cb) {
  let q = 'INSERT INTO bookings (restaurant_id, date, time, party_size, party_size_max) VALUES ?';
  // Note: We're building a array wherein each element is an array of values matching the columns
  let batch = [];
  for(var i = 0; i < arrayLines.length; i++) {
    batch.push(arrayLines[i]);
  }
  connection.query(q, [batch], (error, results, fields) => cb(error, results));
};

mariadbInterface.bulkInsertBatchBookingsArray = function(batchArray) {
  let q = 'INSERT INTO bookings (restaurant_id, date, time, party_size, party_size_max) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
}

// Retrieval
mariadbInterface.grabBooking = (booking_id, cb) => {
  const q = 'SELECT * FROM bookings WHERE id = ?';
  connection.query(q, [booking_id], (error, results, fields) => cb(error, results));
};

mariadbInterface.grabBookings = (restaurant_id, date, time, cb) => {
  const q = `SELECT * FROM bookings WHERE (restaurant_id = ? ${ date ? '&& date = ?' : '' } ${ time ? '&& time = ?' : '' })`;
  connection.query(q, [restaurant_id, date, time], (error, results, fields) => cb(error, results));
};

mariadbInterface.grabTimeSlots = (restaurant_id, date, cb) => {
  const q = 'SELECT * FROM bookings WHERE (restaurant_id = ? && date = ?);';
  connection.query(q, [restaurant_id, date], (error, results, fields) => cb(error, results));
};

// Update
mariadbInterface.updateBooking = (booking_id, new_date, new_time, cb) => {
  const q = 'UPDATE bookings SET date = ?, time = ? WHERE id = ?;';
  connection.query(q, [new_date, new_time, booking_id], (error, results, fields) => cb(error, results));
};

// Destroy
mariadbInterface.deleteBooking = (restaurant_id, booking_id, cb) => {
  const q = 'DELETE FROM bookings WHERE id = ?;';
  connection.query(q, [booking_id], (error, results, fields) => cb(error, results));
};

mariadbInterface.deleteBookingsAtTimeSlot = (restaurant_id, date, time, cb) => {
  const q = 'DELETE FROM bookings WHERE (restaurant_id = ? && date = ? && time = ?);';
  connection.query(q, [restaurant_id, date, time], (error, results, fields) => cb(error, results));
};

module.exports = mariadbInterface;
