// taken from https://github.com/facebook/react/blob/master/jest/preprocessor.js
"use strict";

var babel = require('babel');

module.exports = {
  process: function(src) {
    return babel.transform(src);
  }
};
