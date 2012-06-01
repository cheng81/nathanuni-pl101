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
var eval = function(text,cont,xcont) {
	cont = cont || tortoise.thunkValue;
	xcont = xcont || tortoise.thunkValue;
	var ast = parser.parse(text);
	var next = tortoise.boot(ast,cont,xcont,env);
	var res;
	while( (res=next()) ) {}
	return res;
	// do {
	// 	next = next();
	// } while(next instanceof Function);
	// return next;
};

var next;
var start = function(text,cont,xcont) {
	cont = cont || tortoise.thunkValue;
	xcont = xcont || tortoise.thunkValue;
	var ast = parser.parse(text);
	next = tortoise.boot(ast,cont,xcont,env);
};
var step = function() {
	return next();
};

module.exports = {
	parser: parser,
	tortoise: tortoise,
	bootstrap: bootstrap,
	// make: make,
	evalAll: eval,
	start: start,
	step: step,
	turtlelib: require('./turtle'),
	eval: function(src,log) {
		log = log||false;
		var ast = parser.parse(src);
		if(log) {console.log(util.inspect(ast,false,100));}
		var l = function(val) {
			console.log('# PROGRAM OUTPUT #',val);
		};
		l.tortoiseArity = 1;
		var next = tortoise.boot(ast,tortoise.thunkValue,tortoise.thunkValue,{bindings:{
			log: l
		},outer:{}});
		var res;
		do {
			res = next();
		} while(res===undefined);
		return res;
	}
};