const mariadbInterface = require('./mariadbInterface');

let ingestor = {};

// Utility Method
const getProgressPrinter = () => {
  const emojis = ['📄', '📃', '📝'];
  let emojiCounter = 0;

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
};

// Primary Methods
ingestor.ingestArraysFromGeneratorToMariaDB = function(generatorSourceMethod, mariadbBulkInsertMethod, quantityTotal, ingestionCallback) {
  // Error check
  if (quantityTotal % 10 !== 0) {
    throw new Error("quantityTotal is divisible by 10.");
  }
  batchSize = quantityTotal * 0.01 > 1000 ? 1000 : quantityTotal * 0.01; // batchSize max is 1000

  // How batchSize and batchConnectionSegmentSize relate:
  //
  // batchSize is how many database rows each individual asynchronous connection will perform
  // batchConnectionSegmentSize is how many of those distinct database connections we're going 
  // to fire off at a time
  //
  // Below the batchConnectionSegmentSize is at a locked-in 10% of the inserted batchSize inserts, 
  // and we also make sure we don't floor to zero.
  //
  // Example: For the default batchSize of 10,000 records we'll increment in queues of 100 
  // connections each time.

  const batchConnectionSegmentSize = Math.floor(batchSize * 0.1) > 0 ? Math.floor(batchSize * 0.1) : 1; 
  // batchConnectionSegmentStepSize is then the total rows inserted after ALL batchConnectionSegment connections have resolved
  const batchConnectionSegmentStepSize = batchConnectionSegmentSize * batchSize;
  // totalInsertsCounter tracks this increase of batchConnectionSegmentStepSize each time all the queued operations resolve
  let totalInsertsCounter = 0;

  // Utility function to track how far along in the total process we are and print percentage to stdout
  let progressPrinter = getProgressPrinter();

  // Create batchSize number of rows in Array form and return
  var generateBatch = function() {
    //
    let batch = [];
    for (var i = 0; i < batchSize; i++) {
      batch.push(generatorSourceMethod());
    }
    return batch;
  };

  // The guts of the beast, this is our recursive function that will continue to recurse in total
  // increments of batchConnectionSegmentStepSize rows each call until we reach the end of our requested quantity
  var fireNextBatchConnectionSegment = function() {
    if (totalInsertsCounter >= quantityTotal) {
      // Base Case, we've successfully resolved all quantityTotal insertions requested

      // Fire callback provided at the beginning of the outer function 
      // (usually to perform work once ALL records have been successfully inserted)
      ingestionCallback();
      process.stdout.write("\n🍻"); // Cheers
      return;
    }

    // Asynchronously fire off all of the connections and inserts for this queue
    let bulkInsertPromises = [];
    for (var i = 0; i < batchConnectionSegmentSize; i++) {
      let insertBatch = generateBatch();
      let insertPromise = mariadbBulkInsertMethod(insertBatch); 
      bulkInsertPromises.push(insertPromise);
    }
    // Then "wait" for all of them to resolve
    Promise.all(bulkInsertPromises)
      .then(() => {
        // Increment Step
        totalInsertsCounter += batchConnectionSegmentStepSize;
        // Report to STDOUT
        progressPrinter(totalInsertsCounter, quantityTotal);
        // Recurse Further
        fireNextBatchConnectionSegment();
      })
      .catch((error) => {
        console.log(error);
        ingestionCallback(error);
      })
  };
  // Kick 'er off
  fireNextBatchConnectionSegment();
};

module.exports = ingestor;
