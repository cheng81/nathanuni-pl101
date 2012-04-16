var compile = require('./compile').compile
  , parser = require('./infix');

module.exports = {
	compile: compile,
	parser: parser,
	make: function(src) {
		var ast = parser.parse(src);
		console.log('infoxmus ast',ast);
		return compile(ast.expr,ast.definitions);
	}
};