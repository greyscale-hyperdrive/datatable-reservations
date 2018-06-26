const faker = require('faker');

let dataGenerator = {};

// Primary Method - Generic for possible inclusion of additional tables
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

// Table-specific Methods
dataGenerator.createFakeReservationArray = function() {
  const restaurant_id = faker.random.number({min: 1000, max: 5000});
  const date = faker.date.recent(90).toISOString().slice(0,10);
  const time = dataGenerator._generateTimeString();

  // 21 is the max total party size available but the confirmed party_size must 
  // always be less than the max so can't just do .number(21) on both lines
  const party_size = faker.random.number({min: 1, max: 17});
  const party_size_max = party_size + faker.random.number({min: 0, max: 4});

  // Just a few quick sanity checks
  if (restaurant_id < 1000 || restaurant_id > 5000) {
    throw new Error("Generated an invalid restaurant_id");
  }
  if (party_size < 1 || party_size > 17) {
    throw new Error("Generated an invalid party_size");
  }
  if (party_size_max < 1 || party_size_max > 21) {
    throw new Error("Generated an invalid party_size_max");
  }

  return [
    restaurant_id,
    date,
    time,
    party_size,
    party_size_max
  ];
}

dataGenerator.createFakeReservationString = function() {
  // restaurant_id, date, time, party_size, party_size_max
  return dataGenerator.createFakeReservationArray().join(',') + '\n';
};

dataGenerator.createFakeReservationObject = function() {
  const reservationColumns = ['restaurant_id', 'date', 'time', 'party_size', 'party_size_max'];
  const fakeReservationArray = dataGenerator.createFakeReservationArray();

  // length of both reservationColumns and the length of fakeReservationArray should always be 5
  if ((reservationColumns.length !== fakeReservationArray.length) && (reservationColumns.length !== 5)) {
    throw new Error("Something has gone terribly awry. Go home dataGenerator, you're drunk.");
  }

  let fakeReservationObject = {};
  for(var i = 0; i < 5; i++) {
    let currentColumn = reservationColumns[i];
    let currentValue = fakeReservationArray[i];
    fakeReservationObject[currentColumn] = currentValue;
  }

  return fakeReservationObject;
};

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
