const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/datatable_reservations');

const reservationSchema = new mongoose.Schema({
  user: {
    username: String,
    email: String
  },
  restaurant: {
    restaurant_name: String,
		cuisine: String,
		phone_number: String,
		address: String,
		website: String,
		dining_style: String
  },
  party_size: Number,
	party_size_max: Number,
	date: Date,
	time: String
});
const Reservation = mongoose.model('Reservation', reservationSchema);

return module.exports = {
  Reservation
};
