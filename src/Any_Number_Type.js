/*jslint
    fudge
*/

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

const create = function (r = 0, i = 0) {
    return minimal_object({
        type_name,
        toJSON: constant(
            "Any Number (" +
            JSON.stringify(r) +
            " + " +
            JSON.stringify(i) +
            "i" +
            ")"
        ),
        r,
        i
    });
};

const concat = function (y) {
    return function (x) {
        return create(y.r + x.r, y.i + x.i);
    };
};

const empty = function () {
    return create(0, 0);
};

const invert = function (x) {
    return create(0 - x.r, 0 - x.i);
};

const adt_equals = function (x) {
    return function (y) {
        return ((x.r === y.r) && (x.i === y.i));
    };
};

const lte = function (y) {
    return function (x) {
        return ((x.r**2 + x.i**2) <= (y.r**2 + y.i**2));
    };
};

const map = function (f) {
    return function (x) {
        return create(f(x.r), f(x.i));
    };
};

// Bifunctor :: (a->b) -> (c->d) -> Pair<a, c> -> Pair<b, d>
const bimap = function (f) {
    return function (g) {
        return function (x) {
            return create(f(x.r), g(x.i));
        };
    };
};

const complex_multiply = function (y) {
    return function (x) {
        return create((x.r * y.r) - (x.i * y.i))((x.r * y.i) + (x.i * y.r));
    };
};

const validate = function (x) {
    return (
        is_object(x) && type_check("number")(x.r) && type_check("number")(x.i)
    );
};

const type_factory = function (ignore) {
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