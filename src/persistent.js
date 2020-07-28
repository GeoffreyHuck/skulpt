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
 *
 * @return {object} The references correspondences with key uuid and value the object.
 */
Sk.builtin.changeReferencesRec = function (clonedReferences, $loc, parent, obj) {
    if (!clonedReferences.hasOwnProperty(parent._uuid)) {
        clonedReferences[parent._uuid] = parent.clone(obj);
    }

    const parentClone = clonedReferences[parent._uuid];

    const correspondences = {};
    correspondences[parentClone._uuid] = parentClone;

    if ($loc.hasOwnProperty("__refs__")) {
        if ($loc.__refs__[parentClone._uuid]) {
            const parentRefs = $loc.__refs__[parentClone._uuid];
            for (let idx in parentRefs) {
                $loc[parentRefs[idx]] = parentClone;
            }
        }
    }

    if (parentClone._parents) {
        console.log('number of parents', parentClone._parents.length);
        for (let parentUuid in parentClone._parents) {
            const correspondencesRec = Sk.builtin.changeReferencesRec(clonedReferences, $loc, parentClone._parents[parentUuid], parentClone);

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
 * @param clonedReferences The already cloned references.
 * @param $loc             The internal skulpt $loc or $gbl.
 * @param obj              The object.
 *
 * @return {object} The references correspondences with key uuid and value the object.
 */
Sk.builtin.changeReferences = function (clonedReferences, $loc, obj) {
    return Sk.builtin.changeReferencesRec(clonedReferences, $loc, obj);
};

Sk.exportSymbol("Sk.builtin.changeReferences", Sk.builtin.changeReferences);
