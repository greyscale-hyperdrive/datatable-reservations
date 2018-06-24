const faker = require('faker');
const { Readable } = require('stream');

let generator = {};


class dataStream extends Readable {
  constructor(totalQuantity, batchQuantity) {
    super();
    this.totalQuantity = totalQuantity;
    this.batchQuantity = batchQuantity;
    this.currentCursor = 0;
  }

  read(size) {
    const batchSize = this.currentCursor > this.totalQuantity ? this.currentCursor - this.totalQuantity : this.batchQuantity;
    const value = generator.getBatchOfBookingRecords(batchSize, true);
    console.log(this);
    console.log(value);
    this.push(null);
    return;
    this.push(value);
    if (this.currentCursor > this.totalQuantity) {
      this.push(null); // We're at the end of the total request
    }
    this.currentCursor += batchSize;
  }
}

generator.getReadStream = function(totalQuantity, batchQuantity) {
  return new dataStream(totalQuantity, batchQuantity);
};

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
generator.createFakeBookingObject = function() {
  const party_size = faker.random.number(17); // max party_size of 17
  const party_size_max = party_size + faker.random.number(4); // max party_size_max of 21
  return {
    restaurant_id: faker.random.number(1000, 5000),
    date: faker.date.recent(90).toISOString().slice(0,10),
    time: _generateTimeString(),
    party_size,
    party_size_max
  };
};

generator.createFakeBookingString = function() {
  const party_size = faker.random.number(17); // max party_size of 17
  const party_size_max = party_size + faker.random.number(4); // max party_size_max of 21
  // restaurant_id, date, time, party_size, party_size_max
  return [
    faker.random.number(1000, 5000),
    faker.date.recent(90).toISOString().slice(0,10),
    _generateTimeString(),
    party_size,
    party_size_max
  ].join(',');
};

generator.getBatchOfBookingRecords = function(quantity, string) {
  // console.info(`Generating ${quantity} records:`);
  let batch = [];
  while(quantity > 0) {
    if (string) {
      batch.push(generator.createFakeBookingString());  
    } else {
      batch.push(generator.createFakeBookingObject());
    }
    quantity--;
  }
  return batch;
};

module.exports = generator;
