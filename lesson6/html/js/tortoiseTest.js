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
    var initFile = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/test/evalTortoiseTest.js'
		var startpath = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/test'
    var requiredAs = 'main'
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
	var file = 'chai.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
window.node2browser.cache['chai'] = window.chai;
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('.')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib/tortoise.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
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
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib/parser.js'
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
        
        
        var savedPos0 = pos;
        var result1 = parse_logical();
        var result2 = result1 !== null
          ? (function(expr) { return expr; })(result1)
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
          var result13 = "!";
          pos += 1;
        } else {
          var result13 = null;
          if (reportMatchFailures) {
            matchFailed("\"!\"");
          }
        }
        if (result13 !== null) {
          var result14 = parse__();
          if (result14 !== null) {
            var result15 = parse_logical();
            if (result15 !== null) {
              var result11 = [result13, result14, result15];
            } else {
              var result11 = null;
              pos = savedPos3;
            }
          } else {
            var result11 = null;
            pos = savedPos3;
          }
        } else {
          var result11 = null;
          pos = savedPos3;
        }
        var result12 = result11 !== null
          ? (function(expr) { return {tag:'not', expr:expr}; })(result11[2])
          : null;
        if (result12 !== null) {
          var result10 = result12;
        } else {
          var result10 = null;
          pos = savedPos2;
        }
        if (result10 !== null) {
          var result0 = result10;
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
                    var result3 = [result5, result6, result7, result8, result9];
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
                  var result3 = [result5, result6, result7, result8, result9];
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
                  var result3 = [result5, result6, result7, result8, result9];
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
                  var result3 = [result5, result6, result7, result8, result9];
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
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_primary();
        if (result5 !== null) {
          var result6 = parse__();
          if (result6 !== null) {
            var result7 = parse_exp_op();
            if (result7 !== null) {
              var result8 = parse__();
              if (result8 !== null) {
                var result9 = parse_exponential();
                if (result9 !== null) {
                  var result3 = [result5, result6, result7, result8, result9];
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
          var result1 = parse_primary();
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
        
        
        var result29 = parse_number();
        if (result29 !== null) {
          var result0 = result29;
        } else {
          var result28 = parse_boolean();
          if (result28 !== null) {
            var result0 = result28;
          } else {
            var savedPos5 = pos;
            var savedPos6 = pos;
            var result24 = parse_identifier();
            if (result24 !== null) {
              if (input.substr(pos, 1) === "(") {
                var result25 = "(";
                pos += 1;
              } else {
                var result25 = null;
                if (reportMatchFailures) {
                  matchFailed("\"(\"");
                }
              }
              if (result25 !== null) {
                var result26 = parse__();
                if (result26 !== null) {
                  if (input.substr(pos, 1) === ")") {
                    var result27 = ")";
                    pos += 1;
                  } else {
                    var result27 = null;
                    if (reportMatchFailures) {
                      matchFailed("\")\"");
                    }
                  }
                  if (result27 !== null) {
                    var result22 = [result24, result25, result26, result27];
                  } else {
                    var result22 = null;
                    pos = savedPos6;
                  }
                } else {
                  var result22 = null;
                  pos = savedPos6;
                }
              } else {
                var result22 = null;
                pos = savedPos6;
              }
            } else {
              var result22 = null;
              pos = savedPos6;
            }
            var result23 = result22 !== null
              ? (function(v) { return {tag:"call", name:v, args:[]}; })(result22[0])
              : null;
            if (result23 !== null) {
              var result21 = result23;
            } else {
              var result21 = null;
              pos = savedPos5;
            }
            if (result21 !== null) {
              var result0 = result21;
            } else {
              var savedPos3 = pos;
              var savedPos4 = pos;
              var result15 = parse_identifier();
              if (result15 !== null) {
                if (input.substr(pos, 1) === "(") {
                  var result16 = "(";
                  pos += 1;
                } else {
                  var result16 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"(\"");
                  }
                }
                if (result16 !== null) {
                  var result17 = parse__();
                  if (result17 !== null) {
                    var result18 = parse_arglist();
                    if (result18 !== null) {
                      var result19 = parse__();
                      if (result19 !== null) {
                        if (input.substr(pos, 1) === ")") {
                          var result20 = ")";
                          pos += 1;
                        } else {
                          var result20 = null;
                          if (reportMatchFailures) {
                            matchFailed("\")\"");
                          }
                        }
                        if (result20 !== null) {
                          var result13 = [result15, result16, result17, result18, result19, result20];
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
                ? (function(v, args) { return {tag:"call", name:v, args:args}; })(result13[0], result13[3])
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
        
        
        var savedPos16 = pos;
        var savedPos17 = pos;
        var result116 = parse_expression();
        if (result116 !== null) {
          var result117 = parse__();
          if (result117 !== null) {
            if (input.substr(pos, 1) === ";") {
              var result118 = ";";
              pos += 1;
            } else {
              var result118 = null;
              if (reportMatchFailures) {
                matchFailed("\";\"");
              }
            }
            if (result118 !== null) {
              var result119 = parse__();
              if (result119 !== null) {
                var result114 = [result116, result117, result118, result119];
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
          ? (function(expr) { return { tag:"ignore", body:expr }; })(result114[0])
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
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib/turtle.js'
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

var Turtle = function(container, w, h) {
	this.paper = Raphael(container,w,h);
	this.originx = w/2;
	this.originy = h/2;
	this.state = [];
	this.clear();
};
Turtle.prototype.clear = function() {
	this.paper.clear();
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
	this.turtleimg = undefined;
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
	  , params = this.top().stroke; //{ 'stroke-width': this.top().stroke.width };

	this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
		x1,y1,x,y)).attr(params);
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
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib/bind.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var tortoise = require('./tortoise')
  //, turtlelib = require('./turtle')
  , add_binding = tortoise.add_binding

var makeEnv = function(turtle) {
	var init_env = {};

	for(var i in turtle) {
		if(turtle[i] instanceof Function) {
			console.log('bind function turtle.'+i);
			var bound = turtle[i].bind(turtle);
			bound.tortoiseArity = turtle[i].length;
			add_binding(init_env,i,bound);
			//add_binding(init_env,i,turtle[i].bind(turtle));
		}
	}

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
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib/index.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
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
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/test/evalTortoiseTest.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var assert = require('chai').assert
  , expect = require('chai').expect
  , tortoise = require('../lib')
  , util = require('util');

var Turtle = function(container, w, h) {
	console.log('Turtle constructor called',w,h);
};
Turtle.prototype.clear = function() {
	this.updateTurtle();
};
Turtle.prototype.top = function() {
};
Turtle.prototype.push = function() {
};
Turtle.prototype.pop = function() {
};
Turtle.prototype.updateTurtle = function() {
};
Turtle.prototype.drawTo = function(x,y) {
};
Turtle.prototype.forward = function(d) {
	this.updateTurtle();
};
Turtle.prototype.right = function(ang) {
	this.updateTurtle();
};
Turtle.prototype.left = function(ang) {
	this.updateTurtle();
};
Turtle.prototype.penUp = function() {
};
Turtle.prototype.penDown = function() {
};
Turtle.prototype.home = function() {
};
Turtle.prototype.opacity = function(o) {
};
Turtle.prototype.colorRGB = function(r,g,b) {
};
Turtle.prototype.stroke = function(w) {
};

var turtle = new Turtle();
var env = tortoise.bootstrap(turtle);

var ast = function(text,rule) {
	return tortoise.parser.parse(text,rule);
}
var eval = function(text) {
	var ast = tortoise.parser.parse(text);
	console.log('ast',util.inspect(ast,false,100));
	return tortoise.interpreter.evalStatements(ast,env);
}
var evalExpr = function(text) {
	var ast = tortoise.parser.parse(text,'expression');
	return tortoise.interpreter.evalExpression(ast,env);
}
var evalStmt = function(text) {
	var ast = tortoise.parser.parse(text,'statement');
	return tortoise.interpreter.evalStatement(ast,env);
}

var eq = function(a,b) {
	assert.deepEqual(a,b);
}

suite('Parser', function() {
	test('number', function() {
		eq(ast('-5.2','number'),-5.2);
	});
	test('identifier', function() {
		eq(ast('foobar','identifier'),'foobar');
	});
	test('expression', function() {
		eq(ast('1 + 2 * 3 ** 4','expression'),
			{tag:'+',
			left: 1,
			right: {
				tag:'*',
				left: 2,
				right: {
					tag: '**',
					left: 3,
					right: 4
				}
			}});
	});
	test('statements', function() {
		eq(ast('var a; a := 10;','statements'),
			[{
				tag: 'var',
				name: 'a'
			}, {
				tag: ':=',
				left: 'a',
				right: 10
			}]);
	});
	test('if', function() {
		eq(ast('if (a == 10) { a := a - 1; }','statement'),
			{
				tag: 'if',
				expr: {
					tag: '==',
					left: {
						tag: 'ident',
						name: 'a'
					},
					right: 10
				},
				body: [
					{
						tag: ':=',
						left: 'a',
						right: {
							tag: '-',
							left: {
								tag: 'ident',
								name: 'a'
							},
							right: 1
						}
					}
				],
				elsebody: ''
			});
	});
	test('define', function() {
		eq(ast('define foo (a) { a + 1; }','statement'),
		{
			tag: 'define',
			name: 'foo',
			args: ['a'],
			body: [
			{
				tag: 'ignore',
				body: {
					tag: '+',
					left: {tag:'ident',name:'a'},
					right: 1
				}
			}
			]
		});
	});
	test('declare-var', function() {
		eq(ast('var foobar;','statement'),
		{
			tag: 'var', name: 'foobar'
		});
	});
	test('assign-var', function() {
		eq(ast('foobar := foobar * 2;','statement'),
		{
			tag: ':=',
			left: 'foobar',
			right: {
				tag: '*',
				left: {tag:'ident',name:'foobar'},
				right: 2
			}
		});
	});
});

suite('evalExpression', function() {
	test('number', function() {
		eq(evalExpr('-5.2'),-5.2);
	});
	test('comparison', function() {
		eq(evalExpr('1 > 2'),false);
		eq(evalExpr('1 == 1'),true);
		eq(evalExpr('1 < 2'),true);
		eq(evalExpr('1 <= 1'),true);
		eq(evalExpr('1 >= 2'),false);
	});
	test('arithmetic', function() {
		eq(evalExpr('1 + 2'),3);
		eq(evalExpr('1 + 2 * 3'),7);
		eq(evalExpr('5 % 2 + 1'),2);
	});
	test('logic', function() {
		eq(evalExpr('true && false'),false);
		eq(evalExpr('true || false'),true);
		eq(evalExpr('!false'),true);
		eq(evalExpr('1 > 3 || (true && ! 1 > 3)'),true);
	});
});

suite('evalStatement', function() {
	test('var', function() {
		env.bindings['foobar'] = 5;
		eq(evalStmt('foobar;'),5);
	});
	test('assignment', function() {
		env.bindings['foobar'] = 5;
		evalStmt('foobar := 3;',env);
		eq(env.bindings['foobar'],3);
	});
	test('if', function() {
		eq(evalStmt('if (1 == 1) { 5; }'),5);
		eq(evalStmt('if (2 == 1) { 5; }'),undefined);
		eq(evalStmt('if (2 == 1) { 5; } else { 3; }'),3);
	});
	test('repeat', function() {
		env.bindings['foobar'] = 1;
		evalStmt('repeat(4) { foobar := foobar + 1; }');
		eq(env.bindings['foobar'],5);
	});
});

suite('functions', function() {
	test('define, call',function() {
		eq(eval('define foo (a) {a+2;}\n foo(5);'),7);
	});

	test('define, curry, call', function() {
		eq(eval("define foo(a,b) {\
			a+b;}\
			var myfoo;\
			myfoo := foo(5);\
			myfoo(2);"),7);
	});

	test('too many arguments', function() {
		expect(function() {
			eval("define foo(a) { a+1; };\
				foo(1,2,3);")
		}).to.throw();
	});
});

/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson6/test')));



	
}
)();

