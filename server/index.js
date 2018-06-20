const app = require('./app.js')

const port = process.env.PORT || 3001;

app.listen(port, function() {
  console.log("Listening to port 3001");
});

 