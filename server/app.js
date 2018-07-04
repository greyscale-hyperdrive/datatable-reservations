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

const handleDatabaseError = function(error, res) {
  // NOTE: We could check for error.errno codes here and return different statuses
  // such as 400s if the error was actually the user's fault, but that's outside of our scope
  // Just noting these as ones that I ran into while testing:
  //
  // 1048 - ER_BAD_NULL_ERROR        - Column is NOT NULL and you tried to insert a null value
  // 1292 - ER_TRUNCATED_WRONG_VALUE - Occurs when the incoming data is not the right format
  // 1452 - ER_NO_REFERENCED_ROW_2   - Invalid Foreign Key
  console.error(error);
  return res.status(500).json({
    error: {
      code: 500,
      message: "Error processing request. Please try again."
    }
  });
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
app.post('/restaurants', function(req, res) {
  // Handle invalid requests
  if (!req.body.restaurant_name || !req.body.cuisine || !req.body.phone_number || !req.body.address) {
    return res.status(400).json({
      error: {
        code: 400,
        message: "Missing 'restaurant_name', 'cuisine', 'phone_number', or 'address' parameter(s) in request body."
      }
    });
  }

  db.createRestaurant(
    req.body.restaurant_name, req.body.cuisine, req.body.phone_number, req.body.address, // These are required
    req.body.website, req.body.dining_style, // These are optional
    (error, data) => {
      if (error) {
        return handleDatabaseError(error, res);
      }
      // If no error, return 200 and success message + appropriate data
      return res.json({
        message: "Success.",
        data: {
          id: data.insertId
        }
      });
    }    
  );
});

app.post('/restaurants/:restaurant_id/reservations', function(req, res) {
  // Handle invalid requests
  if (!req.body.user_id || !req.body.date || !req.body.time || !req.body.party_size) {
    return res.status(400).json({
      error: {
        code: 400,
        message: "Missing 'user_id', date', 'time', or 'party_size' parameter(s) in request body."
      }
    });
  }

  // Ideally for a real feature we'd also be doing some checking here to determine if this 
  // new date/time is available before we try to book it but that's out of scope for this project

  db.createReservation(
    req.params.restaurant_id, req.body.user_id,
    req.body.date, req.body.time, req.body.party_size, req.body.party_size,
    (error, data) => {
      // Handle Database Errors
      if (error) {
        return handleDatabaseError(error, res);
      }
      // If no error, return 200 and success message + appropriate data
      console.info(data);
      return res.json({
        message: "Success.",
        data: {
          id: data.insertId
        }
      });
    }
  );
});

/*
  Retrieval Routes
*/
app.get('/restaurants/:restaurant_id', cacher, function(req, res) {
  // Select all available restaurants for the given params
  // (in this case, restaurant_id will always be present)
  db.retrieveRestaurants(
    req.params.restaurant_id,
    req.query.restaurant_name, req.query.cuisine, req.query.phone_number, req.query.address,
		req.query.website, req.query.dining_style,
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
      // Otherwise return 200 and data
      console.info(data);
      return res.json(data);
    });
});

app.get('/restaurants/:restaurant_id/reservations', cacher, function(req, res) {
  // Select all IDs for reservations at this restaurant for a given date and time
  // This could then be used to update these specific reservations with the appropriate PUT route

  // NOTE: We should also really be including/validating user information so that one 
  // user can't alter another user's reservation. Unfortunately this is out of scope though...

  db.retrieveReservations(
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
      // Otherwise return 200 and data
      // console.info(data);
      return res.json(data);
    });
});

/*
  Update Routes
*/
app.put('/restaurants/:restaurant_id/reservations/:reservation_id', function(req, res) {

  db.updateReservation(
    parseInt(req.params.reservation_id), parseInt(req.params.restaurant_id),
    req.body.user_id, req.body.date, req.body.time, req.body.party_size, req.body.party_size_max,
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
      // return a 404 to indicate that this path is invalid (changedRows is separate)
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
app.delete('/restaurants/:restaurant_id/reservations/:reservation_id', function(req, res) {
  // No need for checks to missing params here, if `restaurant_id` or `reservation_id` were absent
  // then this would never even be matched and invoked
  db.deleteReservation(
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
        console.info(data);
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
 