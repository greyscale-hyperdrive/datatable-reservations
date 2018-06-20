const path = require('path');
const SRC_DIR = path.join(__dirname, '/client');
const DIST_DIR = path.join(__dirname, '/public/dist');

module.exports = {
  mode: 'production',
	entry: `${SRC_DIR}/index.jsx`,
	output: {
		filename: 'reservationsBundle.js',
		path: DIST_DIR
	},
	module: {
    rules: [ 
      {
        test: /\.jsx?/, 
        include: SRC_DIR,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      },
      { 
        test: /\.css$/,
        loader: 'style-loader!css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]'
      }
    ]
  } 
};
