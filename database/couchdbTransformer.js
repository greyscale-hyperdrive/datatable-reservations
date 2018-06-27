module.exports = function(doc) {
  return {
    user: {
      username: doc.username,
      email: doc.email
    },
    restaurant: {
      restaurant_name: doc.restaurant_name,
      cuisine: doc.cuisine,
			phone_number: doc.phone_number,
			address: doc.address,
			website: doc.website,
      dining_style: doc.dining_style
    },
    party_size: parseInt(doc.party_size),
    party_size_max: parseInt(doc.party_size_max),
    date: new Date(doc.date),
    time: doc.time
  };
};
