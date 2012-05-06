var assert = require('chai').assert
  , expect = require('chai').expect
  , scheem = require('../lib')
  , evalScheem = scheem.interpreter.evalScheem
  , evalScheemStr = function(str) {
    return evalScheem( scheem.parser.parse(str) );
  };

var env = function() {
    var _env = null;
    var add = function(k,v,end) {
        _env = {
            name:k,
            value:v,
            outer:_env
        };
        if(end) {return _env;}
        return add;
    }
    return add;
}
suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3]),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog']),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]]),
            [1, 2, 3]
        );
    });
});

suite('arithmetic operators', function() {
    test('addition', function() {
        assert.deepEqual(
            evalScheem(['+',5,6]),
            11
        );
    });
    // test('addition, with env', function() {
    //     assert.deepEqual(
    //         evalScheem(['+',5,'a'], env()('a',6,true)),
    //         11
    //     );
    // });
    test('subtraction', function() {
        assert.deepEqual(
            evalScheem(['-',5,2]),
            3
        );
    });
    test('multiplication', function() {
        assert.deepEqual(
            evalScheem(['*',3,4]),
            12
        );
    });
    test('division',function() {
        assert.deepEqual(
            evalScheem(['/',6,3]),
            2
        );
    });
});

suite('environment', function() {
    test('define, get', function() {
        assert.deepEqual(
            evalScheem(['begin',['define','foo',5],'foo']),
            5
        );
    });
    test('define, set, get', function() {
        assert.deepEqual(
            evalScheem(['begin',['define','bar',5],['set!','bar',8],'bar']),
            8
        );
    });
});

suite('comparison operators', function() {
    test('equality, positive', function() {
        assert.deepEqual(
            evalScheem(['=',5,5]),
            '#t'
        );
    });
    test('equality, negative', function() {
        assert.deepEqual(
            evalScheem(['=',5,3]),
            '#f'
        );
    });
    test('lt, positive', function() {
        assert.deepEqual(
            evalScheem(['<',3,5]),
            '#t'
        );
    });
    test('lt, negative', function() {
        assert.deepEqual(
            evalScheem(['<',5,3]),
            '#f'
        );
    });
});

suite('begin', function() {
    test('last number', function() {
        assert.deepEqual(
            evalScheem(['begin',1,2,3]),
            3
        );
    });
});

suite('if', function() {
    test('true branch', function() {
        assert.deepEqual(
            evalScheem(['if',['=',1,1],5,6]),
            5
        );
    });
    test('false branch', function() {
        assert.deepEqual(
            evalScheem(['if',['<',1,1],5,6]),
            6
        );
    });
    test('literal true branch', function() {
        assert.deepEqual(
            evalScheem(['if','#t',5,6]),
            5
        );
    });
    test('literal false branch', function() {
        assert.deepEqual(
            evalScheem(['if','#f',5,6]),
            6
        );
    });
});

suite('list processing', function() {
    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons',1,['quote',[2,3]]]),
            [1,2,3]
        );
    });
    test('car', function() {
        assert.deepEqual(
            evalScheem(['car',['quote',[1,2,3]]]),
            1
        );
    });
    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr',['quote',[1,2,3]]]),
            [2,3]
        );
    });
});

suite('error checking', function() {
    // test('arithmetic expression', function() {
    //     expect(function() {
    //         evalScheem(['+',1])
    //     }).to.throw();
    //     expect(function() {
    //         evalScheem(['+',1,2,3])
    //     }).to.throw();
    // });
    // test('if', function() {
    //     expect(function() {
    //         evalScheem(['if',1,2,3,4])
    //     }).to.throw();
    // });
    test('list processing', function() {
        expect(function() {
            evalScheem(['cons',1,2])
        }).to.throw();
        expect(function() {
            evalScheem(['car',1])
        }).to.throw();
        expect(function() {
            evalScheem(['cdr',1])
        }).to.throw();
    });
});

suite('evalScheemStr', function() {
    test('number', function() {
        assert.deepEqual(
            evalScheemStr("5"),
            5
        );
    });
    test('quoted list', function() {
        assert.deepEqual(
            evalScheemStr("'( 1 2 3)"),
            [1,2,3]
        );
    });
    test('arithmetic expression', function() {
        assert.deepEqual(
            evalScheemStr("(+ (* 1 2) (/ 6 3))"),
            4
        );
    });
    // test('variable in list', function() {
    //     assert.deepEqual(
    //         evalScheemStr("(begin (define x 10) (define y '(x 2 3)) (car y))"),
    //         10
    //     );
    // });
});

suite('lambdas', function() {
    test('Define and call simple function', function() {
        assert.deepEqual(
            evalScheemStr("(begin (define plusone (lambda (x) (+ 1 x))) (plusone 5))"),
            6
        );
    });
    test('Calling an anonynous function', function() {
        assert.deepEqual(
            evalScheemStr("((lambda (x) (+ 1 x)) 5)"),
            6
        );
    });
    test('Passing a function as a value to another function', function() {
        assert.deepEqual(
            evalScheemStr("(begin (define fivethat (lambda (x) (x 5))) (define plusone (lambda (x) (+ x 1))) (fivethat plusone))"),
            6
        );
    });
    test('Inner function uses values from enclosing function', function() {
        assert.deepEqual(
            evalScheemStr(
                "(begin (define plusser (lambda (x) (begin (define plusone (lambda (y) (+ 1 y))) (plusone x)))) (plusser 5))"),
            6
        );
    });
    test('An outer function returns an inner function, inner function refers to outer function variables', function() {
        assert.deepEqual(
            evalScheemStr(
                "(begin (define outer (lambda (foo) (lambda (bar) (+ foo bar)))) ((outer 1) 5))"
            ),
            6
        );
    });
    test('A function in a define that calls itself recursively', function() {
        assert.deepEqual(
            evalScheemStr(
                "(begin (define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5))"),
            120
        );
    })
});

suite('alert',function() {
    test('Calling a simple alert',function() {
        assert.deepEqual(
            evalScheemStr("(alert 'hello-world)"),
            0
        );
    });
});

suite('curryied functions', function() {
    test('Simply curryied function', function() {
        assert.deepEqual(
            evalScheemStr("(begin (define plusminus (lambda (x y z) (- (+ x y) z))) (define p5minus (plusminus 5)) (p5minus 2 1))"),
            6
        );
    });
});
