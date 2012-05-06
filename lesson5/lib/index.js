var parser = require('./scheemparser')
  , interpreter = require('./scheem');

module.exports = {
	parser: parser,
	interpreter: interpreter,
	make: function(src) {
		try {
			src = "(begin " + src + ")";
			var ast = parser.parse(src);
			var res = interpreter.evalScheem(ast);
			return {
				ast: ast,
				result: res
			};
		} catch(err) {
			return {
				error: err
			};
		}
	}
}