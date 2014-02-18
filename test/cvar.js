'use strict';
var CondVar = require('../cvar.js');
var test  = require('tape');
var timer = require('timer-ease');

test("Condition Variables", function (t) {
    t.plan(4);

    (function(){
        var cvar = CondVar();
        timer.after(500,function(){ cvar.send('late') });
        cvar.recv(function(msg){ t.is(msg,'late','Simple delayed send -> recv') });
    })();

    (function(){
        var cvar = CondVar();
        cvar.send('early');
        cvar.recv(function(msg){ t.is(msg,'early','Simple immediate send -> recv') });
    })();

    (function(){
        var cvar = CondVar();

        cvar.begin();
        for (var ii=0; ii<10; ++ii) {
            cvar.begin();
            timer.after(200*ii,function(){ cvar.end() });
        }
        cvar.end();

        cvar.recv(function(value){
            t.pass('Simple grouped result');
        })
    })();

    (function(){
        var cvar = CondVar();
        var result = 0;
        cvar.begin(function(){ this.send(result) });
        
        for (var ii=0; ii<10; ++ii) {
            (function(ii){
                cvar.begin();
                timer.after(200*ii,function(){ result += ii; cvar.end() });
            })(ii);
        }
        
        cvar.end();
        cvar.recv(function(value){
            t.is(value,45,'Complicated grouped result');
        })
    })();
});
