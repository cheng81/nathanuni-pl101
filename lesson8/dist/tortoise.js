(function() {
	/*BRUTALLY STRIPPED FROM NODE.JS "path" module, www.nodejs.org*/
	function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}
	  function normalize(path) {
    var isAbsolute = path.charAt(0) === '/',
        trailingSlash = path.slice(-1) === '/';

    // Normalize the path
    path = normalizeArray(path.split('/').filter(function(p) {
      return !!p;
    }), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  };


  	function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize(paths.filter(function(p, index) {
      return p && typeof p === 'string';
    }).join('/'));
  };

/*BRUTALLY STRIPPED FROM NODE.JS "util" module, www.nodejs.org*/
  function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};
  /**/



	( function(){
		console.log('defining window.node2browser')
		var isNodeMod = function(name) {
			return name[0] != '.'
		}
    var initFile = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/index.js'
		var startpath = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib'
    var requiredAs = 'tortoise'
		var require = function(modulepath) {
			return function(reqmodpath) {
        if(reqmodpath==requiredAs) {return window.node2browser.require(initFile)}
				var reqmod = isNodeMod(reqmodpath) ? reqmodpath : join(modulepath,reqmodpath)
				var thecache = window.node2browser.cache

				if(undefined == thecache[reqmod]) {
					reqmod = reqmod+'.js'
					if(undefined == thecache[reqmod]) {
						throw new Error('Module "'+reqmodpath+'" not loaded')	
					}
				}

				return thecache[reqmod]
			}
		}
		window.node2browser = {
			makerequire: require,
			require: require(startpath),
			globals: {
				process: {
					nextTick: function(fn) {
						window.setTimeout(fn,1)
					},
          argv: []
				}
			},
			cache: {
				util: {
					inspect: function(o) {console.log(o)},
					inherits: function(c,s) {inherits(c,s)}
				}
			}
	}})();

(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/scheduler.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/

var step = function (state) {
	// console.log('step',state);
	var thk = state.data;
	if(thk.tag==='value'){
		state.done = true;
		state.data = thk.val;
		return state;
	} else if(thk.tag !== 'thunk'){
		console.log('bad thunk!',thk);
		throw new Error('Bad thunk');
	}
	state.data = thk.func.apply(null,thk.args);
	return state;
};

var ready = [];
var wait = [];
var cur = 0;
var locks = {};
var counter = 0;
var MAX = 50;

var reset = function() {
	ready = [];
	wait = [];
	cur = 0;
	counter = 0;
	locks = {};
};
var make = function(thread) {
	ready.push({data:thread,done:false});
};
var waitOn = function(onLock) {
	// console.log('waitOn',onLock,cur,wait[onLock]);
	var waiting = ready.splice(cur,1);
	cur = cur % ready.length;
	if(onLock in wait) {
		wait[onLock].push(waiting[0]);
	} else {
		wait[onLock] = waiting;
	}
	// console.log('waitOn',onLock,cur,wait[onLock]);
};
var yield = function() {
	// console.log('yield ',cur,' to ',((cur+1)% ready.length));
	cur = (cur+1) % ready.length;
	counter = 0;
};
var lock = function(id) {
	// console.log('locking',cur,id,locks[id]);
	if(id in locks) {
		waitOn(id);
		return false;
	}
	locks[id] = true;
	return true;
};
var unlock = function(id) {
	// console.log('unlocking',id,locks[id],wait[id]);
	delete(locks[id]);
	if(id in wait) {
		ready.push(wait[id].shift());
		if(wait[id].length===0) {delete wait[id];}
	}
};

var next = function() {
	if(ready.length===0) {return false;}
	var s = ready[cur];
	while(s.done===false&&counter<MAX) {
		s = ready[cur]; //might yield!
		step(s);
		counter++;
	};
	counter = 0;
	if(s.done===true) {
		ready.splice(cur,1);
		cur = cur % ready.length;
		if(ready.length===0) {
			if(wait.length!==0) {throw new Error('DeadLock!');}
			console.log('program ended',s);
			if(s.data instanceof Error) {throw s.data;}
			return s.data;
		}
	} else {
		cur = (cur+1) % ready.length;
	}
};

module.exports = {
	reset: reset,
	make: make,
	lock: lock,
	unlock: unlock,
	yield: yield,
	next: next
};
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/tortoise.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/

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
							t = thunk(evalStatements,func.body,newEnv,thunkValue,xcont);
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
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/parser.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
module.exports = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "_": parse__,
        "additive": parse_additive,
        "additive_op": parse_additive_op,
        "arglist": parse_arglist,
        "boolean": parse_boolean,
        "comma_expression": parse_comma_expression,
        "comma_identifier": parse_comma_identifier,
        "comment": parse_comment,
        "comp_op": parse_comp_op,
        "comparative": parse_comparative,
        "exp_op": parse_exp_op,
        "exponential": parse_exponential,
        "expression": parse_expression,
        "ident_list": parse_ident_list,
        "identifier": parse_identifier,
        "logic_op": parse_logic_op,
        "logical": parse_logical,
        "mult_op": parse_mult_op,
        "multiplicative": parse_multiplicative,
        "number": parse_number,
        "number_frac": parse_number_frac,
        "primary": parse_primary,
        "space": parse_space,
        "statement": parse_statement,
        "statements": parse_statements,
        "validchar": parse_validchar,
        "validfirstchar": parse_validfirstchar
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "statements";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_statements() {
        var cacheKey = 'statements@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse__();
        if (result3 !== null) {
          var result4 = [];
          var result5 = parse_statement();
          while (result5 !== null) {
            result4.push(result5);
            var result5 = parse_statement();
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(stmts) {return stmts;})(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_number_frac() {
        var cacheKey = 'number_frac@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === ".") {
          var result3 = ".";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\".\"");
          }
        }
        if (result3 !== null) {
          var result4 = [];
          if (input.substr(pos).match(/^[0-9]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9]");
            }
          }
          while (result5 !== null) {
            result4.push(result5);
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result5 = input.charAt(pos);
              pos++;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(chars) { return "." + chars.join(''); })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_number() {
        var cacheKey = 'number@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "-") {
          var result8 = "-";
          pos += 1;
        } else {
          var result8 = null;
          if (reportMatchFailures) {
            matchFailed("\"-\"");
          }
        }
        var result3 = result8 !== null ? result8 : '';
        if (result3 !== null) {
          if (input.substr(pos).match(/^[0-9]/) !== null) {
            var result7 = input.charAt(pos);
            pos++;
          } else {
            var result7 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9]");
            }
          }
          if (result7 !== null) {
            var result4 = [];
            while (result7 !== null) {
              result4.push(result7);
              if (input.substr(pos).match(/^[0-9]/) !== null) {
                var result7 = input.charAt(pos);
                pos++;
              } else {
                var result7 = null;
                if (reportMatchFailures) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            var result4 = null;
          }
          if (result4 !== null) {
            var result6 = parse_number_frac();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(minus, chars, frac) { return parseFloat(minus + chars.join('') + frac); })(result1[0], result1[1], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_boolean() {
        var cacheKey = 'boolean@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        if (input.substr(pos, 4) === "true") {
          var result5 = "true";
          pos += 4;
        } else {
          var result5 = null;
          if (reportMatchFailures) {
            matchFailed("\"true\"");
          }
        }
        var result6 = result5 !== null
          ? (function() {return true;})()
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 5) === "false") {
            var result2 = "false";
            pos += 5;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"false\"");
            }
          }
          var result3 = result2 !== null
            ? (function() {return false;})()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_validfirstchar() {
        var cacheKey = 'validfirstchar@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos).match(/^[a-zA-Z_]/) !== null) {
          var result0 = input.charAt(pos);
          pos++;
        } else {
          var result0 = null;
          if (reportMatchFailures) {
            matchFailed("[a-zA-Z_]");
          }
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_validchar() {
        var cacheKey = 'validchar@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos).match(/^[0-9a-zA-Z_]/) !== null) {
          var result0 = input.charAt(pos);
          pos++;
        } else {
          var result0 = null;
          if (reportMatchFailures) {
            matchFailed("[0-9a-zA-Z_]");
          }
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_identifier() {
        var cacheKey = 'identifier@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_validfirstchar();
        if (result3 !== null) {
          var result4 = [];
          var result5 = parse_validchar();
          while (result5 !== null) {
            result4.push(result5);
            var result5 = parse_validchar();
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(firstchar, chars) { return firstchar + chars.join(''); })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse__() {
        var cacheKey = '_@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = [];
        var result6 = parse_space();
        while (result6 !== null) {
          result1.push(result6);
          var result6 = parse_space();
        }
        if (result1 !== null) {
          var savedPos1 = pos;
          var result4 = parse_comment();
          if (result4 !== null) {
            var result5 = parse__();
            if (result5 !== null) {
              var result3 = [result4, result5];
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
          var result2 = result3 !== null ? result3 : '';
          if (result2 !== null) {
            var result0 = [result1, result2];
          } else {
            var result0 = null;
            pos = savedPos0;
          }
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_space() {
        var cacheKey = 'space@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === " ") {
          var result2 = " ";
          pos += 1;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\" \"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos).match(/^[	\n\r]/) !== null) {
            var result1 = input.charAt(pos);
            pos++;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("[	\\n\\r]");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comment() {
        var cacheKey = 'comment@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos3 = pos;
        if (input.substr(pos, 2) === "//") {
          var result10 = "//";
          pos += 2;
        } else {
          var result10 = null;
          if (reportMatchFailures) {
            matchFailed("\"//\"");
          }
        }
        if (result10 !== null) {
          var result11 = [];
          var savedPos4 = pos;
          var savedPos5 = pos;
          var savedReportMatchFailuresVar1 = reportMatchFailures;
          reportMatchFailures = false;
          if (input.substr(pos).match(/^[\n\r]/) !== null) {
            var result15 = input.charAt(pos);
            pos++;
          } else {
            var result15 = null;
            if (reportMatchFailures) {
              matchFailed("[\\n\\r]");
            }
          }
          reportMatchFailures = savedReportMatchFailuresVar1;
          if (result15 === null) {
            var result13 = '';
          } else {
            var result13 = null;
            pos = savedPos5;
          }
          if (result13 !== null) {
            if (input.length > pos) {
              var result14 = input.charAt(pos);
              pos++;
            } else {
              var result14 = null;
              if (reportMatchFailures) {
                matchFailed('any character');
              }
            }
            if (result14 !== null) {
              var result12 = [result13, result14];
            } else {
              var result12 = null;
              pos = savedPos4;
            }
          } else {
            var result12 = null;
            pos = savedPos4;
          }
          while (result12 !== null) {
            result11.push(result12);
            var savedPos4 = pos;
            var savedPos5 = pos;
            var savedReportMatchFailuresVar1 = reportMatchFailures;
            reportMatchFailures = false;
            if (input.substr(pos).match(/^[\n\r]/) !== null) {
              var result15 = input.charAt(pos);
              pos++;
            } else {
              var result15 = null;
              if (reportMatchFailures) {
                matchFailed("[\\n\\r]");
              }
            }
            reportMatchFailures = savedReportMatchFailuresVar1;
            if (result15 === null) {
              var result13 = '';
            } else {
              var result13 = null;
              pos = savedPos5;
            }
            if (result13 !== null) {
              if (input.length > pos) {
                var result14 = input.charAt(pos);
                pos++;
              } else {
                var result14 = null;
                if (reportMatchFailures) {
                  matchFailed('any character');
                }
              }
              if (result14 !== null) {
                var result12 = [result13, result14];
              } else {
                var result12 = null;
                pos = savedPos4;
              }
            } else {
              var result12 = null;
              pos = savedPos4;
            }
          }
          if (result11 !== null) {
            var result9 = [result10, result11];
          } else {
            var result9 = null;
            pos = savedPos3;
          }
        } else {
          var result9 = null;
          pos = savedPos3;
        }
        if (result9 !== null) {
          var result0 = result9;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 2) === "/*") {
            var result2 = "/*";
            pos += 2;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"/*\"");
            }
          }
          if (result2 !== null) {
            var savedPos1 = pos;
            var savedPos2 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            if (input.substr(pos, 2) === "*/") {
              var result8 = "*/";
              pos += 2;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed("\"*/\"");
              }
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result8 === null) {
              var result6 = '';
            } else {
              var result6 = null;
              pos = savedPos2;
            }
            if (result6 !== null) {
              if (input.length > pos) {
                var result7 = input.charAt(pos);
                pos++;
              } else {
                var result7 = null;
                if (reportMatchFailures) {
                  matchFailed('any character');
                }
              }
              if (result7 !== null) {
                var result5 = [result6, result7];
              } else {
                var result5 = null;
                pos = savedPos1;
              }
            } else {
              var result5 = null;
              pos = savedPos1;
            }
            if (result5 !== null) {
              var result3 = [];
              while (result5 !== null) {
                result3.push(result5);
                var savedPos1 = pos;
                var savedPos2 = pos;
                var savedReportMatchFailuresVar0 = reportMatchFailures;
                reportMatchFailures = false;
                if (input.substr(pos, 2) === "*/") {
                  var result8 = "*/";
                  pos += 2;
                } else {
                  var result8 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"*/\"");
                  }
                }
                reportMatchFailures = savedReportMatchFailuresVar0;
                if (result8 === null) {
                  var result6 = '';
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
                if (result6 !== null) {
                  if (input.length > pos) {
                    var result7 = input.charAt(pos);
                    pos++;
                  } else {
                    var result7 = null;
                    if (reportMatchFailures) {
                      matchFailed('any character');
                    }
                  }
                  if (result7 !== null) {
                    var result5 = [result6, result7];
                  } else {
                    var result5 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result5 = null;
                  pos = savedPos1;
                }
              }
            } else {
              var result3 = null;
            }
            if (result3 !== null) {
              if (input.substr(pos, 2) === "*/") {
                var result4 = "*/";
                pos += 2;
              } else {
                var result4 = null;
                if (reportMatchFailures) {
                  matchFailed("\"*/\"");
                }
              }
              if (result4 !== null) {
                var result1 = [result2, result3, result4];
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_expression() {
        var cacheKey = 'expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result9 = parse_logical();
        if (result9 !== null) {
          var result10 = parse__();
          if (result10 !== null) {
            if (input.substr(pos, 1) === "?") {
              var result11 = "?";
              pos += 1;
            } else {
              var result11 = null;
              if (reportMatchFailures) {
                matchFailed("\"?\"");
              }
            }
            if (result11 !== null) {
              var result12 = parse__();
              if (result12 !== null) {
                var result13 = parse_expression();
                if (result13 !== null) {
                  var result14 = parse__();
                  if (result14 !== null) {
                    if (input.substr(pos, 1) === ":") {
                      var result15 = ":";
                      pos += 1;
                    } else {
                      var result15 = null;
                      if (reportMatchFailures) {
                        matchFailed("\":\"");
                      }
                    }
                    if (result15 !== null) {
                      var result16 = parse__();
                      if (result16 !== null) {
                        var result17 = parse_expression();
                        if (result17 !== null) {
                          var result18 = parse__();
                          if (result18 !== null) {
                            var result7 = [result9, result10, result11, result12, result13, result14, result15, result16, result17, result18];
                          } else {
                            var result7 = null;
                            pos = savedPos3;
                          }
                        } else {
                          var result7 = null;
                          pos = savedPos3;
                        }
                      } else {
                        var result7 = null;
                        pos = savedPos3;
                      }
                    } else {
                      var result7 = null;
                      pos = savedPos3;
                    }
                  } else {
                    var result7 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result7 = null;
                  pos = savedPos3;
                }
              } else {
                var result7 = null;
                pos = savedPos3;
              }
            } else {
              var result7 = null;
              pos = savedPos3;
            }
          } else {
            var result7 = null;
            pos = savedPos3;
          }
        } else {
          var result7 = null;
          pos = savedPos3;
        }
        var result8 = result7 !== null
          ? (function(expr, ok, ko) { return {tag:'inline-if',test:expr, left:ok, right:ko}; })(result7[0], result7[4], result7[8])
          : null;
        if (result8 !== null) {
          var result6 = result8;
        } else {
          var result6 = null;
          pos = savedPos2;
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result4 = parse_logical();
          if (result4 !== null) {
            var result5 = parse__();
            if (result5 !== null) {
              var result2 = [result4, result5];
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(expr) { return expr; })(result2[0])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_logic_op() {
        var cacheKey = 'logic_op@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "&&") {
          var result2 = "&&";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"&&\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos, 2) === "||") {
            var result1 = "||";
            pos += 2;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("\"||\"");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_logical() {
        var cacheKey = 'logical@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        if (input.substr(pos, 1) === "!") {
          var result14 = "!";
          pos += 1;
        } else {
          var result14 = null;
          if (reportMatchFailures) {
            matchFailed("\"!\"");
          }
        }
        if (result14 !== null) {
          var result15 = parse__();
          if (result15 !== null) {
            var result16 = parse_logical();
            if (result16 !== null) {
              var result17 = parse__();
              if (result17 !== null) {
                var result12 = [result14, result15, result16, result17];
              } else {
                var result12 = null;
                pos = savedPos3;
              }
            } else {
              var result12 = null;
              pos = savedPos3;
            }
          } else {
            var result12 = null;
            pos = savedPos3;
          }
        } else {
          var result12 = null;
          pos = savedPos3;
        }
        var result13 = result12 !== null
          ? (function(expr) { return {tag:'not', expr:expr}; })(result12[2])
          : null;
        if (result13 !== null) {
          var result11 = result13;
        } else {
          var result11 = null;
          pos = savedPos2;
        }
        if (result11 !== null) {
          var result0 = result11;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result5 = parse_comparative();
          if (result5 !== null) {
            var result6 = parse__();
            if (result6 !== null) {
              var result7 = parse_logic_op();
              if (result7 !== null) {
                var result8 = parse__();
                if (result8 !== null) {
                  var result9 = parse_logical();
                  if (result9 !== null) {
                    var result10 = parse__();
                    if (result10 !== null) {
                      var result3 = [result5, result6, result7, result8, result9, result10];
                    } else {
                      var result3 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result3 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
          var result4 = result3 !== null
            ? (function(left, op, right) { return {tag:op, left:left, right: right}; })(result3[0], result3[2], result3[4])
            : null;
          if (result4 !== null) {
            var result2 = result4;
          } else {
            var result2 = null;
            pos = savedPos0;
          }
          if (result2 !== null) {
            var result0 = result2;
          } else {
            var result1 = parse_comparative();
            if (result1 !== null) {
              var result0 = result1;
            } else {
              var result0 = null;;
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comp_op() {
        var cacheKey = 'comp_op@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "<=") {
          var result6 = "<=";
          pos += 2;
        } else {
          var result6 = null;
          if (reportMatchFailures) {
            matchFailed("\"<=\"");
          }
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          if (input.substr(pos, 2) === ">=") {
            var result5 = ">=";
            pos += 2;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("\">=\"");
            }
          }
          if (result5 !== null) {
            var result0 = result5;
          } else {
            if (input.substr(pos, 2) === "!=") {
              var result4 = "!=";
              pos += 2;
            } else {
              var result4 = null;
              if (reportMatchFailures) {
                matchFailed("\"!=\"");
              }
            }
            if (result4 !== null) {
              var result0 = result4;
            } else {
              if (input.substr(pos, 2) === "==") {
                var result3 = "==";
                pos += 2;
              } else {
                var result3 = null;
                if (reportMatchFailures) {
                  matchFailed("\"==\"");
                }
              }
              if (result3 !== null) {
                var result0 = result3;
              } else {
                if (input.substr(pos, 1) === "<") {
                  var result2 = "<";
                  pos += 1;
                } else {
                  var result2 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"<\"");
                  }
                }
                if (result2 !== null) {
                  var result0 = result2;
                } else {
                  if (input.substr(pos, 1) === ">") {
                    var result1 = ">";
                    pos += 1;
                  } else {
                    var result1 = null;
                    if (reportMatchFailures) {
                      matchFailed("\">\"");
                    }
                  }
                  if (result1 !== null) {
                    var result0 = result1;
                  } else {
                    var result0 = null;;
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comparative() {
        var cacheKey = 'comparative@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_additive();
        if (result5 !== null) {
          var result6 = parse__();
          if (result6 !== null) {
            var result7 = parse_comp_op();
            if (result7 !== null) {
              var result8 = parse__();
              if (result8 !== null) {
                var result9 = parse_comparative();
                if (result9 !== null) {
                  var result10 = parse__();
                  if (result10 !== null) {
                    var result3 = [result5, result6, result7, result8, result9, result10];
                  } else {
                    var result3 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(left, op, right) { return {tag: op, left:left, right:right}; })(result3[0], result3[2], result3[4])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_additive();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_additive_op() {
        var cacheKey = 'additive_op@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === "+") {
          var result2 = "+";
          pos += 1;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"+\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos, 1) === "-") {
            var result1 = "-";
            pos += 1;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("\"-\"");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_additive() {
        var cacheKey = 'additive@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_multiplicative();
        if (result5 !== null) {
          var result6 = parse__();
          if (result6 !== null) {
            var result7 = parse_additive_op();
            if (result7 !== null) {
              var result8 = parse__();
              if (result8 !== null) {
                var result9 = parse_additive();
                if (result9 !== null) {
                  var result10 = parse__();
                  if (result10 !== null) {
                    var result3 = [result5, result6, result7, result8, result9, result10];
                  } else {
                    var result3 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(left, op, right) { return {tag:op, left:left, right:right}; })(result3[0], result3[2], result3[4])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_multiplicative();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_mult_op() {
        var cacheKey = 'mult_op@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === "*") {
          var result2 = "*";
          pos += 1;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"*\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos, 1) === "/") {
            var result1 = "/";
            pos += 1;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("\"/\"");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_multiplicative() {
        var cacheKey = 'multiplicative@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_exponential();
        if (result5 !== null) {
          var result6 = parse__();
          if (result6 !== null) {
            var result7 = parse_mult_op();
            if (result7 !== null) {
              var result8 = parse__();
              if (result8 !== null) {
                var result9 = parse_multiplicative();
                if (result9 !== null) {
                  var result10 = parse__();
                  if (result10 !== null) {
                    var result3 = [result5, result6, result7, result8, result9, result10];
                  } else {
                    var result3 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(left, op, right) { return {tag:op, left:left, right:right}; })(result3[0], result3[2], result3[4])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_exponential();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_exp_op() {
        var cacheKey = 'exp_op@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "**") {
          var result2 = "**";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"**\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos, 1) === "%") {
            var result1 = "%";
            pos += 1;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("\"%\"");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_exponential() {
        var cacheKey = 'exponential@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result9 = parse_primary();
        if (result9 !== null) {
          var result10 = parse__();
          if (result10 !== null) {
            var result11 = parse_exp_op();
            if (result11 !== null) {
              var result12 = parse__();
              if (result12 !== null) {
                var result13 = parse_exponential();
                if (result13 !== null) {
                  var result14 = parse__();
                  if (result14 !== null) {
                    var result7 = [result9, result10, result11, result12, result13, result14];
                  } else {
                    var result7 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result7 = null;
                  pos = savedPos3;
                }
              } else {
                var result7 = null;
                pos = savedPos3;
              }
            } else {
              var result7 = null;
              pos = savedPos3;
            }
          } else {
            var result7 = null;
            pos = savedPos3;
          }
        } else {
          var result7 = null;
          pos = savedPos3;
        }
        var result8 = result7 !== null
          ? (function(left, op, right) { return {tag:op, left:left, right:right}; })(result7[0], result7[2], result7[4])
          : null;
        if (result8 !== null) {
          var result6 = result8;
        } else {
          var result6 = null;
          pos = savedPos2;
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result4 = parse_primary();
          if (result4 !== null) {
            var result5 = parse__();
            if (result5 !== null) {
              var result2 = [result4, result5];
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(p) { return p; })(result2[0])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_primary() {
        var cacheKey = 'primary@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result60 = parse_number();
        if (result60 !== null) {
          var result0 = result60;
        } else {
          var result59 = parse_boolean();
          if (result59 !== null) {
            var result0 = result59;
          } else {
            var savedPos11 = pos;
            var savedPos12 = pos;
            if (input.substr(pos, 5) === "spawn") {
              var result52 = "spawn";
              pos += 5;
            } else {
              var result52 = null;
              if (reportMatchFailures) {
                matchFailed("\"spawn\"");
              }
            }
            if (result52 !== null) {
              var result53 = parse__();
              if (result53 !== null) {
                var result54 = parse_identifier();
                if (result54 !== null) {
                  var result55 = parse__();
                  if (result55 !== null) {
                    if (input.substr(pos, 1) === "(") {
                      var result56 = "(";
                      pos += 1;
                    } else {
                      var result56 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"(\"");
                      }
                    }
                    if (result56 !== null) {
                      var result57 = parse__();
                      if (result57 !== null) {
                        if (input.substr(pos, 1) === ")") {
                          var result58 = ")";
                          pos += 1;
                        } else {
                          var result58 = null;
                          if (reportMatchFailures) {
                            matchFailed("\")\"");
                          }
                        }
                        if (result58 !== null) {
                          var result50 = [result52, result53, result54, result55, result56, result57, result58];
                        } else {
                          var result50 = null;
                          pos = savedPos12;
                        }
                      } else {
                        var result50 = null;
                        pos = savedPos12;
                      }
                    } else {
                      var result50 = null;
                      pos = savedPos12;
                    }
                  } else {
                    var result50 = null;
                    pos = savedPos12;
                  }
                } else {
                  var result50 = null;
                  pos = savedPos12;
                }
              } else {
                var result50 = null;
                pos = savedPos12;
              }
            } else {
              var result50 = null;
              pos = savedPos12;
            }
            var result51 = result50 !== null
              ? (function(v) { return {tag:'spawn', name:v, args:[]}; })(result50[2])
              : null;
            if (result51 !== null) {
              var result49 = result51;
            } else {
              var result49 = null;
              pos = savedPos11;
            }
            if (result49 !== null) {
              var result0 = result49;
            } else {
              var savedPos9 = pos;
              var savedPos10 = pos;
              if (input.substr(pos, 5) === "spawn") {
                var result40 = "spawn";
                pos += 5;
              } else {
                var result40 = null;
                if (reportMatchFailures) {
                  matchFailed("\"spawn\"");
                }
              }
              if (result40 !== null) {
                var result41 = parse__();
                if (result41 !== null) {
                  var result42 = parse_identifier();
                  if (result42 !== null) {
                    var result43 = parse__();
                    if (result43 !== null) {
                      if (input.substr(pos, 1) === "(") {
                        var result44 = "(";
                        pos += 1;
                      } else {
                        var result44 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"(\"");
                        }
                      }
                      if (result44 !== null) {
                        var result45 = parse__();
                        if (result45 !== null) {
                          var result46 = parse_arglist();
                          if (result46 !== null) {
                            var result47 = parse__();
                            if (result47 !== null) {
                              if (input.substr(pos, 1) === ")") {
                                var result48 = ")";
                                pos += 1;
                              } else {
                                var result48 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\")\"");
                                }
                              }
                              if (result48 !== null) {
                                var result38 = [result40, result41, result42, result43, result44, result45, result46, result47, result48];
                              } else {
                                var result38 = null;
                                pos = savedPos10;
                              }
                            } else {
                              var result38 = null;
                              pos = savedPos10;
                            }
                          } else {
                            var result38 = null;
                            pos = savedPos10;
                          }
                        } else {
                          var result38 = null;
                          pos = savedPos10;
                        }
                      } else {
                        var result38 = null;
                        pos = savedPos10;
                      }
                    } else {
                      var result38 = null;
                      pos = savedPos10;
                    }
                  } else {
                    var result38 = null;
                    pos = savedPos10;
                  }
                } else {
                  var result38 = null;
                  pos = savedPos10;
                }
              } else {
                var result38 = null;
                pos = savedPos10;
              }
              var result39 = result38 !== null
                ? (function(v, args) { return {tag:'spawn', name:v, args:args}; })(result38[2], result38[6])
                : null;
              if (result39 !== null) {
                var result37 = result39;
              } else {
                var result37 = null;
                pos = savedPos9;
              }
              if (result37 !== null) {
                var result0 = result37;
              } else {
                var savedPos7 = pos;
                var savedPos8 = pos;
                if (input.substr(pos, 5) === "throw") {
                  var result33 = "throw";
                  pos += 5;
                } else {
                  var result33 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"throw\"");
                  }
                }
                if (result33 !== null) {
                  var result34 = parse__();
                  if (result34 !== null) {
                    var result35 = parse_expression();
                    if (result35 !== null) {
                      var result36 = parse__();
                      if (result36 !== null) {
                        var result31 = [result33, result34, result35, result36];
                      } else {
                        var result31 = null;
                        pos = savedPos8;
                      }
                    } else {
                      var result31 = null;
                      pos = savedPos8;
                    }
                  } else {
                    var result31 = null;
                    pos = savedPos8;
                  }
                } else {
                  var result31 = null;
                  pos = savedPos8;
                }
                var result32 = result31 !== null
                  ? (function(e) { return {tag:'throw', err:e}; })(result31[2])
                  : null;
                if (result32 !== null) {
                  var result30 = result32;
                } else {
                  var result30 = null;
                  pos = savedPos7;
                }
                if (result30 !== null) {
                  var result0 = result30;
                } else {
                  var savedPos5 = pos;
                  var savedPos6 = pos;
                  var result25 = parse_identifier();
                  if (result25 !== null) {
                    var result26 = parse__();
                    if (result26 !== null) {
                      if (input.substr(pos, 1) === "(") {
                        var result27 = "(";
                        pos += 1;
                      } else {
                        var result27 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"(\"");
                        }
                      }
                      if (result27 !== null) {
                        var result28 = parse__();
                        if (result28 !== null) {
                          if (input.substr(pos, 1) === ")") {
                            var result29 = ")";
                            pos += 1;
                          } else {
                            var result29 = null;
                            if (reportMatchFailures) {
                              matchFailed("\")\"");
                            }
                          }
                          if (result29 !== null) {
                            var result23 = [result25, result26, result27, result28, result29];
                          } else {
                            var result23 = null;
                            pos = savedPos6;
                          }
                        } else {
                          var result23 = null;
                          pos = savedPos6;
                        }
                      } else {
                        var result23 = null;
                        pos = savedPos6;
                      }
                    } else {
                      var result23 = null;
                      pos = savedPos6;
                    }
                  } else {
                    var result23 = null;
                    pos = savedPos6;
                  }
                  var result24 = result23 !== null
                    ? (function(v) { return {tag:"call", name:v, args:[]}; })(result23[0])
                    : null;
                  if (result24 !== null) {
                    var result22 = result24;
                  } else {
                    var result22 = null;
                    pos = savedPos5;
                  }
                  if (result22 !== null) {
                    var result0 = result22;
                  } else {
                    var savedPos3 = pos;
                    var savedPos4 = pos;
                    var result15 = parse_identifier();
                    if (result15 !== null) {
                      var result16 = parse__();
                      if (result16 !== null) {
                        if (input.substr(pos, 1) === "(") {
                          var result17 = "(";
                          pos += 1;
                        } else {
                          var result17 = null;
                          if (reportMatchFailures) {
                            matchFailed("\"(\"");
                          }
                        }
                        if (result17 !== null) {
                          var result18 = parse__();
                          if (result18 !== null) {
                            var result19 = parse_arglist();
                            if (result19 !== null) {
                              var result20 = parse__();
                              if (result20 !== null) {
                                if (input.substr(pos, 1) === ")") {
                                  var result21 = ")";
                                  pos += 1;
                                } else {
                                  var result21 = null;
                                  if (reportMatchFailures) {
                                    matchFailed("\")\"");
                                  }
                                }
                                if (result21 !== null) {
                                  var result13 = [result15, result16, result17, result18, result19, result20, result21];
                                } else {
                                  var result13 = null;
                                  pos = savedPos4;
                                }
                              } else {
                                var result13 = null;
                                pos = savedPos4;
                              }
                            } else {
                              var result13 = null;
                              pos = savedPos4;
                            }
                          } else {
                            var result13 = null;
                            pos = savedPos4;
                          }
                        } else {
                          var result13 = null;
                          pos = savedPos4;
                        }
                      } else {
                        var result13 = null;
                        pos = savedPos4;
                      }
                    } else {
                      var result13 = null;
                      pos = savedPos4;
                    }
                    var result14 = result13 !== null
                      ? (function(v, args) { return {tag:"call", name:v, args:args}; })(result13[0], result13[4])
                      : null;
                    if (result14 !== null) {
                      var result12 = result14;
                    } else {
                      var result12 = null;
                      pos = savedPos3;
                    }
                    if (result12 !== null) {
                      var result0 = result12;
                    } else {
                      var savedPos1 = pos;
                      var savedPos2 = pos;
                      if (input.substr(pos, 1) === "(") {
                        var result7 = "(";
                        pos += 1;
                      } else {
                        var result7 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"(\"");
                        }
                      }
                      if (result7 !== null) {
                        var result8 = parse__();
                        if (result8 !== null) {
                          var result9 = parse_expression();
                          if (result9 !== null) {
                            var result10 = parse__();
                            if (result10 !== null) {
                              if (input.substr(pos, 1) === ")") {
                                var result11 = ")";
                                pos += 1;
                              } else {
                                var result11 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\")\"");
                                }
                              }
                              if (result11 !== null) {
                                var result5 = [result7, result8, result9, result10, result11];
                              } else {
                                var result5 = null;
                                pos = savedPos2;
                              }
                            } else {
                              var result5 = null;
                              pos = savedPos2;
                            }
                          } else {
                            var result5 = null;
                            pos = savedPos2;
                          }
                        } else {
                          var result5 = null;
                          pos = savedPos2;
                        }
                      } else {
                        var result5 = null;
                        pos = savedPos2;
                      }
                      var result6 = result5 !== null
                        ? (function(expr) { return expr; })(result5[2])
                        : null;
                      if (result6 !== null) {
                        var result4 = result6;
                      } else {
                        var result4 = null;
                        pos = savedPos1;
                      }
                      if (result4 !== null) {
                        var result0 = result4;
                      } else {
                        var savedPos0 = pos;
                        var result2 = parse_identifier();
                        var result3 = result2 !== null
                          ? (function(v) { return {tag:'ident',name:v}; })(result2)
                          : null;
                        if (result3 !== null) {
                          var result1 = result3;
                        } else {
                          var result1 = null;
                          pos = savedPos0;
                        }
                        if (result1 !== null) {
                          var result0 = result1;
                        } else {
                          var result0 = null;;
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comma_expression() {
        var cacheKey = 'comma_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === ",") {
          var result3 = ",";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\",\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse__();
          if (result4 !== null) {
            var result5 = parse_expression();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(expr) { return expr; })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_arglist() {
        var cacheKey = 'arglist@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_expression();
        if (result3 !== null) {
          var result4 = [];
          var result5 = parse_comma_expression();
          while (result5 !== null) {
            result4.push(result5);
            var result5 = parse_comma_expression();
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first, rest) { return [first].concat(rest); })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_statement() {
        var cacheKey = 'statement@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos24 = pos;
        var savedPos25 = pos;
        if (input.substr(pos, 5) === "yield") {
          var result178 = "yield";
          pos += 5;
        } else {
          var result178 = null;
          if (reportMatchFailures) {
            matchFailed("\"yield\"");
          }
        }
        if (result178 !== null) {
          var result179 = parse__();
          if (result179 !== null) {
            if (input.substr(pos, 1) === ";") {
              var result180 = ";";
              pos += 1;
            } else {
              var result180 = null;
              if (reportMatchFailures) {
                matchFailed("\";\"");
              }
            }
            if (result180 !== null) {
              var result181 = parse__();
              if (result181 !== null) {
                var result176 = [result178, result179, result180, result181];
              } else {
                var result176 = null;
                pos = savedPos25;
              }
            } else {
              var result176 = null;
              pos = savedPos25;
            }
          } else {
            var result176 = null;
            pos = savedPos25;
          }
        } else {
          var result176 = null;
          pos = savedPos25;
        }
        var result177 = result176 !== null
          ? (function() { return { tag:'yield'}; })()
          : null;
        if (result177 !== null) {
          var result175 = result177;
        } else {
          var result175 = null;
          pos = savedPos24;
        }
        if (result175 !== null) {
          var result0 = result175;
        } else {
          var savedPos22 = pos;
          var savedPos23 = pos;
          var result171 = parse_expression();
          if (result171 !== null) {
            var result172 = parse__();
            if (result172 !== null) {
              if (input.substr(pos, 1) === ";") {
                var result173 = ";";
                pos += 1;
              } else {
                var result173 = null;
                if (reportMatchFailures) {
                  matchFailed("\";\"");
                }
              }
              if (result173 !== null) {
                var result174 = parse__();
                if (result174 !== null) {
                  var result169 = [result171, result172, result173, result174];
                } else {
                  var result169 = null;
                  pos = savedPos23;
                }
              } else {
                var result169 = null;
                pos = savedPos23;
              }
            } else {
              var result169 = null;
              pos = savedPos23;
            }
          } else {
            var result169 = null;
            pos = savedPos23;
          }
          var result170 = result169 !== null
            ? (function(expr) { return { tag:"ignore", body:expr }; })(result169[0])
            : null;
          if (result170 !== null) {
            var result168 = result170;
          } else {
            var result168 = null;
            pos = savedPos22;
          }
          if (result168 !== null) {
            var result0 = result168;
          } else {
            var savedPos20 = pos;
            var savedPos21 = pos;
            if (input.substr(pos, 4) === "with") {
              var result154 = "with";
              pos += 4;
            } else {
              var result154 = null;
              if (reportMatchFailures) {
                matchFailed("\"with\"");
              }
            }
            if (result154 !== null) {
              var result155 = parse__();
              if (result155 !== null) {
                if (input.substr(pos, 1) === "(") {
                  var result156 = "(";
                  pos += 1;
                } else {
                  var result156 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"(\"");
                  }
                }
                if (result156 !== null) {
                  var result157 = parse__();
                  if (result157 !== null) {
                    var result158 = parse_expression();
                    if (result158 !== null) {
                      var result159 = parse__();
                      if (result159 !== null) {
                        if (input.substr(pos, 1) === ")") {
                          var result160 = ")";
                          pos += 1;
                        } else {
                          var result160 = null;
                          if (reportMatchFailures) {
                            matchFailed("\")\"");
                          }
                        }
                        if (result160 !== null) {
                          var result161 = parse__();
                          if (result161 !== null) {
                            if (input.substr(pos, 1) === "{") {
                              var result162 = "{";
                              pos += 1;
                            } else {
                              var result162 = null;
                              if (reportMatchFailures) {
                                matchFailed("\"{\"");
                              }
                            }
                            if (result162 !== null) {
                              var result163 = parse__();
                              if (result163 !== null) {
                                var result164 = parse_statements();
                                if (result164 !== null) {
                                  var result165 = parse__();
                                  if (result165 !== null) {
                                    if (input.substr(pos, 1) === "}") {
                                      var result166 = "}";
                                      pos += 1;
                                    } else {
                                      var result166 = null;
                                      if (reportMatchFailures) {
                                        matchFailed("\"}\"");
                                      }
                                    }
                                    if (result166 !== null) {
                                      var result167 = parse__();
                                      if (result167 !== null) {
                                        var result152 = [result154, result155, result156, result157, result158, result159, result160, result161, result162, result163, result164, result165, result166, result167];
                                      } else {
                                        var result152 = null;
                                        pos = savedPos21;
                                      }
                                    } else {
                                      var result152 = null;
                                      pos = savedPos21;
                                    }
                                  } else {
                                    var result152 = null;
                                    pos = savedPos21;
                                  }
                                } else {
                                  var result152 = null;
                                  pos = savedPos21;
                                }
                              } else {
                                var result152 = null;
                                pos = savedPos21;
                              }
                            } else {
                              var result152 = null;
                              pos = savedPos21;
                            }
                          } else {
                            var result152 = null;
                            pos = savedPos21;
                          }
                        } else {
                          var result152 = null;
                          pos = savedPos21;
                        }
                      } else {
                        var result152 = null;
                        pos = savedPos21;
                      }
                    } else {
                      var result152 = null;
                      pos = savedPos21;
                    }
                  } else {
                    var result152 = null;
                    pos = savedPos21;
                  }
                } else {
                  var result152 = null;
                  pos = savedPos21;
                }
              } else {
                var result152 = null;
                pos = savedPos21;
              }
            } else {
              var result152 = null;
              pos = savedPos21;
            }
            var result153 = result152 !== null
              ? (function(turtle, body) { return {tag:'with', expr:turtle, body:body}; })(result152[4], result152[10])
              : null;
            if (result153 !== null) {
              var result151 = result153;
            } else {
              var result151 = null;
              pos = savedPos20;
            }
            if (result151 !== null) {
              var result0 = result151;
            } else {
              var savedPos18 = pos;
              var savedPos19 = pos;
              if (input.substr(pos, 4) === "lock") {
                var result137 = "lock";
                pos += 4;
              } else {
                var result137 = null;
                if (reportMatchFailures) {
                  matchFailed("\"lock\"");
                }
              }
              if (result137 !== null) {
                var result138 = parse__();
                if (result138 !== null) {
                  if (input.substr(pos, 1) === "(") {
                    var result139 = "(";
                    pos += 1;
                  } else {
                    var result139 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"(\"");
                    }
                  }
                  if (result139 !== null) {
                    var result140 = parse__();
                    if (result140 !== null) {
                      var result141 = parse_identifier();
                      if (result141 !== null) {
                        var result142 = parse__();
                        if (result142 !== null) {
                          if (input.substr(pos, 1) === ")") {
                            var result143 = ")";
                            pos += 1;
                          } else {
                            var result143 = null;
                            if (reportMatchFailures) {
                              matchFailed("\")\"");
                            }
                          }
                          if (result143 !== null) {
                            var result144 = parse__();
                            if (result144 !== null) {
                              if (input.substr(pos, 1) === "{") {
                                var result145 = "{";
                                pos += 1;
                              } else {
                                var result145 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\"{\"");
                                }
                              }
                              if (result145 !== null) {
                                var result146 = parse__();
                                if (result146 !== null) {
                                  var result147 = parse_statements();
                                  if (result147 !== null) {
                                    var result148 = parse__();
                                    if (result148 !== null) {
                                      if (input.substr(pos, 1) === "}") {
                                        var result149 = "}";
                                        pos += 1;
                                      } else {
                                        var result149 = null;
                                        if (reportMatchFailures) {
                                          matchFailed("\"}\"");
                                        }
                                      }
                                      if (result149 !== null) {
                                        var result150 = parse__();
                                        if (result150 !== null) {
                                          var result135 = [result137, result138, result139, result140, result141, result142, result143, result144, result145, result146, result147, result148, result149, result150];
                                        } else {
                                          var result135 = null;
                                          pos = savedPos19;
                                        }
                                      } else {
                                        var result135 = null;
                                        pos = savedPos19;
                                      }
                                    } else {
                                      var result135 = null;
                                      pos = savedPos19;
                                    }
                                  } else {
                                    var result135 = null;
                                    pos = savedPos19;
                                  }
                                } else {
                                  var result135 = null;
                                  pos = savedPos19;
                                }
                              } else {
                                var result135 = null;
                                pos = savedPos19;
                              }
                            } else {
                              var result135 = null;
                              pos = savedPos19;
                            }
                          } else {
                            var result135 = null;
                            pos = savedPos19;
                          }
                        } else {
                          var result135 = null;
                          pos = savedPos19;
                        }
                      } else {
                        var result135 = null;
                        pos = savedPos19;
                      }
                    } else {
                      var result135 = null;
                      pos = savedPos19;
                    }
                  } else {
                    var result135 = null;
                    pos = savedPos19;
                  }
                } else {
                  var result135 = null;
                  pos = savedPos19;
                }
              } else {
                var result135 = null;
                pos = savedPos19;
              }
              var result136 = result135 !== null
                ? (function(obj, body) { return {tag:'lock', lock:obj, body:body}; })(result135[4], result135[10])
                : null;
              if (result136 !== null) {
                var result134 = result136;
              } else {
                var result134 = null;
                pos = savedPos18;
              }
              if (result134 !== null) {
                var result0 = result134;
              } else {
                var savedPos16 = pos;
                var savedPos17 = pos;
                if (input.substr(pos, 3) === "try") {
                  var result116 = "try";
                  pos += 3;
                } else {
                  var result116 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"try\"");
                  }
                }
                if (result116 !== null) {
                  var result117 = parse__();
                  if (result117 !== null) {
                    if (input.substr(pos, 1) === "{") {
                      var result118 = "{";
                      pos += 1;
                    } else {
                      var result118 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"{\"");
                      }
                    }
                    if (result118 !== null) {
                      var result119 = parse__();
                      if (result119 !== null) {
                        var result120 = parse_statements();
                        if (result120 !== null) {
                          var result121 = parse__();
                          if (result121 !== null) {
                            if (input.substr(pos, 1) === "}") {
                              var result122 = "}";
                              pos += 1;
                            } else {
                              var result122 = null;
                              if (reportMatchFailures) {
                                matchFailed("\"}\"");
                              }
                            }
                            if (result122 !== null) {
                              var result123 = parse__();
                              if (result123 !== null) {
                                if (input.substr(pos, 5) === "catch") {
                                  var result124 = "catch";
                                  pos += 5;
                                } else {
                                  var result124 = null;
                                  if (reportMatchFailures) {
                                    matchFailed("\"catch\"");
                                  }
                                }
                                if (result124 !== null) {
                                  var result125 = parse__();
                                  if (result125 !== null) {
                                    var result126 = parse_identifier();
                                    if (result126 !== null) {
                                      var result127 = parse__();
                                      if (result127 !== null) {
                                        if (input.substr(pos, 1) === "{") {
                                          var result128 = "{";
                                          pos += 1;
                                        } else {
                                          var result128 = null;
                                          if (reportMatchFailures) {
                                            matchFailed("\"{\"");
                                          }
                                        }
                                        if (result128 !== null) {
                                          var result129 = parse__();
                                          if (result129 !== null) {
                                            var result130 = parse_statements();
                                            if (result130 !== null) {
                                              var result131 = parse__();
                                              if (result131 !== null) {
                                                if (input.substr(pos, 1) === "}") {
                                                  var result132 = "}";
                                                  pos += 1;
                                                } else {
                                                  var result132 = null;
                                                  if (reportMatchFailures) {
                                                    matchFailed("\"}\"");
                                                  }
                                                }
                                                if (result132 !== null) {
                                                  var result133 = parse__();
                                                  if (result133 !== null) {
                                                    var result114 = [result116, result117, result118, result119, result120, result121, result122, result123, result124, result125, result126, result127, result128, result129, result130, result131, result132, result133];
                                                  } else {
                                                    var result114 = null;
                                                    pos = savedPos17;
                                                  }
                                                } else {
                                                  var result114 = null;
                                                  pos = savedPos17;
                                                }
                                              } else {
                                                var result114 = null;
                                                pos = savedPos17;
                                              }
                                            } else {
                                              var result114 = null;
                                              pos = savedPos17;
                                            }
                                          } else {
                                            var result114 = null;
                                            pos = savedPos17;
                                          }
                                        } else {
                                          var result114 = null;
                                          pos = savedPos17;
                                        }
                                      } else {
                                        var result114 = null;
                                        pos = savedPos17;
                                      }
                                    } else {
                                      var result114 = null;
                                      pos = savedPos17;
                                    }
                                  } else {
                                    var result114 = null;
                                    pos = savedPos17;
                                  }
                                } else {
                                  var result114 = null;
                                  pos = savedPos17;
                                }
                              } else {
                                var result114 = null;
                                pos = savedPos17;
                              }
                            } else {
                              var result114 = null;
                              pos = savedPos17;
                            }
                          } else {
                            var result114 = null;
                            pos = savedPos17;
                          }
                        } else {
                          var result114 = null;
                          pos = savedPos17;
                        }
                      } else {
                        var result114 = null;
                        pos = savedPos17;
                      }
                    } else {
                      var result114 = null;
                      pos = savedPos17;
                    }
                  } else {
                    var result114 = null;
                    pos = savedPos17;
                  }
                } else {
                  var result114 = null;
                  pos = savedPos17;
                }
                var result115 = result114 !== null
                  ? (function(tbody, err, cbody) { return {tag:'try', tryBody:tbody, errName:err, catchBody:cbody}; })(result114[4], result114[10], result114[14])
                  : null;
                if (result115 !== null) {
                  var result113 = result115;
                } else {
                  var result113 = null;
                  pos = savedPos16;
                }
                if (result113 !== null) {
                  var result0 = result113;
                } else {
                  var savedPos14 = pos;
                  var savedPos15 = pos;
                  var result106 = parse_identifier();
                  if (result106 !== null) {
                    var result107 = parse__();
                    if (result107 !== null) {
                      if (input.substr(pos, 2) === ":=") {
                        var result108 = ":=";
                        pos += 2;
                      } else {
                        var result108 = null;
                        if (reportMatchFailures) {
                          matchFailed("\":=\"");
                        }
                      }
                      if (result108 !== null) {
                        var result109 = parse__();
                        if (result109 !== null) {
                          var result110 = parse_expression();
                          if (result110 !== null) {
                            if (input.substr(pos, 1) === ";") {
                              var result111 = ";";
                              pos += 1;
                            } else {
                              var result111 = null;
                              if (reportMatchFailures) {
                                matchFailed("\";\"");
                              }
                            }
                            if (result111 !== null) {
                              var result112 = parse__();
                              if (result112 !== null) {
                                var result104 = [result106, result107, result108, result109, result110, result111, result112];
                              } else {
                                var result104 = null;
                                pos = savedPos15;
                              }
                            } else {
                              var result104 = null;
                              pos = savedPos15;
                            }
                          } else {
                            var result104 = null;
                            pos = savedPos15;
                          }
                        } else {
                          var result104 = null;
                          pos = savedPos15;
                        }
                      } else {
                        var result104 = null;
                        pos = savedPos15;
                      }
                    } else {
                      var result104 = null;
                      pos = savedPos15;
                    }
                  } else {
                    var result104 = null;
                    pos = savedPos15;
                  }
                  var result105 = result104 !== null
                    ? (function(v, expr) { return { tag:":=", left:v, right:expr }; })(result104[0], result104[4])
                    : null;
                  if (result105 !== null) {
                    var result103 = result105;
                  } else {
                    var result103 = null;
                    pos = savedPos14;
                  }
                  if (result103 !== null) {
                    var result0 = result103;
                  } else {
                    var savedPos12 = pos;
                    var savedPos13 = pos;
                    if (input.substr(pos, 3) === "var") {
                      var result98 = "var";
                      pos += 3;
                    } else {
                      var result98 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"var\"");
                      }
                    }
                    if (result98 !== null) {
                      var result99 = parse__();
                      if (result99 !== null) {
                        var result100 = parse_identifier();
                        if (result100 !== null) {
                          if (input.substr(pos, 1) === ";") {
                            var result101 = ";";
                            pos += 1;
                          } else {
                            var result101 = null;
                            if (reportMatchFailures) {
                              matchFailed("\";\"");
                            }
                          }
                          if (result101 !== null) {
                            var result102 = parse__();
                            if (result102 !== null) {
                              var result96 = [result98, result99, result100, result101, result102];
                            } else {
                              var result96 = null;
                              pos = savedPos13;
                            }
                          } else {
                            var result96 = null;
                            pos = savedPos13;
                          }
                        } else {
                          var result96 = null;
                          pos = savedPos13;
                        }
                      } else {
                        var result96 = null;
                        pos = savedPos13;
                      }
                    } else {
                      var result96 = null;
                      pos = savedPos13;
                    }
                    var result97 = result96 !== null
                      ? (function(name) { return { tag:'var',name:name }; })(result96[2])
                      : null;
                    if (result97 !== null) {
                      var result95 = result97;
                    } else {
                      var result95 = null;
                      pos = savedPos12;
                    }
                    if (result95 !== null) {
                      var result0 = result95;
                    } else {
                      var savedPos10 = pos;
                      var savedPos11 = pos;
                      if (input.substr(pos, 3) === "var") {
                        var result85 = "var";
                        pos += 3;
                      } else {
                        var result85 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"var\"");
                        }
                      }
                      if (result85 !== null) {
                        var result86 = parse__();
                        if (result86 !== null) {
                          var result87 = parse_identifier();
                          if (result87 !== null) {
                            var result88 = parse__();
                            if (result88 !== null) {
                              if (input.substr(pos, 2) === ":=") {
                                var result89 = ":=";
                                pos += 2;
                              } else {
                                var result89 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\":=\"");
                                }
                              }
                              if (result89 !== null) {
                                var result90 = parse__();
                                if (result90 !== null) {
                                  var result91 = parse_expression();
                                  if (result91 !== null) {
                                    var result92 = parse__();
                                    if (result92 !== null) {
                                      if (input.substr(pos, 1) === ";") {
                                        var result93 = ";";
                                        pos += 1;
                                      } else {
                                        var result93 = null;
                                        if (reportMatchFailures) {
                                          matchFailed("\";\"");
                                        }
                                      }
                                      if (result93 !== null) {
                                        var result94 = parse__();
                                        if (result94 !== null) {
                                          var result83 = [result85, result86, result87, result88, result89, result90, result91, result92, result93, result94];
                                        } else {
                                          var result83 = null;
                                          pos = savedPos11;
                                        }
                                      } else {
                                        var result83 = null;
                                        pos = savedPos11;
                                      }
                                    } else {
                                      var result83 = null;
                                      pos = savedPos11;
                                    }
                                  } else {
                                    var result83 = null;
                                    pos = savedPos11;
                                  }
                                } else {
                                  var result83 = null;
                                  pos = savedPos11;
                                }
                              } else {
                                var result83 = null;
                                pos = savedPos11;
                              }
                            } else {
                              var result83 = null;
                              pos = savedPos11;
                            }
                          } else {
                            var result83 = null;
                            pos = savedPos11;
                          }
                        } else {
                          var result83 = null;
                          pos = savedPos11;
                        }
                      } else {
                        var result83 = null;
                        pos = savedPos11;
                      }
                      var result84 = result83 !== null
                        ? (function(name, expr) { return { tag:'var:=',left:name, right:expr }; })(result83[2], result83[6])
                        : null;
                      if (result84 !== null) {
                        var result82 = result84;
                      } else {
                        var result82 = null;
                        pos = savedPos10;
                      }
                      if (result82 !== null) {
                        var result0 = result82;
                      } else {
                        var savedPos6 = pos;
                        var savedPos7 = pos;
                        if (input.substr(pos, 2) === "if") {
                          var result56 = "if";
                          pos += 2;
                        } else {
                          var result56 = null;
                          if (reportMatchFailures) {
                            matchFailed("\"if\"");
                          }
                        }
                        if (result56 !== null) {
                          var result57 = parse__();
                          if (result57 !== null) {
                            if (input.substr(pos, 1) === "(") {
                              var result58 = "(";
                              pos += 1;
                            } else {
                              var result58 = null;
                              if (reportMatchFailures) {
                                matchFailed("\"(\"");
                              }
                            }
                            if (result58 !== null) {
                              var result59 = parse__();
                              if (result59 !== null) {
                                var result60 = parse_expression();
                                if (result60 !== null) {
                                  var result61 = parse__();
                                  if (result61 !== null) {
                                    if (input.substr(pos, 1) === ")") {
                                      var result62 = ")";
                                      pos += 1;
                                    } else {
                                      var result62 = null;
                                      if (reportMatchFailures) {
                                        matchFailed("\")\"");
                                      }
                                    }
                                    if (result62 !== null) {
                                      var result63 = parse__();
                                      if (result63 !== null) {
                                        if (input.substr(pos, 1) === "{") {
                                          var result64 = "{";
                                          pos += 1;
                                        } else {
                                          var result64 = null;
                                          if (reportMatchFailures) {
                                            matchFailed("\"{\"");
                                          }
                                        }
                                        if (result64 !== null) {
                                          var result65 = parse__();
                                          if (result65 !== null) {
                                            var result66 = parse_statements();
                                            if (result66 !== null) {
                                              var result67 = parse__();
                                              if (result67 !== null) {
                                                if (input.substr(pos, 1) === "}") {
                                                  var result68 = "}";
                                                  pos += 1;
                                                } else {
                                                  var result68 = null;
                                                  if (reportMatchFailures) {
                                                    matchFailed("\"}\"");
                                                  }
                                                }
                                                if (result68 !== null) {
                                                  var result69 = parse__();
                                                  if (result69 !== null) {
                                                    var savedPos8 = pos;
                                                    var savedPos9 = pos;
                                                    if (input.substr(pos, 4) === "else") {
                                                      var result74 = "else";
                                                      pos += 4;
                                                    } else {
                                                      var result74 = null;
                                                      if (reportMatchFailures) {
                                                        matchFailed("\"else\"");
                                                      }
                                                    }
                                                    if (result74 !== null) {
                                                      var result75 = parse__();
                                                      if (result75 !== null) {
                                                        if (input.substr(pos, 1) === "{") {
                                                          var result76 = "{";
                                                          pos += 1;
                                                        } else {
                                                          var result76 = null;
                                                          if (reportMatchFailures) {
                                                            matchFailed("\"{\"");
                                                          }
                                                        }
                                                        if (result76 !== null) {
                                                          var result77 = parse__();
                                                          if (result77 !== null) {
                                                            var result78 = parse_statements();
                                                            if (result78 !== null) {
                                                              var result79 = parse__();
                                                              if (result79 !== null) {
                                                                if (input.substr(pos, 1) === "}") {
                                                                  var result80 = "}";
                                                                  pos += 1;
                                                                } else {
                                                                  var result80 = null;
                                                                  if (reportMatchFailures) {
                                                                    matchFailed("\"}\"");
                                                                  }
                                                                }
                                                                if (result80 !== null) {
                                                                  var result81 = parse__();
                                                                  if (result81 !== null) {
                                                                    var result72 = [result74, result75, result76, result77, result78, result79, result80, result81];
                                                                  } else {
                                                                    var result72 = null;
                                                                    pos = savedPos9;
                                                                  }
                                                                } else {
                                                                  var result72 = null;
                                                                  pos = savedPos9;
                                                                }
                                                              } else {
                                                                var result72 = null;
                                                                pos = savedPos9;
                                                              }
                                                            } else {
                                                              var result72 = null;
                                                              pos = savedPos9;
                                                            }
                                                          } else {
                                                            var result72 = null;
                                                            pos = savedPos9;
                                                          }
                                                        } else {
                                                          var result72 = null;
                                                          pos = savedPos9;
                                                        }
                                                      } else {
                                                        var result72 = null;
                                                        pos = savedPos9;
                                                      }
                                                    } else {
                                                      var result72 = null;
                                                      pos = savedPos9;
                                                    }
                                                    var result73 = result72 !== null
                                                      ? (function(eb) {return eb;})(result72[4])
                                                      : null;
                                                    if (result73 !== null) {
                                                      var result71 = result73;
                                                    } else {
                                                      var result71 = null;
                                                      pos = savedPos8;
                                                    }
                                                    var result70 = result71 !== null ? result71 : '';
                                                    if (result70 !== null) {
                                                      var result54 = [result56, result57, result58, result59, result60, result61, result62, result63, result64, result65, result66, result67, result68, result69, result70];
                                                    } else {
                                                      var result54 = null;
                                                      pos = savedPos7;
                                                    }
                                                  } else {
                                                    var result54 = null;
                                                    pos = savedPos7;
                                                  }
                                                } else {
                                                  var result54 = null;
                                                  pos = savedPos7;
                                                }
                                              } else {
                                                var result54 = null;
                                                pos = savedPos7;
                                              }
                                            } else {
                                              var result54 = null;
                                              pos = savedPos7;
                                            }
                                          } else {
                                            var result54 = null;
                                            pos = savedPos7;
                                          }
                                        } else {
                                          var result54 = null;
                                          pos = savedPos7;
                                        }
                                      } else {
                                        var result54 = null;
                                        pos = savedPos7;
                                      }
                                    } else {
                                      var result54 = null;
                                      pos = savedPos7;
                                    }
                                  } else {
                                    var result54 = null;
                                    pos = savedPos7;
                                  }
                                } else {
                                  var result54 = null;
                                  pos = savedPos7;
                                }
                              } else {
                                var result54 = null;
                                pos = savedPos7;
                              }
                            } else {
                              var result54 = null;
                              pos = savedPos7;
                            }
                          } else {
                            var result54 = null;
                            pos = savedPos7;
                          }
                        } else {
                          var result54 = null;
                          pos = savedPos7;
                        }
                        var result55 = result54 !== null
                          ? (function(test, body, elseb) { return { tag:'if',expr:test, body:body, elsebody:elseb }; })(result54[4], result54[10], result54[14])
                          : null;
                        if (result55 !== null) {
                          var result53 = result55;
                        } else {
                          var result53 = null;
                          pos = savedPos6;
                        }
                        if (result53 !== null) {
                          var result0 = result53;
                        } else {
                          var savedPos4 = pos;
                          var savedPos5 = pos;
                          if (input.substr(pos, 6) === "repeat") {
                            var result40 = "repeat";
                            pos += 6;
                          } else {
                            var result40 = null;
                            if (reportMatchFailures) {
                              matchFailed("\"repeat\"");
                            }
                          }
                          if (result40 !== null) {
                            var result41 = parse__();
                            if (result41 !== null) {
                              if (input.substr(pos, 1) === "(") {
                                var result42 = "(";
                                pos += 1;
                              } else {
                                var result42 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\"(\"");
                                }
                              }
                              if (result42 !== null) {
                                var result43 = parse__();
                                if (result43 !== null) {
                                  var result44 = parse_expression();
                                  if (result44 !== null) {
                                    if (input.substr(pos, 1) === ")") {
                                      var result45 = ")";
                                      pos += 1;
                                    } else {
                                      var result45 = null;
                                      if (reportMatchFailures) {
                                        matchFailed("\")\"");
                                      }
                                    }
                                    if (result45 !== null) {
                                      var result46 = parse__();
                                      if (result46 !== null) {
                                        if (input.substr(pos, 1) === "{") {
                                          var result47 = "{";
                                          pos += 1;
                                        } else {
                                          var result47 = null;
                                          if (reportMatchFailures) {
                                            matchFailed("\"{\"");
                                          }
                                        }
                                        if (result47 !== null) {
                                          var result48 = parse__();
                                          if (result48 !== null) {
                                            var result49 = parse_statements();
                                            if (result49 !== null) {
                                              var result50 = parse__();
                                              if (result50 !== null) {
                                                if (input.substr(pos, 1) === "}") {
                                                  var result51 = "}";
                                                  pos += 1;
                                                } else {
                                                  var result51 = null;
                                                  if (reportMatchFailures) {
                                                    matchFailed("\"}\"");
                                                  }
                                                }
                                                if (result51 !== null) {
                                                  var result52 = parse__();
                                                  if (result52 !== null) {
                                                    var result38 = [result40, result41, result42, result43, result44, result45, result46, result47, result48, result49, result50, result51, result52];
                                                  } else {
                                                    var result38 = null;
                                                    pos = savedPos5;
                                                  }
                                                } else {
                                                  var result38 = null;
                                                  pos = savedPos5;
                                                }
                                              } else {
                                                var result38 = null;
                                                pos = savedPos5;
                                              }
                                            } else {
                                              var result38 = null;
                                              pos = savedPos5;
                                            }
                                          } else {
                                            var result38 = null;
                                            pos = savedPos5;
                                          }
                                        } else {
                                          var result38 = null;
                                          pos = savedPos5;
                                        }
                                      } else {
                                        var result38 = null;
                                        pos = savedPos5;
                                      }
                                    } else {
                                      var result38 = null;
                                      pos = savedPos5;
                                    }
                                  } else {
                                    var result38 = null;
                                    pos = savedPos5;
                                  }
                                } else {
                                  var result38 = null;
                                  pos = savedPos5;
                                }
                              } else {
                                var result38 = null;
                                pos = savedPos5;
                              }
                            } else {
                              var result38 = null;
                              pos = savedPos5;
                            }
                          } else {
                            var result38 = null;
                            pos = savedPos5;
                          }
                          var result39 = result38 !== null
                            ? (function(times, body) { return { tag:'repeat',expr:times,body:body }; })(result38[4], result38[9])
                            : null;
                          if (result39 !== null) {
                            var result37 = result39;
                          } else {
                            var result37 = null;
                            pos = savedPos4;
                          }
                          if (result37 !== null) {
                            var result0 = result37;
                          } else {
                            var savedPos2 = pos;
                            var savedPos3 = pos;
                            if (input.substr(pos, 7) === "define ") {
                              var result23 = "define ";
                              pos += 7;
                            } else {
                              var result23 = null;
                              if (reportMatchFailures) {
                                matchFailed("\"define \"");
                              }
                            }
                            if (result23 !== null) {
                              var result24 = parse__();
                              if (result24 !== null) {
                                var result25 = parse_identifier();
                                if (result25 !== null) {
                                  var result26 = parse__();
                                  if (result26 !== null) {
                                    if (input.substr(pos, 1) === "(") {
                                      var result27 = "(";
                                      pos += 1;
                                    } else {
                                      var result27 = null;
                                      if (reportMatchFailures) {
                                        matchFailed("\"(\"");
                                      }
                                    }
                                    if (result27 !== null) {
                                      var result28 = parse__();
                                      if (result28 !== null) {
                                        if (input.substr(pos, 1) === ")") {
                                          var result29 = ")";
                                          pos += 1;
                                        } else {
                                          var result29 = null;
                                          if (reportMatchFailures) {
                                            matchFailed("\")\"");
                                          }
                                        }
                                        if (result29 !== null) {
                                          var result30 = parse__();
                                          if (result30 !== null) {
                                            if (input.substr(pos, 1) === "{") {
                                              var result31 = "{";
                                              pos += 1;
                                            } else {
                                              var result31 = null;
                                              if (reportMatchFailures) {
                                                matchFailed("\"{\"");
                                              }
                                            }
                                            if (result31 !== null) {
                                              var result32 = parse__();
                                              if (result32 !== null) {
                                                var result33 = parse_statements();
                                                if (result33 !== null) {
                                                  var result34 = parse__();
                                                  if (result34 !== null) {
                                                    if (input.substr(pos, 1) === "}") {
                                                      var result35 = "}";
                                                      pos += 1;
                                                    } else {
                                                      var result35 = null;
                                                      if (reportMatchFailures) {
                                                        matchFailed("\"}\"");
                                                      }
                                                    }
                                                    if (result35 !== null) {
                                                      var result36 = parse__();
                                                      if (result36 !== null) {
                                                        var result21 = [result23, result24, result25, result26, result27, result28, result29, result30, result31, result32, result33, result34, result35, result36];
                                                      } else {
                                                        var result21 = null;
                                                        pos = savedPos3;
                                                      }
                                                    } else {
                                                      var result21 = null;
                                                      pos = savedPos3;
                                                    }
                                                  } else {
                                                    var result21 = null;
                                                    pos = savedPos3;
                                                  }
                                                } else {
                                                  var result21 = null;
                                                  pos = savedPos3;
                                                }
                                              } else {
                                                var result21 = null;
                                                pos = savedPos3;
                                              }
                                            } else {
                                              var result21 = null;
                                              pos = savedPos3;
                                            }
                                          } else {
                                            var result21 = null;
                                            pos = savedPos3;
                                          }
                                        } else {
                                          var result21 = null;
                                          pos = savedPos3;
                                        }
                                      } else {
                                        var result21 = null;
                                        pos = savedPos3;
                                      }
                                    } else {
                                      var result21 = null;
                                      pos = savedPos3;
                                    }
                                  } else {
                                    var result21 = null;
                                    pos = savedPos3;
                                  }
                                } else {
                                  var result21 = null;
                                  pos = savedPos3;
                                }
                              } else {
                                var result21 = null;
                                pos = savedPos3;
                              }
                            } else {
                              var result21 = null;
                              pos = savedPos3;
                            }
                            var result22 = result21 !== null
                              ? (function(v, body) { return { tag:"define", name:v, args:[], body:body }; })(result21[2], result21[10])
                              : null;
                            if (result22 !== null) {
                              var result20 = result22;
                            } else {
                              var result20 = null;
                              pos = savedPos2;
                            }
                            if (result20 !== null) {
                              var result0 = result20;
                            } else {
                              var savedPos0 = pos;
                              var savedPos1 = pos;
                              if (input.substr(pos, 7) === "define ") {
                                var result4 = "define ";
                                pos += 7;
                              } else {
                                var result4 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\"define \"");
                                }
                              }
                              if (result4 !== null) {
                                var result5 = parse__();
                                if (result5 !== null) {
                                  var result6 = parse_identifier();
                                  if (result6 !== null) {
                                    var result7 = parse__();
                                    if (result7 !== null) {
                                      if (input.substr(pos, 1) === "(") {
                                        var result8 = "(";
                                        pos += 1;
                                      } else {
                                        var result8 = null;
                                        if (reportMatchFailures) {
                                          matchFailed("\"(\"");
                                        }
                                      }
                                      if (result8 !== null) {
                                        var result9 = parse__();
                                        if (result9 !== null) {
                                          var result10 = parse_ident_list();
                                          if (result10 !== null) {
                                            var result11 = parse__();
                                            if (result11 !== null) {
                                              if (input.substr(pos, 1) === ")") {
                                                var result12 = ")";
                                                pos += 1;
                                              } else {
                                                var result12 = null;
                                                if (reportMatchFailures) {
                                                  matchFailed("\")\"");
                                                }
                                              }
                                              if (result12 !== null) {
                                                var result13 = parse__();
                                                if (result13 !== null) {
                                                  if (input.substr(pos, 1) === "{") {
                                                    var result14 = "{";
                                                    pos += 1;
                                                  } else {
                                                    var result14 = null;
                                                    if (reportMatchFailures) {
                                                      matchFailed("\"{\"");
                                                    }
                                                  }
                                                  if (result14 !== null) {
                                                    var result15 = parse__();
                                                    if (result15 !== null) {
                                                      var result16 = parse_statements();
                                                      if (result16 !== null) {
                                                        var result17 = parse__();
                                                        if (result17 !== null) {
                                                          if (input.substr(pos, 1) === "}") {
                                                            var result18 = "}";
                                                            pos += 1;
                                                          } else {
                                                            var result18 = null;
                                                            if (reportMatchFailures) {
                                                              matchFailed("\"}\"");
                                                            }
                                                          }
                                                          if (result18 !== null) {
                                                            var result19 = parse__();
                                                            if (result19 !== null) {
                                                              var result2 = [result4, result5, result6, result7, result8, result9, result10, result11, result12, result13, result14, result15, result16, result17, result18, result19];
                                                            } else {
                                                              var result2 = null;
                                                              pos = savedPos1;
                                                            }
                                                          } else {
                                                            var result2 = null;
                                                            pos = savedPos1;
                                                          }
                                                        } else {
                                                          var result2 = null;
                                                          pos = savedPos1;
                                                        }
                                                      } else {
                                                        var result2 = null;
                                                        pos = savedPos1;
                                                      }
                                                    } else {
                                                      var result2 = null;
                                                      pos = savedPos1;
                                                    }
                                                  } else {
                                                    var result2 = null;
                                                    pos = savedPos1;
                                                  }
                                                } else {
                                                  var result2 = null;
                                                  pos = savedPos1;
                                                }
                                              } else {
                                                var result2 = null;
                                                pos = savedPos1;
                                              }
                                            } else {
                                              var result2 = null;
                                              pos = savedPos1;
                                            }
                                          } else {
                                            var result2 = null;
                                            pos = savedPos1;
                                          }
                                        } else {
                                          var result2 = null;
                                          pos = savedPos1;
                                        }
                                      } else {
                                        var result2 = null;
                                        pos = savedPos1;
                                      }
                                    } else {
                                      var result2 = null;
                                      pos = savedPos1;
                                    }
                                  } else {
                                    var result2 = null;
                                    pos = savedPos1;
                                  }
                                } else {
                                  var result2 = null;
                                  pos = savedPos1;
                                }
                              } else {
                                var result2 = null;
                                pos = savedPos1;
                              }
                              var result3 = result2 !== null
                                ? (function(v, args, body) { return { tag:"define", name:v, args:args, body:body }; })(result2[2], result2[6], result2[12])
                                : null;
                              if (result3 !== null) {
                                var result1 = result3;
                              } else {
                                var result1 = null;
                                pos = savedPos0;
                              }
                              if (result1 !== null) {
                                var result0 = result1;
                              } else {
                                var result0 = null;;
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comma_identifier() {
        var cacheKey = 'comma_identifier@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === ",") {
          var result3 = ",";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\",\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse__();
          if (result4 !== null) {
            var result5 = parse_identifier();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(v) { return v; })(result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ident_list() {
        var cacheKey = 'ident_list@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_identifier();
        if (result3 !== null) {
          var result4 = [];
          var result5 = parse_comma_identifier();
          while (result5 !== null) {
            result4.push(result5);
            var result5 = parse_comma_identifier();
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first, rest) { return [first].concat(rest); })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/turtle.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var clone = function(obj) {
	var out = {};
	for(var i in obj) {
		if(obj.hasOwnProperty(i)) {
			if(obj[i] instanceof Object) {
				out[i] = clone(obj[i]);
			} else {
				out[i] = obj[i];
			}
			
		}
	}
	return out;
};

var Turtle = function(raphael, w, h, t) {
	console.log('New Turtle');
	this.paper = raphael;//Raphael(container,w,h);
	this.originx = w/2;
	this.originy = h/2;
	this.state = [];
	this.clear();
	if(t!==undefined) {
		// console.log('Cloning state',t);
		this.state = [];
		for(var i=0; i<t.state.length; i++) {
			this.state[i] = clone(t.state[i]);
		}
		// console.log('Done Cloning!');
		this.updateTurtle();
	}
};
Turtle.prototype.clear = function() {
	// this.paper.clear();
	this.state = [{
		x: this.originx,
		y: this.originy,
		angle: 90,
		scale: 1,
		pen: true,
		stroke: {
			"stroke-width": 4,
			"stroke-linecap": 'round',
			"stroke-linejoin": 'round',
			"stroke": Raphael.rgb(0,0,0),
			"stroke-opacity": 1
		}
	}];
	//this.turtleimg = undefined;
	this.updateTurtle();
};
Turtle.prototype.top = function() {
	return this.state[0];
};
Turtle.prototype.push = function() {
	this.state.unshift(clone(this.state[0]));
};
Turtle.prototype.pop = function() {
	this.state.shift();
};
Turtle.prototype.updateTurtle = function() {
	if(this.turtleimg===undefined) {
		this.turtleimg = this.paper.image("../img/turtle2.png",0,0,64,64);
	}
	this.turtleimg.attr({
		x: this.top().x-32,
		y: this.top().y-32,
		transform: 'r' + (-this.top().angle)
	});
	this.turtleimg.toFront();
};
Turtle.prototype.drawTo = function(x,y) {
	var x1 = this.top().x
	  , y1 = this.top().y
	  , params = this.top().stroke;
	  // , aniparams = clone(this.top().stroke); //{ 'stroke-width': this.top().stroke.width };

	this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
		x1,y1,x,y)).attr(params);

	// var params = { "stroke-width": aniparams["stroke-width"], path:Raphael.format("M{0},{1}", x1, y1) };
	// aniparams.path = Raphael.format("M{0},{1}L{2},{3}", x1, y1, x, y);
	// var path = this.paper.path().attr(params);
	// var speed = Math.sqrt( (x1 - x) + (y1 - y) );
 //    path.animateWith(this.turtleimg, false, aniparams, speed, "linear");
};
Turtle.prototype.forward = function(d) {
	d *= this.top().scale;
	var newx = this.top().x + Math.cos(Raphael.rad(this.top().angle)) * d
	  , newy = this.top().y - Math.sin(Raphael.rad(this.top().angle)) * d;

	if(this.top().pen) {
		this.drawTo(newx,newy);
	}
	this.top().x = newx;
	this.top().y = newy;
	this.updateTurtle();
};
Turtle.prototype.right = function(ang) {
	this.top().angle -= ang;
	this.updateTurtle();
};
Turtle.prototype.left = function(ang) {
	this.top().angle += ang;
	this.updateTurtle();
};
Turtle.prototype.penUp = function() {
	this.top().pen = false;
};
Turtle.prototype.penDown = function() {
	this.top().pen = true;
};
Turtle.prototype.home = function() {
	this.top().x = this.originx;
	this.top().y = this.originy;
	this.updateTurtle();
};

Turtle.prototype.opacity = function(o) {
	this.top().stroke['stroke-opacity'] = o;
};
Turtle.prototype.colorRGB = function(r,g,b) {
	this.top().stroke.stroke = Raphael.rgb(r,g,b);
};
Turtle.prototype.stroke = function(w) {
	this.top().stroke['stroke-width'] = w;
};
Turtle.prototype.scale = function(s) {
	this.top().scale *= s;
};
Turtle.prototype.strokeScale = function(s) {
	this.top().stroke['stroke-width'] *= s;
};

module.exports.Turtle = Turtle;
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/bind.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var tortoise = require('./tortoise')
  , turtlelib = require('./turtle')
  , add_binding = tortoise.add_binding

var makeEnv = function(raphael,w,h) {
	var init_env = {};

	var make = function() {
		var out = new turtlelib.Turtle(raphael,w,w||h);
		console.log('turtle made');
		out.clear();
		return out;
	};
	make.tortoiseArity = 0;

	var clone = function(turtle) {
		var out = new turtlelib.Turtle(raphael,w,w||h,turtle);
		console.log('turtle cloned');
		return out;
	};
	clone.tortoiseArity = 1;

	add_binding(init_env, 'make', make);
	add_binding(init_env, 'clone', clone);
	add_binding(init_env, 'width', w);
	add_binding(init_env, 'height', w||h);

	var consts = ['E','LN2','LOG2E','LOG10E','PI','SQRT1_2','SQRT2'];
	var funs = ['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','random','round','sin','sqrt','tan'];
	for(var i=0; i<consts.length; i++) {
		console.log('bind Math.'+consts[i]);
		add_binding(init_env,consts[i],Math[consts[i]]);
	}
	for(var i=0; i<funs.length; i++) {
		var name = funs[i];
		console.log('bind function Math.'+name);
		var bound = Math[name].bind(Math);
		bound.tortoiseArity = Math[name].length;
		add_binding(init_env,name,bound);
	}

	return init_env;
}

module.exports.makeEnv = makeEnv;

/*
		for(var i in out) {
			if(out[i] instanceof Function) {
				console.log('bind function turtle.'+i);
				var bound = out[i].bind(out);
				bound.tortoiseArity = out[i].length;
				add_binding(init_env,i,bound);
			}
		}

*/
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib/index.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
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
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson8/lib')));



	
}
)();

