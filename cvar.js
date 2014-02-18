"use strict";
var events = require('events');

var CondVar = module.exports = function (onComplete) {
    var eventEmitter = new events.EventEmitter();
    var cv = function (cb) {
        if (cv.complete) return process.nextTick(function(){ cb.apply(null, cv.values) });
        cv.on('complete', cb);
    };
    for (var k in events.EventEmitter.prototype) cv[k] = events.EventEmitter.prototype[k];

    cv.recv = cv;
    cv.send = function () {
        if (cv.complete) return;
        cv.values = Array.prototype.slice.call(arguments,0);
        cv.complete = true;
        cv.emit.apply(cv,['complete'].concat(cv.values));
    }

    cv.begin = function(cb) {
        ++ cv.depth;
        if (cb) this.groupcb = cb;
    }

    cv.end = function() {
        if (-- cv.depth == 0) {
            this.groupcb ? this.groupcb() : cv.send();
        }
    }

    cv.complete = false;
    cv.depth = 0;
    cv.err = null;
    cv.value = null;
    if (onComplete) cv.on('complete', onComplete);
    return cv;
}
