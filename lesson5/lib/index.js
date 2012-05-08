var parser = require('./scheemparser')
  , interpreter = require('./scheem');

module.exports = {
	parser: parser,
	interpreter: interpreter,
	make: function(src) {
		var ast = null;
		try {
			src = "(begin\r\n" + src + "\r\n)";
			ast = parser.parse(src);
			var res = interpreter.evalScheem(ast);
			return {
				ast: ast,
				result: res
			};
		} catch(err) {
			return {
				ast: ast,
				error: err
			};
		}
	}
}