cvar
----

Callback only condition variables

Synopsis
--------

    var CondVar = require('cvar');

    var cv1 = CondVar();

    setTimeout(function(){ cv1.send('asdf') }, 1000);

    cv1.recv(function(got) {
        console.log(got); // asdf
    });

    // or
    cv1(function(got){ console.log(got); /* asdf */ });

    var cv2 = CondVar();

    for (var ii=0; ii<10; ++ii) {
        cv2.begin();
        setTimeout(function(){ cv2.end() }, 1000 - (ii*100));
    }
    cv2.recv(function() {
        console.log('complete'); // after 900 ms
    });


Description
-----------

Condition variables are Yet Another way of storing callback state in an
async program.  They bear some similarlity to promises and continuables.

Functions
---------

`var CondVar = require('cvar');`

* CondVar([callback]) -> cvar

Returns a new condition variable. The optional callback will be called
when the cvar is completed, see below.  It's the same as calling the
`recv()` method.

Methods
-------

* send(...)

Stores the argument list, emits the `complete` event.  The argument list is
passed to the event and to any `recv` callbacks.  The `complete` event will
only be emitted once, even if this is called more then once.

* recv(callback)

Receives the values sent via `send`.  The argument list passed to `send`
will be passed to the callback when its called.  The callback will only ever
be called once.  As many things can call `recv` as you want and they'll all
receive the same result.  Even if the condvar is already complete, the
allback is guarenteed to not be executed immediately-- at nextTick at the
soonest.

* begin(groupcallback)

* end()

The `begin` method increments an internal counter, the `end` method
decrements it.  When the counter reaches zero the groupcallback will be
called.  If none is specified then `send` will be called with no arguments.
For ecample:

    function do_stuff(list_of_hosts) {
        var cv = CondVar();
        var result = {};
        cv.begin(function (){ cv.send(result) });
        
        list_of_hosts.forEach(function(host){
            cv.begin();
            ping_host_then_call_callback( host, function () {
                result[host] = ...;
                cv.end();
            });
        });

        cv.end();
        
        return cv;
    }
    
    var cv = do_stuff([ ... ]);
    cv.recv(function(results){
        ... 
    });


The main thing to notice here is the bracketing begin/end calls.  These both
give you an opportunity to pass in a groupcallback, and to ensure that the
CondVar will complete even if list_of_hosts is an empty array.

Events
------

* complete(arguments...)

Used internally. Called when either `send()` is first called or when the final `end()` is called.

Prior Art
---------

[AnyEvent::CondVar](https://metacpan.org/pod/AnyEvent#CONDITION-VARIABLES)


[condvar](https://www.npmjs.org/package/condvar)

This module differs from both of these in that it does not support any
blocking mode of operation.  It's purely callback based.  We also do not
support a throwing exceptions-- how you pass errors through is up to you. 
One might adopt the node style of passing an error or null, followed by a
value.  Alternatively, one might say that if the value is an Error object
then something is wrong.

