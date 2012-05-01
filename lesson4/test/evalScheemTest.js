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


