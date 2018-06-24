const dataGenerator = require('./database/dataGenerator');
const mariadb = require('./database/mariadbInterface');
const { Writable } = require('stream');


// function generateHeapDumpAndStats() {
//   // 1. Force garbage collection every time this function is called
//   try {
//     global.gc();
//   } catch (e) {
//     console.log("You must run program with 'node --expose-gc index.js'");
//     process.exit();
//   }
 
//   //2. Output Heap stats
//   var heapUsed = process.memoryUsage().heapUsed;
//   console.info("Program is using " + heapUsed + " bytes of Heap.")
// }

// module.exports.run = function(targetNumRecords = 10000000, batchSize = 10000) { // 10 Million ::Dr Evil Pinky::
//   // console.time('totalSeedTime');

//   // Debugging:
//   console.log(`Starting a seed of ${targetNumRecords}`);

//   var dataset;

//   while(targetNumRecords > 0) {
//     batchSize = targetNumRecords < batchSize ? targetNumRecords : batchSize;
//     // console.time('generateDataset');
//     dataset = dataGenerator.getBatchOfBookingRecords(batchSize);
//     // console.timeEnd('generateDataset');

//     targetNumRecords = targetNumRecords - batchSize;
//     mariadb.bulkInsert(dataset, (error, results) => {
//       if (error) {
//         throw Error(error);
//       }
//       generateHeapDumpAndStats();
//     });

//     dataset.length = 0;
//     console.log(`${targetNumRecords} left to process...`);
//   }
//   // console.timeEnd('totalSeedTime');
//   return "🎉";
// };


class MyWritable extends Writable {
  constructor(options) {
    super(options);
  }
  _write(chunk) {
    console.log(chunk);
  }
}

module.exports.run = function(targetNumRecords = 10000000, batchSize = 10000) { // 10 Million ::Dr Evil Pinky::
  // console.time('totalSeedTime');

  // Debugging:
  console.log(`Starting a seed of ${targetNumRecords}`);

  var dataStream = dataGenerator.getReadStream(targetNumRecords, batchSize);
  console.log(dataStream);
  dataStream.pipe(new MyWritable);

  // var dataset;

  // while(targetNumRecords > 0) {
  //   batchSize = targetNumRecords < batchSize ? targetNumRecords : batchSize;
  //   // console.time('generateDataset');
  //   dataset = dataGenerator.getBatchOfBookingRecords(batchSize);
  //   // console.timeEnd('generateDataset');

  //   targetNumRecords = targetNumRecords - batchSize;
  //   mariadb.bulkInsert(dataset, (error, results) => {
  //     if (error) {
  //       throw Error(error);
  //     }
  //     generateHeapDumpAndStats();
  //   });

  //   dataset.length = 0;
  //   console.log(`${targetNumRecords} left to process...`);
  // }
  // console.timeEnd('totalSeedTime');
  return "🎉";
};
