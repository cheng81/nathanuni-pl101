var parser = require('./scheemparser')
  , interpreter = require('./scheem');

module.exports = {
	parser: parser,
	interpreter: interpreter,
	make: function(src,env) {
		var ast = parser.parse(src);
		var res = interpreter.evalScheem(ast,env||{});
		return {
			ast: ast,
			result: res
		};
	}
}