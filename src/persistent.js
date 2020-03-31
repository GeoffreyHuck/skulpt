/* jslint nomen: true, bitwise: true */
/* global Sk: true */

/**
 * @namespace Sk.builtin
 */

/**
 * @description
 * Copy a Skulpt object with a new reference (object is different), + keep the old value.
 *
 * @param  {Object} dest The destination object.
 * @param  {Object} src  The source object.
 *
 * @return {Object} A new object with src's value as value and dest's value as old value.
 */
Sk.builtin.persistentCopy = function (dest, src) {
    if (src instanceof Sk.builtin.func || typeof src === "function") {
        return src;
    }

    console.log("__PERSISTENT__COPY__", dest, src);

    const newObject = src.clone();

    if (dest) {
        newObject._old = dest.v;
    } else {
        newObject._old = undefined;
    }

    return newObject;
};

Sk.exportSymbol("Sk.builtin.persistentCopy", Sk.builtin.persistentCopy);
