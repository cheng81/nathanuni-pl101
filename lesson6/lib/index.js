var tortoise = require('./tortoise')
  , parser = require('./parser')
  , bindings = require('./bind');

var env = undefined;
var bootstrap = function(turtle) {
	env = bindings.makeEnv(turtle);
	return env;
}

var make = function(text) {
	var ast = parser.parse(text);
	console.log(ast);
	return tortoise.evalStatements(ast,env);
};

module.exports.bootstrap = bootstrap;
module.exports.make = make;

module.exports.parser = parser;
module.exports.interpreter = tortoise;
module.exports.turtlelib = require('./turtle');