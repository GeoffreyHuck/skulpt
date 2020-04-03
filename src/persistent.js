/* jslint nomen: true, bitwise: true */
/* global Sk: true */

/**
 * @namespace Sk.builtin
 */

/**
 * @description
 * Copy a Skulpt object with a new reference (object is different), + keep the old value.
 *
 * @param  {Object} currentValue The current object.
 * @param  {Object} newValue     The new value object.
 *
 * @return {Object} A cloned object.
 */
Sk.builtin.persistentCopy = function (currentValue, newValue) {
    if (newValue instanceof Sk.builtin.func || typeof newValue === "function") {
        return newValue;
    }

    console.log("__PERSISTENT__COPY__", currentValue, newValue);

    // const newObject = src.clone();

    // if (newValue) {
    //     newObject._old = newValue.v;
    // } else {
    //     newObject._old = undefined;
    // }

    return newValue.clone();
};

/**
 * Removes all the ._old properties of a skuplt builtin object.
 *
 * @param value The value.
 *
 * @returns {[]|*} A new value without the ._old properties.
 */
Sk.builtin.removeOldValues = function(value) {
    if (Array.isArray(value)) {
        let values = [];
        for (let idx = 0; idx < value.length; idx++) {
            const newValue = value[idx].clone();
            newValue._old = undefined;

            values.push(newValue);
        }

        return values;
    } else if (value.hasOwnProperty("v")) {
        const newValue = value.clone();
        newValue._old = undefined;

        return newValue;
    } else {
        return value;
    }
};

Sk.exportSymbol("Sk.builtin.persistentCopy", Sk.builtin.persistentCopy);
