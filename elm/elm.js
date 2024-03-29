(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');


// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (typeof x.$ === 'undefined')
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $elm$core$Basics$EQ = {$: 'EQ'};
var $elm$core$Basics$GT = {$: 'GT'};
var $elm$core$Basics$LT = {$: 'LT'};
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var $elm$core$Basics$False = {$: 'False'};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var $elm$core$Maybe$Nothing = {$: 'Nothing'};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 'Nothing') {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / $elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = {$: 'True'};
var $elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var $elm$url$Url$Http = {$: 'Http'};
var $elm$url$Url$Https = {$: 'Https'};
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 'Nothing') {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Http,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Https,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(_Utils_Tuple0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0.a;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return _Utils_Tuple0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(_Utils_Tuple0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0.a;
		return $elm$core$Task$Perform(
			A2($elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2($elm$core$Task$map, toMessage, task)));
	});
var $elm$browser$Browser$element = _Browser_element;
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (n <= 0) {
				return result;
			} else {
				var $temp$result = A2($elm$core$List$cons, value, result),
					$temp$n = n - 1,
					$temp$value = value;
				result = $temp$result;
				n = $temp$n;
				value = $temp$value;
				continue repeatHelp;
			}
		}
	});
var $elm$core$List$repeat = F2(
	function (n, value) {
		return A3($elm$core$List$repeatHelp, _List_Nil, n, value);
	});
var $author$project$Model$freshGraphics = A2(
	$elm$core$List$repeat,
	32,
	A2($elm$core$List$repeat, 32, 0));
var $author$project$State$ChanSingle = function (a) {
	return {$: 'ChanSingle', a: a};
};
var $author$project$StateUtils$displaychanname = 'SERIAL';
var $author$project$State$Any = {$: 'Any'};
var $author$project$State$freshChannel = {isFull: false, value: $author$project$State$Any};
var $elm$core$Dict$Black = {$: 'Black'};
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = {$: 'Red'};
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1.$) {
				case 'LT':
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $author$project$StateUtils$keyboardchanname = 'KEYBOARD';
var $author$project$StateUtils$freshState = {
	chans: A3(
		$elm$core$Dict$insert,
		$author$project$StateUtils$keyboardchanname,
		$author$project$State$ChanSingle($author$project$State$freshChannel),
		A3(
			$elm$core$Dict$insert,
			$author$project$StateUtils$displaychanname,
			$author$project$State$ChanSingle($author$project$State$freshChannel),
			$elm$core$Dict$empty)),
	vars: $elm$core$Dict$empty
};
var $author$project$Model$freshModel = {
	display: _List_Nil,
	graphics: $author$project$Model$freshGraphics,
	ids: $elm$core$Dict$empty,
	keyboardBuffer: _List_Nil,
	output: _List_Nil,
	randomGenerator: {fulfilment: $elm$core$Maybe$Nothing, request: $elm$core$Maybe$Nothing},
	randomSeed: $elm$core$Maybe$Nothing,
	runFlag: false,
	running: _List_Nil,
	state: $author$project$StateUtils$freshState,
	waiting: _List_Nil
};
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Model$print = F2(
	function (s, m) {
		return _Utils_update(
			m,
			{
				output: A2($elm$core$List$cons, s, m.output)
			});
	});
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (_v0.$ === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var $author$project$Model$getNext = function (dict) {
	var getNext2 = F2(
		function (d, n) {
			getNext2:
			while (true) {
				if (A2($elm$core$Dict$member, n, d)) {
					var $temp$d = d,
						$temp$n = n + 1;
					d = $temp$d;
					n = $temp$n;
					continue getNext2;
				} else {
					return _Utils_Tuple2(
						n,
						A3($elm$core$Dict$insert, n, true, d));
				}
			}
		});
	return A2(getNext2, dict, 0);
};
var $author$project$Model$assignIds = F3(
	function (trees, ancestor, dict) {
		if (!trees.b) {
			return _Utils_Tuple2(_List_Nil, dict);
		} else {
			var t = trees.a;
			var ts = trees.b;
			var _v1 = A3($author$project$Model$assignIds, ts, ancestor, dict);
			var xs = _v1.a;
			var d = _v1.b;
			var _v2 = $author$project$Model$getNext(d);
			var i = _v2.a;
			var dict2 = _v2.b;
			return _Utils_Tuple2(
				A2(
					$elm$core$List$cons,
					{ancestorId: ancestor, code: t, id: i},
					xs),
				dict2);
		}
	});
var $author$project$Model$basic_spawn = F2(
	function (xs, m) {
		return _Utils_update(
			m,
			{
				running: _Utils_ap(xs, m.running)
			});
	});
var $author$project$Model$Terminated = function (a) {
	return {$: 'Terminated', a: a};
};
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$Model$updateWaitCond = F3(
	function (parent, children, m) {
		var updated_waiting = A2(
			$elm$core$List$map,
			function (p) {
				var _v0 = p.waitCond;
				if (_v0.$ === 'Terminated') {
					var xs = _v0.a;
					return A2($elm$core$List$member, parent, xs) ? _Utils_update(
						p,
						{
							waitCond: $author$project$Model$Terminated(
								_Utils_ap(children, xs))
						}) : p;
				} else {
					return p;
				}
			},
			m.waiting);
		return _Utils_update(
			m,
			{waiting: updated_waiting});
	});
var $author$project$Model$spawn = F4(
	function (xs, parent, ancestor, m) {
		var _v0 = A3($author$project$Model$assignIds, xs, ancestor, m.ids);
		var newprocs = _v0.a;
		var d = _v0.b;
		var m2 = A2(
			$author$project$Model$basic_spawn,
			newprocs,
			_Utils_update(
				m,
				{ids: d}));
		return A3(
			$author$project$Model$updateWaitCond,
			parent,
			A2(
				$elm$core$List$map,
				function (p) {
					return p.id;
				},
				newprocs),
			m2);
	});
var $author$project$Readfile$Branch = F2(
	function (a, b) {
		return {$: 'Branch', a: a, b: b};
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $author$project$Readfile$Ident = function (a) {
	return {$: 'Ident', a: a};
};
var $author$project$Readfile$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Readfile$idDecoder = A2(
	$elm$json$Json$Decode$map,
	$author$project$Readfile$Leaf,
	A2(
		$elm$json$Json$Decode$map,
		$author$project$Readfile$Ident,
		A2($elm$json$Json$Decode$field, 'idleaf', $elm$json$Json$Decode$string)));
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$lazy = function (thunk) {
	return A2(
		$elm$json$Json$Decode$andThen,
		thunk,
		$elm$json$Json$Decode$succeed(_Utils_Tuple0));
};
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Readfile$Num = function (a) {
	return {$: 'Num', a: a};
};
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Readfile$numDecoder = A2(
	$elm$json$Json$Decode$map,
	$author$project$Readfile$Leaf,
	A2(
		$elm$json$Json$Decode$map,
		$author$project$Readfile$Num,
		A2($elm$json$Json$Decode$field, 'numleaf', $elm$json$Json$Decode$int)));
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Readfile$ABinop = function (a) {
	return {$: 'ABinop', a: a};
};
var $author$project$Readfile$Alt = {$: 'Alt'};
var $author$project$Readfile$AltList = {$: 'AltList'};
var $author$project$Readfile$Alternative = {$: 'Alternative'};
var $author$project$Readfile$And = {$: 'And'};
var $author$project$Readfile$AssignExpr = {$: 'AssignExpr'};
var $author$project$Readfile$AssignProc = {$: 'AssignProc'};
var $author$project$Readfile$ChoiceList = {$: 'ChoiceList'};
var $author$project$Readfile$Cond = {$: 'Cond'};
var $author$project$Readfile$DeclareChannel = {$: 'DeclareChannel'};
var $author$project$Readfile$DeclareVariable = {$: 'DeclareVariable'};
var $author$project$Readfile$Dimensions = {$: 'Dimensions'};
var $author$project$Readfile$Div = {$: 'Div'};
var $author$project$Readfile$Eq = {$: 'Eq'};
var $author$project$Readfile$Ge = {$: 'Ge'};
var $author$project$Readfile$Gt = {$: 'Gt'};
var $author$project$Readfile$Guard = {$: 'Guard'};
var $author$project$Readfile$GuardedChoice = {$: 'GuardedChoice'};
var $author$project$Readfile$Id = {$: 'Id'};
var $author$project$Readfile$In = {$: 'In'};
var $author$project$Readfile$LBinop = function (a) {
	return {$: 'LBinop', a: a};
};
var $author$project$Readfile$Le = {$: 'Le'};
var $author$project$Readfile$Lt = {$: 'Lt'};
var $author$project$Readfile$Minus = {$: 'Minus'};
var $author$project$Readfile$Or = {$: 'Or'};
var $author$project$Readfile$Out = {$: 'Out'};
var $author$project$Readfile$Par = {$: 'Par'};
var $author$project$Readfile$Plus = {$: 'Plus'};
var $author$project$Readfile$ProcList = {$: 'ProcList'};
var $author$project$Readfile$Replicator = {$: 'Replicator'};
var $author$project$Readfile$Seq = {$: 'Seq'};
var $author$project$Readfile$Skip = {$: 'Skip'};
var $author$project$Readfile$Times = {$: 'Times'};
var $author$project$Readfile$While = {$: 'While'};
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Readfile$ruleFromString = function (str) {
	switch (str) {
		case 'par':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Par);
		case 'seq':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Seq);
		case 'proc_list':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$ProcList);
		case 'alt':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Alt);
		case 'alt_list':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$AltList);
		case 'alternative':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Alternative);
		case 'guard':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Guard);
		case 'in':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$In);
		case 'out':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Out);
		case 'assign_expr':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$AssignExpr);
		case 'assign_proc':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$AssignProc);
		case 'id':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Id);
		case 'dimensions_list':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Dimensions);
		case 'while':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$While);
		case 'cond':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Cond);
		case 'choice_list':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$ChoiceList);
		case 'guarded_choice':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$GuardedChoice);
		case 'replicator':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Replicator);
		case 'declare_var':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$DeclareVariable);
		case 'declare_chan':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$DeclareChannel);
		case 'skip':
			return $elm$json$Json$Decode$succeed($author$project$Readfile$Skip);
		case 'AND':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$LBinop($author$project$Readfile$And));
		case 'OR':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$LBinop($author$project$Readfile$Or));
		case 'PLUS':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Plus));
		case 'MINUS':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Minus));
		case 'TIMES':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Times));
		case 'DIV':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Div));
		case 'EQ':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Eq));
		case 'GT':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Gt));
		case 'LT':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Lt));
		case 'GE':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Ge));
		case 'LE':
			return $elm$json$Json$Decode$succeed(
				$author$project$Readfile$ABinop($author$project$Readfile$Le));
		default:
			return $elm$json$Json$Decode$fail('Invalid grammar rule' + str);
	}
};
var $author$project$Readfile$ruleDecoder = A2($elm$json$Json$Decode$andThen, $author$project$Readfile$ruleFromString, $elm$json$Json$Decode$string);
function $author$project$Readfile$cyclic$treeDecoder() {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$author$project$Readfile$cyclic$branchDecoder(),
				$author$project$Readfile$numDecoder,
				$author$project$Readfile$idDecoder
			]));
}
function $author$project$Readfile$cyclic$branchDecoder() {
	return A3(
		$elm$json$Json$Decode$map2,
		$author$project$Readfile$Branch,
		A2($elm$json$Json$Decode$field, 'rule', $author$project$Readfile$ruleDecoder),
		A2(
			$elm$json$Json$Decode$field,
			'children',
			$elm$json$Json$Decode$list(
				$elm$json$Json$Decode$lazy(
					function (_v0) {
						return $author$project$Readfile$cyclic$treeDecoder();
					}))));
}
try {
	var $author$project$Readfile$treeDecoder = $author$project$Readfile$cyclic$treeDecoder();
	$author$project$Readfile$cyclic$treeDecoder = function () {
		return $author$project$Readfile$treeDecoder;
	};
	var $author$project$Readfile$branchDecoder = $author$project$Readfile$cyclic$branchDecoder();
	$author$project$Readfile$cyclic$branchDecoder = function () {
		return $author$project$Readfile$branchDecoder;
	};
} catch ($) {
	throw 'Some top-level definitions from `Readfile` are causing infinite recursion:\n\n  ┌─────┐\n  │    treeDecoder\n  │     ↓\n  │    branchDecoder\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $author$project$Main$init = function (json) {
	var _v0 = A2($elm$json$Json$Decode$decodeValue, $author$project$Readfile$treeDecoder, json);
	if (_v0.$ === 'Ok') {
		var t = _v0.a;
		return _Utils_Tuple2(
			A2(
				$author$project$Model$print,
				'\n',
				A4(
					$author$project$Model$spawn,
					_List_fromArray(
						[t]),
					-1,
					$elm$core$Maybe$Nothing,
					$author$project$Model$freshModel)),
			$elm$core$Platform$Cmd$none);
	} else {
		var e = _v0.a;
		return _Utils_Tuple2(
			A2(
				$author$project$Model$print,
				'Error parsing JSON!',
				A4($author$project$Model$spawn, _List_Nil, -1, $elm$core$Maybe$Nothing, $author$project$Model$freshModel)),
			$elm$core$Platform$Cmd$none);
	}
};
var $author$project$Main$ReceivedDataFromJS = function (a) {
	return {$: 'ReceivedDataFromJS', a: a};
};
var $author$project$Main$ReceivedKeyboardInput = function (a) {
	return {$: 'ReceivedKeyboardInput', a: a};
};
var $author$project$Main$Tick = function (a) {
	return {$: 'Tick', a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 'Every', a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {processes: processes, taggers: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 'Nothing') {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$time$Time$Name = function (a) {
	return {$: 'Name', a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 'Offset', a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 'Zone', a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.processes;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(_Utils_Tuple0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$Posix = function (a) {
	return {$: 'Posix', a: a};
};
var $elm$time$Time$millisToPosix = $elm$time$Time$Posix;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.taggers);
		if (_v0.$ === 'Nothing') {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $author$project$KeyboardInput$Key1 = {$: 'Key1'};
var $author$project$KeyboardInput$Key2 = {$: 'Key2'};
var $author$project$KeyboardInput$Key3 = {$: 'Key3'};
var $author$project$KeyboardInput$toDirection = function (string) {
	switch (string) {
		case '1':
			return $author$project$KeyboardInput$Key1;
		case '2':
			return $author$project$KeyboardInput$Key2;
		default:
			return $author$project$KeyboardInput$Key3;
	}
};
var $author$project$KeyboardInput$keyDecoder = A2(
	$elm$json$Json$Decode$map,
	$author$project$KeyboardInput$toDirection,
	A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string));
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Main$messageReceiver = _Platform_incomingPort('messageReceiver', $elm$json$Json$Decode$value);
var $elm$browser$Browser$Events$Document = {$: 'Document'};
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 'MySub', a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {pids: pids, subs: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (node.$ === 'Document') {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {event: event, key: key};
	});
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (node.$ === 'Document') {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.pids,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.key;
		var event = _v0.event;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.subs);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onKeyDown = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'keydown');
var $author$project$Main$subscriptions = function (_v0) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Main$messageReceiver($author$project$Main$ReceivedDataFromJS),
				$elm$browser$Browser$Events$onKeyDown(
				A2($elm$json$Json$Decode$map, $author$project$Main$ReceivedKeyboardInput, $author$project$KeyboardInput$keyDecoder)),
				A2($elm$time$Time$every, 20, $author$project$Main$Tick)
			]));
};
var $author$project$Main$Fulfilment = F2(
	function (a, b) {
		return {$: 'Fulfilment', a: a, b: b};
	});
var $author$project$Main$RunThread = F2(
	function (a, b) {
		return {$: 'RunThread', a: a, b: b};
	});
var $author$project$Main$RunUntil = function (a) {
	return {$: 'RunUntil', a: a};
};
var $author$project$Main$Step = {$: 'Step'};
var $author$project$Main$StopRunning = {$: 'StopRunning'};
var $author$project$Main$Thread = function (a) {
	return {$: 'Thread', a: a};
};
var $author$project$Model$enqKeypress = F2(
	function (dir, m) {
		return _Utils_update(
			m,
			{
				keyboardBuffer: A2($elm$core$List$cons, dir, m.keyboardBuffer)
			});
	});
var $author$project$Model$fulfilRandom = F2(
	function (n, m) {
		return _Utils_update(
			m,
			{
				randomGenerator: {
					fulfilment: $elm$core$Maybe$Just(n),
					request: $elm$core$Maybe$Nothing
				}
			});
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Model$isBlocked = function (m) {
	return $elm$core$List$isEmpty(m.running);
};
var $author$project$Model$isFinished = function (m) {
	return $author$project$Model$isBlocked(m) && $elm$core$List$isEmpty(m.waiting);
};
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $author$project$StateUtils$keyboardchanid = {dims: _List_Nil, str: $author$project$StateUtils$keyboardchanname};
var $author$project$Model$isWaitingForKeyboard = function (m) {
	var keyboardWaitCond = function (wp) {
		var _v0 = wp.waitCond;
		if (_v0.$ === 'FilledChan') {
			var identifier = _v0.a;
			return _Utils_eq(identifier, $author$project$StateUtils$keyboardchanid);
		} else {
			return false;
		}
	};
	return $author$project$Model$isBlocked(m) && (!$elm$core$List$isEmpty(
		A2($elm$core$List$filter, keyboardWaitCond, m.waiting)));
};
var $elm$random$Random$Generator = function (a) {
	return {$: 'Generator', a: a};
};
var $elm$random$Random$constant = function (value) {
	return $elm$random$Random$Generator(
		function (seed) {
			return _Utils_Tuple2(value, seed);
		});
};
var $elm$random$Random$Generate = function (a) {
	return {$: 'Generate', a: a};
};
var $elm$random$Random$Seed = F2(
	function (a, b) {
		return {$: 'Seed', a: a, b: b};
	});
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$random$Random$next = function (_v0) {
	var state0 = _v0.a;
	var incr = _v0.b;
	return A2($elm$random$Random$Seed, ((state0 * 1664525) + incr) >>> 0, incr);
};
var $elm$random$Random$initialSeed = function (x) {
	var _v0 = $elm$random$Random$next(
		A2($elm$random$Random$Seed, 0, 1013904223));
	var state1 = _v0.a;
	var incr = _v0.b;
	var state2 = (state1 + x) >>> 0;
	return $elm$random$Random$next(
		A2($elm$random$Random$Seed, state2, incr));
};
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0.a;
	return millis;
};
var $elm$random$Random$init = A2(
	$elm$core$Task$andThen,
	function (time) {
		return $elm$core$Task$succeed(
			$elm$random$Random$initialSeed(
				$elm$time$Time$posixToMillis(time)));
	},
	$elm$time$Time$now);
var $elm$random$Random$step = F2(
	function (_v0, seed) {
		var generator = _v0.a;
		return generator(seed);
	});
var $elm$random$Random$onEffects = F3(
	function (router, commands, seed) {
		if (!commands.b) {
			return $elm$core$Task$succeed(seed);
		} else {
			var generator = commands.a.a;
			var rest = commands.b;
			var _v1 = A2($elm$random$Random$step, generator, seed);
			var value = _v1.a;
			var newSeed = _v1.b;
			return A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$random$Random$onEffects, router, rest, newSeed);
				},
				A2($elm$core$Platform$sendToApp, router, value));
		}
	});
var $elm$random$Random$onSelfMsg = F3(
	function (_v0, _v1, seed) {
		return $elm$core$Task$succeed(seed);
	});
var $elm$random$Random$map = F2(
	function (func, _v0) {
		var genA = _v0.a;
		return $elm$random$Random$Generator(
			function (seed0) {
				var _v1 = genA(seed0);
				var a = _v1.a;
				var seed1 = _v1.b;
				return _Utils_Tuple2(
					func(a),
					seed1);
			});
	});
var $elm$random$Random$cmdMap = F2(
	function (func, _v0) {
		var generator = _v0.a;
		return $elm$random$Random$Generate(
			A2($elm$random$Random$map, func, generator));
	});
_Platform_effectManagers['Random'] = _Platform_createManager($elm$random$Random$init, $elm$random$Random$onEffects, $elm$random$Random$onSelfMsg, $elm$random$Random$cmdMap);
var $elm$random$Random$command = _Platform_leaf('Random');
var $elm$random$Random$generate = F2(
	function (tagger, generator) {
		return $elm$random$Random$command(
			$elm$random$Random$Generate(
				A2($elm$random$Random$map, tagger, generator)));
	});
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$xor = _Bitwise_xor;
var $elm$random$Random$peel = function (_v0) {
	var state = _v0.a;
	var word = (state ^ (state >>> ((state >>> 28) + 4))) * 277803737;
	return ((word >>> 22) ^ word) >>> 0;
};
var $elm$random$Random$int = F2(
	function (a, b) {
		return $elm$random$Random$Generator(
			function (seed0) {
				var _v0 = (_Utils_cmp(a, b) < 0) ? _Utils_Tuple2(a, b) : _Utils_Tuple2(b, a);
				var lo = _v0.a;
				var hi = _v0.b;
				var range = (hi - lo) + 1;
				if (!((range - 1) & range)) {
					return _Utils_Tuple2(
						(((range - 1) & $elm$random$Random$peel(seed0)) >>> 0) + lo,
						$elm$random$Random$next(seed0));
				} else {
					var threshhold = (((-range) >>> 0) % range) >>> 0;
					var accountForBias = function (seed) {
						accountForBias:
						while (true) {
							var x = $elm$random$Random$peel(seed);
							var seedN = $elm$random$Random$next(seed);
							if (_Utils_cmp(x, threshhold) < 0) {
								var $temp$seed = seedN;
								seed = $temp$seed;
								continue accountForBias;
							} else {
								return _Utils_Tuple2((x % range) + lo, seedN);
							}
						}
					};
					return accountForBias(seed0);
				}
			});
	});
var $elm$core$Basics$modBy = _Basics_modBy;
var $author$project$Main$randomBelow = F3(
	function (seed, msgmaker, n) {
		if (seed.$ === 'Nothing') {
			return _Utils_Tuple2(
				A2(
					$elm$random$Random$generate,
					msgmaker,
					A2($elm$random$Random$int, 0, n - 1)),
				$elm$core$Maybe$Nothing);
		} else {
			var m = seed.a;
			var chosen = A2($elm$core$Basics$modBy, n, m);
			return _Utils_Tuple2(
				A2(
					$elm$random$Random$generate,
					msgmaker,
					$elm$random$Random$constant(chosen)),
				$elm$core$Maybe$Just(m + 1));
		}
	});
var $elm$core$Result$andThen = F2(
	function (callback, result) {
		if (result.$ === 'Ok') {
			var value = result.a;
			return callback(value);
		} else {
			var msg = result.a;
			return $elm$core$Result$Err(msg);
		}
	});
var $author$project$Compile$Blocked = function (a) {
	return {$: 'Blocked', a: a};
};
var $author$project$Compile$RunErr = function (a) {
	return {$: 'RunErr', a: a};
};
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Model$EmptiedChan = function (a) {
	return {$: 'EmptiedChan', a: a};
};
var $author$project$Model$FilledChan = function (a) {
	return {$: 'FilledChan', a: a};
};
var $author$project$Compile$Ran = F2(
	function (a, b) {
		return {$: 'Ran', a: a, b: b};
	});
var $author$project$Compile$Requesting = function (a) {
	return {$: 'Requesting', a: a};
};
var $author$project$Compile$Unrolled = F2(
	function (a, b) {
		return {$: 'Unrolled', a: a, b: b};
	});
var $author$project$State$Array = function (a) {
	return {$: 'Array', a: a};
};
var $author$project$State$derefAndUpdateVariable = F4(
	function (val, str, dims, state) {
		var dAUArray = F4(
			function (v, d, ds, dict) {
				if (!ds.b) {
					var _v1 = A2($elm$core$Dict$get, d, dict);
					if (_v1.$ === 'Just') {
						if (_v1.a.$ === 'Array') {
							return $elm$core$Result$Err('Not enough indexes for array ' + str);
						} else {
							var oldvalue = _v1.a;
							return $elm$core$Result$Ok(
								_Utils_Tuple2(
									oldvalue,
									$author$project$State$Array(
										A3($elm$core$Dict$insert, d, v, dict))));
						}
					} else {
						return $elm$core$Result$Err(
							'Index ' + ($elm$core$String$fromInt(d) + ' out of bounds'));
					}
				} else {
					var i = ds.a;
					var is = ds.b;
					var _v2 = A2($elm$core$Dict$get, d, dict);
					if (_v2.$ === 'Just') {
						if (_v2.a.$ === 'Array') {
							var dict2 = _v2.a.a;
							return A2(
								$elm$core$Result$andThen,
								function (_v3) {
									var oldvalue = _v3.a;
									var newstruct = _v3.b;
									return $elm$core$Result$Ok(
										_Utils_Tuple2(
											oldvalue,
											$author$project$State$Array(
												A3($elm$core$Dict$insert, d, newstruct, dict))));
								},
								A4(dAUArray, v, i, is, dict2));
						} else {
							var oldvalue = _v2.a;
							return $elm$core$Result$Err('Too many indexes for array ' + str);
						}
					} else {
						return $elm$core$Result$Err(
							'Index ' + ($elm$core$String$fromInt(d) + ' out of bounds'));
					}
				}
			});
		var _v4 = A2($elm$core$Dict$get, str, state.vars);
		if (_v4.$ === 'Nothing') {
			return $elm$core$Result$Err('Variable ' + (str + ' not declared'));
		} else {
			if (_v4.a.$ === 'Array') {
				var dict = _v4.a.a;
				if (dims.b) {
					var d = dims.a;
					var ds = dims.b;
					return A2(
						$elm$core$Result$andThen,
						function (_v6) {
							var accessedvalue = _v6.a;
							var updatedvars = _v6.b;
							return $elm$core$Result$Ok(
								_Utils_Tuple2(
									accessedvalue,
									_Utils_update(
										state,
										{
											vars: A3($elm$core$Dict$insert, str, updatedvars, state.vars)
										})));
						},
						A4(dAUArray, val, d, ds, dict));
				} else {
					return $elm$core$Result$Err('Not enough indices for array ' + str);
				}
			} else {
				var accessedvalue = _v4.a;
				if (!dims.b) {
					return $elm$core$Result$Ok(
						_Utils_Tuple2(
							accessedvalue,
							_Utils_update(
								state,
								{
									vars: A3($elm$core$Dict$insert, str, val, state.vars)
								})));
				} else {
					return $elm$core$Result$Err('Too many indexes for array ' + str);
				}
			}
		}
	});
var $author$project$State$Boolval = function (a) {
	return {$: 'Boolval', a: a};
};
var $author$project$State$Number = function (a) {
	return {$: 'Number', a: a};
};
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						$elm$core$List$cons,
						sep,
						A2($elm$core$List$cons, x, rest));
				});
			var spersed = A3($elm$core$List$foldr, step, _List_Nil, tl);
			return A2($elm$core$List$cons, hd, spersed);
		}
	});
var $author$project$State$ruleToString = function (r) {
	switch (r.$) {
		case 'Skip':
			return 'Skip';
		case 'ProcList':
			return 'ProcList';
		case 'Par':
			return 'Par';
		case 'Seq':
			return 'Seq';
		case 'Alt':
			return 'Alt';
		case 'AltList':
			return 'AltList';
		case 'Alternative':
			return 'Alternative';
		case 'Guard':
			return 'Guard';
		case 'In':
			return 'In';
		case 'Out':
			return 'Out';
		case 'AssignExpr':
			return 'AssignExpr';
		case 'AssignProc':
			return 'AssignProc';
		case 'Id':
			return 'Id';
		case 'Dimensions':
			return 'Dimensions';
		case 'While':
			return 'While';
		case 'Cond':
			return 'Cond';
		case 'ChoiceList':
			return 'ChoiceList';
		case 'GuardedChoice':
			return 'GuardedChoice';
		case 'Replicator':
			return 'Replicator';
		case 'DeclareChannel':
			return 'DeclareChannel';
		case 'DeclareVariable':
			return 'DeclareVariable';
		case 'ABinop':
			return 'ABop';
		default:
			return 'LBop';
	}
};
var $author$project$State$printTree = function (t) {
	if (t.$ === 'Leaf') {
		if (t.a.$ === 'Ident') {
			var i = t.a.a;
			return 'Ident ' + i;
		} else {
			var n = t.a.a;
			return 'Num ' + $elm$core$String$fromInt(n);
		}
	} else {
		var rule = t.a;
		var xs = t.b;
		return $author$project$State$ruleToString(rule) + ('[' + ($elm$core$String$concat(
			A2(
				$elm$core$List$intersperse,
				', ',
				A2($elm$core$List$map, $author$project$State$printTree, xs))) + ']'));
	}
};
var $author$project$State$arithEval = F4(
	function (op, x, y, state) {
		return A2(
			$elm$core$Result$andThen,
			function (v1) {
				return A2(
					$elm$core$Result$andThen,
					function (v2) {
						var _v37 = _Utils_Tuple2(v1, v2);
						if ((_v37.a.$ === 'Number') && (_v37.b.$ === 'Number')) {
							var n1 = _v37.a.a;
							var n2 = _v37.b.a;
							switch (op.$) {
								case 'Plus':
									return $elm$core$Result$Ok(
										$author$project$State$Number(n1 + n2));
								case 'Minus':
									return $elm$core$Result$Ok(
										$author$project$State$Number(n1 - n2));
								case 'Times':
									return $elm$core$Result$Ok(
										$author$project$State$Number(n1 * n2));
								case 'Div':
									return $elm$core$Result$Ok(
										$author$project$State$Number((n1 / n2) | 0));
								case 'Eq':
									return $elm$core$Result$Ok(
										$author$project$State$Boolval(
											_Utils_eq(n1, n2)));
								case 'Gt':
									return $elm$core$Result$Ok(
										$author$project$State$Boolval(
											_Utils_cmp(n1, n2) > 0));
								case 'Lt':
									return $elm$core$Result$Ok(
										$author$project$State$Boolval(
											_Utils_cmp(n1, n2) < 0));
								case 'Ge':
									return $elm$core$Result$Ok(
										$author$project$State$Boolval(
											_Utils_cmp(n1, n2) > -1));
								default:
									return $elm$core$Result$Ok(
										$author$project$State$Boolval(
											_Utils_cmp(n1, n2) < 1));
							}
						} else {
							return $elm$core$Result$Err('Invalid arguments for this operator');
						}
					},
					A2($author$project$State$eval, y, state));
			},
			A2($author$project$State$eval, x, state));
	});
var $author$project$State$eval = F2(
	function (t, state) {
		_v20$2:
		while (true) {
			_v20$6:
			while (true) {
				if (t.$ === 'Leaf') {
					if (t.a.$ === 'Num') {
						var n = t.a.a;
						return $elm$core$Result$Ok(
							$author$project$State$Number(n));
					} else {
						break _v20$6;
					}
				} else {
					switch (t.a.$) {
						case 'Id':
							if (((((((t.b.b && (t.b.a.$ === 'Leaf')) && (t.b.a.a.$ === 'Ident')) && t.b.b.b) && (t.b.b.a.$ === 'Branch')) && (t.b.b.a.a.$ === 'Dimensions')) && (!t.b.b.a.b.b)) && (!t.b.b.b.b)) {
								switch (t.b.a.a.a) {
									case 'TRUE':
										var _v21 = t.a;
										var _v22 = t.b;
										var _v23 = _v22.b;
										var _v24 = _v23.a;
										var _v25 = _v24.a;
										return $elm$core$Result$Ok(
											$author$project$State$Boolval(true));
									case 'FALSE':
										var _v26 = t.a;
										var _v27 = t.b;
										var _v28 = _v27.b;
										var _v29 = _v28.a;
										var _v30 = _v29.a;
										return $elm$core$Result$Ok(
											$author$project$State$Boolval(false));
									default:
										break _v20$2;
								}
							} else {
								break _v20$2;
							}
						case 'ABinop':
							if ((t.b.b && t.b.b.b) && (!t.b.b.b.b)) {
								var b = t.a.a;
								var _v33 = t.b;
								var x = _v33.a;
								var _v34 = _v33.b;
								var y = _v34.a;
								return A4($author$project$State$arithEval, b, x, y, state);
							} else {
								break _v20$6;
							}
						case 'LBinop':
							if ((t.b.b && t.b.b.b) && (!t.b.b.b.b)) {
								var b = t.a.a;
								var _v35 = t.b;
								var x = _v35.a;
								var _v36 = _v35.b;
								var y = _v36.a;
								return A4($author$project$State$logicEval, b, x, y, state);
							} else {
								break _v20$6;
							}
						default:
							break _v20$6;
					}
				}
			}
			return $elm$core$Result$Err(
				'not a valid value ' + $author$project$State$printTree(t));
		}
		var _v31 = t.a;
		return A2(
			$elm$core$Result$andThen,
			function (varid) {
				return A2(
					$elm$core$Result$andThen,
					function (_v32) {
						var val = _v32.a;
						return $elm$core$Result$Ok(val);
					},
					A4($author$project$State$derefAndUpdateVariable, $author$project$State$Any, varid.str, varid.dims, state));
			},
			A2($author$project$State$treeToId, state, t));
	});
var $author$project$State$idMaker = F3(
	function (state, i, ds) {
		return A2(
			$elm$core$Result$andThen,
			function (result) {
				return $elm$core$Result$Ok(
					{dims: result, str: i});
			},
			A2($author$project$State$treeToDimsList, state, ds));
	});
var $author$project$State$logicEval = F4(
	function (op, x, y, state) {
		return A2(
			$elm$core$Result$andThen,
			function (v1) {
				return A2(
					$elm$core$Result$andThen,
					function (v2) {
						var _v18 = _Utils_Tuple2(v1, v2);
						if ((_v18.a.$ === 'Boolval') && (_v18.b.$ === 'Boolval')) {
							var b1 = _v18.a.a;
							var b2 = _v18.b.a;
							if (op.$ === 'And') {
								return $elm$core$Result$Ok(
									$author$project$State$Boolval(b1 && b2));
							} else {
								return $elm$core$Result$Ok(
									$author$project$State$Boolval(b1 || b2));
							}
						} else {
							return $elm$core$Result$Err('Invalid arguments for this operator');
						}
					},
					A2($author$project$State$eval, y, state));
			},
			A2($author$project$State$eval, x, state));
	});
var $author$project$State$treeToDimsList = F2(
	function (state, ds) {
		if (!ds.b) {
			return $elm$core$Result$Ok(_List_Nil);
		} else {
			var t = ds.a;
			var xs = ds.b;
			return A2(
				$elm$core$Result$andThen,
				function (val) {
					if (val.$ === 'Number') {
						var n = val.a;
						return A2(
							$elm$core$Result$andThen,
							function (ys) {
								return $elm$core$Result$Ok(
									A2($elm$core$List$cons, n, ys));
							},
							A2($author$project$State$treeToDimsList, state, xs));
					} else {
						return $elm$core$Result$Err('Dimension must be a number');
					}
				},
				A2($author$project$State$eval, t, state));
		}
	});
var $author$project$State$treeToId = F2(
	function (state, tree) {
		_v0$3:
		while (true) {
			if ((tree.$ === 'Branch') && tree.b.b) {
				if (tree.b.a.$ === 'Leaf') {
					if ((((((tree.a.$ === 'Id') && (tree.b.a.a.$ === 'Ident')) && tree.b.b.b) && (tree.b.b.a.$ === 'Branch')) && (tree.b.b.a.a.$ === 'Dimensions')) && (!tree.b.b.b.b)) {
						var _v1 = tree.a;
						var _v2 = tree.b;
						var i = _v2.a.a.a;
						var _v3 = _v2.b;
						var _v4 = _v3.a;
						var _v5 = _v4.a;
						var ds = _v4.b;
						return A3($author$project$State$idMaker, state, i, ds);
					} else {
						break _v0$3;
					}
				} else {
					if (((((tree.b.a.a.$ === 'Dimensions') && tree.b.b.b) && (tree.b.b.a.$ === 'Leaf')) && (tree.b.b.a.a.$ === 'Ident')) && (!tree.b.b.b.b)) {
						switch (tree.a.$) {
							case 'DeclareChannel':
								var _v6 = tree.a;
								var _v7 = tree.b;
								var _v8 = _v7.a;
								var _v9 = _v8.a;
								var ds = _v8.b;
								var _v10 = _v7.b;
								var i = _v10.a.a.a;
								return A3($author$project$State$idMaker, state, i, ds);
							case 'DeclareVariable':
								var _v11 = tree.a;
								var _v12 = tree.b;
								var _v13 = _v12.a;
								var _v14 = _v13.a;
								var ds = _v13.b;
								var _v15 = _v12.b;
								var i = _v15.a.a.a;
								return A3($author$project$State$idMaker, state, i, ds);
							default:
								break _v0$3;
						}
					} else {
						break _v0$3;
					}
				}
			} else {
				break _v0$3;
			}
		}
		return $elm$core$Result$Err(
			'problem parsing ident with tree ' + $author$project$State$printTree(tree));
	});
var $author$project$StateUtils$assignVar = F3(
	function (state, _var, val) {
		return A2(
			$elm$core$Result$andThen,
			function (id) {
				return A2($elm$core$Dict$member, id.str, state.chans) ? $elm$core$Result$Err('tried to assign to a channel') : A2(
					$elm$core$Result$andThen,
					function (_v0) {
						var ov = _v0.a;
						var newstate = _v0.b;
						return $elm$core$Result$Ok(newstate);
					},
					A4($author$project$State$derefAndUpdateVariable, val, id.str, id.dims, state));
			},
			A2($author$project$State$treeToId, state, _var));
	});
var $author$project$Model$block = F2(
	function (xs, m) {
		return _Utils_update(
			m,
			{
				waiting: _Utils_ap(xs, m.waiting)
			});
	});
var $author$project$State$ChanArray = function (a) {
	return {$: 'ChanArray', a: a};
};
var $author$project$State$derefAndUpdateChannel = F4(
	function (ch, str, dims, state) {
		var dAUArray = F3(
			function (d, ds, dict) {
				if (!ds.b) {
					var _v1 = A2($elm$core$Dict$get, d, dict);
					if (_v1.$ === 'Just') {
						if (_v1.a.$ === 'ChanArray') {
							return $elm$core$Result$Err('Not enough indexes for array ' + str);
						} else {
							var oldchan = _v1.a.a;
							return $elm$core$Result$Ok(
								_Utils_Tuple2(
									oldchan,
									$author$project$State$ChanArray(
										A3(
											$elm$core$Dict$insert,
											d,
											$author$project$State$ChanSingle(ch),
											dict))));
						}
					} else {
						return $elm$core$Result$Err(
							'Index ' + ($elm$core$String$fromInt(d) + ' out of bounds'));
					}
				} else {
					var i = ds.a;
					var is = ds.b;
					var _v2 = A2($elm$core$Dict$get, d, dict);
					if (_v2.$ === 'Just') {
						if (_v2.a.$ === 'ChanArray') {
							var dict2 = _v2.a.a;
							return A2(
								$elm$core$Result$andThen,
								function (_v3) {
									var oldchan = _v3.a;
									var newstruct = _v3.b;
									return $elm$core$Result$Ok(
										_Utils_Tuple2(
											oldchan,
											$author$project$State$ChanArray(
												A3($elm$core$Dict$insert, d, newstruct, dict))));
								},
								A3(dAUArray, i, is, dict2));
						} else {
							return $elm$core$Result$Err('Too many indexes for array ' + str);
						}
					} else {
						return $elm$core$Result$Err(
							'Index ' + ($elm$core$String$fromInt(d) + ' out of bounds'));
					}
				}
			});
		var _v4 = A2($elm$core$Dict$get, str, state.chans);
		if (_v4.$ === 'Nothing') {
			return $elm$core$Result$Err('Channel ' + (str + ' not declared'));
		} else {
			if (_v4.a.$ === 'ChanArray') {
				var dict = _v4.a.a;
				if (dims.b) {
					var d = dims.a;
					var ds = dims.b;
					return A2(
						$elm$core$Result$andThen,
						function (_v6) {
							var accessedvalue = _v6.a;
							var updatedstruct = _v6.b;
							return $elm$core$Result$Ok(
								_Utils_Tuple2(
									accessedvalue,
									_Utils_update(
										state,
										{
											chans: A3($elm$core$Dict$insert, str, updatedstruct, state.chans)
										})));
						},
						A3(dAUArray, d, ds, dict));
				} else {
					return $elm$core$Result$Err('Not enough indices for array ' + str);
				}
			} else {
				var accessedchan = _v4.a.a;
				if (!dims.b) {
					return $elm$core$Result$Ok(
						_Utils_Tuple2(
							accessedchan,
							_Utils_update(
								state,
								{
									chans: A3(
										$elm$core$Dict$insert,
										str,
										$author$project$State$ChanSingle(ch),
										state.chans)
								})));
				} else {
					return $elm$core$Result$Err('Too many indexes for array ' + str);
				}
			}
		}
	});
var $author$project$StateUtils$dummyChannel = $author$project$State$freshChannel;
var $author$project$StateUtils$accessChannel = F2(
	function (chanid, state) {
		return A2(
			$elm$core$Result$andThen,
			function (_v0) {
				var oldchan = _v0.a;
				return $elm$core$Result$Ok(oldchan);
			},
			A4($author$project$State$derefAndUpdateChannel, $author$project$StateUtils$dummyChannel, chanid.str, chanid.dims, state));
	});
var $author$project$StateUtils$checkFull = F2(
	function (state, _var) {
		return A2(
			$elm$core$Result$andThen,
			function (id) {
				return A2(
					$elm$core$Result$andThen,
					function (ch) {
						return $elm$core$Result$Ok(ch.isFull);
					},
					A2($author$project$StateUtils$accessChannel, id, state));
			},
			A2($author$project$State$treeToId, state, _var));
	});
var $author$project$StateUtils$makeChanArray = function (dimensions) {
	if (!dimensions.b) {
		return $author$project$State$ChanSingle($author$project$State$freshChannel);
	} else {
		var x = dimensions.a;
		var xs = dimensions.b;
		return $author$project$State$ChanArray(
			A3(
				$elm$core$List$foldr,
				function (d) {
					return A2(
						$elm$core$Dict$insert,
						d,
						$author$project$StateUtils$makeChanArray(xs));
				},
				$elm$core$Dict$empty,
				A2($elm$core$List$range, 0, x - 1)));
	}
};
var $author$project$StateUtils$declareChan = F2(
	function (state, _var) {
		return A2(
			$elm$core$Result$andThen,
			function (id) {
				if (A2($elm$core$Dict$member, id.str, state.vars)) {
					return $elm$core$Result$Err('tried to declare ' + (id.str + ' as a channel, but it is already a variable'));
				} else {
					if (A2($elm$core$Dict$member, id.str, state.chans)) {
						return $elm$core$Result$Err(id.str + 'channel already declared');
					} else {
						var freshchans = $author$project$StateUtils$makeChanArray(id.dims);
						return $elm$core$Result$Ok(
							_Utils_update(
								state,
								{
									chans: A3($elm$core$Dict$insert, id.str, freshchans, state.chans)
								}));
					}
				}
			},
			A2($author$project$State$treeToId, state, _var));
	});
var $author$project$StateUtils$makeVarArray = function (dimensions) {
	if (!dimensions.b) {
		return $author$project$State$Any;
	} else {
		var x = dimensions.a;
		var xs = dimensions.b;
		return $author$project$State$Array(
			A3(
				$elm$core$List$foldr,
				function (d) {
					return A2(
						$elm$core$Dict$insert,
						d,
						$author$project$StateUtils$makeVarArray(xs));
				},
				$elm$core$Dict$empty,
				A2($elm$core$List$range, 0, x - 1)));
	}
};
var $author$project$StateUtils$declareVar = F2(
	function (state, _var) {
		return A2(
			$elm$core$Result$andThen,
			function (id) {
				if (A2($elm$core$Dict$member, id.str, state.vars)) {
					return $elm$core$Result$Err('declared a variable ' + (id.str + ' that already exists'));
				} else {
					if (A2($elm$core$Dict$member, id.str, state.chans)) {
						return $elm$core$Result$Err('tried to declare ' + (id.str + ' as a variable, but it is already a channel'));
					} else {
						var freshvars = $author$project$StateUtils$makeVarArray(id.dims);
						return $elm$core$Result$Ok(
							_Utils_update(
								state,
								{
									vars: A3($elm$core$Dict$insert, id.str, freshvars, state.vars)
								}));
					}
				}
			},
			A2($author$project$State$treeToId, state, _var));
	});
var $author$project$StateUtils$graphicschanname = 'GRAPHICS';
var $author$project$Utils$pickValidBranches = F2(
	function (alts, state) {
		var flattenAlt = function (ys) {
			if (!ys.b) {
				return $elm$core$Result$Ok(_List_Nil);
			} else {
				var z = ys.a;
				var zs = ys.b;
				_v1$2:
				while (true) {
					if ((((((z.$ === 'Branch') && (z.a.$ === 'Alternative')) && z.b.b) && (z.b.a.$ === 'Branch')) && z.b.b.b) && (!z.b.b.b.b)) {
						switch (z.b.a.a.$) {
							case 'Guard':
								var _v2 = z.a;
								var _v3 = z.b;
								var _v4 = _v3.a;
								var _v5 = _v4.a;
								var _v6 = _v3.b;
								return A2(
									$elm$core$Result$andThen,
									function (therest) {
										return $elm$core$Result$Ok(
											A2($elm$core$List$cons, z, therest));
									},
									flattenAlt(zs));
							case 'Alt':
								if (((z.b.a.b.b && (z.b.a.b.a.$ === 'Branch')) && (z.b.a.b.a.a.$ === 'AltList')) && (!z.b.a.b.b.b)) {
									var _v7 = z.a;
									var _v8 = z.b;
									var _v9 = _v8.a;
									var _v10 = _v9.a;
									var _v11 = _v9.b;
									var _v12 = _v11.a;
									var _v13 = _v12.a;
									var qs = _v12.b;
									var _v14 = _v8.b;
									return A2(
										$elm$core$Result$andThen,
										function (flattened) {
											return A2(
												$elm$core$Result$andThen,
												function (therest) {
													return $elm$core$Result$Ok(
														_Utils_ap(flattened, therest));
												},
												flattenAlt(zs));
										},
										flattenAlt(qs));
								} else {
									break _v1$2;
								}
							default:
								break _v1$2;
						}
					} else {
						break _v1$2;
					}
				}
				return $elm$core$Result$Err('Invalid ALT branch');
			}
		};
		var filterByGuard = function (ys) {
			if (!ys.b) {
				return $elm$core$Result$Ok(_List_Nil);
			} else {
				var x = ys.a;
				var xs = ys.b;
				return A2(
					$elm$core$Result$andThen,
					function (therest) {
						if ((((((((((x.$ === 'Branch') && (x.a.$ === 'Alternative')) && x.b.b) && (x.b.a.$ === 'Branch')) && (x.b.a.a.$ === 'Guard')) && x.b.a.b.b) && x.b.a.b.b.b) && (!x.b.a.b.b.b.b)) && x.b.b.b) && (!x.b.b.b.b)) {
							var _v17 = x.a;
							var _v18 = x.b;
							var _v19 = _v18.a;
							var _v20 = _v19.a;
							var _v21 = _v19.b;
							var bool = _v21.a;
							var _v22 = _v21.b;
							var input = _v22.a;
							var _v23 = _v18.b;
							var proc = _v23.a;
							var _v24 = A2($author$project$State$eval, bool, state);
							if (_v24.$ === 'Ok') {
								if (_v24.a.$ === 'Boolval') {
									if (_v24.a.a) {
										_v25$2:
										while (true) {
											if (input.$ === 'Branch') {
												switch (input.a.$) {
													case 'In':
														if ((input.b.b && input.b.b.b) && (!input.b.b.b.b)) {
															var _v26 = input.a;
															var _v27 = input.b;
															var chan = _v27.a;
															var _v28 = _v27.b;
															var _var = _v28.a;
															return A2(
																$elm$core$Result$andThen,
																function (f) {
																	return f ? $elm$core$Result$Ok(
																		A2($elm$core$List$cons, x, therest)) : $elm$core$Result$Ok(therest);
																},
																A2($author$project$StateUtils$checkFull, state, chan));
														} else {
															break _v25$2;
														}
													case 'Skip':
														var _v29 = input.a;
														return $elm$core$Result$Ok(
															A2($elm$core$List$cons, x, therest));
													default:
														break _v25$2;
												}
											} else {
												break _v25$2;
											}
										}
										return $elm$core$Result$Err('unexpected channel in alternative branch');
									} else {
										return $elm$core$Result$Ok(therest);
									}
								} else {
									return $elm$core$Result$Err('Expression in front of a guard on an alt branch must be boolean');
								}
							} else {
								var msg = _v24.a;
								return $elm$core$Result$Err(msg);
							}
						} else {
							return $elm$core$Result$Err('Unexpected branch in alternative');
						}
					},
					filterByGuard(xs));
			}
		};
		return A2(
			$elm$core$Result$andThen,
			filterByGuard,
			flattenAlt(alts));
	});
var $elm$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _v0) {
				var trues = _v0.a;
				var falses = _v0.b;
				return pred(x) ? _Utils_Tuple2(
					A2($elm$core$List$cons, x, trues),
					falses) : _Utils_Tuple2(
					trues,
					A2($elm$core$List$cons, x, falses));
			});
		return A3(
			$elm$core$List$foldr,
			step,
			_Utils_Tuple2(_List_Nil, _List_Nil),
			list);
	});
var $author$project$Compile$channelEmptied = F3(
	function (chanid, pid, m) {
		var _v0 = A2(
			$elm$core$List$partition,
			function (wp) {
				return _Utils_eq(
					wp.waitCond,
					$author$project$Model$EmptiedChan(chanid));
			},
			m.waiting);
		var mayUnblock = _v0.a;
		var stillBlocking = _v0.b;
		if (mayUnblock.b) {
			var unblocking = mayUnblock.a;
			var notUnblocking = mayUnblock.b;
			var _v2 = unblocking.proc.code;
			if ((_v2.$ === 'Branch') && (_v2.a.$ === 'Out')) {
				var _v3 = _v2.a;
				return A2(
					$author$project$Compile$Ran,
					_Utils_update(
						m,
						{
							waiting: _Utils_ap(notUnblocking, stillBlocking)
						}),
					_List_fromArray(
						[unblocking.proc.id, pid]));
			} else {
				return $author$project$Compile$RunErr('unexpected process unblocking following a channel being emptied');
			}
		} else {
			return A2(
				$author$project$Compile$Ran,
				m,
				_List_fromArray(
					[pid]));
		}
	});
var $author$project$StateUtils$getValueAndEmptyChannel = F2(
	function (chanid, state) {
		return A2(
			$elm$core$Result$andThen,
			function (_v0) {
				var oldchan = _v0.a;
				var newstate = _v0.b;
				var _v1 = oldchan.isFull;
				if (_v1) {
					return $elm$core$Result$Ok(
						_Utils_Tuple2(oldchan.value, newstate));
				} else {
					return $elm$core$Result$Err('Tried to get value and empty channel, but channel is already empty');
				}
			},
			A4($author$project$State$derefAndUpdateChannel, $author$project$State$freshChannel, chanid.str, chanid.dims, state));
	});
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (result.$ === 'Ok') {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Compile$receiveOnChan = F4(
	function (chan, _var, pid, m) {
		var _v0 = A2($author$project$State$treeToId, m.state, chan);
		if (_v0.$ === 'Ok') {
			var chanid = _v0.a;
			var _v1 = A2($author$project$StateUtils$getValueAndEmptyChannel, chanid, m.state);
			if (_v1.$ === 'Ok') {
				var _v2 = _v1.a;
				var receivedValue = _v2.a;
				var stateChanEmptied = _v2.b;
				var _v3 = A3($author$project$StateUtils$assignVar, stateChanEmptied, _var, receivedValue);
				if (_v3.$ === 'Ok') {
					var stateChanEmptiedAssigned = _v3.a;
					switch (receivedValue.$) {
						case 'Number':
							var n = receivedValue.a;
							return A3(
								$author$project$Compile$channelEmptied,
								chanid,
								pid,
								A2(
									$author$project$Model$print,
									'inputted ' + ($elm$core$String$fromInt(n) + (' to ' + A2(
										$elm$core$Result$withDefault,
										'receiveOnChan ERROR',
										A2(
											$elm$core$Result$andThen,
											function (id) {
												return $elm$core$Result$Ok(id.str);
											},
											A2($author$project$State$treeToId, stateChanEmptiedAssigned, _var))))),
									_Utils_update(
										m,
										{state: stateChanEmptiedAssigned})));
						case 'Any':
							return $author$project$Compile$RunErr('bug - receiving from an empty channel');
						default:
							return $author$project$Compile$RunErr('input to channel was not a number');
					}
				} else {
					var msg = _v3.a;
					return $author$project$Compile$RunErr(msg);
				}
			} else {
				var msg = _v1.a;
				return $author$project$Compile$RunErr(msg);
			}
		} else {
			var msg = _v0.a;
			return $author$project$Compile$RunErr(msg);
		}
	});
var $author$project$Utils$replaceSubtree = F3(
	function (old, _new, code) {
		if (code.$ === 'Branch') {
			var rule = code.a;
			var xs = code.b;
			return _Utils_eq(
				A2($author$project$Readfile$Branch, rule, xs),
				old) ? _new : A2(
				$author$project$Readfile$Branch,
				rule,
				A2(
					$elm$core$List$map,
					A2($author$project$Utils$replaceSubtree, old, _new),
					xs));
		} else {
			var l = code.a;
			return _Utils_eq(
				$author$project$Readfile$Leaf(l),
				old) ? _new : $author$project$Readfile$Leaf(l);
		}
	});
var $author$project$Model$requestRandomUpTo = F2(
	function (n, m) {
		return _Utils_update(
			m,
			{
				randomGenerator: {
					fulfilment: $elm$core$Maybe$Nothing,
					request: $elm$core$Maybe$Just(n)
				}
			});
	});
var $author$project$Compile$channelFilled = F3(
	function (chanid, pid, m) {
		var _v0 = A2(
			$elm$core$List$partition,
			function (wp) {
				return _Utils_eq(
					wp.waitCond,
					$author$project$Model$FilledChan(chanid));
			},
			m.waiting);
		var mayUnblock = _v0.a;
		var stillBlocking = _v0.b;
		if (mayUnblock.b) {
			var unblocking = mayUnblock.a;
			var notUnblocking = mayUnblock.b;
			var _v2 = unblocking.proc.code;
			if (((((_v2.$ === 'Branch') && (_v2.a.$ === 'In')) && _v2.b.b) && _v2.b.b.b) && (!_v2.b.b.b.b)) {
				var _v3 = _v2.a;
				var _v4 = _v2.b;
				var chan2 = _v4.a;
				var _v5 = _v4.b;
				var _var = _v5.a;
				var _v6 = A4(
					$author$project$Compile$receiveOnChan,
					chan2,
					_var,
					unblocking.proc.id,
					_Utils_update(
						m,
						{
							waiting: _Utils_ap(notUnblocking, stillBlocking)
						}));
				if (_v6.$ === 'Ran') {
					var model = _v6.a;
					var xs = _v6.b;
					return A2($author$project$Compile$Ran, model, xs);
				} else {
					var other = _v6;
					return other;
				}
			} else {
				return $author$project$Compile$RunErr('unexpected process unblocking following a channel being filled');
			}
		} else {
			return $author$project$Compile$Blocked(m);
		}
	});
var $author$project$StateUtils$fillChannel = F3(
	function (val, chanid, state) {
		var filledchan = {isFull: true, value: val};
		return A2(
			$elm$core$Result$andThen,
			function (_v0) {
				var newstate = _v0.b;
				return $elm$core$Result$Ok(newstate);
			},
			A4($author$project$State$derefAndUpdateChannel, filledchan, chanid.str, chanid.dims, state));
	});
var $author$project$Model$update = F2(
	function (s, m) {
		return _Utils_update(
			m,
			{state: s});
	});
var $author$project$Compile$sendOnChan = F4(
	function (chanid, val, pid, m) {
		if (val.$ === 'Number') {
			var n = val.a;
			var _v1 = A3($author$project$StateUtils$fillChannel, val, chanid, m.state);
			if (_v1.$ === 'Ok') {
				var updatedState = _v1.a;
				return A3(
					$author$project$Compile$channelFilled,
					chanid,
					pid,
					A2(
						$author$project$Model$print,
						'outputted ' + ($elm$core$String$fromInt(n) + (' to ' + chanid.str)),
						A2($author$project$Model$update, updatedState, m)));
			} else {
				var msg = _v1.a;
				return $author$project$Compile$RunErr(msg);
			}
		} else {
			return $author$project$Compile$RunErr('Channels are integer only at the moment');
		}
	});
var $author$project$Model$spawnAndWait = F5(
	function (runner, waiter, parent, ancestor, m) {
		var _v0 = $author$project$Model$getNext(m.ids);
		var i = _v0.a;
		var ids2 = _v0.b;
		var _v1 = $author$project$Model$getNext(ids2);
		var j = _v1.a;
		var ids3 = _v1.b;
		var blocked_proc = {ancestorId: ancestor, code: waiter, id: j};
		var waitingproc = {
			proc: blocked_proc,
			waitCond: $author$project$Model$Terminated(
				_List_fromArray(
					[i]))
		};
		var spawned_proc = {
			ancestorId: $elm$core$Maybe$Just(j),
			code: runner,
			id: i
		};
		return A2(
			$author$project$Model$basic_spawn,
			_List_fromArray(
				[spawned_proc]),
			A2(
				$author$project$Model$block,
				_List_fromArray(
					[waitingproc]),
				A3(
					$author$project$Model$updateWaitCond,
					parent,
					_List_fromArray(
						[j]),
					_Utils_update(
						m,
						{ids: ids3}))));
	});
var $author$project$Model$takeFulfilled = function (m) {
	return _Utils_Tuple2(
		_Utils_update(
			m,
			{
				randomGenerator: {fulfilment: $elm$core$Maybe$Nothing, request: $elm$core$Maybe$Nothing}
			}),
		m.randomGenerator.fulfilment);
};
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Utils$updateCoord = F4(
	function (n, x, y, graphics) {
		var newcol = function () {
			if ((0 <= x) && (_Utils_cmp(
				x,
				$elm$core$List$length(graphics)) < 0)) {
				var _v0 = $elm$core$List$head(
					A2($elm$core$List$drop, x, graphics));
				if (_v0.$ === 'Just') {
					var somecol = _v0.a;
					return ((0 <= y) && (_Utils_cmp(
						y,
						$elm$core$List$length(graphics)) < 0)) ? $elm$core$Result$Ok(
						_Utils_ap(
							A2($elm$core$List$take, y, somecol),
							A2(
								$elm$core$List$cons,
								n,
								A2($elm$core$List$drop, y + 1, somecol)))) : $elm$core$Result$Err('Graphics y-coordinate out of bounds');
				} else {
					return $elm$core$Result$Err('Graphics x-coordinate out of bounds');
				}
			} else {
				return $elm$core$Result$Err('Graphics x-coordinate out of bounds');
			}
		}();
		return A2(
			$elm$core$Result$andThen,
			function (col) {
				return $elm$core$Result$Ok(
					_Utils_ap(
						A2($elm$core$List$take, x, graphics),
						A2(
							$elm$core$List$cons,
							col,
							A2($elm$core$List$drop, x + 1, graphics))));
			},
			newcol);
	});
var $author$project$Utils$updateCell = F3(
	function (model, value, cid) {
		switch (value.$) {
			case 'Number':
				var n = value.a;
				var _v1 = cid.dims;
				if ((_v1.b && _v1.b.b) && (!_v1.b.b.b)) {
					var x = _v1.a;
					var _v2 = _v1.b;
					var y = _v2.a;
					return A2(
						$elm$core$Result$andThen,
						function (newGraphics) {
							return $elm$core$Result$Ok(
								_Utils_update(
									model,
									{graphics: newGraphics}));
						},
						A4($author$project$Utils$updateCoord, n, x, y, model.graphics));
				} else {
					return $elm$core$Result$Err('Incorrect number of dimensions for graphics channel array (requires 2)');
				}
			case 'Boolval':
				return $elm$core$Result$Err('Cannot output boolean to a pixel');
			case 'Array':
				return $elm$core$Result$Err('Cannot output array to a pixel');
			default:
				return $elm$core$Result$Err('Trying to output value which has not been set yet to a pixel');
		}
	});
var $author$project$Compile$step = F2(
	function (e, m) {
		var state = m.state;
		var pid = e.id;
		var ranMe = function (model) {
			return A2(
				$author$project$Compile$Ran,
				model,
				_List_fromArray(
					[pid]));
		};
		var unrolledMe = function (model) {
			return A2($author$project$Compile$Unrolled, model, pid);
		};
		var aid = e.ancestorId;
		var _v0 = e.code;
		_v0$12:
		while (true) {
			if (_v0.$ === 'Leaf') {
				var l = _v0.a;
				return $author$project$Compile$RunErr('Tried to run variable');
			} else {
				switch (_v0.a.$) {
					case 'Par':
						var _v1 = _v0.a;
						var xs = _v0.b;
						_v2$2:
						while (true) {
							if (xs.b && (xs.a.$ === 'Branch')) {
								if (!xs.b.b) {
									if (xs.a.a.$ === 'ProcList') {
										var _v3 = xs.a;
										var _v4 = _v3.a;
										var ys = _v3.b;
										return unrolledMe(
											A4($author$project$Model$spawn, ys, pid, aid, m));
									} else {
										break _v2$2;
									}
								} else {
									if ((((((xs.a.a.$ === 'Replicator') && xs.a.b.b) && xs.a.b.b.b) && xs.a.b.b.b.b) && (!xs.a.b.b.b.b.b)) && (!xs.b.b.b)) {
										var _v5 = xs.a;
										var _v6 = _v5.a;
										var _v7 = _v5.b;
										var v1 = _v7.a;
										var _v8 = _v7.b;
										var e1 = _v8.a;
										var _v9 = _v8.b;
										var e2 = _v9.a;
										var _v10 = xs.b;
										var proc = _v10.a;
										var _v11 = _Utils_Tuple2(
											A2($author$project$State$eval, e1, state),
											A2($author$project$State$eval, e2, state));
										if ((((_v11.a.$ === 'Ok') && (_v11.a.a.$ === 'Number')) && (_v11.b.$ === 'Ok')) && (_v11.b.a.$ === 'Number')) {
											var k = _v11.a.a.a;
											var l = _v11.b.a.a;
											if (_Utils_cmp(k, l) > 0) {
												return ranMe(m);
											} else {
												var replaceWithNumber = function (n) {
													return A3(
														$author$project$Utils$replaceSubtree,
														v1,
														$author$project$Readfile$Leaf(
															$author$project$Readfile$Num(n)),
														proc);
												};
												var allReplaced = A2(
													$elm$core$List$map,
													replaceWithNumber,
													A2($elm$core$List$range, k, l));
												return unrolledMe(
													A4($author$project$Model$spawn, allReplaced, pid, aid, m));
											}
										} else {
											return $author$project$Compile$RunErr('Error evaluating replicator');
										}
									} else {
										break _v2$2;
									}
								}
							} else {
								break _v2$2;
							}
						}
						return $author$project$Compile$RunErr('PAR rule must be followed by process list or replicator only');
					case 'Seq':
						var _v12 = _v0.a;
						var xs = _v0.b;
						_v13$3:
						while (true) {
							if (xs.b && (xs.a.$ === 'Branch')) {
								if (!xs.a.b.b) {
									if ((xs.a.a.$ === 'ProcList') && (!xs.b.b)) {
										var _v14 = xs.a;
										var _v15 = _v14.a;
										return ranMe(m);
									} else {
										break _v13$3;
									}
								} else {
									if (!xs.b.b) {
										if (xs.a.a.$ === 'ProcList') {
											var _v16 = xs.a;
											var _v17 = _v16.a;
											var _v18 = _v16.b;
											var y = _v18.a;
											var ys = _v18.b;
											return unrolledMe(
												A5(
													$author$project$Model$spawnAndWait,
													y,
													A2(
														$author$project$Readfile$Branch,
														$author$project$Readfile$Seq,
														_List_fromArray(
															[
																A2($author$project$Readfile$Branch, $author$project$Readfile$ProcList, ys)
															])),
													pid,
													aid,
													m));
										} else {
											break _v13$3;
										}
									} else {
										if (((((xs.a.a.$ === 'Replicator') && xs.a.b.b.b) && xs.a.b.b.b.b) && (!xs.a.b.b.b.b.b)) && (!xs.b.b.b)) {
											var _v19 = xs.a;
											var _v20 = _v19.a;
											var _v21 = _v19.b;
											var v1 = _v21.a;
											var _v22 = _v21.b;
											var e1 = _v22.a;
											var _v23 = _v22.b;
											var e2 = _v23.a;
											var _v24 = xs.b;
											var proc = _v24.a;
											var _v25 = _Utils_Tuple2(
												A2($author$project$State$eval, e1, state),
												A2($author$project$State$eval, e2, state));
											if ((((_v25.a.$ === 'Ok') && (_v25.a.a.$ === 'Number')) && (_v25.b.$ === 'Ok')) && (_v25.b.a.$ === 'Number')) {
												var k = _v25.a.a.a;
												var l = _v25.b.a.a;
												if (_Utils_cmp(k, l) > 0) {
													return ranMe(m);
												} else {
													var replicated = A3(
														$author$project$Utils$replaceSubtree,
														v1,
														$author$project$Readfile$Leaf(
															$author$project$Readfile$Num(k)),
														proc);
													var nextMe = A2(
														$author$project$Readfile$Branch,
														$author$project$Readfile$Seq,
														_List_fromArray(
															[
																A2(
																$author$project$Readfile$Branch,
																$author$project$Readfile$Replicator,
																_List_fromArray(
																	[
																		v1,
																		$author$project$Readfile$Leaf(
																		$author$project$Readfile$Num(k + 1)),
																		$author$project$Readfile$Leaf(
																		$author$project$Readfile$Num(l))
																	])),
																proc
															]));
													return unrolledMe(
														A5($author$project$Model$spawnAndWait, replicated, nextMe, pid, aid, m));
												}
											} else {
												return $author$project$Compile$RunErr('Error evaluating replicator');
											}
										} else {
											break _v13$3;
										}
									}
								}
							} else {
								break _v13$3;
							}
						}
						return $author$project$Compile$RunErr('SEQ rule must be followed by process list or replicator only');
					case 'In':
						if ((_v0.b.b && _v0.b.b.b) && (!_v0.b.b.b.b)) {
							var _v26 = _v0.a;
							var _v27 = _v0.b;
							var chan = _v27.a;
							var _v28 = _v27.b;
							var _var = _v28.a;
							var _v29 = A2($author$project$StateUtils$checkFull, state, chan);
							if (_v29.$ === 'Ok') {
								if (_v29.a) {
									return A4($author$project$Compile$receiveOnChan, chan, _var, pid, m);
								} else {
									var _v30 = A2($author$project$State$treeToId, state, chan);
									if (_v30.$ === 'Ok') {
										var chanid = _v30.a;
										return $author$project$Compile$Blocked(
											A2(
												$author$project$Model$block,
												_List_fromArray(
													[
														{
														proc: e,
														waitCond: $author$project$Model$FilledChan(chanid)
													}
													]),
												m));
									} else {
										var msg = _v30.a;
										return $author$project$Compile$RunErr(msg);
									}
								}
							} else {
								var msg = _v29.a;
								return $author$project$Compile$RunErr('tried to get input but ' + msg);
							}
						} else {
							break _v0$12;
						}
					case 'Out':
						if ((_v0.b.b && _v0.b.b.b) && (!_v0.b.b.b.b)) {
							var _v31 = _v0.a;
							var _v32 = _v0.b;
							var chan = _v32.a;
							var _v33 = _v32.b;
							var expr = _v33.a;
							var _v34 = A2($author$project$State$eval, expr, state);
							if (_v34.$ === 'Ok') {
								var n = _v34.a;
								var _v35 = A2($author$project$State$treeToId, state, chan);
								if (_v35.$ === 'Ok') {
									var chanid = _v35.a;
									if (_Utils_eq(chanid.str, $author$project$StateUtils$graphicschanname)) {
										var _v36 = A3($author$project$Utils$updateCell, m, n, chanid);
										if (_v36.$ === 'Ok') {
											var updatedModel = _v36.a;
											return ranMe(updatedModel);
										} else {
											var msg = _v36.a;
											return $author$project$Compile$RunErr(msg);
										}
									} else {
										var _v37 = A2($author$project$StateUtils$checkFull, state, chan);
										if (_v37.$ === 'Ok') {
											if (_v37.a) {
												return $author$project$Compile$RunErr('Occam doesn\'t allow more than one parallel process to output to the same channel');
											} else {
												var waiting = {
													proc: e,
													waitCond: $author$project$Model$EmptiedChan(chanid)
												};
												return A4(
													$author$project$Compile$sendOnChan,
													chanid,
													n,
													pid,
													A2(
														$author$project$Model$block,
														_List_fromArray(
															[waiting]),
														m));
											}
										} else {
											var msg = _v37.a;
											return $author$project$Compile$RunErr('tried to output to a channel but ' + msg);
										}
									}
								} else {
									var msg = _v35.a;
									return $author$project$Compile$RunErr('tried to output to a channel but ' + msg);
								}
							} else {
								var msg = _v34.a;
								return $author$project$Compile$RunErr('tried to output a value but ' + msg);
							}
						} else {
							break _v0$12;
						}
					case 'Alt':
						if (_v0.b.b && (!_v0.b.b.b)) {
							var _v38 = _v0.a;
							var _v39 = _v0.b;
							var x = _v39.a;
							if ((x.$ === 'Branch') && (x.a.$ === 'AltList')) {
								var _v41 = x.a;
								var xs = x.b;
								var enactAlternative = F2(
									function (a, model) {
										if ((((((((((a.$ === 'Branch') && (a.a.$ === 'Alternative')) && a.b.b) && (a.b.a.$ === 'Branch')) && (a.b.a.a.$ === 'Guard')) && a.b.a.b.b) && a.b.a.b.b.b) && (!a.b.a.b.b.b.b)) && a.b.b.b) && (!a.b.b.b.b)) {
											var _v47 = a.a;
											var _v48 = a.b;
											var _v49 = _v48.a;
											var _v50 = _v49.a;
											var _v51 = _v49.b;
											var bool = _v51.a;
											var _v52 = _v51.b;
											var action = _v52.a;
											var _v53 = _v48.b;
											var proc = _v53.a;
											_v54$2:
											while (true) {
												if (action.$ === 'Branch') {
													switch (action.a.$) {
														case 'In':
															if ((action.b.b && action.b.b.b) && (!action.b.b.b.b)) {
																var _v55 = action.a;
																var _v56 = action.b;
																var chan = _v56.a;
																var _v57 = _v56.b;
																var _var = _v57.a;
																return A4(
																	$author$project$Compile$receiveOnChan,
																	chan,
																	_var,
																	pid,
																	A4(
																		$author$project$Model$spawn,
																		_List_fromArray(
																			[proc]),
																		pid,
																		aid,
																		model));
															} else {
																break _v54$2;
															}
														case 'Skip':
															var _v58 = action.a;
															return ranMe(
																A4(
																	$author$project$Model$spawn,
																	_List_fromArray(
																		[proc]),
																	pid,
																	aid,
																	model));
														default:
															break _v54$2;
													}
												} else {
													break _v54$2;
												}
											}
											return $author$project$Compile$RunErr('Invalid alt guard');
										} else {
											return $author$project$Compile$RunErr('Invalid alt branch');
										}
									});
								var _v42 = A2($author$project$Utils$pickValidBranches, xs, state);
								if (_v42.$ === 'Ok') {
									if (!_v42.a.b) {
										return ranMe(m);
									} else {
										var ys = _v42.a;
										var _v43 = $author$project$Model$takeFulfilled(m);
										if (_v43.b.$ === 'Nothing') {
											var model = _v43.a;
											var _v44 = _v43.b;
											return $author$project$Compile$Requesting(
												A2(
													$author$project$Model$requestRandomUpTo,
													$elm$core$List$length(ys),
													A2(
														$author$project$Model$print,
														'Requesting random one of ' + $elm$core$String$fromInt(
															$elm$core$List$length(ys)),
														model)));
										} else {
											var model = _v43.a;
											var rand = _v43.b.a;
											var _v45 = $elm$core$List$head(
												A2($elm$core$List$drop, rand, ys));
											if (_v45.$ === 'Just') {
												var a = _v45.a;
												return A2(enactAlternative, a, model);
											} else {
												return $author$project$Compile$RunErr(
													'randomly picking alt branch failed! I think there are ' + ($elm$core$String$fromInt(
														$elm$core$List$length(ys)) + (' branches but I got the number ' + $elm$core$String$fromInt(rand))));
											}
										}
									}
								} else {
									var msg = _v42.a;
									return $author$project$Compile$RunErr(msg);
								}
							} else {
								return $author$project$Compile$RunErr('ALT must be followed by a list of alternatives');
							}
						} else {
							break _v0$12;
						}
					case 'AssignExpr':
						if ((_v0.b.b && _v0.b.b.b) && (!_v0.b.b.b.b)) {
							var _v59 = _v0.a;
							var _v60 = _v0.b;
							var id = _v60.a;
							var _v61 = _v60.b;
							var e1 = _v61.a;
							var _v62 = A2($author$project$State$eval, e1, state);
							if (_v62.$ === 'Ok') {
								var v = _v62.a;
								var _v63 = A3($author$project$StateUtils$assignVar, state, id, v);
								if (_v63.$ === 'Ok') {
									var s = _v63.a;
									return ranMe(
										A2($author$project$Model$update, s, m));
								} else {
									var msg = _v63.a;
									return $author$project$Compile$RunErr(msg);
								}
							} else {
								var msg = _v62.a;
								return $author$project$Compile$RunErr(msg);
							}
						} else {
							break _v0$12;
						}
					case 'While':
						if ((_v0.b.b && _v0.b.b.b) && (!_v0.b.b.b.b)) {
							var _v64 = _v0.a;
							var _v65 = _v0.b;
							var cond = _v65.a;
							var _v66 = _v65.b;
							var body = _v66.a;
							var _v67 = A2($author$project$State$eval, cond, state);
							if ((_v67.$ === 'Ok') && (_v67.a.$ === 'Boolval')) {
								if (_v67.a.a) {
									return unrolledMe(
										A5($author$project$Model$spawnAndWait, body, e.code, pid, aid, m));
								} else {
									return ranMe(m);
								}
							} else {
								return $author$project$Compile$RunErr('Condition must evaluate to boolean value');
							}
						} else {
							break _v0$12;
						}
					case 'Cond':
						if (_v0.b.b && (!_v0.b.b.b)) {
							var _v68 = _v0.a;
							var _v69 = _v0.b;
							var choicelist = _v69.a;
							var getFirstRestChoices = function (ys) {
								if (!ys.b) {
									return $elm$core$Result$Err('No choices left');
								} else {
									var z = ys.a;
									var zs = ys.b;
									_v71$2:
									while (true) {
										if (z.$ === 'Branch') {
											switch (z.a.$) {
												case 'GuardedChoice':
													var _v72 = z.a;
													return $elm$core$Result$Ok(
														_Utils_Tuple2(z, zs));
												case 'Cond':
													if (((z.b.b && (z.b.a.$ === 'Branch')) && (z.b.a.a.$ === 'ChoiceList')) && (!z.b.b.b)) {
														var _v73 = z.a;
														var _v74 = z.b;
														var _v75 = _v74.a;
														var _v76 = _v75.a;
														var qs = _v75.b;
														return A2(
															$elm$core$Result$andThen,
															function (_v77) {
																var first = _v77.a;
																var rest = _v77.b;
																if (!rest.b) {
																	return $elm$core$Result$Ok(
																		_Utils_Tuple2(first, zs));
																} else {
																	var ps = rest;
																	return $elm$core$Result$Ok(
																		_Utils_Tuple2(
																			first,
																			A2(
																				$elm$core$List$cons,
																				A2($author$project$Readfile$Branch, $author$project$Readfile$ChoiceList, ps),
																				zs)));
																}
															},
															getFirstRestChoices(qs));
													} else {
														break _v71$2;
													}
												default:
													break _v71$2;
											}
										} else {
											break _v71$2;
										}
									}
									return $elm$core$Result$Err('Invalid IF branch');
								}
							};
							if ((choicelist.$ === 'Branch') && (choicelist.a.$ === 'ChoiceList')) {
								if (!choicelist.b.b) {
									var _v80 = choicelist.a;
									return ranMe(m);
								} else {
									var _v81 = choicelist.a;
									var xs = choicelist.b;
									var _v82 = getFirstRestChoices(xs);
									if (_v82.$ === 'Ok') {
										if (((((_v82.a.a.$ === 'Branch') && (_v82.a.a.a.$ === 'GuardedChoice')) && _v82.a.a.b.b) && _v82.a.a.b.b.b) && (!_v82.a.a.b.b.b.b)) {
											var _v83 = _v82.a;
											var _v84 = _v83.a;
											var _v85 = _v84.a;
											var _v86 = _v84.b;
											var cond = _v86.a;
											var _v87 = _v86.b;
											var proc = _v87.a;
											var ys = _v83.b;
											var _v88 = A2($author$project$State$eval, cond, state);
											if (_v88.$ === 'Ok') {
												if (_v88.a.$ === 'Boolval') {
													if (_v88.a.a) {
														return ranMe(
															A4(
																$author$project$Model$spawn,
																_List_fromArray(
																	[proc]),
																pid,
																aid,
																m));
													} else {
														return unrolledMe(
															A4(
																$author$project$Model$spawn,
																_List_fromArray(
																	[
																		A2(
																		$author$project$Readfile$Branch,
																		$author$project$Readfile$Cond,
																		_List_fromArray(
																			[
																				A2($author$project$Readfile$Branch, $author$project$Readfile$ChoiceList, ys)
																			]))
																	]),
																pid,
																aid,
																m));
													}
												} else {
													return $author$project$Compile$RunErr('problem evaluating if condition');
												}
											} else {
												var msg = _v88.a;
												return $author$project$Compile$RunErr('Failed to evaluate if condition: ' + msg);
											}
										} else {
											return $author$project$Compile$RunErr('problem evaluating IF');
										}
									} else {
										var msg = _v82.a;
										return $author$project$Compile$RunErr('couldn\'t evaluate IF: ' + msg);
									}
								}
							} else {
								return $author$project$Compile$RunErr('invalid syntax for IF statement');
							}
						} else {
							break _v0$12;
						}
					case 'DeclareVariable':
						var _v89 = _v0.a;
						var _v90 = A2($author$project$StateUtils$declareVar, state, e.code);
						if (_v90.$ === 'Ok') {
							var state2 = _v90.a;
							return ranMe(
								A2($author$project$Model$update, state2, m));
						} else {
							var msg = _v90.a;
							return $author$project$Compile$RunErr(msg);
						}
					case 'DeclareChannel':
						var _v91 = _v0.a;
						var _v92 = A2($author$project$StateUtils$declareChan, state, e.code);
						if (_v92.$ === 'Ok') {
							var state2 = _v92.a;
							return ranMe(
								A2($author$project$Model$update, state2, m));
						} else {
							var msg = _v92.a;
							return $author$project$Compile$RunErr(msg);
						}
					case 'Skip':
						if (!_v0.b.b) {
							var _v93 = _v0.a;
							return ranMe(m);
						} else {
							break _v0$12;
						}
					default:
						break _v0$12;
				}
			}
		}
		var s = _v0.a;
		return $author$project$Compile$RunErr('Wrong tree structure');
	});
var $author$project$Compile$make_step = F2(
	function (m, n) {
		var _v0 = m.running;
		if (_v0.b) {
			var x = _v0.a;
			var xs = _v0.b;
			var notChosen = _Utils_ap(
				A2($elm$core$List$take, n, m.running),
				A2($elm$core$List$drop, n + 1, m.running));
			var chosen = $elm$core$List$head(
				A2($elm$core$List$drop, n, m.running));
			if (chosen.$ === 'Just') {
				var t = chosen.a;
				var m2 = _Utils_update(
					m,
					{running: notChosen});
				return A2($author$project$Compile$step, t, m2);
			} else {
				return $author$project$Compile$RunErr('Failed to choose a thread - Number out of bounds');
			}
		} else {
			return $author$project$Compile$Blocked(m);
		}
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Compile$unblock = F2(
	function (model, ids) {
		var unblock_once = F2(
			function (m, id) {
				var updatedAfterTermination = A2(
					$elm$core$List$map,
					function (p) {
						var _v2 = p.waitCond;
						if (_v2.$ === 'Terminated') {
							var xs = _v2.a;
							return _Utils_update(
								p,
								{
									waitCond: $author$project$Model$Terminated(
										A2(
											$elm$core$List$filter,
											function (x) {
												return !_Utils_eq(x, id);
											},
											xs))
								});
						} else {
							return p;
						}
					},
					m.waiting);
				var _v1 = A2(
					$elm$core$List$partition,
					function (p) {
						return _Utils_eq(
							p.waitCond,
							$author$project$Model$Terminated(_List_Nil));
					},
					updatedAfterTermination);
				var unblocked = _v1.a;
				var stillWaiting = _v1.b;
				var unblockedProcs = A2(
					$elm$core$List$map,
					function (p) {
						return p.proc;
					},
					unblocked);
				return $elm$core$Result$Ok(
					A2(
						$author$project$Model$basic_spawn,
						unblockedProcs,
						_Utils_update(
							m,
							{waiting: stillWaiting})));
			});
		if (!ids.b) {
			return $elm$core$Result$Ok(model);
		} else {
			var x = ids.a;
			var xs = ids.b;
			return A2(
				$elm$core$Result$andThen,
				function (newm) {
					return A2($author$project$Compile$unblock, newm, xs);
				},
				A2(unblock_once, model, x));
		}
	});
var $author$project$Compile$chainRun = F3(
	function (model, f, g) {
		var _v0 = f(model);
		switch (_v0.$) {
			case 'Ran':
				var m = _v0.a;
				var xs = _v0.b;
				var _v1 = g(m);
				switch (_v1.$) {
					case 'Ran':
						var m2 = _v1.a;
						var ys = _v1.b;
						return A2(
							$author$project$Compile$Ran,
							m2,
							_Utils_ap(xs, ys));
					case 'Blocked':
						var m2 = _v1.a;
						return A2($author$project$Compile$Ran, m2, xs);
					case 'RunErr':
						var msg = _v1.a;
						return $author$project$Compile$RunErr(msg);
					default:
						return $author$project$Compile$RunErr('unexpected chainrun');
				}
			case 'Blocked':
				var m = _v0.a;
				var _v2 = g(m);
				switch (_v2.$) {
					case 'Ran':
						var m2 = _v2.a;
						var ys = _v2.b;
						return A2($author$project$Compile$Ran, m2, ys);
					case 'Blocked':
						var m2 = _v2.a;
						return $author$project$Compile$Blocked(m2);
					case 'RunErr':
						var msg = _v2.a;
						return $author$project$Compile$RunErr(msg);
					default:
						return $author$project$Compile$RunErr('unexpected chainrun');
				}
			case 'RunErr':
				var msg = _v0.a;
				return $author$project$Compile$RunErr(msg);
			default:
				return $author$project$Compile$RunErr('unexpected chainrun');
		}
	});
var $author$project$Model$display = F2(
	function (n, m) {
		return _Utils_update(
			m,
			{
				display: A2($elm$core$List$cons, n, m.display)
			});
	});
var $author$project$StateUtils$displaychanid = {dims: _List_Nil, str: $author$project$StateUtils$displaychanname};
var $author$project$Compile$updateDisplay = function (m) {
	var _v0 = A2(
		$author$project$StateUtils$checkFull,
		m.state,
		A2(
			$author$project$Readfile$Branch,
			$author$project$Readfile$Id,
			_List_fromArray(
				[
					$author$project$Readfile$Leaf(
					$author$project$Readfile$Ident($author$project$StateUtils$displaychanname)),
					A2($author$project$Readfile$Branch, $author$project$Readfile$Dimensions, _List_Nil)
				])));
	if (_v0.$ === 'Ok') {
		if (_v0.a) {
			var _v1 = A2($author$project$StateUtils$getValueAndEmptyChannel, $author$project$StateUtils$displaychanid, m.state);
			if (_v1.$ === 'Ok') {
				var _v2 = _v1.a;
				var value = _v2.a;
				var newState = _v2.b;
				if (value.$ === 'Number') {
					var n = value.a;
					return A3(
						$author$project$Compile$channelEmptied,
						$author$project$StateUtils$displaychanid,
						-1,
						A2(
							$author$project$Model$update,
							newState,
							A2($author$project$Model$display, n, m)));
				} else {
					return $author$project$Compile$RunErr('Invalid output to the display (currently requires a number)');
				}
			} else {
				var msg = _v1.a;
				return $author$project$Compile$RunErr(msg);
			}
		} else {
			return A2($author$project$Compile$Ran, m, _List_Nil);
		}
	} else {
		var msg = _v0.a;
		return $author$project$Compile$RunErr('tried to check for a message to the display, but ' + msg);
	}
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (maybeValue.$ === 'Just') {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Model$deqKeypress = function (m) {
	var len = $elm$core$List$length(m.keyboardBuffer);
	return A2(
		$elm$core$Maybe$andThen,
		function (dir) {
			return $elm$core$Maybe$Just(
				_Utils_Tuple2(
					dir,
					_Utils_update(
						m,
						{
							keyboardBuffer: A2($elm$core$List$take, len - 1, m.keyboardBuffer)
						})));
		},
		$elm$core$List$head(
			A2($elm$core$List$drop, len - 1, m.keyboardBuffer)));
};
var $author$project$Utils$dirToValue = function (dir) {
	switch (dir.$) {
		case 'Key1':
			return $author$project$State$Number(1);
		case 'Key2':
			return $author$project$State$Number(2);
		case 'Key3':
			return $author$project$State$Number(3);
		case 'Key4':
			return $author$project$State$Number(4);
		case 'Key5':
			return $author$project$State$Number(5);
		case 'Key6':
			return $author$project$State$Number(6);
		case 'Key7':
			return $author$project$State$Number(7);
		case 'Key8':
			return $author$project$State$Number(8);
		case 'Key9':
			return $author$project$State$Number(9);
		default:
			return $author$project$State$Number(0);
	}
};
var $author$project$Compile$updateKeyboard = function (m) {
	var _v0 = $author$project$Model$deqKeypress(m);
	if (_v0.$ === 'Just') {
		var _v1 = _v0.a;
		var dir = _v1.a;
		var m2 = _v1.b;
		var _v2 = A2(
			$author$project$StateUtils$checkFull,
			m2.state,
			A2(
				$author$project$Readfile$Branch,
				$author$project$Readfile$Id,
				_List_fromArray(
					[
						$author$project$Readfile$Leaf(
						$author$project$Readfile$Ident($author$project$StateUtils$keyboardchanname)),
						A2($author$project$Readfile$Branch, $author$project$Readfile$Dimensions, _List_Nil)
					])));
		if (_v2.$ === 'Ok') {
			if (_v2.a) {
				return A2($author$project$Compile$Ran, m, _List_Nil);
			} else {
				return A4(
					$author$project$Compile$sendOnChan,
					$author$project$StateUtils$keyboardchanid,
					$author$project$Utils$dirToValue(dir),
					-2,
					m2);
			}
		} else {
			var msg = _v2.a;
			return $author$project$Compile$RunErr('tried to update keyboard, but ' + msg);
		}
	} else {
		return A2($author$project$Compile$Ran, m, _List_Nil);
	}
};
var $author$project$Compile$updateIO = function (model) {
	return A3($author$project$Compile$chainRun, model, $author$project$Compile$updateDisplay, $author$project$Compile$updateKeyboard);
};
var $author$project$Compile$run = F2(
	function (m, n) {
		var _v0 = A2($author$project$Compile$make_step, m, n);
		switch (_v0.$) {
			case 'Ran':
				var model = _v0.a;
				var ids = _v0.b;
				var _v1 = $author$project$Compile$updateIO(model);
				switch (_v1.$) {
					case 'Ran':
						var model2 = _v1.a;
						var ids2 = _v1.b;
						return A2(
							$author$project$Compile$unblock,
							model2,
							_Utils_ap(ids, ids2));
					case 'RunErr':
						var msg = _v1.a;
						return $elm$core$Result$Err(msg);
					default:
						return $elm$core$Result$Err('unexpected result from IO');
				}
			case 'Unrolled':
				var model = _v0.a;
				var id = _v0.b;
				return A2(
					$elm$core$Result$andThen,
					function (newm) {
						return A2($author$project$Compile$run, newm, n);
					},
					A2(
						$author$project$Compile$unblock,
						model,
						_List_fromArray(
							[id])));
			case 'Blocked':
				var model = _v0.a;
				var _v2 = $author$project$Compile$updateIO(model);
				switch (_v2.$) {
					case 'Ran':
						var model2 = _v2.a;
						var ids2 = _v2.b;
						return A2($author$project$Compile$unblock, model2, ids2);
					case 'RunErr':
						var msg = _v2.a;
						return $elm$core$Result$Err(msg);
					default:
						return $elm$core$Result$Err('unexpected result from IO');
				}
			case 'Requesting':
				var model = _v0.a;
				return $elm$core$Result$Ok(model);
			default:
				var msg = _v0.a;
				return $elm$core$Result$Err(msg);
		}
	});
var $author$project$Model$setRunFlag = function (m) {
	return _Utils_update(
		m,
		{runFlag: true});
};
var $author$project$Model$unsetRunFlag = function (m) {
	return _Utils_update(
		m,
		{runFlag: false});
};
var $author$project$Model$updateSeed = F2(
	function (seed, model) {
		return _Utils_update(
			model,
			{randomSeed: seed});
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 'Step':
					if ($author$project$Model$isBlocked(model) && (!$author$project$Model$isWaitingForKeyboard(model))) {
						if ($author$project$Model$isFinished(model)) {
							var $temp$msg = $author$project$Main$StopRunning,
								$temp$model = A2($author$project$Model$print, 'Program finished', model);
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							var $temp$msg = $author$project$Main$StopRunning,
								$temp$model = A2($author$project$Model$print, 'Program blocked', model);
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						}
					} else {
						var _v1 = A3(
							$author$project$Main$randomBelow,
							model.randomSeed,
							$author$project$Main$Thread,
							$elm$core$List$length(model.running));
						var cmdmsg = _v1.a;
						var seed = _v1.b;
						return _Utils_Tuple2(
							A2($author$project$Model$updateSeed, seed, model),
							cmdmsg);
					}
				case 'Thread':
					var n = msg.a;
					var _v2 = A2($author$project$Compile$run, model, n);
					if (_v2.$ === 'Ok') {
						var m = _v2.a;
						var _v3 = m.randomGenerator.request;
						if (_v3.$ === 'Just') {
							var k = _v3.a;
							var _v4 = A3(
								$author$project$Main$randomBelow,
								m.randomSeed,
								$author$project$Main$Fulfilment(
									$author$project$Main$Thread(n)),
								k);
							var cmdmsg = _v4.a;
							var seed = _v4.b;
							return _Utils_Tuple2(
								A2($author$project$Model$updateSeed, seed, model),
								cmdmsg);
						} else {
							return _Utils_Tuple2(m, $elm$core$Platform$Cmd$none);
						}
					} else {
						var s = _v2.a;
						return _Utils_Tuple2(
							A2($author$project$Model$print, s, model),
							$elm$core$Platform$Cmd$none);
					}
				case 'Fulfilment':
					var t = msg.a;
					var f = msg.b;
					var $temp$msg = t,
						$temp$model = A2($author$project$Model$fulfilRandom, f, model);
					msg = $temp$msg;
					model = $temp$model;
					continue update;
				case 'RunUntil':
					var n = msg.a;
					if ($author$project$Model$isBlocked(model)) {
						if ($author$project$Model$isFinished(model)) {
							var $temp$msg = $author$project$Main$StopRunning,
								$temp$model = A2($author$project$Model$print, 'Program finished', model);
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							var $temp$msg = $author$project$Main$StopRunning,
								$temp$model = A2($author$project$Model$print, 'Program blocked', model);
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						}
					} else {
						if (!n) {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						} else {
							var _v6 = A3(
								$author$project$Main$randomBelow,
								model.randomSeed,
								$author$project$Main$RunThread(n),
								$elm$core$List$length(model.running));
							var cmdmsg = _v6.a;
							var seed = _v6.b;
							return _Utils_Tuple2(
								A2($author$project$Model$updateSeed, seed, model),
								cmdmsg);
						}
					}
				case 'RunThread':
					var countdown = msg.a;
					var n = msg.b;
					var _v7 = A2($author$project$Compile$run, model, n);
					if (_v7.$ === 'Ok') {
						var m = _v7.a;
						var _v8 = m.randomGenerator.request;
						if (_v8.$ === 'Just') {
							var k = _v8.a;
							var _v9 = A3(
								$author$project$Main$randomBelow,
								m.randomSeed,
								$author$project$Main$Fulfilment(
									A2($author$project$Main$RunThread, countdown, n)),
								k);
							var cmdmsg = _v9.a;
							var seed = _v9.b;
							return _Utils_Tuple2(
								A2($author$project$Model$updateSeed, seed, model),
								cmdmsg);
						} else {
							var $temp$msg = $author$project$Main$RunUntil(countdown - 1),
								$temp$model = m;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						}
					} else {
						var s = _v7.a;
						var $temp$msg = $author$project$Main$RunUntil(countdown - 1),
							$temp$model = A2($author$project$Model$print, s, model);
						msg = $temp$msg;
						model = $temp$model;
						continue update;
					}
				case 'ReceivedDataFromJS':
					var data = msg.a;
					var _v10 = A2($elm$json$Json$Decode$decodeValue, $author$project$Readfile$treeDecoder, data);
					if (_v10.$ === 'Ok') {
						var t = _v10.a;
						return _Utils_Tuple2(
							A4(
								$author$project$Model$spawn,
								_List_fromArray(
									[t]),
								-1,
								$elm$core$Maybe$Nothing,
								$author$project$Model$freshModel),
							$elm$core$Platform$Cmd$none);
					} else {
						var e = _v10.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Model$print,
								'Error: ' + $elm$json$Json$Decode$errorToString(e),
								$author$project$Model$freshModel),
							$elm$core$Platform$Cmd$none);
					}
				case 'ReceivedKeyboardInput':
					var dir = msg.a;
					return _Utils_Tuple2(
						A2($author$project$Model$enqKeypress, dir, model),
						$elm$core$Platform$Cmd$none);
				case 'RunOverTime':
					return _Utils_Tuple2(
						$author$project$Model$setRunFlag(model),
						$elm$core$Platform$Cmd$none);
				case 'StopRunning':
					return _Utils_Tuple2(
						$author$project$Model$unsetRunFlag(model),
						$elm$core$Platform$Cmd$none);
				default:
					var posix = msg.a;
					if (model.runFlag) {
						if ($author$project$Model$isBlocked(model)) {
							if ($author$project$Model$isFinished(model)) {
								var $temp$msg = $author$project$Main$StopRunning,
									$temp$model = A2($author$project$Model$print, 'Program finished', model);
								msg = $temp$msg;
								model = $temp$model;
								continue update;
							} else {
								if ($author$project$Model$isWaitingForKeyboard(model)) {
									var $temp$msg = $author$project$Main$Step,
										$temp$model = model;
									msg = $temp$msg;
									model = $temp$model;
									continue update;
								} else {
									var $temp$msg = $author$project$Main$StopRunning,
										$temp$model = A2($author$project$Model$print, 'Program blocked', model);
									msg = $temp$msg;
									model = $temp$model;
									continue update;
								}
							}
						} else {
							var $temp$msg = $author$project$Main$Step,
								$temp$model = model;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
			}
		}
	});
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$json$Json$Encode$string = _Json_wrap;
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$hr = _VirtualDom_node('hr');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Main$maybeSerial = function (model) {
	return ($elm$core$List$length(model.display) > 0) ? _List_fromArray(
		[
			A2($elm$html$Html$hr, _List_Nil, _List_Nil),
			A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Serial Output Log:')
				])),
			A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2(
						$elm$core$String$join,
						', ',
						A2($elm$core$List$map, $elm$core$String$fromInt, model.display)))
				])),
			A2($elm$html$Html$hr, _List_Nil, _List_Nil)
		]) : _List_fromArray(
		[
			A2($elm$html$Html$hr, _List_Nil, _List_Nil)
		]);
};
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Utils$zipWithIndex = function (xs) {
	return A3(
		$elm$core$List$map2,
		$elm$core$Tuple$pair,
		xs,
		A2(
			$elm$core$List$range,
			0,
			$elm$core$List$length(xs) - 1));
};
var $author$project$Utils$graphicsAddCoords = function (xs) {
	return A2(
		$elm$core$List$concatMap,
		function (_v0) {
			var ys = _v0.a;
			var i = _v0.b;
			return A2(
				$elm$core$List$map,
				function (_v1) {
					var color = _v1.a;
					var j = _v1.b;
					return _Utils_Tuple2(
						color,
						_Utils_Tuple2(i, j));
				},
				ys);
		},
		$author$project$Utils$zipWithIndex(
			A2($elm$core$List$map, $author$project$Utils$zipWithIndex, xs)));
};
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $author$project$Utils$numberToColor = function (n) {
	numberToColor:
	while (true) {
		switch (n) {
			case 0:
				return 'black';
			case 1:
				return 'grey';
			case 2:
				return 'white';
			case 3:
				return 'red';
			case 4:
				return 'yellow';
			case 5:
				return 'limegreen';
			case 6:
				return 'cyan';
			case 7:
				return 'blue';
			case 8:
				return 'magenta';
			default:
				var $temp$n = 0;
				n = $temp$n;
				continue numberToColor;
		}
	}
};
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$rect = $elm$svg$Svg$trustedNode('rect');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $author$project$Utils$itemToRect = function (item) {
	var color = item.a;
	var _v1 = item.b;
	var i = _v1.a;
	var j = _v1.b;
	return A2(
		$elm$svg$Svg$rect,
		_List_fromArray(
			[
				$elm$svg$Svg$Attributes$x(
				$elm$core$String$fromInt(10 * j)),
				$elm$svg$Svg$Attributes$y(
				$elm$core$String$fromInt(10 * i)),
				$elm$svg$Svg$Attributes$width('10'),
				$elm$svg$Svg$Attributes$height('10'),
				$elm$svg$Svg$Attributes$fill(
				$author$project$Utils$numberToColor(color))
			]),
		_List_Nil);
};
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $author$project$Utils$printgraphics = function (graphics) {
	return A2(
		$elm$svg$Svg$svg,
		_List_fromArray(
			[
				$elm$svg$Svg$Attributes$width('320'),
				$elm$svg$Svg$Attributes$height('320'),
				$elm$svg$Svg$Attributes$viewBox('0 0 320 320')
			]),
		A2(
			$elm$core$List$map,
			$author$project$Utils$itemToRect,
			$author$project$Utils$graphicsAddCoords(graphics)));
};
var $elm$html$Html$br = _VirtualDom_node('br');
var $author$project$Main$printout = function (s) {
	return A2(
		$elm$core$List$intersperse,
		A2($elm$html$Html$br, _List_Nil, _List_Nil),
		A2($elm$core$List$map, $elm$html$Html$text, s));
};
var $author$project$Main$RunOverTime = {$: 'RunOverTime'};
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$Main$runovertimebtn = function (model) {
	return model.runFlag ? A2(
		$elm$html$Html$button,
		_List_fromArray(
			[
				$elm$html$Html$Events$onClick($author$project$Main$StopRunning),
				A2($elm$html$Html$Attributes$style, 'background-color', 'orange')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('Pause')
			])) : A2(
		$elm$html$Html$button,
		_List_fromArray(
			[
				$elm$html$Html$Events$onClick($author$project$Main$RunOverTime),
				A2($elm$html$Html$Attributes$style, 'background-color', 'limegreen')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('Run')
			]));
};
var $elm$json$Json$Encode$dict = F3(
	function (toKey, toValue, dictionary) {
		return _Json_wrap(
			A3(
				$elm$core$Dict$foldl,
				F3(
					function (key, value, obj) {
						return A3(
							_Json_addField,
							toKey(key),
							toValue(value),
							obj);
					}),
				_Json_emptyObject(_Utils_Tuple0),
				dictionary));
	});
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$json$Json$Encode$int = _Json_wrap;
var $author$project$StateUtils$jsonValues = function (val) {
	switch (val.$) {
		case 'Number':
			var n = val.a;
			return $elm$json$Json$Encode$int(n);
		case 'Boolval':
			var b = val.a;
			return $elm$json$Json$Encode$bool(b);
		case 'Array':
			var xs = val.a;
			return A3($elm$json$Json$Encode$dict, $elm$core$String$fromInt, $author$project$StateUtils$jsonValues, xs);
		default:
			return $elm$json$Json$Encode$string('null');
	}
};
var $author$project$StateUtils$toJson = function (state) {
	return A2(
		$elm$json$Json$Encode$encode,
		4,
		A3($elm$json$Json$Encode$dict, $elm$core$Basics$identity, $author$project$StateUtils$jsonValues, state.vars));
};
var $author$project$Main$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('twopanel')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_Nil,
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Events$onClick($author$project$Main$Step)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Step')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Events$onClick(
									$author$project$Main$RunUntil(50))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('50 Steps')
								])),
							$author$project$Main$runovertimebtn(model),
							A2($elm$html$Html$hr, _List_Nil, _List_Nil),
							A2(
							$elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Channel Activity:')
								]))
						]),
					$author$project$Main$printout(model.output))),
				A2(
				$elm$html$Html$div,
				_List_Nil,
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									$author$project$Utils$printgraphics(model.graphics)
								]))
						]),
					_Utils_ap(
						$author$project$Main$maybeSerial(model),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Variables:')
									])),
								A2(
								$elm$html$Html$div,
								_List_Nil,
								$author$project$Main$printout(
									_List_fromArray(
										[
											$author$project$StateUtils$toJson(model.state)
										])))
							]))))
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{init: $author$project$Main$init, subscriptions: $author$project$Main$subscriptions, update: $author$project$Main$update, view: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$value)(0)}});}(this));