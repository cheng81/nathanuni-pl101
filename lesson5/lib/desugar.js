////PATTERN MATCHING MADNESS
// we need to build identifiers on-the-fly
var _id=0;
var fresh = function(str) {
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
    var discId = fresh('disc');

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
                var eqOp = (ptn[1] instanceof Array) ? '=l' : '=';
                return ['if',[eqOp,discr,ptn],body,[failId,'#nil']];
            } else {
                // otherwise, data-destructor must be used
                // currently, only de-cons is defined (since we just have cons-cells)
                var name = ptn.shift();
                var ids = [];
                var idsCopy = [];
                for (var i = 0; i < ptn.length; i++) {
                    ids[i] = fresh('ptn');
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
    var _desugarMatchClauses = function(exprs,discr) {
        // last pattern is FAILURE!
        if(exprs.length===0) {return ['error',['quote','no-match']];}
        var expr = exprs.shift();
        // get a new failure-continuation identifier
        var failId = fresh('fail');
        var ptn = expr[0];
        var body = expr[1];
        /*
        Tries to match the pattern, if fail calls <failId>
        (begin
            (define <failId> (lambda () <desugarMatchClauses>))
            <desugarPattern>)*/
        return ['begin',['define',failId,['lambda',[],_desugarMatchClauses(exprs,discr)]],
        _desugarPattern(ptn,discr,body,failId)];
    };

    /*
    (begin
        (define <discId> <discE>)
        <desugarMatchClauses>)*/
    return ['begin',['define',discId,discE],_desugarMatchClauses(expr,discId)];
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
            case 'quasiquote': return expr;
            case 'unquote': return expr;
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
            case 'define*':
                expr.shift();
                var defs = [];
                var sets = [];
                for (var i = 0; i < expr.length; i++) {
                    var cur = expr[i];
                    defs[i] = ['define',cur[0],'#nil'];
                    sets[i] = ['set!',cur[0],cur[1]];
                };
                return desugar(['begin'].concat(defs).concat(sets));
            case 'defun*':
                expr.shift();
                var defs = [];
                var sets = [];
                for (var i = 0; i < expr.length; i++) {
                    var cur = expr[i];
                    defs[i] = ['define',cur[0],'#nil'];
                    sets[i] = ['set!',cur[0],['lambda',cur[1],cur[2]]];
                };
                return desugar(['begin'].concat(defs).concat(sets));
                return res;
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
};

module.exports.desugar = desugar;