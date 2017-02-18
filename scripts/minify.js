var compressor = require('node-minify');

compressor.minify({
  compressor: 'gcc',
  input: 'dist/main.js',
  output: 'dist/main.js',
  options: {
    compilation_level: 'WHITESPACE_ONLY',
  },
  callback: function (err, min) {}
});

compressor.minify({
  compressor: 'clean-css',
  input: 'dist/style.css',
  output: 'dist/style.css',
  callback: function (err, min) {}
});