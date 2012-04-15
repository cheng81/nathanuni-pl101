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

A `.mus` file can start with a bunch of definitions, which can be later on referred to using the `ref` construct.