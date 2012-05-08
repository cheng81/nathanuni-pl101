var parser = require('./scheemparser');

var src = "\
(defun*\
	(id (x _) x)\
	(empty? (lst) (=l '() lst))\
	(fold (fn accum lst)\
		(match lst\
			( (cons x xs) (fold fn (fn accum x) xs) )\
			( '() accum )))\
	(map (fn lst)\
		(match lst\
			( (cons x xs) (cons (fn x) (map fn xs)) )\
			( '() '() )))\
	(reverse (lst)\
		(fold (lambda (acc el) (cons el acc)) '() lst))\
	(append (l1 l2)\
		(fold (lambda (acc el) (cons el acc)) l2 (reverse l1)))\
	(de-cons (lst fn fail)\
		(if (list? lst)\
			(if (empty? lst) (fail) (fn (car lst) (cdr lst)))\
			(fail)))\
	(nth (i lst)\
		(if (= i 0)\
			(car lst)\
			(nth (- i 1) (cdr lst))))\
)";

module.exports.stdlibast = parser.parse(src);