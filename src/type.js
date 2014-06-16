var reg = /^(\[*)(Str|Int|Num|[a-z])(\]*)/;

getType = function getType (a) {
    switch (typeof  a) {
        case 'number':
            return (a % 1 === 0) ? 'Int' : 'Num';
        case 'string':
            return 'String';
    }
    switch (Object.prototype.toString.call (a)) {
        case '[object Array]':
            return TArray (a[0] ? getType (a[0]) : '');
    }
    if (a === undefined) return 'Undefined';
    if (a === Object (a)) return 'Obj';
    if (a === null) return 'Null';

    return 'Unknown';
};

parseSignature = function parseSignature (s) {
    return s.replace(/\s/g,'').split('->').map( function(s){
        var m = s.match(reg);

        if (m === null)
            throw new TypeError('Unknown type ' + s);
        if ((m[1] && !m[3]) || (!m[1] && m[3]))
            throw new TypeError('Unknown type ' + s);
        if (m[1] && m[1].length !== m[3].length)
            throw new TypeError('Un balanced expression ' + s);
        return m[0];

    });
};

getTypeVariable = function getTypeVariable (a) {
    var m = a.match( /^(\[*)([a-z])(\]*)/);
    return m ? m[2] : null;
};

getDepth = function getDepth (a) {
    var m = a.match( /^(\[*)/);
    return m && m[1] ? m[1].length : 0;
};

detectVariableType = function detectVariableType (a,b) {
    var d = getDepth(a);
    return b.slice (d, b.length - d);
};

maybeReplaceTypeVariable = function maybeReplaceTypeVariable (a, name, value) {
    return getTypeVariable(a) === name ? a.replace (name, value). replace ('Int', 'Num') : a;
};

typesAreEqual = function typesAreEqual (functionSignature, typeNeeded, typeGiven) {
    var variableTypeName, variableTypeValue, i, t;

    if (typeNeeded === typeGiven)
        return true;

    if ((variableTypeName = getTypeVariable(typeNeeded)) && (getDepth(typeNeeded) <= getDepth(typeGiven))) {
        variableTypeValue = detectVariableType (typeNeeded, typeGiven);
        for (i = 0; i < functionSignature.length; i++) {
            t = functionSignature[i];
            functionSignature[i] = maybeReplaceTypeVariable(t, variableTypeName, variableTypeValue);
        }
        return true;
    }
    if (typeNeeded === typeGiven.replace ('Int', 'Num'))
        return true;

    return false;
};

Type = function Type (signature, f) {
    var typeArg, out, i, typeOut,
        checked = false,
        types = parseSignature (signature),
        args = '';

    function _typedFun() {
        if (arguments.length !== types.length - 1)
            throw new RangeError('Incorrect number of arguments, expected' + (types.length - 1) + ', received ' + arguments.length);

        for (i = 0; i < arguments.length; i++) {
            typeArg = getType(arguments[i]);
            if (!typesAreEqual (types, types[i], typeArg)) {
                throw  new TypeError('Incorrect input type, expected ' + types[i] + ', received ' + typeArg);
            }
        }
        out = f.apply(this,arguments);
        typeOut = getType(out);
        if (!typesAreEqual(types, types[types.length - 1], typeOut))
            throw  new TypeError('Incorrect output type, expected ' + types[types.length - 1] + ', received ' + typeOut);
        return out;
    }

    for (i = 0; i < f.length; i++) {
        args += 'a' + i;
        if (i+1 < f.length)
            args += ',';
    }
    eval( 'function typedFun (' + args + '){ return _typedFun.apply(this,arguments) }' );

    return typedFun;
};


Function.prototype.setType = function (signature) {
    return Type (signature, this);
};
