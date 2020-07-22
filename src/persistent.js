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
 * @returns {*} A new value without the ._old properties.
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

/**
 * Changes recursively all the references of an object.
 *
 * @param $loc   The internal skulpt loc.
 * @param parent The object's parent.
 * @param obj    The object.
 */
Sk.builtin.changeReferencesRec = function ($loc, parent, obj) {
    const parentClone = parent.clone(obj);

    if ($loc.__refs__[parentClone._uuid]) {
        $loc[$loc.__refs__[parentClone._uuid]] = parentClone;
    }

    if (parentClone._parents) {
        for (let parentUuid in parentClone._parents) {
            Sk.builtin.changeReferencesRec($loc, parentClone._parents[parentUuid], parentClone);
        }
    }
};

/**
 * Changes all the references of an object.
 *
 * @param $loc The internal skulpt loc.
 * @param obj  The object.
 */
Sk.builtin.changeReferences = function ($loc, obj) {
    if ($loc.hasOwnProperty("__refs__")) {
        if ($loc.__refs__[obj._uuid]) {
            // obj is already a clone.
            $loc[$loc.__refs__[obj._uuid]] = obj;
        }

        if (obj._parents) {
            for (let parentUuid in obj._parents) {
                Sk.builtin.changeReferencesRec($loc, obj._parents[parentUuid], obj);
            }
        }
    }
};

Sk.exportSymbol("Sk.builtin.persistentCopy", Sk.builtin.persistentCopy);
Sk.exportSymbol("Sk.builtin.changeReferences", Sk.builtin.changeReferences);
