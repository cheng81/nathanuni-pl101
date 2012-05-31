var util = require('util')
  , tortoise = require('./tortoise')
  , parser = require('./parser')
  , bindings = require('./bind');

var env = undefined;
var bootstrap = function(raphael,w,h) {
	env = bindings.makeEnv(raphael,w,h);
	env.bindings.log = function(val) {
		console.log(val);
	};
	env.bindings.log.tortoiseArity = 1;
	return env;
};
var make = function(text,cont,xcont) {
	cont = cont || tortoise.thunkValue;
	xcont = xcont || tortoise.thunkValue;
	var ast = parser.parse(text);
	var next = tortoise.boot(ast,cont,xcont,env);
	do {
		next = next();
	} while(next instanceof Function);
	return next;
};

var _next = undefined;
var step = function(text,cont,xcont) {
	cont = cont || tortoise.thunkValue;
	xcont = xcont || tortoise.thunkValue;
	if(text !== undefined && _next === undefined) {
		var ast = parser.parse(text);
		_next = tortoise.boot(ast,cont,xcont,env);
		_next = _next();
	} else if(_next instanceof Function) {
		_next = _next();
		if(!(_next instanceof Function)) {
			var out = _next;
			_next = undefined;
			return out;
		}
	}
};
module.exports = {
	parser: parser,
	tortoise: tortoise,
	bootstrap: bootstrap,
	make: make,
	step: step,
	turtlelib: require('./turtle'),
	eval: function(src,log) {
		log = log||false;
		var ast = parser.parse(src);
		if(log) {console.log(util.inspect(ast,false,100));}
		var l = function(val) {
			console.log(val);
		};
		l.tortoiseArity = 1;
		var next = tortoise.boot(ast,tortoise.thunkValue,tortoise.thunkValue,{bindings:{
			log: l
		},outer:{}});
		do {
			next = next();
		} while(next instanceof Function);
		return next;
	}
};