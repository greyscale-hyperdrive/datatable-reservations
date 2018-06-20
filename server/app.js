const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '../public')));

// Create
app.post('/restaurant/:restaurant_id/reservations', function(req, res) {
  // Handle invalid requests
  if (!req.body || !req.body.date || !req.body.time) {
    res.status(400).json({
      error: {
        code: 400,
        message: "Missing 'date' or 'time' parameter(s)"
      }
    });
  }

  // Perform database work
  db.postTimeSlot(req.params.restaurant_id, req.body.date, req.body.time, (error, data) => {
    if (error) {
      res.sendStatus(500);
    }
    res.json(data);
  });
});

// Retrieval
app.get('/restaurant/:restaurant_id/:date', function(req, res) {
  db.grabTimeSlots(req.params.restaurant_id, req.params.date, (error, data) => {
    if (error) {
      res.sendStatus(500);
    }
    res.json(data);
  }); 
});
   
module.exports = app;
 