/**
 * extensions.test.js created by xinwenxu - 2017/11/15.
 */
const Promise = require('../index')
const assert = require('assert')

const a = {}
const b = {}
const c = {}

const A = Promise.resolve(a)
const B = Promise.resolve(b)
const C = Promise.resolve(c)

const rejection = {}
const rejected = new Promise(function (resolve, reject) { reject(rejection) })

describe('extensions', function () {
  describe('Promise.all(...)', function () {
    describe('an array', function () {
      describe('that is empty', function () {
        it('returns a promise for an empty array', function (done) {
          let res = Promise.all([])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res.length === 0)
            done()
          })
        })
      })
      describe('of objects', function () {
        it('returns a promise for the array', function (done) {
          let res = Promise.all([a, b, c])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res[0] === a)
            assert(res[1] === b)
            assert(res[2] === c)
            done()
          })
        })
      })
      describe('of promises', function () {
        it('returns a promise for an array containing the fulfilled values', function (done) {
          let d = {}
          let resolveD
          let res = Promise.all([A, B, C, new Promise(function (resolve) { resolveD = resolve })])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res[0] === a)
            assert(res[1] === b)
            assert(res[2] === c)
            assert(res[3] === d)
            done()
          })
          resolveD(d)
        })
      })
      describe('of mixed values', function () {
        it('returns a promise for an array containing the fulfilled values', function (done) {
          let res = Promise.all([A, b, C])
          assert(res instanceof Promise)
          res.then(function (res) {
            assert(Array.isArray(res))
            assert(res[0] === a)
            assert(res[1] === b)
            assert(res[2] === c)
            done()
          })
        })
      })
      describe('containing at least one rejected promise', function () {
        it('rejects the resulting promise', function (done) {
          let res = Promise.all([A, rejected, C])
          assert(res instanceof Promise)
          res.then(function (res) {
            throw new Error('Should be rejected')
          },
            function (err) {
              assert(err === rejection)
            })
          .then(done)
        })
      })
      describe('containing at least one eventually rejected promise', function () {
        it('rejects the resulting promise', function (done) {
          let rejectB
          let rejected = new Promise(function (resolve, reject) { rejectB = reject })
          let res = Promise.all([A, rejected, C])
          assert(res instanceof Promise)
          res.then(function (res) {
            throw new Error('Should be rejected')
          },
            function (err) {
              assert(err === rejection)
            })
          .then(done)
          rejectB(rejection)
        })
      })
      describe('with a promise that resolves twice', function () {
        it('still waits for all the other promises', function (done) {
          let fakePromise = {then: function (onFulfilled) { onFulfilled(1); onFulfilled(2) }}
          let eventuallyRejected = {then: function (_, onRejected) { this.onRejected = onRejected }}
          let res = Promise.all([fakePromise, eventuallyRejected])
          assert(res instanceof Promise)
          res.then(function (res) {
            throw new Error('Should be rejected')
          },
            function (err) {
              assert(err === rejection)
            })
          .then(done)
          eventuallyRejected.onRejected(rejection)
        })
      })
      describe('when given a foreign promise', function () {
        it('should provide the correct value of `this`', function (done) {
          let p = {then: function (onFulfilled) { onFulfilled({self: this}) }}
          Promise.all([p]).then(function (results) {
            assert(p === results[0].self)
            done()
          })
        })
      })
    })
  })
})
