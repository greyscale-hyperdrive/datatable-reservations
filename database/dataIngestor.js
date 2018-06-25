const mariadbInterface = require('./mariadbInterface');

let ingestor = {};

// Primary Methods
ingestor.ingestArraysFromGeneratorToMariaDB = function(generatorSourceFunction, tableName, quantityTotal, batchSize, ingestionCallback) {
  if (quantityTotal % batchSize !== 0) {
    throw new Error("quantityTotal is not a product of batchSize");
  }

  // The passed in tableName allows us to provide one entry-point for this ingestion system and
  // dyamically use whichever mariadbInterface method is the generator for this table
  const mariadbBulkMethod = mariadbInterface[`bulkInsertBatch${tableName}Array`];
  if (typeof mariadbBulkMethod !== 'function') {
    throw new Error(`tableName does not have a corresponding mariadbInterface method: ${tableName}`);
  }

  // batchSize (passed in) is how many database rows each individual asynchronous connection will perform
  // batchQueueSize is how many of those distinct database connections we're going to fire off at a time
  //   * Below the batchQueueSize is at a locked-in 10% of the inserted batchSize inserts, and we also 
  //     make sure we don't floor to zero. For a batchSize of 10,000 records we'll increment in queues
  //     of 100 connections each time.
  const batchQueueSize = Math.floor(batchSize / 100) > 0 ? Math.floor(batchSize / 100) : 1; 
  // batchQueueStepSize is then the total rows inserted after ALL batchQueue connections have resolved
  const batchQueueStepSize = batchQueueSize * batchSize;
  // totalInsertsCounter tracks this increase of batchQueueStepSize each time all the queued operations resolve
  let totalInsertsCounter = 0;

  // Utility function to track how far along in the total process we are and print percentage to stdout
  const progressPrinter = ingestor.getProgressPrinter();

  // Create batchSize number of rows in Array form and return
  var generateBatch = function() {
    //
    let batch = [];
    for (var i = 0; i < batchSize; i++) {
      batch.push(generatorSourceFunction());
    }
    return batch;
  };

  // The guts of the beast, this is our recursive function that will continue to recurse in total
  // increments of batchQueueStepSize rows each call until we reach the end of our requested quantity
  var fireNextBatchQueue = function() {
    if (totalInsertsCounter >= quantityTotal) {
      // Base Case, we've successfully resolved all quantityTotal insertions requested

      // Fire callback provided at the beginning of the outer function 
      // (usually to perform work once ALL records have been successfully inserted)
      ingestionCallback();
      console.info("\n🍻\n"); // Cheers
      return;
    }

    // Asynchronously fire off all of the connections and inserts for this queue
    let bulkInsertPromises = [];
    for (var i = 0; i < batchQueueSize; i++) {
      let insertBatch = generateBatch();
      let insertPromise = mariadbBulkMethod(insertBatch); 
      bulkInsertPromises.push(insertPromise);
    }
    // Then "wait" for all of them to resolve
    Promise.all(bulkInsertPromises)
      .then(() => {
        // Increment Step
        totalInsertsCounter += batchQueueStepSize;
        // Report to STDOUT
        progressPrinter(totalInsertsCounter, quantityTotal);
        // Recurse Further
        fireNextBatchQueue();
      })
      .catch((error) => {
        console.log(error);
        throw error;
      })
  };
  // Kick 'er off
  fireNextBatchQueue();
}
ingestor.getProgressPrinter = () => {
  const emojis = ['📄', '📃', '📝'];
  let emojiCounter = 0;

  // If we're gonna be ready to start printing to STDOUT soon let's give ourselves some room
  process.stdout.write('\n\n');

  // Return Function object with closure to our emoji variables 🤓
  return (totalInsertsCounter, quantityTotal) => {
    let currentEmoji = emojis[emojiCounter];

    emojiCounter++;
    if (emojiCounter === emojis.length) {
      emojiCounter = 0;
    }

    process.stdout.write(
      `   ${currentEmoji} : ${totalInsertsCounter} of ${quantityTotal} ` +
      `[${Math.floor(totalInsertsCounter / quantityTotal * 100)}%]` + '\r'
    );
  };
}

module.exports = ingestor;
