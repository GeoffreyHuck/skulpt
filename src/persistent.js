/* jslint nomen: true, bitwise: true */
/* global Sk: true */

/**
 * @namespace Sk.builtin
 */

/**
 * Changes recursively all the references of an object.
 * At first call, parent is the object and obj is undefined.
 *
 * @param clonedReferences The already cloned references.
 * @param $loc             The internal skulpt $loc or $gbl.
 * @param parent           The object's parent.
 * @param obj              The object.
 * @param cycle            Whether a cycle has been detected.
 *
 * @return {object} The references correspondences with key uuid and value the object.
 */
Sk.builtin.changeReferencesRec = function (clonedReferences, $loc, parent, obj, cycle) {
    if (!clonedReferences.hasOwnProperty(parent._uuid)) {
        clonedReferences[parent._uuid] = parent.clone(obj);
    }

    const parentClone = clonedReferences[parent._uuid];

    if ($loc.hasOwnProperty("__refs__")) {
        if ($loc.__refs__[parentClone._uuid]) {
            const parentRefs = $loc.__refs__[parentClone._uuid];
            for (let idx in parentRefs) {
                $loc[parentRefs[idx]] = parentClone;
            }
        }
    }

    if (!cycle && parentClone._parents) {
        for (let parentUuid in parentClone._parents) {
            const parentParent = parentClone._parents[parentUuid];

            let cycle = false;
            if (clonedReferences.hasOwnProperty(parentParent._uuid) && parentParent === clonedReferences[parentParent._uuid]) {
                cycle = true;
            }

            Sk.builtin.changeReferencesRec(clonedReferences, $loc, parentParent, parentClone, cycle);
        }
    }
};

/**
 * Changes all the references of an object.
 *
 * @param clonedReferences The already cloned references.
 * @param $loc             The internal skulpt $loc or $gbl.
 * @param obj              The object.
 *
 * @return {object} The references correspondences with key uuid and value the object.
 */
Sk.builtin.changeReferences = function (clonedReferences, $loc, obj) {
    return Sk.builtin.changeReferencesRec(clonedReferences, $loc, obj, undefined, false);
};

Sk.exportSymbol("Sk.builtin.changeReferences", Sk.builtin.changeReferences);
