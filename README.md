[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/xujuvenile/promise-simulation.svg?branch=master)](https://travis-ci.org/xujuvenile/promise-simulation)

# Promise-Simulation

Simulate the realization of Promise base in Promise/A+ specification / It's simple version :)

If you have any question please PR or issues or email to me :)



# API

## new Promise(resolver)

This creates and returns a new promise.  `resolver` must be a function.  The `resolver` function is passed two arguments:

 1. `resolve` should be called with a single argument.  If it is called with a non-promise value then the promise is fulfilled with that value.  If it is called with a promise (A) then the returned promise takes on the state of that new promise (A).
 2. `reject` should be called with a single argument.  The returned promise will be rejected with that argument.


### Prototype Methods

These methods are invoked on a promise instance by calling `myPromise.methodName`

#### Promise#then(onFulfilled, onRejected)

#### Promise#catch(onRejected)

#### Promise#done(onFulfilled, onRejected)

The same as `.then` but it does not return a promise and any exceptions are re-thrown so that they can be logged (crashing the application in non-browser environments)

### Static Functions

  These methods are invoked by calling `Promise.methodName`.

#### Promise.resolve(value)

#### Promise.reject(value)

#### Promise.all(array)


# Passed Promises/A+ Compliance Test Suite

![detail](assert/promise.gif)

