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
    var initFile = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson4/test/evalScheemTest.js'
		var startpath = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson4/test'
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
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson4/lib/scheem.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var check = function(name,expr) {
    return {
        len: function(expected) {
            if(expr.length !== expected) {
                throw new Error(name + ' expressions take '+expected+' parameters, but '+expr.length+' parameters were given');
            }
        },
        arr: function(val) {
            if(!(val instanceof Array)) {
                throw new Error('List expected, but '+(typeof val)+' found');
            }
        }
    };
};
var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        if(expr==='#t' || expr==='#f') {return expr;}
        return env[expr];
    }
    // Look at head of list for operation
    var chk = check(expr[0],expr);
    switch (expr[0]) {
        case '+':
            chk.len(3);
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case '-':
            chk.len(3);
            return evalScheem(expr[1], env) - 
                    evalScheem(expr[2], env);
        case '*':
            chk.len(3);
            return evalScheem(expr[1], env) * 
                    evalScheem(expr[2], env);
        case '/':
            chk.len(3);
            return evalScheem(expr[1], env) / 
                    evalScheem(expr[2], env);
        case 'quote':
            chk.len(2);
            return expr[1];
        case '=':
            chk.len(3);
            var eq = (evalScheem(expr[1], env) ===
                    (evalScheem(expr[2], env)));
            return eq ? '#t' : '#f';
        case '<':
            chk.len(3);
            var lt = (evalScheem(expr[1], env) < evalScheem(expr[2], env));
            return lt ? '#t' : '#f';
        case 'if':
            chk.len(4);
            return (evalScheem(expr[1], env) === '#t') ?
                evalScheem(expr[2], env) :
                evalScheem(expr[3], env);
        case 'cons':
            chk.len(3);
            var arr = evalScheem(expr[2], env);
            chk.arr(arr);
            return [evalScheem(expr[1], env)]
                .concat(arr);
        case 'car':
            chk.len(2);
            var arr = evalScheem(expr[1], env);
            chk.arr(arr);
            return arr[0];
        case 'cdr':
            chk.len(2);
            var arr = evalScheem(expr[1], env);
            chk.arr(arr);
            return arr.splice(1);
        case 'define':
            chk.len(3);
            if(env[expr[1]] !== undefined) {
                throw new Error(expr[1] + ' already defined');
            }
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'set!':
            if(env[expr[1]] === undefined) {
                throw new Error('Undefined '+expr[1]+' variable');
            }
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'begin':
            var res = 0;
            for (var i = 1; i < expr.length; i++) {
                res = evalScheem(expr[i], env);
            };
            return res;
    }
};

module.exports.evalScheem = evalScheem;
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson4/lib')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson4/test/evalScheemTest.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var assert = require('chai').assert;
var expect = require('chai').expect;
var evalScheem = require('../lib/scheem').evalScheem;

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});

suite('arithmetic operators', function() {
    test('addition', function() {
        assert.deepEqual(
            evalScheem(['+',5,6], {}),
            11
        );
    });
    test('addition, with env', function() {
        assert.deepEqual(
            evalScheem(['+',5,'a'], {a: 6}),
            11
        );
    });
    test('subtraction', function() {
        assert.deepEqual(
            evalScheem(['-',5,2],{}),
            3
        );
    });
    test('multiplication', function() {
        assert.deepEqual(
            evalScheem(['*',3,4],{}),
            12
        );
    });
    test('division',function() {
        assert.deepEqual(
            evalScheem(['/',6,3],{}),
            2
        );
    });
});

suite('environment', function() {
    test('define, get', function() {
        assert.deepEqual(
            evalScheem(['begin',['define','foo',5],'foo'],{}),
            5
        );
    });
    test('define, set, get', function() {
        assert.deepEqual(
            evalScheem(['begin',['define','bar',5],['set!','bar',8],'bar'],{}),
            8
        );
    });
});

suite('comparison operators', function() {
    test('equality, positive', function() {
        assert.deepEqual(
            evalScheem(['=',5,5],{}),
            '#t'
        );
    });
    test('equality, negative', function() {
        assert.deepEqual(
            evalScheem(['=',5,3],{}),
            '#f'
        );
    });
    test('lt, positive', function() {
        assert.deepEqual(
            evalScheem(['<',3,5],{}),
            '#t'
        );
    });
    test('lt, negative', function() {
        assert.deepEqual(
            evalScheem(['<',5,3],{}),
            '#f'
        );
    });
});

suite('begin', function() {
    test('last number', function() {
        assert.deepEqual(
            evalScheem(['begin',1,2,3],{}),
            3
        );
    });
});

suite('if', function() {
    test('true branch', function() {
        assert.deepEqual(
            evalScheem(['if',['=',1,1],5,6], {}),
            5
        );
    });
    test('false branch', function() {
        assert.deepEqual(
            evalScheem(['if',['<',1,1],5,6], {}),
            6
        );
    });
    test('literal true branch', function() {
        assert.deepEqual(
            evalScheem(['if','#t',5,6],{}),
            5
        );
    });
    test('literal false branch', function() {
        assert.deepEqual(
            evalScheem(['if','#f',5,6],{}),
            6
        );
    });
});

suite('list processing', function() {
    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons',1,['quote',[2,3]]],{}),
            [1,2,3]
        );
    });
    test('car', function() {
        assert.deepEqual(
            evalScheem(['car',['quote',[1,2,3]]],{}),
            1
        );
    });
    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr',['quote',[1,2,3]]],{}),
            [2,3]
        );
    });
});

suite('error checking', function() {
    test('arithmetic expression', function() {
        expect(function() {
            evalScheem(['+',1],{})
        }).to.throw();
        expect(function() {
            evalScheem(['+',1,2,3],{})
        }).to.throw();
    });
    test('if', function() {
        expect(function() {
            evalScheem(['if',1,2,3,4],{})
        }).to.throw();
    });
    test('list processing', function() {
        expect(function() {
            evalScheem(['cons',1,2], {})
        }).to.throw();
        expect(function() {
            evalScheem(['car',1], {})
        }).to.throw();
        expect(function() {
            evalScheem(['cdr',1], {})
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
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101/lesson4/test')));



	
}
)();

