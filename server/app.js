const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '../public')));

/*
  Creation
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

  db.postTimeSlot(
    req.params.restaurant_id, 
    req.body.date, 
    req.body.time, 
    req.body.party_size, 
    req.body.party_size, // we need both 'party_size' and 'party_size_max' ? 
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
  Retrieval
*/
app.get('/restaurant/:restaurant_id/reservations', function(req, res) {
  // Select all IDs for bookings at this restaurant for a given date and time
  // This could then be used to update this specific booking with the Update method below
  // NOTE: We should also really be including user information so that one user can't alter
  // another user's booking. Unfortunately this is out of scope though...

  db.grabBookings(req.params.restaurant_id, req.query.date, req.query.time, (error, data) => {
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

app.get('/restaurant/:restaurant_id/:date', function(req, res) {
  // Select all available timeslots for bookings at this restaurant for a given date

  // I'd really like to change this URL to be underneath `/restaurant/:restaurant_id/reservations/date/:date`
  // or just as a query param for a more REST-ful structure but that would require patching 
  // the existing front-end implementation...
  db.grabTimeSlots(req.params.restaurant_id, req.params.date, (error, data) => {
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
  Update
*/
app.put('/restaurant/:restaurant_id/reservations/:booking_id', function(req, res) {
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

  db.updateBooking(parseInt(req.params.booking_id), req.body.date, req.body.time, (error, data) => {
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
    // Check data, if this transaction did not affect any rows then the booking_id is invalid
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
  Destroy
*/
app.delete('/restaurant/:restaurant_id/reservations/:booking_id', function(req, res) {
  // No need for checks to missing params here, if `restaurant_id` or `booking_id` were absent
  // then this wouldn't never even be matched and invoked

  db.deleteBooking(parseInt(req.params.booking_id), parseInt(req.params.restaurant_id), (error, data) => {
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
 