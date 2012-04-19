(function() {
	/*BRUTALLY STRIPPED FROM NODE.JS "path" module, www.nodejs.org*/
	function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}
	  function normalize(path) {
    var isAbsolute = path.charAt(0) === '/',
        trailingSlash = path.slice(-1) === '/';

    // Normalize the path
    path = normalizeArray(path.split('/').filter(function(p) {
      return !!p;
    }), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  };


  	function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize(paths.filter(function(p, index) {
      return p && typeof p === 'string';
    }).join('/'));
  };

/*BRUTALLY STRIPPED FROM NODE.JS "util" module, www.nodejs.org*/
  function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};
  /**/



	( function(){
		console.log('defining window.node2browser')
		var isNodeMod = function(name) {
			return name[0] != '.'
		}
    var initFile = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2/mus.js'
		var startpath = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2'
    var requiredAs = 'mus'
		var require = function(modulepath) {
			return function(reqmodpath) {
        if(reqmodpath==requiredAs) {return window.node2browser.require(initFile)}
				var reqmod = isNodeMod(reqmodpath) ? reqmodpath : join(modulepath,reqmodpath)
				var thecache = window.node2browser.cache

				if(undefined == thecache[reqmod]) {
					reqmod = reqmod+'.js'
					if(undefined == thecache[reqmod]) {
						throw new Error('Module "'+reqmodpath+'" not loaded')	
					}
				}

				return thecache[reqmod]
			}
		}
		window.node2browser = {
			makerequire: require,
			require: require(startpath),
			globals: {
				process: {
					nextTick: function(fn) {
						window.setTimeout(fn,1)
					},
          argv: []
				}
			},
			cache: {
				util: {
					inspect: function(o) {console.log(o)},
					inherits: function(c,s) {inherits(c,s)}
				}
			}
	}})();

(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2/compile.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var convertPitch = function(pitch) {
	var sharp = pitch.length===3;
	var octave = sharp ? parseInt(pitch[2],10) : parseInt(pitch[1],10);
	var p0 = pitch[0].toUpperCase();
	var pitchNum =
		p0==='A' ? 9 :
		p0==='B' ? 11 :
		p0==='C' ? 0 :
		p0==='D' ? 2 :
		p0==='E' ? 4 :
		p0==='F' ? 5 :
		p0==='G' ? 7 : -1;

	if(pitchNum<0) {throw new Error('Wrong pitch',pitch);}
	return 12 + 12 * (octave + (sharp ? 1 : 0)) + pitchNum;
};

var cNote = function(note,start) {
	return {
		tag: 'note',
		pitch: note.pitch,
		// pitch: convertPitch(note.pitch),
		start: start,
		dur: note.dur
	};
};

var c = function(expr,definitions,start,out) {
	var top = out===undefined;
	out = out||[];
	var newtime = start;
	switch(expr.tag) {
		case 'note': 
			out.push(cNote(expr,start));
			newtime = start+expr.dur;
			break;
		case 'rest':
			newtime = start+expr.duration;
			break;
		case 'seq':
			newtime = c(expr.right,definitions,(c(expr.left,definitions,start,out)),out);
			break;
		case 'par':
			newtime = Math.max( c(expr.left,definitions,start,out),c(expr.right,definitions,start,out) );
			break;
		case 'repeat':
			for (var i = 0; i < expr.count; i++) {
				newtime = c(expr.section,definitions,newtime,out); 
			};
			break;
		case 'ref':
			newtime = c(definitions[expr.name],definitions,start,out);
			break;
		default:
			throw new Error('Unknown tag ' + expr.tag);
	}
	if(top===true) {return out;}
	return newtime;
};

var nonRecur = function(name,expr) {
	switch(expr.tag) {
		case 'note':
		case 'rest': return true;
		case 'seq':
		case 'par': nonRecur(name,expr.left); nonRecur(name,expr.right); return true;
		case 'repeat': nonRecur(name,expr.section); return true;
		case 'ref': if(expr.name==name) {throw new Error('Recursive "'+name+'" definition!');} else {return true;}
	}
}
var sanity = function(defs) {
	for(var i in defs) {
		if(defs.hasOwnProperty(i)) {
			nonRecur(i,defs[i]);
		}
	}
}
var compile = function(musexpr,definitions) {
	sanity(definitions);
	var out = c(musexpr, definitions, 0);
	out.sort(function(a,b) {return a.start - b.start;});
	return out;
};

module.exports.compile = compile;
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2/infix.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
module.exports = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "_": parse__,
        "comment": parse_comment,
        "def": parse_def,
        "id": parse_id,
        "integer": parse_integer,
        "note": parse_note,
        "par": parse_par,
        "pitch": parse_pitch,
        "prim": parse_prim,
        "seq": parse_seq,
        "song": parse_song,
        "space": parse_space
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "song";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_song() {
        var cacheKey = 'song@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse__();
        if (result3 !== null) {
          var result4 = [];
          var result7 = parse_def();
          while (result7 !== null) {
            result4.push(result7);
            var result7 = parse_def();
          }
          if (result4 !== null) {
            var result5 = parse__();
            if (result5 !== null) {
              var result6 = parse_par();
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(e) { return {definitions:definitions,expr:e}; })(result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_def() {
        var cacheKey = 'def@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 3) === "let") {
          var result3 = "let";
          pos += 3;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"let\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse__();
          if (result4 !== null) {
            var result5 = parse_id();
            if (result5 !== null) {
              var result6 = parse__();
              if (result6 !== null) {
                if (input.substr(pos, 1) === "=") {
                  var result7 = "=";
                  pos += 1;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"=\"");
                  }
                }
                if (result7 !== null) {
                  var result8 = parse__();
                  if (result8 !== null) {
                    var result9 = parse_par();
                    if (result9 !== null) {
                      var result1 = [result3, result4, result5, result6, result7, result8, result9];
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(name, e) { definitions[name] = e; })(result1[2], result1[6])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_note() {
        var cacheKey = 'note@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_pitch();
        if (result3 !== null) {
          var result4 = parse__();
          if (result4 !== null) {
            var result5 = parse_integer();
            if (result5 !== null) {
              var result6 = parse__();
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(p, dur) { return {tag:'note',pitch:p,dur:dur}; })(result1[0], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_par() {
        var cacheKey = 'par@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_seq();
        if (result5 !== null) {
          var result6 = parse__();
          if (result6 !== null) {
            if (input.substr(pos, 1) === "|") {
              var result7 = "|";
              pos += 1;
            } else {
              var result7 = null;
              if (reportMatchFailures) {
                matchFailed("\"|\"");
              }
            }
            if (result7 !== null) {
              var result8 = parse__();
              if (result8 !== null) {
                var result9 = parse_par();
                if (result9 !== null) {
                  var result10 = parse__();
                  if (result10 !== null) {
                    var result3 = [result5, result6, result7, result8, result9, result10];
                  } else {
                    var result3 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(left, right) { return {tag:'par',left:left,right:right}; })(result3[0], result3[4])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_seq();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_seq() {
        var cacheKey = 'seq@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_prim();
        if (result5 !== null) {
          var result6 = parse__();
          if (result6 !== null) {
            if (input.substr(pos, 1) === ",") {
              var result7 = ",";
              pos += 1;
            } else {
              var result7 = null;
              if (reportMatchFailures) {
                matchFailed("\",\"");
              }
            }
            if (result7 !== null) {
              var result8 = parse__();
              if (result8 !== null) {
                var result9 = parse_seq();
                if (result9 !== null) {
                  var result10 = parse__();
                  if (result10 !== null) {
                    var result3 = [result5, result6, result7, result8, result9, result10];
                  } else {
                    var result3 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(left, right) { return {tag:'seq',left:left,right:right}; })(result3[0], result3[4])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_prim();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_prim() {
        var cacheKey = 'prim@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result30 = parse_note();
        if (result30 !== null) {
          var result0 = result30;
        } else {
          var savedPos6 = pos;
          var savedPos7 = pos;
          if (input.substr(pos, 1) === "_") {
            var result26 = "_";
            pos += 1;
          } else {
            var result26 = null;
            if (reportMatchFailures) {
              matchFailed("\"_\"");
            }
          }
          if (result26 !== null) {
            var result27 = parse__();
            if (result27 !== null) {
              var result28 = parse_integer();
              if (result28 !== null) {
                var result29 = parse__();
                if (result29 !== null) {
                  var result24 = [result26, result27, result28, result29];
                } else {
                  var result24 = null;
                  pos = savedPos7;
                }
              } else {
                var result24 = null;
                pos = savedPos7;
              }
            } else {
              var result24 = null;
              pos = savedPos7;
            }
          } else {
            var result24 = null;
            pos = savedPos7;
          }
          var result25 = result24 !== null
            ? (function(dur) { return {tag:'rest',duration:dur}; })(result24[2])
            : null;
          if (result25 !== null) {
            var result23 = result25;
          } else {
            var result23 = null;
            pos = savedPos6;
          }
          if (result23 !== null) {
            var result0 = result23;
          } else {
            var savedPos4 = pos;
            var savedPos5 = pos;
            var result21 = parse_id();
            if (result21 !== null) {
              var result22 = parse__();
              if (result22 !== null) {
                var result19 = [result21, result22];
              } else {
                var result19 = null;
                pos = savedPos5;
              }
            } else {
              var result19 = null;
              pos = savedPos5;
            }
            var result20 = result19 !== null
              ? (function(ref) { return {tag:'ref',name:ref}; })(result19[0])
              : null;
            if (result20 !== null) {
              var result18 = result20;
            } else {
              var result18 = null;
              pos = savedPos4;
            }
            if (result18 !== null) {
              var result0 = result18;
            } else {
              var savedPos2 = pos;
              var savedPos3 = pos;
              if (input.substr(pos, 1) === "(") {
                var result12 = "(";
                pos += 1;
              } else {
                var result12 = null;
                if (reportMatchFailures) {
                  matchFailed("\"(\"");
                }
              }
              if (result12 !== null) {
                var result13 = parse__();
                if (result13 !== null) {
                  var result14 = parse_par();
                  if (result14 !== null) {
                    var result15 = parse__();
                    if (result15 !== null) {
                      if (input.substr(pos, 1) === ")") {
                        var result16 = ")";
                        pos += 1;
                      } else {
                        var result16 = null;
                        if (reportMatchFailures) {
                          matchFailed("\")\"");
                        }
                      }
                      if (result16 !== null) {
                        var result17 = parse__();
                        if (result17 !== null) {
                          var result10 = [result12, result13, result14, result15, result16, result17];
                        } else {
                          var result10 = null;
                          pos = savedPos3;
                        }
                      } else {
                        var result10 = null;
                        pos = savedPos3;
                      }
                    } else {
                      var result10 = null;
                      pos = savedPos3;
                    }
                  } else {
                    var result10 = null;
                    pos = savedPos3;
                  }
                } else {
                  var result10 = null;
                  pos = savedPos3;
                }
              } else {
                var result10 = null;
                pos = savedPos3;
              }
              var result11 = result10 !== null
                ? (function(e) { return e; })(result10[2])
                : null;
              if (result11 !== null) {
                var result9 = result11;
              } else {
                var result9 = null;
                pos = savedPos2;
              }
              if (result9 !== null) {
                var result0 = result9;
              } else {
                var savedPos0 = pos;
                var savedPos1 = pos;
                var result4 = parse_integer();
                if (result4 !== null) {
                  var result5 = parse__();
                  if (result5 !== null) {
                    if (input.substr(pos, 1) === "*") {
                      var result6 = "*";
                      pos += 1;
                    } else {
                      var result6 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"*\"");
                      }
                    }
                    if (result6 !== null) {
                      var result7 = parse__();
                      if (result7 !== null) {
                        var result8 = parse_par();
                        if (result8 !== null) {
                          var result2 = [result4, result5, result6, result7, result8];
                        } else {
                          var result2 = null;
                          pos = savedPos1;
                        }
                      } else {
                        var result2 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result2 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result2 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result2 = null;
                  pos = savedPos1;
                }
                var result3 = result2 !== null
                  ? (function(count, section) { return {tag:'repeat',count:count,section:section}; })(result2[0], result2[4])
                  : null;
                if (result3 !== null) {
                  var result1 = result3;
                } else {
                  var result1 = null;
                  pos = savedPos0;
                }
                if (result1 !== null) {
                  var result0 = result1;
                } else {
                  var result0 = null;;
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_pitch() {
        var cacheKey = 'pitch@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos).match(/^[A-Ga-g]/) !== null) {
          var result3 = input.charAt(pos);
          pos++;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("[A-Ga-g]");
          }
        }
        if (result3 !== null) {
          if (input.substr(pos, 1) === "#") {
            var result6 = "#";
            pos += 1;
          } else {
            var result6 = null;
            if (reportMatchFailures) {
              matchFailed("\"#\"");
            }
          }
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            if (input.substr(pos).match(/^[0-8]/) !== null) {
              var result5 = input.charAt(pos);
              pos++;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("[0-8]");
              }
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(fst, sharp, snd) { return fst+sharp+snd; })(result1[0], result1[1], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse__() {
        var cacheKey = '_@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = [];
        var result6 = parse_space();
        while (result6 !== null) {
          result1.push(result6);
          var result6 = parse_space();
        }
        if (result1 !== null) {
          var savedPos1 = pos;
          var result4 = parse_comment();
          if (result4 !== null) {
            var result5 = parse__();
            if (result5 !== null) {
              var result3 = [result4, result5];
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
          var result2 = result3 !== null ? result3 : '';
          if (result2 !== null) {
            var result0 = [result1, result2];
          } else {
            var result0 = null;
            pos = savedPos0;
          }
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_space() {
        var cacheKey = 'space@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === " ") {
          var result2 = " ";
          pos += 1;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\" \"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos).match(/^[	\n\r]/) !== null) {
            var result1 = input.charAt(pos);
            pos++;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("[	\\n\\r]");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_comment() {
        var cacheKey = 'comment@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos3 = pos;
        if (input.substr(pos, 2) === "//") {
          var result10 = "//";
          pos += 2;
        } else {
          var result10 = null;
          if (reportMatchFailures) {
            matchFailed("\"//\"");
          }
        }
        if (result10 !== null) {
          var result11 = [];
          var savedPos4 = pos;
          var savedPos5 = pos;
          var savedReportMatchFailuresVar1 = reportMatchFailures;
          reportMatchFailures = false;
          if (input.substr(pos).match(/^[\n\r]/) !== null) {
            var result15 = input.charAt(pos);
            pos++;
          } else {
            var result15 = null;
            if (reportMatchFailures) {
              matchFailed("[\\n\\r]");
            }
          }
          reportMatchFailures = savedReportMatchFailuresVar1;
          if (result15 === null) {
            var result13 = '';
          } else {
            var result13 = null;
            pos = savedPos5;
          }
          if (result13 !== null) {
            if (input.length > pos) {
              var result14 = input.charAt(pos);
              pos++;
            } else {
              var result14 = null;
              if (reportMatchFailures) {
                matchFailed('any character');
              }
            }
            if (result14 !== null) {
              var result12 = [result13, result14];
            } else {
              var result12 = null;
              pos = savedPos4;
            }
          } else {
            var result12 = null;
            pos = savedPos4;
          }
          while (result12 !== null) {
            result11.push(result12);
            var savedPos4 = pos;
            var savedPos5 = pos;
            var savedReportMatchFailuresVar1 = reportMatchFailures;
            reportMatchFailures = false;
            if (input.substr(pos).match(/^[\n\r]/) !== null) {
              var result15 = input.charAt(pos);
              pos++;
            } else {
              var result15 = null;
              if (reportMatchFailures) {
                matchFailed("[\\n\\r]");
              }
            }
            reportMatchFailures = savedReportMatchFailuresVar1;
            if (result15 === null) {
              var result13 = '';
            } else {
              var result13 = null;
              pos = savedPos5;
            }
            if (result13 !== null) {
              if (input.length > pos) {
                var result14 = input.charAt(pos);
                pos++;
              } else {
                var result14 = null;
                if (reportMatchFailures) {
                  matchFailed('any character');
                }
              }
              if (result14 !== null) {
                var result12 = [result13, result14];
              } else {
                var result12 = null;
                pos = savedPos4;
              }
            } else {
              var result12 = null;
              pos = savedPos4;
            }
          }
          if (result11 !== null) {
            var result9 = [result10, result11];
          } else {
            var result9 = null;
            pos = savedPos3;
          }
        } else {
          var result9 = null;
          pos = savedPos3;
        }
        if (result9 !== null) {
          var result0 = result9;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 2) === "/*") {
            var result2 = "/*";
            pos += 2;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"/*\"");
            }
          }
          if (result2 !== null) {
            var savedPos1 = pos;
            var savedPos2 = pos;
            var savedReportMatchFailuresVar0 = reportMatchFailures;
            reportMatchFailures = false;
            if (input.substr(pos, 2) === "*/") {
              var result8 = "*/";
              pos += 2;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed("\"*/\"");
              }
            }
            reportMatchFailures = savedReportMatchFailuresVar0;
            if (result8 === null) {
              var result6 = '';
            } else {
              var result6 = null;
              pos = savedPos2;
            }
            if (result6 !== null) {
              if (input.length > pos) {
                var result7 = input.charAt(pos);
                pos++;
              } else {
                var result7 = null;
                if (reportMatchFailures) {
                  matchFailed('any character');
                }
              }
              if (result7 !== null) {
                var result5 = [result6, result7];
              } else {
                var result5 = null;
                pos = savedPos1;
              }
            } else {
              var result5 = null;
              pos = savedPos1;
            }
            if (result5 !== null) {
              var result3 = [];
              while (result5 !== null) {
                result3.push(result5);
                var savedPos1 = pos;
                var savedPos2 = pos;
                var savedReportMatchFailuresVar0 = reportMatchFailures;
                reportMatchFailures = false;
                if (input.substr(pos, 2) === "*/") {
                  var result8 = "*/";
                  pos += 2;
                } else {
                  var result8 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"*/\"");
                  }
                }
                reportMatchFailures = savedReportMatchFailuresVar0;
                if (result8 === null) {
                  var result6 = '';
                } else {
                  var result6 = null;
                  pos = savedPos2;
                }
                if (result6 !== null) {
                  if (input.length > pos) {
                    var result7 = input.charAt(pos);
                    pos++;
                  } else {
                    var result7 = null;
                    if (reportMatchFailures) {
                      matchFailed('any character');
                    }
                  }
                  if (result7 !== null) {
                    var result5 = [result6, result7];
                  } else {
                    var result5 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result5 = null;
                  pos = savedPos1;
                }
              }
            } else {
              var result3 = null;
            }
            if (result3 !== null) {
              if (input.substr(pos, 2) === "*/") {
                var result4 = "*/";
                pos += 2;
              } else {
                var result4 = null;
                if (reportMatchFailures) {
                  matchFailed("\"*/\"");
                }
              }
              if (result4 !== null) {
                var result1 = [result2, result3, result4];
              } else {
                var result1 = null;
                pos = savedPos0;
              }
            } else {
              var result1 = null;
              pos = savedPos0;
            }
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_integer() {
        var cacheKey = 'integer@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        if (input.substr(pos).match(/^[0-9]/) !== null) {
          var result3 = input.charAt(pos);
          pos++;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("[0-9]");
          }
        }
        if (result3 !== null) {
          var result1 = [];
          while (result3 !== null) {
            result1.push(result3);
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result3 = input.charAt(pos);
              pos++;
            } else {
              var result3 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
          }
        } else {
          var result1 = null;
        }
        var result2 = result1 !== null
          ? (function(digits) { return parseInt(digits.join(""), 10) })(result1)
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_id() {
        var cacheKey = 'id@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "_") {
          var result9 = "_";
          pos += 1;
        } else {
          var result9 = null;
          if (reportMatchFailures) {
            matchFailed("\"_\"");
          }
        }
        if (result9 !== null) {
          var result3 = result9;
        } else {
          if (input.substr(pos).match(/^[a-zA-Z]/) !== null) {
            var result8 = input.charAt(pos);
            pos++;
          } else {
            var result8 = null;
            if (reportMatchFailures) {
              matchFailed("[a-zA-Z]");
            }
          }
          if (result8 !== null) {
            var result3 = result8;
          } else {
            var result3 = null;;
          };
        }
        if (result3 !== null) {
          var result4 = [];
          if (input.substr(pos, 1) === "_") {
            var result7 = "_";
            pos += 1;
          } else {
            var result7 = null;
            if (reportMatchFailures) {
              matchFailed("\"_\"");
            }
          }
          if (result7 !== null) {
            var result5 = result7;
          } else {
            if (input.substr(pos).match(/^[a-zA-Z0-9]/) !== null) {
              var result6 = input.charAt(pos);
              pos++;
            } else {
              var result6 = null;
              if (reportMatchFailures) {
                matchFailed("[a-zA-Z0-9]");
              }
            }
            if (result6 !== null) {
              var result5 = result6;
            } else {
              var result5 = null;;
            };
          }
          while (result5 !== null) {
            result4.push(result5);
            if (input.substr(pos, 1) === "_") {
              var result7 = "_";
              pos += 1;
            } else {
              var result7 = null;
              if (reportMatchFailures) {
                matchFailed("\"_\"");
              }
            }
            if (result7 !== null) {
              var result5 = result7;
            } else {
              if (input.substr(pos).match(/^[a-zA-Z0-9]/) !== null) {
                var result6 = input.charAt(pos);
                pos++;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("[a-zA-Z0-9]");
                }
              }
              if (result6 !== null) {
                var result5 = result6;
              } else {
                var result5 = null;;
              };
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(fstchar, rest) {var id = [fstchar].concat(rest).join(''); return id;})(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
		var definitions = {};
      
	
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2')));


(function(r) {
	var file = '/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2/mus.js'
	var exp = {}
	var mod = {
		exports: exp
	}
	console.log('defining module',file);
	(function(require,module,exports,process) {

/*---------------------------------------------------*/
var compile = require('./compile').compile
  , parser = require('./infix');

module.exports = {
	compile: compile,
	parser: parser,
	make: function(src) {
		var ast = parser.parse(src);
		console.log('infoxmus ast',ast);
		return compile(ast.expr,ast.definitions);
	}
};
/*---------------------------------------------------*/

	}
	)(r,mod,exp,window.node2browser.globals.process);

	window.node2browser.cache[file] = mod.exports
	console.log('defined',file,mod.exports)
	var idx = file.indexOf('/index.js')
	if(idx>0&&file.length==(idx+'/index.js'.length)) {
		window.node2browser.cache[file.substring(0,idx)] = mod.exports
	}
}(window.node2browser.makerequire('/Users/frza/Documents/workspace.javascript/nathanuni/nathanuni-pl101-lesson2')));



	
}
)();

