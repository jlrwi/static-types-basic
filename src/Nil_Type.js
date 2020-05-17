/*jslint
    fudge
*/

import {
//test     identity,
    constant,
    second,
    compose
} from "@jlrwi/combinators";
import {
//test     log,
    equals,
    empty_object,
    is_object
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Nil

const type_name = "Nil";

// Custom methods

const object_is_nil = function (o) {
    return (
        is_object (o) &&
        Object.isFrozen(o) &&
        Object.keys(o).length === 0 &&
        o.constructor === undefined
    );
};

const validate = function (x) {
    const testers = [
        equals (undefined),
        equals (null),
        Number.isNaN,
        object_is_nil
    ];

    return testers.some(function (f) {
        return f (x);
    });
};

const create = compose (Object.freeze) (empty_object);

// Setoid :: a -> a -> Boolean
const type_equals = compose (constant) (constant (true));

// Ord :: a -> a -> Boolean
const lte = compose (constant) (constant (true));

const concat = constant;

const empty = create;

// Functor :: (a -> b) -> a -> b
const map = second;

const type_factory = function () {
    return Object.freeze({
        spec: "StaticLand",
        version: 1,
        type_name,
        equals: type_equals,
        lte,
        concat,
        empty,
        map,
        create,
        validate
    });
};

//test const testT = type_factory ();
//test const nil_obj = create ();

//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             f: jsc.literal(identity),
//test             g: jsc.literal(identity)
//test         }]
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             b: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             c: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }]
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }]
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             b: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             c: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }]
//test     },
//test     ord: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             b: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             c: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }]
//test     }
//test });
//test test_roster.forEach(jsc.claim);
//testbatch /*
//test jsc.check({
//test     on_report: log
//test });
//testbatch */
//testbatch export {jsc};

export default Object.freeze(type_factory);