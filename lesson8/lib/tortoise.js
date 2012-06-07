
var util = require('util');
var sched = require('./scheduler');

var add_turtle = function(env, name, value) {
	env.turtle = env.turtle || {};
	env.turtle[name] = value;
	return env;
}
var add_binding = function(env, name, value) {
	if(env.bindings===undefined) {
		env.bindings = {};
		env.outer = {};
	}
	env.bindings[name] = value;
	return env;
};
var update = function(env, name, value) {
	if(env.bindings===undefined) {
		return new Error('Cannot update undefined value '+name);
	}
	if(env.bindings[name]!==undefined) {
		env.bindings[name] = value;
	} else {
		return update(env.outer, name, value);
	}
};
var lookup = function(env, name) {
	if(env===undefined||env.bindings===undefined) {
		return new Error('Cannot find value '+name);
	}
	if(env.bindings[name] !== undefined) {
		return env.bindings[name];
	}
	if(env.turtle !== undefined && env.turtle[name] !== undefined) {
		return env.turtle[name];
	}
	return lookup(env.outer, name);
};
var thunk = function(f) {
	var args = Array.prototype.slice.call(arguments);
	args.shift();
	return {
		tag: 'thunk',
		func: f,
		args: args
	};
};
var thunkValue = function(x) {
	return {
		tag: 'value',
		val: x
	};
};

var pairfn = function(fn) {
	var out = function(expr,env,cont,xcont) {
		return thunk(evalExpr, expr.left, env, function(lVal) {
			return thunk(evalExpr, expr.right, env, function(rVal) {
				return thunk(cont,fn(lVal,rVal));
			}, xcont);
		}, xcont);
	};
	out.tortoiseArity = 2;
	return out;
};
var builtins = {
	'not': function(expr, env, cont, xcont) {
		return thunk(evalExpr, expr.expr, env, function(val) {
			return thunk(cont,(!val));
		}, xcont);
	},
	'&&': function(expr, env, cont, xcont) {
		return thunk(evalExpr, expr.left, env, function(lVal) {
			if(lVal===true) {
				return thunk(evalExpr, expr.right, env, cont, xcont);
				// return thunk(evalExpr, expr.right, env, function(rVal) {
				// 	return thunk(cont,rVal);
				// }, xcont);
			}
			return thunk(cont,false);
		}, xcont);
	},
	'||': function(expr, env, cont, xcont) {
		return thunk(evalExpr, expr.left, env, function(lVal) {
			if(lVal===true) {
				return thunk(cont,true);
			}
			return thunk(evalExpr, expr.right, env, cont, xcont);
		}, xcont);
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
	'**': pairfn(function(l,r) {return Math.exp(l,r);}),
	'%': pairfn(function(l,r) {return l%r;})
};

var applyArgs = function(names,values,env,dynEnv) {
	var newBindings = {};
	for (var i = 0; i < names.length; i++) {
		newBindings[names[i]] = values[i];
	}
	var out = {
		bindings: newBindings,
		outer: env
	};
	if(dynEnv.turtle !== undefined) {out.turtle=dynEnv.turtle;}
	// console.log('applyArgs',util.inspect(out,false,10));
	return out;
};
var evalExpr = function(expr, env, cont, xcont) {
	// console.log(expr,xcont);
	if( typeof expr === 'number' ) {return thunk(cont,expr);}
	if( typeof expr === 'boolean' ) {return thunk(cont,expr);}
	if( expr.tag in builtins ) {
		return builtins[expr.tag](expr, env, cont, xcont);
	}
	switch(expr.tag) {
		case 'ident':
			var val = lookup(env, expr.name);
			if(val instanceof Error) {
				return thunk(xcont,val);
			}
			return thunk(cont,val);
		case 'inline-if':
			return thunk(evalExpr,expr.test, env, function(t) {
				var theExpr = (t!==true) ? expr.right : expr.left;
				return thunk(evalExpr, theExpr, env, cont, xcont);
			}, xcont);
		case 'throw':
			return thunk(evalExpr, expr.err, env, xcont, xcont);
		case 'spawn':
			var func = lookup(env, expr.name);
			if(func instanceof Error) {return thunk(xcont,new Error('Cannot find function '+expr.name));}
			if(func.tortoiseArity !== expr.args.length) {
				return thunk(xcont,new Error('Cannot spawn function '+expr.name+': wrong argument numbers'));
			}
			var next = function(idx,args) {
				return function(arg) {
					var nextId = idx+1;
					args.push(arg);
					console.log('spawn.cont',idx,args,expr.args.length);
					if(expr.args.length===args.length||expr.args.length===0) {
						var t = null;
						if(func instanceof Function) {
							t = {tag:thunk, func:func, args: args};
						} else {
							var newEnv = applyArgs(func.args,args,func.env,env);
							t = thunk(evalStatements,func.body,newEnv,thunkValue,thunkValue);
						}
						sched.make(t);
						return thunk(cont);
					} else {
						return thunk(evalExpr, expr.args[nextId], env, next(nextId,args), xcont);
					}
				}
			};
			return thunk(evalExpr, expr.args.length > 0 ? expr.args[0] : 0, env, next(0, []), xcont);
		case 'call':
			var func = lookup(env, expr.name);
			if(func instanceof Error) {return thunk(xcont,func);}//{return thunk(xcont,new Error('Cannot find function '+expr.name));}
			if(func.tortoiseArity < expr.args.length) {
				return thunk(xcont,new Error('Function '+expr.name+ ' expects '+func.tortoiseArity+' arguments, but '+expr.args.length+' passed'));
			}
			var next = function(idx,args) {
				return function(arg) {
					var nextId = idx+1;
					args.push(arg);
					if(args.length===expr.args.length||expr.args.length===0) {
						//call function
						if(func.tortoiseArity===args.length||func.tortoiseArity===0) {
							if(func instanceof Function) {
								return thunk(cont,func.apply(null,args));
							} else {
								var newEnv = applyArgs(func.args,args,func.env,env);
								// newEnv.turtle = env.turtle;
								return thunk(evalStatements,func.body,newEnv,cont,xcont);
							}
						} else {
							var outFunc = null;
							if(func instanceof Function) {
								outFunc = function() {
									var newArgs = Array.prototype.slice.call(arguments);
									return func.apply(null,args.concat(newArgs));
								};
							} else {
								var applyied = func.args.slice();
								var togo = applyied.splice(args.length);
								outFunc = {
									body: func.body,
									args: togo,
									env: applyArgs(applyied,args,func.env,env)
								}
								// outFunc.env.turtle = env.turtle;
							}
							outFunc.tortoiseArity = (func.tortoiseArity) - args.length;
							return thunk(cont,outFunc);
						}
					} else {
						return thunk(evalExpr, expr.args[nextId], env, next(nextId,args), xcont);
					}
				}
			}
			return thunk(evalExpr, expr.args.length > 0 ? expr.args[0] : 0, env, next(0,[]), xcont);
	}
};
var evalStatement = function(stmt, env, cont, xcont) {
	switch(stmt.tag) {
		case 'ignore':
			return thunk(evalExpr,stmt.body, env, function(val) {
				return thunk(cont,val);
			}, xcont);
		case 'var':
			add_binding(env, stmt.name, 0);
			return thunk(cont);
		case ':=':
			return thunk(evalExpr,stmt.right, env, function(val) {
				update(env, stmt.left, val);
				return thunk(cont, val);
			}, xcont);
		case 'var:=':
			return thunk(evalExpr,stmt.right, env, function(val) {
				add_binding(env, stmt.left, val);
				return thunk(cont, val);
			}, xcont);
		case 'if':
			return thunk(evalExpr, stmt.expr, env, function(test) {
				if(test===true) {
					return thunk(evalStatements, stmt.body, env, cont, xcont);
				}
				if(stmt.elsebody instanceof Array && stmt.elsebody.length > 0) {
					return thunk(evalStatements, stmt.elsebody, env, cont, xcont);
				}
				return thunk(cont);
			}, xcont);
		case 'repeat':
			return thunk(evalExpr, stmt.expr, env, function(times) {
				if(times===0) {return thunk(cont,0);}
				var next = function(idx) {
					return function(val) {
						var nextId = idx+1;
						if(nextId === times) {
							return thunk(cont,val);
						}
						return thunk(evalStatements, stmt.body, env, next(nextId), xcont);
					}
				};
				return thunk(evalStatements, stmt.body, env, next(0), xcont);
			}, xcont);
		case 'define':
			add_binding(env, stmt.name, {
				body: stmt.body,
				args: stmt.args,
				env: env,
				tortoiseArity: stmt.args.length
			});
			return thunk(cont);
		case 'lock':
			var obj = stmt.lock;
			if(sched.lock(obj)) {
				return thunk(evalStatements, stmt.body, env, function(ret) {
					sched.unlock(obj);
					return thunk(cont,ret);
				},xcont);
			}
			return thunk(evalStatement, stmt, env, cont, xcont);
		case 'try':
			return thunk(evalStatements, stmt.tryBody, env, cont, function(err) {
				return thunk(evalStatements, stmt.catchBody, add_binding(env, stmt.errName, err), cont, xcont);
			});
		case 'yield':
			sched.yield();
			return thunk(cont);
		case 'with':
			return thunk(evalExpr, stmt.expr, env, function(turtle) {
				var new_env = env;//{bindings:{}, outer:env};
				for(var i in turtle) {
					if(turtle[i] instanceof Function) {
						(function(name) {
							var bound = function() {
								// console.log('called',stmt.expr,name);
								return turtle[name].apply(turtle,arguments);
							};
							bound.tortoiseArity = turtle[name].length;
							add_turtle(new_env,name,bound);
						}(i));
					}
				}

				return thunk(evalStatements, stmt.body, new_env, function(val) {
					console.log('body evaluated, delete turtle funs');
					delete(new_env.turtle);
					return thunk(cont,val);
				}, xcont);
			}, xcont);
	}
};
var evalStatements = function(seq, env, cont, xcont) {
	var next = function(idx) {
		return function(v) {
			var nextId = idx+1;
			if(nextId === seq.length) {
				return thunk(cont,v);
			}
			return thunk(evalStatement,seq[nextId],env,next(nextId),xcont);
		};
	};
	return thunk(evalStatement,seq[0],env,next(0),xcont);
};

var boot = function(statements,cont,xcont,env) {
	sched.reset();
	// console.log('boot',cont,xcont);
	var thunk = evalStatements(statements,env,cont,xcont);
	sched.make(thunk);
	return sched.next;
};

module.exports = {
	boot: boot,
	thunkValue: thunkValue,
	add_binding: add_binding
};