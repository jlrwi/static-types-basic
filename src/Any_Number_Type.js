/*jslint
    fudge
*/

//MD # any_number_type/p
//MD This is a numeric pair for storing real and complex numbers./p
//MD ## Module methods/p

import {
    constant
} from "@jlrwi/combinators";
import {
//test     array_map,
//test     exponent,
//test     multiply,
//test     add,
    is_object,
    type_check,
    minimal_object
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_name = "Any Number";

//MD ### .create(real_component, [imaginary_component])/p
//MD The create method takes a numeric value representing the real component of
//MD the number and an optional second numeric value that specifies the
//MD imaginary component./p
//MD Example:/p
//MD ```/p
//MD type_module.create(3, 7);/p
//MD {type_name: "Any Number", r: 3, i: 7}/p
//MD ```/p
const create = function (r = 0, i = 0) {
    return minimal_object({
        type_name,
        toJSON: constant(
            type_name + " (" +
            JSON.stringify(r) +
            " + " +
            JSON.stringify(i) + "i" +
            ")"
        ),
        r,
        i
    });
};

//MD ### .equals(a)(b)/p
// Setoid :: a -> a -> boolean
const adt_equals = function (x) {
    return function (y) {
        return ((x.r === y.r) && (x.i === y.i));
    };
};

//MD ### .lte(a)(b)/p
//MD Determines if b is less than or equal to a. Comparison is made using the
//MD distance from the origin of the complex plane./p
//MD Example:/p
//MD ```/p
//MD type_module.lte({r: -3, i: 7})({r: 1, i: 4});/p
//MD true/p
//MD ```/p
// Ord :: a -> a -> boolean
const lte = function (y) {
    return function (x) {
        return ((x.r**2 + x.i**2) <= (y.r**2 + y.i**2));
    };
};

//MD ### .concat(a)(b)/p
//MD The concat method operates as a numeric sum of each component./p
//MD Example:/p
//MD ```/p
//MD type_module.concat({r: 3, i: 7})({r: -1, i: 4});/p
//MD {type_name: "Any Number", r: 2, i: 11}/p
//MD ```/p
// Semigroup :: {a} -> {a} -> {a}
const concat = function (y) {
    return function (x) {
        return create(y.r + x.r, y.i + x.i);
    };
};

//MD ### .empty()/p
//MD Produces a zero value./p
// Monoid :: () -> {r: 0, i: 0}
const empty = function () {
    return create(0, 0);
};

//MD ### .invert(a)/p
//MD Produces the negative inverse of both component values./p
// Group :: a -> a
const invert = function (x) {
    return create(-x.r, -x.i);
};

//MD ### .map(f)(a)/p
//MD Applies function `f` to both component values./p
//MD Example:/p
//MD ```/p
//MD type_module.map(add(5))({r: -1, i: 4});/p
//MD {type_name: "Any Number", r: 4, i: 9}/p
//MD ```/p
// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return function (x) {
        return create(f(x.r), f(x.i));
    };
};

//MD ### .bimap(f)(g)(a)/p
//MD Applies function `f` to the real component and function `g` to the
//MD imaginary component./p
// Bifunctor :: (a->b) -> (c->d) -> <a, c> -> <b, d>
const bimap = function (f) {
    return function (g) {
        return function (x) {
            return create(f(x.r), g(x.i));
        };
    };
};

//MD ### .validate(a)/p
const validate = function (x) {
    return (
        is_object(x) && type_check("number")(x.r) && type_check("number")(x.i)
    );
};

//MD ### .multiply(a)(b)/p
//MD Performs complex number multiplication on two values.
//MD Example:/p
//MD ```/p
//MD type_module.multiply({r: 2, i: 1})({r: 1, i: 1});/p
//MD {type_name: "Any Number", r: 1, i: 3}/p
//MD ```/p
const complex_multiply = function (y) {
    return function (x) {
        return create((x.r * y.r) - (x.i * y.i))((x.r * y.i) + (x.i * y.r));
    };
};

const type_factory = function () {
    return Object.freeze({
        spec: "curried-static-land",
        version: 1,
        type_name,
        concat,
        empty,
        invert,
        equals: adt_equals,
        lte,
        map,
        bimap,
        multiply: complex_multiply,
        create,
        validate
    });
};

//test const testT = type_factory();
//test const test_fxs = array_map(jsc.literal)([
//test     add(10),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-1)
//test ]);
//test const invoke_of = function (contentsfr, contentsfi) {
//test     return function () {
//test         return create(contentsfr(), contentsfi());
//test     };
//test };

//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999)),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999)),
//test             b: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999)),
//test             c: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999))
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999))
//test         }
//test     },
//test     group: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 invoke_of(jsc.integer(-48, -1), jsc.integer(-48, -1)),
//test                 invoke_of(jsc.integer(-48, -1), jsc.integer(1, 48)),
//test                 invoke_of(jsc.integer(1, 48), jsc.integer(-48, -1)),
//test                 invoke_of(jsc.integer(1, 48), jsc.integer(1, 48))
//test             ])
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 invoke_of(constant(13), constant(11)),
//test                 invoke_of(
//test                     jsc.integer(-999, 999),
//test                     jsc.integer(-999, 999)
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 invoke_of(constant(13), constant(11)),
//test                 invoke_of(
//test                     jsc.integer(-999, 999),
//test                     jsc.integer(-999, 999)
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 invoke_of(constant(13), constant(11)),
//test                 invoke_of(
//test                     jsc.integer(-999, 999),
//test                     jsc.integer(-999, 999)
//test                 )
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999)),
//test             b: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999)),
//test             c: invoke_of(jsc.integer(-999, 999), jsc.integer(-999, 999))
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