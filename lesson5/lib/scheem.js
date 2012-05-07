var util = require('util')

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
        var _env = null;
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
    .add('=',pair(function(x,y) {return x===y ? '#t':'#f';}))
    .add('=l',pair(function(x,y) {
        if(!(x instanceof Array) || !(y instanceof Array)) {
            throw new Error('=l expects two lists');
        }
        return listEq(x,y) ? '#t' : '#f';
    }))
    .add('<',pair(function(x,y) {return x<y? '#t':'#f';}))
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
        return x.splice(1);
    })
    .add('alert',function(x) {
        if(typeof alert !== 'undefined') {
            alert(x);
        } else {
            console.log(x);
        }
        return 0;
    });

    return bld.env();
};

var desugar = function (expr) {
    if(expr instanceof Array) {
        switch(expr[0]) {
            case 'lambda':
                var formals = expr[1];
                var formal = formals.shift();
                if(formals.length>0) {
                    return ['lambda-one',formal,desugar(['lambda',formals,expr[2]])];    
                } else {
                    return ['lambda-one',formal,desugar(expr[2])];
                }
                
            case 'quote': return expr;//['quote',desugar(expr[1])];
            case 'define':
                return ['define',expr[1],desugar(expr[2])];
            case 'set!':
                return ['set!',expr[1],desugar(expr[2])];
            case 'if':
                return ['if',desugar(expr[1]),desugar(expr[2]),desugar(expr[3])];
            case 'begin':
                var out = ['begin'];
                for (var i = 1; i < expr.length; i++) {
                    out[i] = desugar(expr[i]);
                };
                return out;
            case '&':
                return ['if',desugar(expr[1]),desugar(expr[2]),'#f'];
            case '|':
                return ['if',desugar(expr[1]),'#t',desugar(expr[2])];
            default:
                var call = [desugar(expr.shift()),desugar(expr.shift())];
                while(expr.length>0) {
                    call = [call,desugar(expr.shift())];
                }
                return call;
        }
    } else {
        return expr;
    }
}

var evalScheem = function (expr, env) {
    if(env===undefined) {
        env = env || stdlib();
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
        case 'lambda-one':
            return function(_arg) {
                return evalScheem(expr[2], bind(env,expr[1],_arg));
            };
        default:
            var fun = evalScheem(expr[0],env);
            var arg = evalScheem(expr[1],env);
            return fun(arg);
    }
};

module.exports.evalScheem = evalScheem;