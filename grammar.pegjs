{
	var definitions = {};
}
song =
	def* _ s:expr
	{ return {definitions:definitions,expr:s} }

def =
	'(' _ name:id _ e:expr _ ')' _
	{ definitions[name] = e; }

expr =
	'(' _ t:type _ l:expr _ r:expr _ ')' _
	{ return {tag:t,left:l,right:r} }
	/ '(' _ p:pitch _ d:integer _ ')' _
	{ return {tag:'note', pitch:p, dur:d} }
	/ '(' _ 'rest' _ d:integer _ ')' _
	{ return {tag:'rest', duration:d } }
	/ '(' _ ('repeat'/'*') _ n:integer _ e:expr _ ')' _
	{ return {tag:'repeat',count:n,section:e }}
	/ '(' _ 'ref' _ name:id _ ')' _
	{ return {tag:'ref',name:name} }

type =
	('seq'/'&') {return 'seq'}
	/ ('par'/'|') {return 'par'}

pitch =
	fst:[A-Ga-g] snd:[0-8] {return fst+snd}

_ = 
	space* (comment _)?
space = 
	' ' / [\t\n\r]
comment =
	'//' (![\n\r] c:.)* / '/*' (!'*/' c:.)+ '*/'

integer =
	digits:[0-9]+ { return parseInt(digits.join(""), 10) }

id =
	'$' fstchar:('_'/[a-zA-Z]) rest:(('_'/[a-zA-Z0-9])*) {var id = [fstchar].concat(rest).join(''); return id}
