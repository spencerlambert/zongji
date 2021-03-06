var MAX_WAIT = 3000;

// Check an array of events against an array of expectations
// @param {object} test - Pass-thru from nodeunit test case
// @param {[object]} events - Array of zongji events
// @param {[object]} expected - Array of expectations
// @param {string} expected.$._type - Special, match binlog event name
// @param {function} expected.$._[custom] - Apply custom tests for this event
//                                          function(test, event){}
// @param {any} expected.$.[key] - Deep match any other values
// @param {function} callback - Call when done, no arguments (optional)
// @param waitIndex - Do not specify, used internally
var expectEvents = module.exports = function(test, events, expected, callback, waitIndex){
  if(events.length < expected.length && !(waitIndex > 10)){
    // Wait for events to appear
    setTimeout(function(){
      expectEvents(test, events, expected, callback, (waitIndex || 0) + 1);
    }, MAX_WAIT / 10);
  }else{
    test.strictEqual(events.length, expected.length);
    events.forEach(function(event, index){
      var exp = expected[index];
      for(var i in exp){
        if(exp.hasOwnProperty(i)){
          if(i === '_type'){
            test.strictEqual(exp[i], event.getTypeName());
          }else if(String(i).substr(0, 1) === '_'){
            exp[i](test, event);
          }else{
            test.deepEqual(exp[i], event[i]);
          }
        }
      }
    });
    if(typeof callback === 'function') callback();
  }
};
