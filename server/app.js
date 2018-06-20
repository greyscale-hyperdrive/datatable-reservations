const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database');

let app = express();

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../public')));

// Retrieval
app.get('/restaurant/:restaurant_id/:date', function(req, res) {
  db.grabTimeSlots(req.params.restaurant_id, req.params.date, function(error, data) {
    if (error) {
      res.sendStatus(500);
    }
    res.json(data);
  }); 
});  
   
module.exports = app;
 