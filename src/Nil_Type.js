/*jslint
    fudge
*/

//MD # nil_type/p
//MD A type representing all bottom values in Javascript./p

//MD ## Module methods/p

import {
//test     identity,
    constant,
    apply_with,
    second,
    compose
} from "@jlrwi/combinators";
import {
    equals,
    empty_object,
    is_object
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Nil

const type_name = "Nil";

// Custom methods

const object_is_nil = function (o) {
    return (
        is_object(o) &&
        Object.isFrozen(o) &&
        (Object.keys(o).length === 0) &&
        (o.constructor === undefined)
    );
};

//MD ### .create(x)/p
//MD Returns an empty, frozen object./p
const create = compose(Object.freeze)(empty_object);

//MD ### .equals(a)(b)/p
//MD Returns true because all bottom values are considered to be equal./p
// Setoid :: a -> a -> Boolean
const type_equals = compose(constant)(constant(true));

//MD ### .lte(a)(b)/p
//MD Returns true because all bottom values are considered to be equal./p
// Ord :: a -> a -> Boolean
const lte = compose(constant)(constant(true));

//MD ### .concat(a)(b)/p
//MD The result of concatenating two bottom values is a bottom value./p
const concat = constant;

//MD ### .empty()/p
//MD Returns an empty, frozen object./p
const empty = create;

//MD ### .map(f)(a)/p
//MD Returns the value `a` because a bottom value cannot be changed./p
// Functor :: (a -> b) -> a -> b
const map = second;

//MD ### .validate(a)/p
//MD Tests for one of the following: undefined, null, NaN, or a frozen,empty
//MD object./p
const validate = function (x) {
    const testers = [
        equals(undefined),
        equals(null),
        Number.isNaN,
        object_is_nil
    ];

    return testers.some(apply_with(x));
};

const type_factory = function () {
    return Object.freeze({
        spec: "curried-static-land",
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

//test const testT = type_factory();
//test const nil_obj = create();
//test const custom_predicate = function (verdict) {
//test     return function ({left, right, compare_with}) {
//test         return verdict(compare_with(left)(right));
//test     };
//test };
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             f: jsc.literal(identity),
//test             g: jsc.literal(identity)
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             b: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             c: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             b: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             c: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             b: jsc.wun_of([null, undefined, NaN, nil_obj]),
//test             c: jsc.wun_of([null, undefined, NaN, nil_obj])
//test         }
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