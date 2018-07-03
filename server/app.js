require('newrelic');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressRedisCache = require('express-redis-cache')();
const db = require('../database');

//     _____                    _________       __
//    /  _  \ ______ ______    /   _____/ _____/  |_ __ ________
//   /  /_\  \\____ \\____ \   \_____  \_/ __ \   __\  |  \____ \
//  /    |    \  |_> >  |_> >  /        \  ___/|  | |  |  /  |_> >
//  \____|__  /   __/|   __/  /_______  /\___  >__| |____/|   __/
//          \/|__|   |__|             \/     \/           |__|
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '../public')));

// Database Middleware 
// Incoming requests will receive their own database connection
// The connection is released back to the pool after response has been sent
// app.use((req, res, next) => {
//   const pool = db.connectAndGetPoolFromDatabase();
//   pool.getConnection((error, connection) => {
//     if (error) {
//       // Something has gone wrong with the database connection, return error code and message
//       console.error(error);
//       return res.status(500).json({
//         error: {
//           code: 500,
//           message: "Database Error. Please try again."
//         }
//       });
//     }
//     // Otherwise, we're good to go so add the connection to res.locals so it's available going
//     // forward and then proceed to the route
//     res.locals.connection = connection;
//     // Then make sure that at the end of the response chain we always release our connection
//     res.on('finish', () => {
//       console.log("Releasing connection.");
//       res.locals.connection.release();
//       // console.log(res.locals.connection);
//     });
//     // Middleware is done and connection is available, move forward
//     next();
//   });
// });

// Caching Middleware
// Store as variable so it can be applied as appropriate (e.g. for GETs but not POSTs)
const cacher = (req, res, next) => {
  let uniqueQueryValuesArray = [];
  if (Object.values(req.query).length) {
    uniqueQueryValuesArray = Object.values(req.query);
  }
  const cache_key = [].concat([req.path], uniqueQueryValuesArray).join('-');
  console.log(cache_key);

  res.express_redis_cache_name = cache_key;
  next();
};

//  __________               __
//  \______   \ ____  __ ___/  |_  ____   ______
//   |       _//  _ \|  |  \   __\/ __ \ /  ___/
//   |    |   (  <_> )  |  /|  | \  ___/ \___ \
//   |____|_  /\____/|____/ |__|  \___  >____  >
//          \/                        \/     \/

// Dummy Route for test purposes
app.get('/hello_world', (req, res, next) => {
  return res.status(200).end('Hello World!');
});

/*
  Creation Routes
*/
app.post('/restaurant/:restaurant_id/reservations', function(req, res) {
  // Handle invalid requests
  if (!req.body.date || !req.body.time || !req.body.party_size) {
    return res.status(400).json({
      error: {
        code: 400,
        message: "Missing 'date', 'time', or 'party_size' parameter(s) in request body."
      }
    });
  }

  // Ideally for a real feature we'd also be doing some checking here to determine if this 
  // new date/time is available before we try to book it but that's out of scope for this project

  db.postReservation(
    // res.locals.connection,
    req.params.user_id, req.params.restaurant_id, 
    req.body.date,  req.body.time, req.body.party_size, req.body.party_size,
    (error, data) => {
      // Handle Database Errors
      if (error) {
        console.error(error);
        return res.status(500).json({
         error: {
            code: 500,
            message: "Error processing request. Please try again."
         }
       });
      }
      // Otherwise return 200 and success message
      console.info(data);
      return res.json({
        message: "Success."
      });
    }
  );
});

/*
  Retrieval Routes
*/
app.get('/restaurant/:restaurant_id/reservations', cacher, function(req, res) {
  // Select all IDs for reservations at this restaurant for a given date and time
  // This could then be used to update this specific reservation with the Update method below
  // NOTE: We should also really be including/validating user information so that one 
  // user can't alter another user's reservation. Unfortunately this is out of scope though...

  db.grabReservations(
    // res.locals.connection,
    req.params.restaurant_id,
    req.query.user_id, req.query.date, req.query.time,
    (error, data) => {
      // Handle Database Errors
      if (error) {
        console.error(error);
        return res.status(500).json({
          error: {
            code: 500,
            message: "Error processing request. Please try again."
          }
        });
      }
      // Otherwise return 200 and success message
      // console.info(data);
      return res.json(data);
    });
});

app.get('/restaurant/:restaurant_id/:date', cacher, function(req, res) {
  // Select all available timeslots for reservations at this restaurant for a given date

  // I'd really like to change this URL to be underneath `/restaurant/:restaurant_id/reservations/date/:date`
  // or just as a query param for a more REST-ful structure but that would require patching 
  // the existing front-end implementation...
  db.grabTimeSlots(
    // res.locals.connection,
    req.params.restaurant_id, req.params.date,
    (error, data) => {
      // Handle Database Errors
      if (error) {
        console.error(error);
        return res.status(500).json({
          error: {
            code: 500,
            message: "Error processing request. Please try again."
          }
        });
      }
      // Otherwise return 200 and success message
      console.info(data);
      return res.json(data);
    });
});

/*
  Update Routes
*/
app.put('/restaurant/:restaurant_id/reservations/:reservation_id', function(req, res) {
  // Handle invalid requests
  if (!req.body.date || !req.body.time) {
    return res.status(400).json({
      error: {
        code: 400,
        message: "Missing 'date' or 'time' parameter(s) in request body."
      }
    });
  }

  // Ideally for a real feature we'd also be doing some checking here to determine if this 
  // new date/time is available before we try to book it but that's out of scope for this project

  db.updateReservation(
    // res.locals.connection,
    parseInt(req.params.reservation_id), parseInt(req.params.restaurant_id),
    req.body.date, req.body.time,
    (error, data) => {
      // Handle Database Errors
      if (error) {
        console.error(error);
        return res.status(500).json({
          error: {
            code: 500,
            message: "Error processing request. Please try again."
          }
        });
      }
      // Check data, if this transaction did not affect any rows then the reservation_id is invalid
      // return a 404 to indicate that this full path is inaccessible
      if (data.affectedRows === 0) {
        return res.status(404).json({
          error: {
            code: 404,
            message: "Resource Not Found."
          }
        });
      }
      // Otherwise return 200 and success message
      console.info(data);
      return res.json({
        message: "Success."
      });
    });
});

/*
  Destroy Routes
*/
app.delete('/restaurant/:restaurant_id/reservations/:reservation_id', function(req, res) {
  // No need for checks to missing params here, if `restaurant_id` or `reservation_id` were absent
  // then this wouldn't never even be matched and invoked

  db.deleteReservation(
    // res.locals.connection,
    parseInt(req.params.reservation_id), parseInt(req.params.restaurant_id),
    (error, data) => {
      // Handle Database Errors
      if (error) {
        console.error(error);
        return res.status(500).json({
          error: {
            code: 500,
            message: "Error processing request. Please try again."
          }
        });
      }
      // Check data, if this item was already deleted (no rows affected) then 
      // return a 404 to indicate that this full path is now invalid
      if (data.affectedRows === 0) {
        return res.status(404).json({
          error: {
            code: 404,
            message: "Resource Not Found."
          }
        });
      }
      // Otherwise return 200 and Success message
      console.info(data);
      return res.json({
        message: "Success."
      });
    });
});

module.exports = app;
 