var util = require('util')
  , desugar = require('./desugar').desugar
  , stdlibast = require('./stdlib').stdlibast;

var lookup = function(env,v) {
    if(env===undefined||env===null) {
        throw new Error('Value '+v+' not found');
    }
    if(env.name===v) {return env.value;}
    return lookup(env.outer,v);
};
var update = function(env,v,val) {
    if(env===undefined||env===null) {
        throw new Error('Cannot update non existent value '+v);
    }
    if(env.name===v) {
        env.value=val;
    } else {
        update(env.outer,v,val);
    }
};
var add_binding = function(env,v,val) {
    var outer = {
        name: env.name,
        value: env.value,
        outer: env.outer
    };
    env.name=v;
    env.value=val;
    env.outer=outer;
    return env;
};
var bind = function(env,v,val) {
    return {
        name: v,
        value: val,
        outer: env
    };
};

var stdlib = function() {
    var EnvBuilder = function() {
        var _env = {};
        var s = this;
        this.add = function(k,v) {
            _env = {
                name: k,
                value: v,
                outer: _env
            };
            return s;
        };
        this.env = function() {
            return _env;
        }
    };
    var pair = function(fn) {
        return function(x) {
            return function(y) {
                return fn(x,y);
            }
        }
    }
    var listEq = function(x,y) {
        if(x.length !== y.length) {return false;}
        for (var i = 0; i < x.length; i++) {
            if(x[i] instanceof Array) {
                if(y[i] instanceof Array) {
                    if(!listEq(x[i],y[i])) {return false;}
                } else {
                    return false;
                }
            } else if(x[i] !== y[i]) {
                return false;
            }
        };
        return true;
    }

    var bld = new EnvBuilder();
    bld
    .add('+',pair(function(x,y) {return x+y;}))
    .add('-',pair(function(x,y) {return x-y;}))
    .add('*',pair(function(x,y) {return x*y;}))
    .add('/',pair(function(x,y) {return x/y;}))
    .add('%',pair(function(x,y) {return x%y;}))
    .add('=',pair(function(x,y) {
        return x===y ? '#t':'#f';}))
    .add('=l',pair(function(x,y) {
        if(!(x instanceof Array) || !(y instanceof Array)) {
            throw new Error('=l expects two lists');
        }
        return listEq(x,y) ? '#t' : '#f';
    }))
    .add('<',pair(function(x,y) {return x<y? '#t':'#f';}))
    .add('int?',function(x) {
        return ('number' === (typeof x)) ? '#t':'#f';
    })
    .add('bool?',function(x) {
        return (x==='#t'||x==='#f') ? '#t':'#f';
    })
    .add('sym?',function(x) {
        return ((typeof x)==='string' && x[0] !== '#') ? '#t' : '#f';
    })
    .add('list?',function(x) {
        return (x instanceof Array) ? '#t':'#f';
    })
    .add('lambda?',function(x) {
        return ((x instanceof Function) || (x instanceof Object && ('body' in x && 'arg' in x && 'env' in x))) ? '#t':'#f';
    })
    .add('cons',function(x) {return function(y) {
        if(!(y instanceof Array)) {throw new Error('cons expect a list as second argument')}
        return [x].concat(y);}
    })
    .add('car',function(x) {
        if(!(x instanceof Array)) {throw new Error('car expect a list as first argument');}
        if(x.length===0) {throw new Error('Cannot extract head of empty list');}
        return x[0];
    })
    .add('cdr',function(x) {
        if(!(x instanceof Array)) {throw new Error('cdr expect a list as first argument');}
        if(x.length===0) {throw new Error('Cannot extract tail of empty list');}
        return x.slice(1);
    })
    .add('alert',function(x) {
        if(typeof alert !== 'undefined') {
            alert(x);
        } else {
            console.log(x);
        }
        return 0;
    })
    .add('error',function(err) {
        throw new Error(err);
    });
    return bld.env();
};

var ensure = function(env) {
    return bind(env,'£ohoh','#nil');
};
var evalScheem = function (expr, env) {
    if(env===undefined) {
        //little trick to leave the standard bindings
        //intact --damn define
        env = ensure(_stdlib); //bind(_stdlib,'(_impossibru)','#nil');
        expr = desugar(expr);
    }

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        if(expr==='#t' || expr==='#f' || expr==='#nil') {return expr;}
        return lookup(env,expr);
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case 'quote':
            return expr[1];
        case 'quasiquote':
            var unquote = function(v) {
                if(v instanceof Array) {
                    if(v[0]==='unquote') {
                        return evalScheem(v[1],env);
                    } else {
                        var out = [];
                        for (var i = 0; i < v.length; i++) {
                            out[i] = unquote(v[i]);
                        };
                        return out;
                    }
                } else {
                    return v;
                }
            };
            return unquote(expr[1]);
        case 'unquote':
            throw new Error('Unquote can appear only in a semiquote expression');
        case 'if':
            return (evalScheem(expr[1], env) === '#t') ?
                evalScheem(expr[2], env) :
                evalScheem(expr[3], env);
        case 'define':
            add_binding(env,expr[1],evalScheem(expr[2],env));
            return 0;
        case 'set!':
            update(env,expr[1],evalScheem(expr[2],env));
            return 0;
        case 'begin':
            var res = 0;
            for (var i = 1; i < expr.length; i++) {
                res = evalScheem(expr[i], env);
            };
            return res;
        case 'let':
            return evalScheem(expr[2], bind(env,expr[1][0], evalScheem(expr[1][1],env)));
        case 'lambda-one':
            return {
                body: expr[2],
                arg: expr[1],
                env: ensure(env)
            };
            // return function(_arg) {
            //     return evalScheem(expr[2], bind(env,expr[1],_arg));
            // };
        default:
            var fun = evalScheem(expr[0],env);
            var arg = evalScheem(expr[1],env);
            // console.log('app',fun,arg);
            // return fun(arg);
            if(fun instanceof Function) {
                //primitive function application..how troublesome!
                return fun(arg);
            }
            return evalScheem(fun.body,bind(fun.env,fun.arg,arg));
    }
};

//
//creates the standard library bindings
//once and for all
//evalScheem creates a fictional environment
//to leave the original one intact
var _stdlib = stdlib();
evalScheem( desugar(stdlibast),_stdlib );
//

module.exports.evalScheem = evalScheem;
module.exports.desugar = desugar;
module.exports.stdlib = _stdlib;