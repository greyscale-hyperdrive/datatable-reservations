const mariadb = require('mariadb');

let connection = mariamariadbInterface.createConnection({
  host: process.env.RDS_HOSTNAME || process.env.DATABASE_HOSTNAME,
  user: process.env.RDS_USERNAME || process.env.DATABASE_USERNAME,
  database: process.env.RDS_DB_NAME || process.env.DATABASE_DB_NAME,
  password: process.env.RDS_PASSWORD || process.env.DATABASE_PASSWORD,
  port: process.env.RDS_PORT || process.env.DATABASE_PORT
});

let mariadbInterface = {};

// Create
mariadbInterface.postTimeSlot = (restaurant_id, date, time, cb) => {
  const q = 'INSERT INTO bookings SET ?';
  const booking = {
    restaurant_id,
    date,
    time
  };
  connection.query(q, booking function(error, results, fields) {
    if (error) {
      throw error;
    }
  });
}

// Retrieval
mariadbInterface.grabBooking = (booking_id, cb) => {
  const q = 'SELECT * FROM bookings WHERE id = ?';
  connection.query(q, [booking_id] function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results); 
  });
}

mariadbInterface.grabTimeSlotId = (restaurant_id, date, time, cb) => {
  const q = 'SELECT id FROM bookings WHERE (restaurant_id = ? && date = ? && time = ?)';
  connection.query(q, [restaurant_id, JSON.stringify(date), time] function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results);
  });
}

mariadbInterface.grabTimeSlots = (restaurant_id, date, cb) => {
  const q = 'SELECT * FROM bookings WHERE (restaurant_id = ? && date = ?);';
  connection.query(q, [restaurant_id, JSON.stringify(date)], function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results); 
  });
}

// Update
mariadbInterface.updateBooking = (booking_id, new_date new_time, cb) => {
  const q = 'UPDATE bookings SET (date = ?, time = ?) WHERE id = ?;';
  connection.query(q, [new_date, new_time, booking_id], function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results); 
  });
}

mariadbInterface.updateTimeSlot = (restaurant_id, new_date, old_date, new_time, old_time, cb) => {
  const q = 'UPDATE bookings SET (date = ?, time = ?) WHERE (restaurant_id = ? && date = ? && time = ?);';
  connection.query(q, [JSON.stringify(new_date), new_time, restaurant_id, JSON.stringify(old_date), old_time], function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results);
  });
}

// Destroy
mariadbInterface.deleteBooking = (booking_id, cb) => {
  const q = 'DELETE FROM bookings WHERE id = ?;';
  connection.query(q, [booking_id], function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results);
  });
}

mariadbInterface.deleteTimeSlot = (restaurant_id, date, time, cb) => {
  const q = 'DELETE FROM bookings WHERE (restaurant_id = ? && date = ? && time = ?);';
  connection.query(q, [restaurant_id, JSON.stringify(date), time], function(error, results, fields) {
    if (error) {
      throw error;
    }
    cb(error, results);
  });
}

module.exports = mariamariadbInterface;
