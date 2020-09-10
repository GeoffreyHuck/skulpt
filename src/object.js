import {v4 as uuidv4} from "uuid";

/**
 * @constructor
 * Sk.builtin.object
 *
 * @description
 * Constructor for Python object. All Python classes (builtin and user-defined)
 * should inherit from this class.
 *
 * @return {Sk.builtin.object} Python object
 */
Sk.builtin.object = function () {
    if (!(this instanceof Sk.builtin.object)) {
        return new Sk.builtin.object();
    }

    // Sets the UUID.
    this._ref_uuid = uuidv4();
    // if (uuid === undefined) {

    /**
     * This constructor is NOT called when an object is cloned.
     * So the _uuid is always new.
     */

    this._uuid = uuidv4();

    /**
     * The internal dict $d doesn't exist here, so it's parent (this), is set elsewhere.
     */

    return this;
};

Sk.builtin.object.prototype.__init__ = function __init__() {
    return Sk.builtin.none.none$;
};
Sk.builtin.object.prototype.__init__.co_kwargs = 1;

Sk.builtin._tryGetSubscript = function(dict, pyName) {
    try {
        return dict.mp$subscript(pyName);
    } catch (x) {
        return undefined;
    }
};
Sk.exportSymbol("Sk.builtin._tryGetSubscript", Sk.builtin._tryGetSubscript);


/**
 * Get an attribute
 * @param {Object} pyName Python string name of the attribute
 * @param {boolean=} canSuspend Can we return a suspension?
 * @return {undefined}
 */
Sk.builtin.object.prototype.GenericGetAttr = function (pyName, canSuspend) {
    var res;
    var f;
    var descr;
    var tp;
    var dict;
    var getf;
    var jsName = pyName.$jsstr();

    tp = this.ob$type;
    Sk.asserts.assert(tp !== undefined, "object has no ob$type!");

    dict = this["$d"] || this.constructor["$d"];
    //print("getattr", tp.tp$name, name);

    // todo; assert? force?
    if (dict) {
        if (dict.mp$lookup) {
            res = dict.mp$lookup(pyName);
        } else if (dict.mp$subscript) {
            res = Sk.builtin._tryGetSubscript(dict, pyName);
        } else if (typeof dict === "object") {
            res = dict[jsName];
        }
        if (res !== undefined) {
            return res;
        }
    }

    descr = Sk.builtin.type.typeLookup(tp, pyName);

    // otherwise, look in the type for a descr
    if (descr !== undefined && descr !== null) {
        f = descr.tp$descr_get;
        // todo - data descriptors (ie those with tp$descr_set too) get a different lookup priority

        if (f) {
            // non-data descriptor
            return f.call(descr, this, this.ob$type, canSuspend);
        }
    }

    if (descr !== undefined) {
        return descr;
    }

    // OK, try __getattr__

    descr = Sk.builtin.type.typeLookup(tp, Sk.builtin.str.$getattr);
    if (descr !== undefined && descr !== null) {
        f = descr.tp$descr_get;
        if (f) {
            getf = f.call(descr, this, this.ob$type);
        } else {
            getf = descr;
        }

        res = Sk.misceval.tryCatch(function() {
            return Sk.misceval.callsimOrSuspendArray(getf, [pyName]);
        }, function(e) {
            if (e instanceof Sk.builtin.AttributeError) {
                return undefined;
            } else {
                throw e;
            }
        });
        return canSuspend ? res : Sk.misceval.retryOptionalSuspensionOrThrow(res);
    }


    return undefined;
};
Sk.exportSymbol("Sk.builtin.object.prototype.GenericGetAttr", Sk.builtin.object.prototype.GenericGetAttr);

Sk.builtin.object.prototype.GenericPythonGetAttr = function(self, pyName) {
    var r = Sk.builtin.object.prototype.GenericGetAttr.call(self, pyName, true);
    if (r === undefined) {
        throw new Sk.builtin.AttributeError(pyName);
    }
    return r;
};
Sk.exportSymbol("Sk.builtin.object.prototype.GenericPythonGetAttr", Sk.builtin.object.prototype.GenericPythonGetAttr);

/**
 * @param {Object} pyName
 * @param {Object} value
 * @param {boolean=} canSuspend
 * @return {undefined}
 */
Sk.builtin.object.prototype.GenericSetAttr = function (pyName, value, canSuspend) {
    var objname = Sk.abstr.typeName(this);
    var jsName = pyName.$jsstr();
    var dict;
    var tp = this.ob$type;
    var descr;
    var f;

    Sk.asserts.assert(tp !== undefined, "object has no ob$type!");

    dict = this["$d"] || this.constructor["$d"];

    if (jsName == "__class__") {
        if (value.tp$mro === undefined || value.tp$name === undefined) {
            throw new Sk.builtin.TypeError(
                "attempted to assign non-class to __class__");
        }
        this.ob$type = value;
        this.tp$name = value.tp$name;
        return;
    }

    descr = Sk.builtin.type.typeLookup(tp, pyName);

    // otherwise, look in the type for a descr
    if (descr !== undefined && descr !== null) {
        f = descr.tp$descr_set;
        // todo; is this the right lookup priority for data descriptors?
        if (f) {
            return f.call(descr, this, value, canSuspend);
        }
    }

    if (dict.mp$ass_subscript) {
        if (this instanceof Sk.builtin.object && !(this.ob$type.sk$klass) &&
            dict.mp$lookup(pyName) === undefined) {
            // Cannot add new attributes to a builtin object
            throw new Sk.builtin.AttributeError("'" + objname + "' object has no attribute '" + Sk.unfixReserved(jsName) + "'");
        }
        dict.mp$ass_subscript(pyName, value);
    } else if (typeof dict === "object") {
        dict[jsName] = value;
    }
};
Sk.exportSymbol("Sk.builtin.object.prototype.GenericSetAttr", Sk.builtin.object.prototype.GenericSetAttr);

Sk.builtin.object.prototype.GenericPythonSetAttr = function(self, pyName, value) {
    return Sk.builtin.object.prototype.GenericSetAttr.call(self, pyName, value, true);
};
Sk.exportSymbol("Sk.builtin.object.prototype.GenericPythonSetAttr", Sk.builtin.object.prototype.GenericPythonSetAttr);

Sk.builtin.object.prototype.HashNotImplemented = function () {
    throw new Sk.builtin.TypeError("unhashable type: '" + Sk.abstr.typeName(this) + "'");
};

Sk.builtin.object.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.object.prototype.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;

// Although actual attribute-getting happens in pure Javascript via tp$getattr, classes
// overriding __getattribute__ etc need to be able to call object.__getattribute__ etc from Python
Sk.builtin.object.prototype["__getattribute__"] = Sk.builtin.object.prototype.GenericPythonGetAttr;
Sk.builtin.object.prototype["__setattr__"] = Sk.builtin.object.prototype.GenericPythonSetAttr;

/**
 * The name of this class.
 * @type {string}
 */
Sk.builtin.object.prototype.tp$name = "object";

/**
 * The type object of this class.
 * @type {Sk.builtin.type|Object}
 */
Sk.builtin.object.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj("object", Sk.builtin.object);
Sk.builtin.object.prototype.ob$type.sk$klass = undefined;   // Nonsense for closure compiler
Sk.builtin.object.prototype.tp$descr_set = undefined;   // Nonsense for closure compiler

Sk.builtin.object.prototype["clone"] = function(newElementValue, clonedReferences) {
    /**
     * Warning : Only clone the content, not the reference itself.
     * Then only the internal dict will be persistent and not the object itself.
     *
     * Possible workaround : Find a way to copy an object. But copying only the
     * attributes doesn't work, so it would require something else.
     */
    //const newObject = this;

    // Try to overcome to above warning.
    const newObject = Object.create(this);

    // New reference id.
    newObject._ref_uuid = uuidv4();

    for (let idx in this) {
        if (idx === '_ref_uuid') {
            // Ignore.
        }
        else if (idx === '$d') {
            if (!clonedReferences || !clonedReferences.hasOwnProperty(newObject.$d._uuid)) {
                newObject.$d = newObject.$d.clone(newElementValue);
                Sk.builtin.registerParentReferenceInChild(newObject, newObject.$d);
            } else {
                // If the internal dict has already been cloned, just copy it.
                newObject.$d = clonedReferences[newObject.$d._uuid];
            }
        } else {
            newObject[idx] = this[idx];
        }
    }

    return newObject;
};

/**
 * Updates references within an object.
 *
 * @param newReferences The set of new references {UUID: Object}.
 */
Sk.builtin.object.prototype["updateReferencesInside"] = function(newReferences) {
    if (this.hasOwnProperty('$d') && newReferences.hasOwnProperty(this.$d._uuid)) {
        this.$d = newReferences[this.$d._uuid];
    }
};

/** Default implementations of dunder methods found in all Python objects */
/**
 * Default implementation of __new__ just calls the class constructor
 * @name  __new__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__new__"] = function (cls) {
    Sk.builtin.pyCheckArgsLen("__new__", arguments.length, 1, 1, false, false);

    return new cls([], []);
};

/**
 * Python wrapper for `__repr__` method.
 * @name  __repr__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__repr__"] = function (self) {
    Sk.builtin.pyCheckArgsLen("__repr__", arguments.length, 0, 0, false, true);

    return self["$r"]();
};


Sk.builtin.object.prototype["__format__"] = function (self, format_spec) {
    var formatstr;
    Sk.builtin.pyCheckArgsLen("__format__", arguments.length, 2, 2);

    if (!Sk.builtin.checkString(format_spec)) {
        if (Sk.__future__.exceptions) {
            throw new Sk.builtin.TypeError("format() argument 2 must be str, not " + Sk.abstr.typeName(format_spec));
        } else {
            throw new Sk.builtin.TypeError("format expects arg 2 to be string or unicode, not " + Sk.abstr.typeName(format_spec));
        }
    } else {
        formatstr = Sk.ffi.remapToJs(format_spec);
        if (formatstr !== "") {
            throw new Sk.builtin.NotImplementedError("format spec is not yet implemented");
        }
    }

    return new Sk.builtin.str(self);
};


/**
 * Python wrapper for `__str__` method.
 * @name  __str__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__str__"] = function (self) {
    Sk.builtin.pyCheckArgsLen("__str__", arguments.length, 0, 0, false, true);

    return self["$r"]();
};

/**
 * Python wrapper for `__hash__` method.
 * @name  __hash__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__hash__"] = function (self) {
    Sk.builtin.pyCheckArgsLen("__hash__", arguments.length, 0, 0, false, true);

    return self.tp$hash();
};

/**
 * Python wrapper for `__eq__` method.
 * @name  __eq__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__eq__"] = function (self, other) {
    Sk.builtin.pyCheckArgsLen("__eq__", arguments.length, 1, 1, false, true);

    return self.ob$eq(other);
};

/**
 * Python wrapper for `__ne__` method.
 * @name  __ne__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__ne__"] = function (self, other) {
    Sk.builtin.pyCheckArgsLen("__ne__", arguments.length, 1, 1, false, true);

    return self.ob$ne(other);
};

/**
 * Python wrapper for `__lt__` method.
 * @name  __lt__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__lt__"] = function (self, other) {
    Sk.builtin.pyCheckArgsLen("__lt__", arguments.length, 1, 1, false, true);

    return self.ob$lt(other);
};

/**
 * Python wrapper for `__le__` method.
 * @name  __le__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__le__"] = function (self, other) {
    Sk.builtin.pyCheckArgsLen("__le__", arguments.length, 1, 1, false, true);

    return self.ob$le(other);
};

/**
 * Python wrapper for `__gt__` method.
 * @name  __gt__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__gt__"] = function (self, other) {
    Sk.builtin.pyCheckArgsLen("__gt__", arguments.length, 1, 1, false, true);

    return self.ob$gt(other);
};

/**
 * Python wrapper for `__ge__` method.
 * @name  __ge__
 * @memberOf Sk.builtin.object.prototype
 * @instance
 */
Sk.builtin.object.prototype["__ge__"] = function (self, other) {
    Sk.builtin.pyCheckArgsLen("__ge__", arguments.length, 1, 1, false, true);

    return self.ob$ge(other);
};

/** Default implementations of Javascript functions used in dunder methods */

/**
 * Return the string representation of this instance.
 *
 * Javascript function, returns Python object.
 *
 * @name  $r
 * @memberOf Sk.builtin.object.prototype
 * @return {Sk.builtin.str} The Python string representation of this instance.
 */
Sk.builtin.object.prototype["$r"] = function () {
    return new Sk.builtin.str("<object>");
};

Sk.builtin.hashCount = 1;
Sk.builtin.idCount = 1;

/**
 * Return the hash value of this instance.
 *
 * Javascript function, returns Python object.
 *
 * @return {Sk.builtin.int_} The hash value
 */
Sk.builtin.object.prototype.tp$hash = function () {
    if (!this.$savedHash_) {
        this.$savedHash_ = new Sk.builtin.int_(Sk.builtin.hashCount++);
    }

    return this.$savedHash_;
};

/**
 * Perform equality check between this instance and a Python object (i.e. this == other).
 *
 * Implements `__eq__` dunder method.
 *
 * Javascript function, returns Python object.
 *
 * @param  {Object} other The Python object to check for equality.
 * @return {(Sk.builtin.bool|Sk.builtin.NotImplemented)} true if equal, false otherwise
 */
Sk.builtin.object.prototype.ob$eq = function (other) {
    if (this === other) {
        return Sk.builtin.bool.true$;
    }

    return Sk.builtin.NotImplemented.NotImplemented$;
};

/**
 * Perform non-equality check between this instance and a Python object (i.e. this != other).
 *
 * Implements `__ne__` dunder method.
 *
 * Javascript function, returns Python object.
 *
 * @param  {Object} other The Python object to check for non-equality.
 * @return {(Sk.builtin.bool|Sk.builtin.NotImplemented)} true if not equal, false otherwise
 */
Sk.builtin.object.prototype.ob$ne = function (other) {
    if (this === other) {
        return Sk.builtin.bool.false$;
    }

    return Sk.builtin.NotImplemented.NotImplemented$;
};

/**
 * Determine if this instance is less than a Python object (i.e. this < other).
 *
 * Implements `__lt__` dunder method.
 *
 * Javascript function, returns Python object.
 *
 * @param  {Object} other The Python object to compare.
 * @return {(Sk.builtin.bool|Sk.builtin.NotImplemented)} true if this < other, false otherwise
 */
Sk.builtin.object.prototype.ob$lt = function (other) {
    return Sk.builtin.NotImplemented.NotImplemented$;
};

/**
 * Determine if this instance is less than or equal to a Python object (i.e. this <= other).
 *
 * Implements `__le__` dunder method.
 *
 * Javascript function, returns Python object.
 *
 * @param  {Object} other The Python object to compare.
 * @return {(Sk.builtin.bool|Sk.builtin.NotImplemented)} true if this <= other, false otherwise
 */
Sk.builtin.object.prototype.ob$le = function (other) {
    return Sk.builtin.NotImplemented.NotImplemented$;
};

/**
 * Determine if this instance is greater than a Python object (i.e. this > other).
 *
 * Implements `__gt__` dunder method.
 *
 * Javascript function, returns Python object.
 *
 * @param  {Object} other The Python object to compare.
 * @return {(Sk.builtin.bool|Sk.builtin.NotImplemented)} true if this > other, false otherwise
 */
Sk.builtin.object.prototype.ob$gt = function (other) {
    return Sk.builtin.NotImplemented.NotImplemented$;
};

/**
 * Determine if this instance is greater than or equal to a Python object (i.e. this >= other).
 *
 * Implements `__ge__` dunder method.
 *
 * Javascript function, returns Python object.
 *
 * @param  {Object} other The Python object to compare.
 * @return {(Sk.builtin.bool|Sk.builtin.NotImplemented)} true if this >= other, false otherwise
 */
Sk.builtin.object.prototype.ob$ge = function (other) {
    return Sk.builtin.NotImplemented.NotImplemented$;
};

// Wrap the following functions in Sk.builtin.func once that class is initialized
/**
 * Array of all the Python functions which are methods of this class.
 * @type {Array}
 */
Sk.builtin.object.pythonFunctions = [
    "__repr__", "__str__", "__hash__",
    "__eq__", "__ne__", "__lt__", "__le__",
    "__gt__", "__ge__", "__getattribute__",
    "__setattr__", "__format__"
];

/**
 * @constructor
 * Sk.builtin.none
 *
 * @extends {Sk.builtin.object}
 */
Sk.builtin.none = function () {
    this.v = null;
};
Sk.abstr.setUpInheritance("NoneType", Sk.builtin.none, Sk.builtin.object);

/** @override */
Sk.builtin.none.prototype["$r"] = function () { return new Sk.builtin.str("None"); };

/** @override */
Sk.builtin.none.prototype.tp$hash = function () {
    return new Sk.builtin.int_(0);
};

/**
 * Python None constant.
 * @type {Sk.builtin.none}
 */
Sk.builtin.none.none$ = new Sk.builtin.none();

/**
 * @constructor
 * Sk.builtin.NotImplemented
 *
 * @extends {Sk.builtin.object}
 */
Sk.builtin.NotImplemented = function() { };
Sk.abstr.setUpInheritance("NotImplementedType", Sk.builtin.NotImplemented, Sk.builtin.object);

/** @override */
Sk.builtin.NotImplemented.prototype["$r"] = function () { return new Sk.builtin.str("NotImplemented"); };

/**
 * Python NotImplemented constant.
 * @type {Sk.builtin.NotImplemented}
 */
Sk.builtin.NotImplemented.NotImplemented$ = new Sk.builtin.NotImplemented();

Sk.exportSymbol("Sk.builtin.none", Sk.builtin.none);
Sk.exportSymbol("Sk.builtin.NotImplemented", Sk.builtin.NotImplemented);
