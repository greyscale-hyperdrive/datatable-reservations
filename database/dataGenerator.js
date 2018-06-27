const faker = require('faker');

let dataGenerator = {
  max_restaurants: 20000,
  max_users: 50000,
  user_columns: ['username', 'email'],
  restaurant_columns: ['restaurant_name', 'cuisine', 'phone_number', 'address', 'website', 'dining_style'],
  reservation_columns: ['user_id', 'restaurant_id', 'party_size', 'party_size_max', 'date', 'time'],
};

/*
 Table-specific Methods
*/

// Users
dataGenerator.createFakeUserArray = function() {
  const username = faker.internet.userName();
  const email = faker.internet.email();

  return [
    username,
    email
  ];
};

// Restaurants
const restaurantCuisines = [
  'Burgers', 'Sushi', 'Pasta', 'Burritos', 'Tacos', 'Ramen', 'Noodles',
  'American', 'Mexican', 'French', 'Italian', 'Japanese', 'Chinese', 'Korean'
];
const restaurantDiningStyles = [
  'Fine dining', 'Casual', 'Fast food', 'Cafe', 'Buffet'
];
dataGenerator.createFakeRestaurantArray = function() {
  const restaurant_name = faker.company.companyName();
  const cuisine = restaurantCuisines[
    faker.random.number({min: 0, max: restaurantCuisines.length -1})
  ];
  const phone_number = faker.phone.phoneNumber();
  const address = [
    faker.address.streetAddress(),
    faker.address.city(),
    faker.address.zipCode()
  ].join(', ');
  const website = faker.internet.url();
  const dining_style = restaurantDiningStyles[
    faker.random.number({min: 0, max: restaurantDiningStyles.length -1})
  ];

  return [
    restaurant_name,
    cuisine,
    phone_number,
    address,
    website,
    dining_style
  ];
};

// Reservations
dataGenerator.createFakeReservationArray = function() {
  const user_id = faker.random.number({min: 1, max: dataGenerator.max_users});
  const restaurant_id = faker.random.number({min: 1, max: dataGenerator.max_restaurants});
  const date = faker.date.recent(90).toISOString().slice(0,10);
  const time = dataGenerator._generateTimeString();

  // 21 is the max total party size available but the confirmed party_size must 
  // always be less than the max so can't just do .number(21) on both lines
  const party_size = faker.random.number({min: 1, max: 17});
  const party_size_max = party_size + faker.random.number({min: 0, max: 4});

  return [
    user_id,
    restaurant_id,
    party_size,
    party_size_max,
    date,
    time
  ];
};

dataGenerator.zipColumnsAndArrayIntoObject = function(columns, array) {
  if ((columns.length !== arrray.length)) {
    throw new Error("Given columns and array are not the same length, unable to zip.");
  }

  let obj = {};
  for (var i = 0; i < columns.length; i++) {
    let column = columns[i];
    let value = array[i];
    obj[currentColumn] = value;
  }

  return obj;
};

// CSV Utility
dataGenerator.writeToFileFromGeneratorSource = function(filepath, generatorSource, quantityTotal, encoding = 'utf8', callback) {
  if (!filepath || typeof filepath !== 'string') { throw new Error("Invalid filepath provided."); }
  if (Number.isNaN(quantityTotal)) { throw new Error("Invalid quantity provided."); }
  if (typeof generatorSource !== 'function') { throw new Error("Invalid generatorSource provided."); }

  const fileStream = fs.createWriteStream(filepath);
  let quantityCount = 0;
  let loggingStep = Math.floor(quantityTotal * 0.05); // Log at every x%
  let currentLoggingTarget = loggingStep;

  const streamToFile = () => {
    let belowDrainLevel = true;
    do {
      quantityCount += 1;
      if (quantityCount === currentLoggingTarget) {
        console.log(
          `Completed writing ${currentLoggingTarget} of ${quantityTotal} records:`
          + ` ${Math.floor((currentLoggingTarget / quantityTotal) * 100)}%.`
        );
        currentLoggingTarget += loggingStep; // Increase by x%
      }
      if (quantityCount === quantityTotal) {
        // Hit the last line of requested quantity
        // Perform final write and execute the callback
        fileStream.write(generatorSource(), encoding, callback);
      } else {
        // Write and check drain status
        belowDrainLevel = fileStream.write(generatorSource(), encoding);
      }
    } while (quantityCount < quantityTotal && belowDrainLevel);

    // We hit the drain limit but we need to generate more lines
    // Set up a recursive call to our same function to be fired once the drain 
    // is finished to start again where we left off (quantityCount is scoped outside)
    if (quantityCount < quantityTotal) {
      fileStream.once('drain', streamToFile);
    }
  };
  // Kick off initial write/drain function
  streamToFile();
}

// Helper Methods
dataGenerator._generateTimeString = function() {
  // String.padStart() here will ensure length is 2 and only then 
  // insert a leading zero (i.e. '12' will remain '12' not '012')
  let hour = faker.random.number(12).toString().padStart(2, '0');
  let min = faker.random.number(60).toString().padStart(2, '0');
  let period = faker.random.boolean() ? 'AM' : 'PM';
  return `${hour}:${min} ${period}`;
};

module.exports = dataGenerator;
