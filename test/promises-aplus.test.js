/**
 * index.test.js created by xinwenxu - 2017/11/13.
 */

const adapter = require('../index')

describe('Promises/A+ Tests', function () {
  require('promises-aplus-tests').mocha(adapter)
})
