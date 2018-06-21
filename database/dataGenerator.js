const faker = require('faker');

let generator = {};

// Helper Methods
const _generateTimeString = function() {
  // String.padStart() here will ensure length is 2 and only then 
  // insert a leading zero (i.e. '12' will remain '12' not '012')
  let hour = faker.random.number(12).toString().padStart(2, '0');
  let min = faker.random.number(60).toString().padStart(2, '0');
  let period = faker.random.boolean() ? 'AM' : 'PM';
  return `${hour}:${min} ${period}`;
};

// Module Methods
generator.createFakeBooking = function() {
  const party_size = faker.random.number(17); // max party_size of 17
  const party_size_max = party_size + faker.random.number(4); // max party_size_max of 21
  return {
    date: faker.date.recent(90),
    party_size,
    party_size_max,
    time: _generateTimeString(),
    restaurant_id: faker.random.number(1000, 5000)
  };
};

generator.getBatchOfBookingRecords = function(quantity) {
  console.info(`Generating ${quantity} records:`);
  console.time('generationTime');
  let batch = [];
  while(quantity) {
    batch.push(generator.createFakeBooking());
    quantity--;
  }
  setTimeout(() => {
    console.timeEnd('generationTime');  
  }, 5000);
  return batch;
};

module.exports = generator;
