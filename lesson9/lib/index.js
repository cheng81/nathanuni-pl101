var parser = require('./tscheemparser')
  , interpreter = require('./tscheem');

module.exports = {
	parser: parser,
	interpreter: interpreter,
	make: function(src) {
		try {
			var ast = parser.parse(src);
			var type = interpreter.typeExpr(ast,interpreter.stdTypes);
			var erased = interpreter.erase(ast);
			var res = interpreter.eval(erased,interpreter.stdLib);
			return {
				ast: ast,
				type: type,
				res: res
			};
		} catch(e) {
			console.log('Error',e);
			throw e;
		}
	}
}