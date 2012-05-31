
var step = function (state) {
	// console.log('step',state);
	var thk = state.data;
	if(thk.tag==='value'){
		state.done = true;
		state.data = thk.val;
		return state;
	} else if(thk.tag !== 'thunk'){
		console.log('bad thunk!',thk);
		throw new Error('Bad thunk');
	}
	state.data = thk.func.apply(null,thk.args);
	return state;
};

var ready = [];
var wait = [];
var cur = 0;
var locks = {};

var reset = function() {
	ready = [];
	wait = [];
	cur = 0;
	locks = {};
};
var make = function(thread) {
	ready.push({data:thread,done:false});
};
var waitOn = function(onLock) {
	console.log('waitOn',onLock,cur,wait[onLock]);
	var waiting = ready.splice(cur,1);
	cur = cur % ready.length;
	if(onLock in wait) {
		wait[onLock].push(waiting[0]);
	} else {
		wait[onLock] = waiting;
	}
	console.log('waitOn',onLock,cur,wait[onLock]);
};
var yield = function() {
	cur = (cur+1) % ready.length;
	counter = 0;
};
var lock = function(id) {
	console.log('locking',cur,id,locks[id]);
	if(id in locks) {
		waitOn(id);
		return false;
	}
	locks[id] = true;
	return true;
};
var unlock = function(id) {
	console.log('unlocking',id,locks[id],wait[id]);
	delete(locks[id]);
	if(id in wait) {
		ready.push(wait[id].shift());
		if(wait[id].length===0) {delete wait[id];}
	}
};

var counter = 0;
var MAX = 50;
var next = function() {
	if(ready.length===0) {
		return false;
	}
	var s = ready[cur];
	step(s);
	if(s.done===true) {
		ready.splice(cur,1);
		cur = cur % ready.length;
		if(ready.length===0) {
			if(wait.length!==0) {
				throw new Error('DeadLock!');
			}
			console.log('program ended',s);
			if (s.data instanceof Error) {
				throw s.data;
			}
			return s.data;
		}
	} else {
		counter++;
		if(counter===MAX) {
			// if(Math.random() > 0.95) {
				cur = (cur+1) % ready.length;
				// console.log('switch',cur);
			// }
			counter = 0;
		}
	}
	return next;
};

module.exports = {
	reset: reset,
	make: make,
	lock: lock,
	unlock: unlock,
	yield: yield,
	next: next
};