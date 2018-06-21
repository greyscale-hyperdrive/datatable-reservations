const faker = require('faker');

let generator = {};

generator.createFakeBooking = () => {
  const party_size = faker.number(17); // max party_size of 17
  const party_size_max = party_size + faker.number(4); // max party_size_max of 21
  return {
    date: faker.date.recent(90),
    party_size,
    party_size_max
  };
};

module.exports = generator;
