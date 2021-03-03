/* jslint nomen: true, bitwise: true */
/* global Sk: true */

/**
 * @namespace Sk.builtin
 */

/**
 * Register a promise reference.
 *
 * @param susp The suspension.
 */
Sk.builtin.registerPromiseReference = function(susp) {
    if (susp && susp.child && susp.child.$tmps) {
        var __selfArgName = susp.child._argnames[0];
        if (susp.child.$tmps[__selfArgName] && susp.child.$tmps[__selfArgName].hasOwnProperty("_uuid")) {
            window.currentPythonRunner._debugger.registerPromiseReference(susp.child.$tmps[__selfArgName]);
        }
    }
};

/**
 * Register the parent reference of one of its child.
 *
 * @param parent The parent.
 * @param child  The child.
 */
Sk.builtin.registerParentReferenceInChild = function(parent, child) {
    if (!child || !parent || !child.hasOwnProperty("_uuid") || !parent.hasOwnProperty("_uuid")) {
        return;
    }

    if (!child.hasOwnProperty("_parents")) {
        child._parents = {};
    }

    child._parents[parent._uuid] = parent;
};

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
        clonedReferences[parent._uuid] = parent.clone(obj, clonedReferences);

        if (parent.hasOwnProperty("$d")) {
            clonedReferences[parent.$d._uuid] = parent.$d;
        }
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
            if (clonedReferences.hasOwnProperty(parentUuid)) {
                parentClone._parents[parentUuid] = clonedReferences[parentUuid];
            }

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

Sk.exportSymbol("Sk.builtin.registerParentReferenceInChild", Sk.builtin.registerParentReferenceInChild);
Sk.exportSymbol("Sk.builtin.changeReferences", Sk.builtin.changeReferences);
