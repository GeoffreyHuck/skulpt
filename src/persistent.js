/* jslint nomen: true, bitwise: true */
/* global Sk: true */

/**
 * @namespace Sk.builtin
 */

/**
 * Changes recursively all the references of an object.
 * At first call, parent is the object and obj is undefined.
 *
 * @param $loc   The internal skulpt $loc or $gbl.
 * @param parent The object's parent.
 * @param obj    The object.
 *
 * @return {object} The references correspondences with key uuid and value the object.
 */
Sk.builtin.changeReferencesRec = function ($loc, parent, obj) {
    let parentClone;
    if (obj === undefined) {
        /**
         * "obj" is undefined for the object which has initially been modified.
         * This object has already been cloned and therefore its reference has
         * already changed.
         */

        parentClone = parent;
    } else {
        parentClone = parent.clone(obj);
    }

    const correspondences = {};
    correspondences[parentClone._uuid] = parentClone;

    if ($loc.hasOwnProperty("__refs__")) {
        if ($loc.__refs__[parentClone._uuid]) {
            $loc[$loc.__refs__[parentClone._uuid]] = parentClone;
        }
    }

    if (parentClone._parents) {
        for (let parentUuid in parentClone._parents) {
            const correspondencesRec = Sk.builtin.changeReferencesRec($loc, parentClone._parents[parentUuid], parentClone);

            for (let correspondenceRecIdx in correspondencesRec) {
                correspondences[correspondenceRecIdx] = correspondencesRec[correspondenceRecIdx];
            }
        }
    }

    return correspondences;
};

/**
 * Changes all the references of an object.
 *
 * @param $loc The internal skulpt $loc or $gbl.
 * @param obj  The object.
 *
 * @return {object} The references correspondences with key uuid and value the object.
 */
Sk.builtin.changeReferences = function ($loc, obj) {
    return Sk.builtin.changeReferencesRec($loc, obj);
};

Sk.exportSymbol("Sk.builtin.changeReferences", Sk.builtin.changeReferences);
