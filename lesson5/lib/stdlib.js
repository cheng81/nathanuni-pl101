var parser = require('./scheemparser');

var src = "\
(defun*\
	(id (x _) x)\
	(empty? (lst) (=l '() lst))\
	(length (lst)\
		(begin\
		(defun fn (rest counter) (if (empty? rest) counter (fn (cdr rest) (+ 1 counter))))\
		(fn lst 0)))\
	(fold (fn accum lst)\
		(match lst\
			( (cons x xs) (fold fn (fn accum x) xs) )\
			( '() accum )))\
	(map (fn lst)\
		(match lst\
			( (cons x xs) (cons (fn x) (map fn xs)) )\
			( '() '() )))\
	(each (fn lst)\
		(match lst\
			( (cons x xs) (begin (fn x) (each fn xs)) )\
			( '() #nil )))\
	(apply (fn arg) (fn arg))\
	(reverse (lst)\
		(fold (lambda (acc el) (cons el acc)) '() lst))\
	(append (l1 l2)\
		(fold (lambda (acc el) (cons el acc)) l2 (reverse l1)))\
	(filter (pred lst)\
		(reverse (fold (lambda (accum elm) (if (pred elm) (cons elm accum) accum)) '() lst)))\
	(de-cons (lst len cont fail)\
		(if (& (list? lst) (<= (- len 1) (length lst)))\
			(let\
				(counter 0)\
				(begin\
				(defun fn ()\
					(if (= counter (- len 1))\
						(cont lst)\
						(begin\
						(set! counter (+ counter 1))\
						(set! cont (cont (car lst)))\
						(set! lst (cdr lst))\
						(fn)\
					)))\
				(fn)))\
			(fail)))\
	(de-tuple (tuple len cont fail)\
		(if (& (list? tuple) (= len (length tuple)))\
			(fold apply cont tuple)\
			(fail)))\
	(nth (i lst)\
		(if (= i 0)\
			(car lst)\
			(nth (- i 1) (cdr lst))))\
	(not (x) (if x #f #t))\
	(> (x y) (& (not (= x y)) (not (< x y))))\
	(<= (x y) (| (= x y) (< x y)))\
	(>= (x y) (| (= x y) (not (< x y))))\
)";

module.exports.stdlibast = parser.parse(src);

/*
	(de-cons (lst _len fn fail)\
		(if (list? lst)\
			(if (empty? lst) (fail) (fn (car lst) (cdr lst)))\
			(fail)))\
*/