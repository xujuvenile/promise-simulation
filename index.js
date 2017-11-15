const PENDING = Symbol('PENDING')
const FULFILLED = Symbol('FULFILLED')
const REJECTED = Symbol('REJECTED')

function Promise (fn) {
  // state enum: [PENDING, FULFILLED , REJECTED]
  let state = PENDING

  // store value once FULFILLED or REJECTED
  let value = null

  // store sucess & failure handlers
  let handlers = []

  let self = this

  function fulfill (result) {
    state = FULFILLED
    value = result
    handlers.forEach(handle)
    handlers = null
  }

  function reject (error) {
    state = REJECTED
    value = error
    handlers.forEach(handle)
    handlers = null
  }

  // #2.3 The Promise Resolution Procedure
  function resolve (result) {
    try {
      // #2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason
      if (self === result) {
        return reject(new TypeError('same object'))
      }

      let then = getThen(result)

      if (then) {
        // 规范里的 x ===> this.result
        // #2.3.3 if `then` is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
        return finale(then.bind(result), resolve, reject)
      } else {
        // #2.3.3.4 If then is not a function, fulfill promise with x.
        return fulfill(result)
      }
    } catch (err) {
      reject(err)
    }
  }

  // #3.1 using process.nextTick to ensure that onFulfilled and onRejected execute asynchronously
  function handle (handler) {
    if (state === PENDING) {
      handlers.push(handler)
    } else {
      if (state === FULFILLED && typeof handler.onFulfilled === 'function') {
        process.nextTick(() => handler.onFulfilled(value))
      }
      if (state === REJECTED && typeof handler.onRejected === 'function') {
        process.nextTick(() => handler.onRejected(value))
      }
    }
  }

  this.done = function (onFulfilled, onRejected) {
    handle({onFulfilled: onFulfilled, onRejected: onRejected})
  }

  this.then = function (onFulfilled, onRejected) {
    // 根据标准，如果then的参数不是function，则我们需要忽略它
    let self = this
    return new Promise((resolve, reject) => {
      try {
        self.done(// 成功方法
          function (result) {
            if (typeof onFulfilled === 'function') {
              try {
                return resolve(onFulfilled(result))
              } catch (err) {
                return reject(err)
              }
            } else {
              //  #2.2.7.3 if onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
              return resolve(result)
            }
          }, // 失败，调用 reject
          function (err) {
            if (typeof onRejected === 'function') {
              try {
                return resolve(onRejected(err))
              } catch (err) {
                return reject(err)
              }
            } else {
              return reject(err)
            }
          })
      } catch (err) {
        reject(err)
      }
    })
  }

  this.catch = function (err) {
    return this.then(null, err)
  }

  finale(fn, resolve, reject)
}

function getThen (value) {
  // #2.2.4 `onFulfilled` or `onRejected` must not be called until the execution context stack contains only platform code

  // 这里要确保传入的参数是 object/function 类型

  let t = typeof value
  if (value && (t === 'object' || t === 'function')) {
    let then = value.then
    if (typeof then === 'function') {
      return then
    }
  }
  return null
}

function finale (fn, resolve, reject) {
  // #2.1.2/3: When fulfilled/rejected, a promise: must not transition to any other state.
  // #2.2.2/3: If `onFulfilled/onRejected` is a function, 2.2.2.3: it must not be called more than once. trying to fulfill/reject a pending promise more than once
  // #2.2.6: `then` may be called multiple times on the same promise
  let done = false
  try {
    fn(function (result) {
      if (done) return
      done = true
      resolve(result)
    }, function (error) {
      if (done) return
      done = true
      reject(error)
    })
  } catch (err) {
    if (done) return
    done = true
    reject(err)
  }
}

/**
 * `deferred()`: creates an object consisting of `{ promise, resolve, reject }`
 * Promise.defer => new Promise
 * @return {{promise: Promise, resolve: *, reject: *}}
 */
Promise.deferred = Promise.defer = function () {
  let _resolve, _reject
  let promise = new Promise(function (resolve, reject) {
    _resolve = resolve
    _reject = reject
  })
  return {
    promise: promise, resolve: _resolve, reject: _reject
  }
}

/**
 * http://www.ecma-international.org/ecma-262/6.0/#sec-promise.resolve
 * @param value: promise/thenable/other value type likes null/number..
 */
Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    return resolve(value)
  })
}

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    return reject(reason)
  })
}

/**
 * in promise values, if anyone value status trans to resolve or reject, then return thispromise.resolve/reject
 * @param values
 * @return {Promise}
 */
Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function (value) {
      Promise.resolve(value).then(resolve, reject)
    })
  })
}

Promise.delay = function (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms * 1000)
  })
}

/**
 * 生成并返回一个新的promise对象。
 * 参数传递promise数组中所有的promise对象都变为resolve的时候，该方法才会返回， 新创建的promise则会使用这些promise的值。
 * 如果参数中的任何一个promise为reject的话，则整个Promise.all调用会立即终止，并返回一个reject的新的promise对象。
 * @param values
 */
Promise.all = function (values) {
  if (!Array.isArray(values)) throw new TypeError('values should be an array')
  if (values.length === 0) return Promise.resolve(values)

  return new Promise((resolve, reject) => {
    let remains = values.length

    function res (idx, val) {
      let then = getThen(val)
      if (then) {
        let p = new Promise(then.bind(val))
        p.then(function (val) {
          res(idx, val)
        }, reject)
        return
      }

      values[idx] = val
      if (--remains === 0) {
        resolve(values)
      }
    }

    for (let i = 0; i < values.length; i++) {
      res(i, values[i])
    }
  })
}

module.exports = Promise
