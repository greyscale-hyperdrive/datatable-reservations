const dataGenerator = require('./database/dataGenerator');
const dataIngestor = require('./database/dataIngestor');

// "SeederScript" is intended to provide methods to be invoked via the node prompt
// (not as a module for use by other project code)
let seeder = {};

seeder.generateAndWriteBookingsCsvFile = function(filepath, targetNumRecords = 10000000) {
  console.time('totalTime');
  dataGenerator.writeToFileFromGeneratorSource(
    filepath,
    dataGenerator.createFakeBookingString,
    targetNumRecords,
    'utf8',
    () => {
      console.timeEnd('totalTime');
      console.log("\n✨🎉✨\n");
    }
  );
};

seeder.generateAndBulkInsertMariadbBookingsRecords = function(targetNumRecords = 10000000, batchSize = 1000) {
  console.time("Total Time");
  dataIngestor.ingestArraysFromGeneratorToMariaDB(
    dataGenerator.createFakeBookingArray,
    'Bookings',
    targetNumRecords,
    batchSize,
    () => {
      console.timeEnd("Total Time");
      console.log("\n🌟💃🌟\n");
    }
  );
};

module.exports = seeder;
