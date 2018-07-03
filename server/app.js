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
    (error, data, fields) => {
      if (error) {
        return handleDatabaseError(error, res);
      }
      // If no error, return 200 and success message + appropriate data
      console.info(data);
      console.info(fields);
      return res.json({
        message: "Success.",
        data: {
          id: data.insertId
        },
        fields: fields
      });
    }    
  );
});

app.post('/restaurants/:restaurant_id/reservations', function(req, res) {
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

  db.createReservation(
    req.params.user_id, req.params.restaurant_id, 
    req.body.date,  req.body.time, req.body.party_size, req.body.party_size,
    (error, data) => {
      // Handle Database Errors
      if (error) {
        return handleDatabaseError(error, res);
      }
      // If no error, return 200 and success message + appropriate data
      console.info(data);
      return res.json({
        message: "Success.",
        data: data
      });
    }
  );
});

/*
  Retrieval Routes
*/
app.get('/restaurants/:restaurant_id/reservations', cacher, function(req, res) {
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

app.get('/restaurants/:restaurant_id/:date', cacher, function(req, res) {
  // Select all available timeslots for reservations at this restaurant for a given date

  // I'd really like to change this URL to be underneath `/restaurant/:restaurant_id/reservations/date/:date`
  // or just as a query param for a more REST-ful structure but that would require patching 
  // the existing front-end implementation...
  db.grabTimeSlots(
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
app.put('/restaurants/:restaurant_id/reservations/:reservation_id', function(req, res) {
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
app.delete('/restaurants/:restaurant_id/reservations/:reservation_id', function(req, res) {
  // No need for checks to missing params here, if `restaurant_id` or `reservation_id` were absent
  // then this wouldn't never even be matched and invoked

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
 