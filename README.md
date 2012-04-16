# Nathan's university, PL101 online course, Lesson 2

## Ref
http://nathansuniversity.com/vanilla/discussion/36/lesson-2-your-first-compiler

## What is in here

The MUS compiler is compliant with the MUS specs.
Since I don't remember much about music, and I never known anithing about MIDI,
I extended the language with some more PL-related feature: references.
I also made a little prefix-notation parser, here an example:

    ($intro
    	(|
    		(c4 100)
    		(&
    			(d4 75)
    			(g1 25))))
    (&
    	(ref $intro)
    	(* 4 (d1 50)))

..and of course also an infix-notation parser :)

    let intro = c4 100 | d4 75 , g1 25

    intro , 4 * d1 50


A `.mus` file can start with a bunch of definitions, which can be later on referred to using the `ref` construct.

### MUS Syntax

Notes are the pitch and the duration. 'Rest' are like notes, but instead of the pitch use an underscore (e.g. `_ 100`).
You can put stuff in sequence using a comma, e.g. `c1 100, b2 200`. The pipe is used to put stuff in paralled, e.g. `c1 100 | b2 200`. Keep in mind that the parser looks first for parallel expressions.
To repeat an expression, use `<count> * <expr>`. You can also enclose an expression in parenthesis, to override the default precedence rules: `( c1 100 | c2 100 ) , a1 100` will play in paralles `c1` and `c2`, followed by `a1`.

## MUS Playground

I actually wanted to hear something, so here it is, a MUS playground.
First, MUS code is compiled to NOTES, then to an even lower-level language and finally translated to MIDI, using the [jsmidi](http://sergimansilla.com/blog/dinamically-generating-midi-in-javascript/) library.

Of course playing MIDI in the browser is more tricky than expected. [jasmid](http://matt.west.co.tt/music/jasmid-midi-synthesis-with-javascript-and-html5-audio/) library to the rescue.

At the moment I do not know where to put this thing online, so if you want to try out, here it is how:

    git clone git://github.com/cheng81/nathanuni-pl101-lesson2.git
    cd nathanuni-pl101-lesson2
    git submodule init
    git submodule update

After that, just open the `html/index.html` file, type some code, and press the `Go` button.