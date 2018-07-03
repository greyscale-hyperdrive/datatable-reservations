const mysql = require('mysql');

const connectionOptions = {
  host     : process.env.RDS_HOSTNAME || process.env.DATABASE_HOSTNAME,
  user     : process.env.RDS_USERNAME || process.env.DATABASE_USERNAME,
  password : process.env.RDS_PASSWORD || process.env.DATABASE_PASSWORD,
  database : process.env.RDS_DB_NAME  || process.env.DATABASE_DB_NAME,
  port     : process.env.RDS_PORT     || process.env.DATABASE_PORT
};
const connection = mysql.createConnection(connectionOptions);

let mariadbInterface = {};

/*
Create
*/

// Bulk Create
mariadbInterface.bulkInsertIndividualReservationsArrayLines = function(insertionQueryString, arrayLines, cb) {
  // Note: We're building a array wherein each element is an array of values matching the columns
  let batch = [];
  for(var i = 0; i < arrayLines.length; i++) {
    batch.push(arrayLines[i]);
  }
  // Example insertionQueryString:
  //   - 'INSERT INTO reservations (restaurant_id, date, time, party_size, party_size_max) VALUES ?'
  connection.query(insertionQueryString, [batch], (error, results, fields) => cb(error, results));
};

mariadbInterface.bulkInsertUsersArrayBatch = function(batchArray) {
  let q = 'INSERT INTO users (username, email) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

mariadbInterface.bulkInsertRestaurantArrayBatch = function(batchArray) {
  let q = 'INSERT INTO restaurants (restaurant_name, cuisine, phone_number, address, website, dining_style) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

mariadbInterface.bulkInsertReservationsArrayBatch = function(batchArray) {
  let q = 'INSERT INTO reservations (user_id, restaurant_id, party_size, party_size_max, date, time) VALUES ?';
  return new Promise((resolve, reject) => {
    // Queue the query and either resolve or reject promise when complete as appropriate
    connection.query(q, [batchArray], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

// Individual Creation
mariadbInterface.createRestaurant = function(restaurant_name, cuisine, phone_number, address, website, dining_style, cb) {
  const q = 'INSERT INTO restaurants SET ?';
  const restaurant = {
		restaurant_name,
		cuisine,
		phone_number,
		address,
		website,
    dining_style
  };
  connection.query(q, restaurant, (error, results, fields) => cb(error, results, fields));
};

mariadbInterface.createReservation = function(user_id, restaurant_id, date, time, party_size, party_size_max, cb) {
  const q = 'INSERT INTO reservations SET ?';
  const reservation = {
    user_id,
    restaurant_id,
    date,
    time,
    party_size,
    party_size_max
  };
  connection.query(q, reservation, (error, results, fields) => cb(error, results));
};

/*
Retrieval
*/
mariadbInterface.grabReservation = function(reservation_id, cb) {
  const q = 'SELECT * FROM reservations WHERE id = ? LIMIT 1';
  connection.query(q, [reservation_id], (error, results, fields) => cb(error, results));
};

mariadbInterface.grabReservations = function(restaurant_id, user_id, date, time, cb) {
  const q = `SELECT id, user_id, restaurant_id, party_size, party_size_max, date, time
              FROM reservations WHERE
                restaurant_id = ?
                ${ user_id ? 'AND user_id = ?' : '' }
                ${ date    ? 'AND date = ?'    : '' }
                ${ time    ? 'AND time = ?'    : '' }
              `;
  connection.query(q, [restaurant_id, user_id, date, time], (error, results, fields) => cb(error, results));
};

mariadbInterface.grabTimeSlots = function(restaurant_id, date, cb) {
  const q = 'SELECT * FROM reservations WHERE (restaurant_id = ? && date = ?);';
  connection.query(q, [restaurant_id, date], (error, results, fields) => cb(error, results));
};

/*
Update
*/
mariadbInterface.updateReservation = function(reservation_id, new_date, new_time, cb) {
  const q = 'UPDATE reservations SET date = ?, time = ? WHERE id = ? LIMIT 1;';
  connection.query(q, [new_date, new_time, reservation_idd], (error, results, fields) => cb(error, results));
};

/*
Destroy
*/
mariadbInterface.deleteReservation = function(reservation_id, cb) {
  const q = 'DELETE FROM reservations WHERE id = ? LIMIT 1;';
  connection.query(q, [reservation_id], (error, results, fields) => cb(error, results));
};

mariadbInterface.deleteReservationsAtTimeSlot = function(restaurant_id, date, time, cb) {
  const q = 'DELETE FROM reservations WHERE (restaurant_id = ? && date = ? && time = ?);';
  connection.query(q, [restaurant_id, date, time], (error, results, fields) => cb(error, results));
};

module.exports = mariadbInterface;
