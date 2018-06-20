const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME || process.env.DATABASE_HOSTNAME,
  user: process.env.RDS_USERNAME || process.env.DATABASE_USERNAME,
  password: process.env.RDS_PASSWORD || process.env.DATABASE_PASSWORD,
  database: process.env.RDS_DB_NAME || process.env.DATABASE_DB_NAME,
  port: process.env.RDS_PORT || process.env.DATABASE_PORT
});
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
