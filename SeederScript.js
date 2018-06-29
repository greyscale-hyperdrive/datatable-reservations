const dataGenerator = require('./database/dataGenerator');
const dataIngestor = require('./database/dataIngestor');

const mariadbInterface = require('./database/mariadbInterface');

// "SeederScript" is intended to provide methods to be invoked via the node prompt
// (not as a module for use by other project code)
let seeder = {};

/*
'Composer' Methods
*/

// Runs the Ingestion Methods in-sequence so that the tables which are necessary for
// the following tables (they have FOREIGN KEYs to the previous tables) are seeded first.
seeder.seedAllMariadbTables = function() {
  console.info('Starting Users Seed...');
  seeder
    .seedMariadbUsers()
    .then(() => {
      console.info('Starting Restaurants Seed...');
      return seeder.seedMariadbRestaurants();
    })
    .then(() => {
      console.info('Starting Reservations Seed...');
      return seeder.seedMariadbReservations();
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

seeder.seedMongoDB = function(targetNumRecords = 10000000) {
  dataIngestor.ingestDocumentObjectsFromGeneratorToMongoDB(
    targetNumRecords,
    dataGenerator.createFakeReservationDocumentObject,
    () => {
      console.log("\n🎆 🍾 🎆");
    }
  );
}

/*
Ingestion Methods
*/

// Primary Method, utilized by the Table-Specific Methods
seeder.generateAndIngestMariadbRecords = function(arrayGeneratorMethod, mariadbBulkInsertMethod, targetNumRecords, callback) {

  console.time("Total Time");
  dataIngestor.ingestArraysFromGeneratorToMariaDB(
    arrayGeneratorMethod,
    mariadbBulkInsertMethod,
    targetNumRecords,
    (error) => {
      console.timeEnd("Total Time");
      if (error) {
        console.log("\n☠ ❌ ☠️");
      } else {
        console.log("\n🌟 💃 🌟");
      }
      callback(error);
    }
  );
};

// Table-Specific Methods
seeder.seedMariadbUsers = function(targetNumRecords = 50000) {
  return new Promise((resolve, reject) => {
    seeder.generateAndIngestMariadbRecords(
      dataGenerator.createFakeUserArray,
      mariadbInterface.bulkInsertUsersArrayBatch,
      targetNumRecords,
      (error) => {
        if (error) {
          reject();
          return;
        }
        resolve();
      }
    );
  });
};

seeder.seedMariadbRestaurants = function(targetNumRecords = 20000) {
  return new Promise((resolve, reject) => {
    return seeder.generateAndIngestMariadbRecords(
      dataGenerator.createFakeRestaurantArray,
      mariadbInterface.bulkInsertRestaurantArrayBatch,
      targetNumRecords,
      (error) => {
        if (error) {
          reject();
          return;
        }
        resolve();
      }
    );
  });
};

seeder.seedMariadbReservations = function(targetNumRecords = 10000000) {
  return new Promise((resolve, reject) => {
    return seeder.generateAndIngestMariadbRecords(
      dataGenerator.createFakeReservationArray,
      mariadbInterface.bulkInsertReservationsArrayBatch,
      targetNumRecords,
      (error) => {
        if (error) {
          reject();
          return;
        }
        resolve();
      }
    );
  });
};

/*
Utility Methods
*/

// Stringify + New Line arrays
seeder.createSQLStringFromArrayGenerator = function(arrayGenerator) {
  return arrayGenerator().join(',') + '\n';
};

// CSV Utility
seeder.generateAndWriteCsvFile = function(filepath, stringGeneratorMethod, targetNumRecords = 10000000) {
  console.time('totalTime');
  dataGenerator.writeToFileFromGeneratorSource(
    filepath,
    stringGeneratorMethod,
    targetNumRecords,
    'utf8',
    () => {
      console.timeEnd('totalTime');
      console.log("\n✨ 🎉 ✨");
    }
  );
};

module.exports = seeder;
