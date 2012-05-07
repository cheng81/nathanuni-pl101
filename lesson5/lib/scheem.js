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
    })
    .add('de-cons',function(lst) {
        return function(fun) {
            return function(fail) {
                if(lst.length === 0) {return fail();}
                return ((fun(lst[0]))(lst.slice(1)))
            }
        }
    });
    /*
    As many other funs here, de-cons could be implemented in scheem directly:
    (defun de-cons (lst fun fail)
        (if (empty? lst) (fail) (fun (car lst) (cdr lst))))
    */

    return bld.env();
};

////PATTERN MATCHING MADNESS
// we need to build identifiers on-the-fly
var _id=0;
var _identifier = function(str) {
    var id = _id++;
    var out = '=_gen_'+(id)+'_'+str;
    return out;
}

// driver fun, takes a (match) expression
// and returns a series on crazy nested if
// and failure continuations
var desugarMatch = function (expr) {
    expr.shift(); //get rid of match

    // discriminator expression
    var discE = expr.shift();
    // discriminator identifier
    var discId = _identifier('disc');

    var _collect = function(arr,idx) {
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            out[i] = arr[i][idx];
        };
        return out;
    };
    
    var _desugarPatterns = function(ptns,ids,body,failId) {
        if(ptns.length===0) {return body;}
        var ptn = ptns.shift();
        var id = ids.shift();
        return _desugarPattern(ptn,id, _desugarPatterns(ptns,ids,body,failId),failId);
    };
    var _desugarPattern = function(ptn,discr,body,failId) {
        // match everything, needs just the body
        if(ptn==='_') {
            return body;
        }
        // match everything, just bind the value to a variable
        if((typeof ptn === 'string') && ptn[0] !== '#') {
            return ['begin',['define',ptn,discr],body];
        }
        if(ptn instanceof Array) {
            // quote is left as-is, = used for testing
            if(ptn[0]==='quote') {
                return ['if',['=',discr,ptn],body,[failId,'#nil']];
            } else {
                // otherwise, data-destructor must be used
                // currently, only de-cons is defined (since we just have cons-cells)
                var name = ptn.shift();
                var ids = [];
                var idsCopy = [];
                for (var i = 0; i < ptn.length; i++) {
                    ids[i] = _identifier('ptn');
                    idsCopy[i] = ids[i];
                };
                // of course we can have sub-patterns in this case!
                // that's what _desugarPatterns is for
                return ['de-'+name,discr,['lambda',ids,_desugarPatterns(ptn,idsCopy,body,failId)],failId];
            }
        }
        // otherwise is a constant value, = used for testing
        return ['if',['=',discr,ptn],body,[failId,'#nil']];
    };
    var _desugarMatchClauses = function(ptns,bodies,discr) {
        // last pattern is FAILURE!
        if(ptns.length===0) {return ['error',['quote','no-match']];}
        // get a new failure-continuation identifier
        var failId = _identifier('fail');
        var ptn = ptns.shift();
        var body = bodies.shift();
        /*
        Tries to match the pattern, if fail calls <failId>
        (begin
            (define <failId> (lambda () <desugarMatchClauses>))
            <desugarPattern>)*/
        return ['begin',['define',failId,['lambda',[],_desugarMatchClauses(ptns,bodies,discr)]],
        _desugarPattern(ptn,discr,body,failId)];
    };

    /*
    (begin
        (define <discId> <discE>)
        <desugarMatchClauses>)
    */
    return ['begin',['define',discId,discE],_desugarMatchClauses(_collect(expr,0),_collect(expr,1),discId)];
};
var desugar = function (expr) {
    if(expr instanceof Array) {
        switch(expr[0]) {
            case 'lambda-one':
                return ['lambda-one',expr[1],desugar(expr[2])];
            case 'lambda':
                var formals = expr[1];
                var formal = formals.shift();
                if(formal===undefined) {formal = '_';}
                if(formals.length>0) {
                    return ['lambda-one',formal,desugar(['lambda',formals,expr[2]])];    
                } else {
                    return ['lambda-one',formal,desugar(expr[2])];
                }
            case 'quote': return expr;
            case 'cond':
                expr.shift();//get rid of cond
                var cur = expr.shift();
                var out = ['if',cur[0],cur[1]];
                var tmp = out;
                while(expr.length!==1) {
                    cur = expr.shift();
                    var branch = ['if',cur[0],cur[1]];
                    tmp.push( branch );
                    tmp = branch;
                }
                cur = expr.shift();
                tmp.push(cur[1]);
                return desugar(out);
            case 'list':
                expr.shift(); //get rid of 'list'
                var out = ['cons',expr.pop(),['quote',[]]]
                while(expr.length !== 0) {
                    out = ['cons',expr.pop(),out];
                }
                return desugar(out);
            case 'match':
                return desugar(desugarMatch(expr));
            case 'defun':
                return desugar(['define',expr[1],['lambda',expr[2],expr[3]]]);
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
                if(expr.length===1) {expr.push('#nil');}
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
        //console.log('desugard',expr,expr1);
        //expr=expr1;
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
module.exports.desugar = desugar;