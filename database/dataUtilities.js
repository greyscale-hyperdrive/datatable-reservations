// Utility Method
module.exports.getProgressPrinter = () => {
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
