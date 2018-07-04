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
  let q = `INSERT INTO restaurants
            (restaurant_name, cuisine, phone_number, address, website, dining_style)
            VALUES ?
          ;`;
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
  let q = `INSERT INTO reservations
            (user_id, restaurant_id, party_size, party_size_max, date, time)
            VALUES ?
          ;`;
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
mariadbInterface.createRestaurant = function(restaurant_name, cuisine, phone_number, 
                                             address, website, dining_style, cb) {

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

mariadbInterface.createReservation = function(restaurant_id, user_id, date, time, 
                                              party_size, party_size_max, cb) {

  const q = 'INSERT INTO reservations SET ?';
  const reservation = {
    restaurant_id,
    user_id,
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
mariadbInterface.retrieveRestaurants = function(id, restaurant_name, cuisine,
                                                phone_number, address, website, dining_style, cb) {

  const queryValues = Array.prototype.slice.call(arguments, 0, -1);
  const q = `SELECT id, restaurant_name, cuisine, phone_number, address, website, dining_style
              FROM restaurants WHERE
                ${ id              !== undefined ? 'AND id = ?'              : '' }
                ${ restaurant_name !== undefined ? 'AND restaurant_name = ?' : '' }
                ${ cuisine         !== undefined ? 'AND cuisine = ?'         : '' }
                ${ phone_number    !== undefined ? 'AND phone_number = ?'    : '' }
                ${ address         !== undefined ? 'AND address = ?'         : '' }
                ${ website         !== undefined ? 'AND website = ?'         : '' }
                ${ dining_style    !== undefined ? 'AND dining_style = ?'    : '' }
              ;`;
  connection.query(q, queryValues, (error, results, fields) => cb(error, results));
};

// This isn't being used... remove it.
// mariadbInterface.retrieveReservation = function(reservation_id, cb) {
//   const q = 'SELECT * FROM reservations WHERE id = ? LIMIT 1;';
//   connection.query(q, [reservation_id], (error, results, fields) => cb(error, results));
// };

mariadbInterface.retrieveReservations = function(restaurant_id, user_id, date, time, cb) {
  const q = `SELECT id, user_id, restaurant_id, party_size, party_size_max, date, time
              FROM reservations WHERE
                restaurant_id = ?
                ${ user_id !== undefined ? 'AND user_id = ?' : '' }
                ${ date    !== undefined ? 'AND date = ?'    : '' }
                ${ time    !== undefined ? 'AND time = ?'    : '' }
              ;`;
  connection.query(q, [restaurant_id, user_id, date, time], (error, results, fields) => cb(error, results));
};

/*
Update
*/
mariadbInterface.updateReservation = function(reservation_id, restaurant_id, // These must always be present and are unchangeable
                                              user_id, date, time, party_size, party_size_max, cb) {
  let updateSet = {};
  // Only create updateSet keys if we actually have a value to work with
  // (otherwise we'd be updating creating a blank key, and we'd end up updating the database with null values)
  if (user_id        !== undefined) { updateSet.user_id        = user_id;        }
  if (date           !== undefined) { updateSet.date           = date;           }
  if (time           !== undefined) { updateSet.time           = time;           }
  if (party_size     !== undefined) { updateSet.party_size     = party_size;     }
  if (party_size_max !== undefined) { updateSet.party_size_max = party_size_max; }

  const q = `UPDATE reservations
              SET ?
              WHERE id = ? AND restaurant_id = ?
              LIMIT 1;
            `;
  connection.query(q, [updateSet, reservation_id, restaurant_id], (error, results, fields) => cb(error, results));
};

/*
Destroy
*/
mariadbInterface.deleteReservation = function(reservation_id, restaurant_id, cb) {
  const q = 'DELETE FROM reservations WHERE id = ? && restaurant_id = ? LIMIT 1;';
  connection.query(q, [reservation_id, restaurant_id], (error, results, fields) => cb(error, results));
};

// This isn't being used... remove it.
// mariadbInterface.deleteReservationsAtTimeSlot = function(restaurant_id, date, time, cb) {
//   const q = 'DELETE FROM reservations WHERE (restaurant_id = ? && date = ? && time = ?);';
//   connection.query(q, [restaurant_id, date, time], (error, results, fields) => cb(error, results));
// };

module.exports = mariadbInterface;
