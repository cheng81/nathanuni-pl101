var parser = require('./scheemparser')
  , interpreter = require('./scheem');

module.exports = {
	parser: parser,
	interpreter: interpreter,
	makeCPS: function(src,cont) {
		var ast = null;
		try {
			src = "(begin\r\n" + src + "\r\n)";
			ast = parser.parse(src);
			interpreter.evalScheem(ast,cont);
		} catch(err) {
			return {
				ast: ast,
				error: err
			};
		}
	},
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