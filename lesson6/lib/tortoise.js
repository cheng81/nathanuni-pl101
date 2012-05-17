var add_binding = function(env, name, value) {
	if(env.bindings===undefined) {
		env.bindings = {};
		env.outer = {};
	}
	env.bindings[name] = value;
};
var update = function(env, name, value) {
	if(env.bindings===undefined) {
		throw new Error('Cannot update undefined value '+name);
	}
	if(env.bindings[name]!==undefined) {
		env.bindings[name] = value;
	} else {
		return update(env.outer, name, value);
	}
}
var lookup = function(env, name) {
	if(env.bindings===undefined) {
		throw new Error('Cannot find value '+name);
	}
	if(env.bindings[name] !== undefined) {
		return env.bindings[name];
	}
	return lookup(env.outer, name);
};

var pairfn = function(fn) {
	var out = function(expr,env) {
		return fn(evalExpr(expr.left, env),evalExpr(expr.right,env));
	};
	out.tortoiseArity = 2;
	return out;
};
var builtins = {
	'not': function(expr, env) {
		return !(evalExpr(expr.expr, env));
	},
	'&&': function(expr, env) {
		if( evalExpr(expr.left, env) ) {
			return evalExpr(expr.right, env);
		}
		return false;
	},
	'||': function(expr, env) {
		if( evalExpr(expr.left, env) ) {return true;}
		return evalExpr(expr.right, env);
	},
	'<': pairfn(function(l,r) {return l<r;}),
	'>': pairfn(function(l,r) {return l>r;}),
	'<=': pairfn(function(l,r) {return l<=r;}),
	'>=': pairfn(function(l,r) {return l>=r;}),
	'==': pairfn(function(l,r) {return l===r;}),
	'+': pairfn(function(l,r) {return l+r;}),
	'-': pairfn(function(l,r) {return l-r;}),
	'/': pairfn(function(l,r) {return l/r;}),
	'*': pairfn(function(l,r) {return l*r;}),
	'**': pairfn(function(l,r) {return Math.expr(l,r);}),
	'%': pairfn(function(l,r) {return l%r;})
};

var evalExpr = function(expr, env) {
	if( typeof expr === 'number' ) {
		return expr;
	}
	if( typeof expr === 'boolean' ) {
		return expr;
	}
	if(expr.tag in builtins) {
		return builtins[expr.tag](expr, env);
	}
	switch(expr.tag) {
		case 'ident':
			return lookup(env, expr.name);
		case 'inline-if':
			if(evalExpr(expr.test, env)) {
				return evalExpr(expr.left, env);
			}
			return evalExpr(expr.right, env);
		case 'call':
			var func = lookup(env, expr.name);
			if(func.tortoiseArity < expr.args.length) {
				throw new Error('Function '+expr.name+ 'expects '+func.tortoiseArity+' arguments, but '+ev_args.length+' passed');
			}
			var ev_args = [];
			for (var i = 0; i < expr.args.length; i++) {
				ev_args[i] = evalExpr(expr.args[i], env);
			}
			if(func.tortoiseArity === ev_args.length) {
				return func.apply(null,ev_args);
			} else {
				var out_func = function() {
					var new_args = Array.prototype.slice.call(arguments);
					return func.apply(null,ev_args.concat(new_args));
				};
				out_func.tortoiseArity = (func.tortoiseArity) - ev_args.length;
				return out_func;
			}
	}
};

var evalStatement = function(stmt, env) {
	var val;
	switch(stmt.tag) {
		case 'ignore': return evalExpr(stmt.body, env);
		case 'var':
			add_binding(env, stmt.name, 0);
			return 0;
		case ':=':
			val = evalExpr(stmt.right, env);
			update(env, stmt.left, val);
			return val;
		case 'var:=':
			var val = evalExpr(stmt.right, env);
			add_binding(env, stmt.left, val);
			return val;
		case 'if':
			if(evalExpr(stmt.expr, env)) {
				val = evalStatements(stmt.body, env);
			} else if(stmt.elsebody instanceof Array && stmt.elsebody.length > 0) {
				val = evalStatements(stmt.elsebody, env);
			}
			return val;
		case 'repeat':
			var times = evalExpr(stmt.expr, env);
			for (var i = 0; i < times; i++) {
				val = evalStatements(stmt.body, env);
			}
			return val;
		case 'define':
			var new_func = function() {
				var new_env, new_bindings = {};
				for (var i = 0; i < stmt.args.length; i++) {
					new_bindings[stmt.args[i]] = arguments[i];
				}
				new_env = { bindings: new_bindings, outer: env };
				return evalStatements(stmt.body, new_env);
			};
			new_func.tortoiseArity = stmt.args.length;
			add_binding(env, stmt.name, new_func);
			return 0;
	}
};

var evalStatements = function(seq, env) {
	var val;
	for (var i = 0; i < seq.length; i++) {
		val = evalStatement(seq[i], env);
	};
	return val;
};

module.exports = {
	evalStatements: evalStatements,
	evalStatement: evalStatement,
	evalExpression: evalExpr,
	add_binding: add_binding
};