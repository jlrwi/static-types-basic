/*jslint
    fudge
*/

/*
Attempts to make this type function as an Applicative using straightforward
logic don't succeed in passing the tests.

If Constant is instantiated with a monoid, it can be derived to behave like an
Applicative, using .concat() for .ap(), and .empty() for .of()

This allows the sort-of Applicative to be used with traversal functions, with
different monoids (eg arrays vs. numbers) producing different results.

References:
Sanctuary Constant:
https://github.com/sanctuary-js/sanctuary-constant/

Explanation of partial lenses
https://calmm-js.github.io/partial.lenses/implementation.html
*/

// This is Constant without the code to make it an applicative when
// instantiated w/ a monoid

import {
    constant,
    compose,
    flip,
    on,
    second,
    identity
} from "@jlrwi/combinators";
import {
//test     log,
//test     string_concat,
//test     array_map,
//test     equals,
    is_object,
    equals,
    prop,
    object_has_property,
    minimal_object
} from "@jlrwi/esfunctions";
//test import {slm} from "@jlrwi/es-static-types";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test import maybe_type from "../src/Maybe_Type.js";
//test import pair_type from "../src/Pair_Type.js";
//test let jsc = jsCheck();

const type_name = "Primitive Constant";

const extract = identity;

const adt_equals = equals;

// Discard the f parameter and just return the unchanged Constant
const map = second;

const validate = constant (true);

const create = identity;

const type_factory = function (ignore) {
    const base_type = {
        spec: "StaticLand",
        version: 1,
        type_name,
        map,
        equals: adt_equals,
        create,
        validate,
        extract
    };

    return Object.freeze(base_type);
};

//test const testT = type_factory (slm.str);
//test const pair_of_bool_strT = pair_type (slm.bool) (slm.str);
//test const maybe_of_stringT = maybe_type (slm.str);
//test const test_fxs = array_map (jsc.literal) ([
//test     string_concat ("_"),
//test     flip (string_concat) ("!"),
//test     function (str) {
//test         return str.slice(0, 2);
//test     },
//test     function (str) {
//test         return str.split("").reverse().join("");
//test     }
//test ]);
//test const invoke_of = function (contentsf) {
//test     return compose (create) (contentsf);
//test };
//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.string ()),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.string ()),
//test             u: invoke_of (jsc.wun_of(test_fxs)),
//test             v: invoke_of (jsc.wun_of(test_fxs))
//test         }
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.string ()),
//test             f: jsc.wun_of(test_fxs),
//test             u: invoke_of (jsc.wun_of(test_fxs)),
//test             x: jsc.string()
//test         }
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: {
//test             f: jsc.wun_of(test_fxs),
//test             x: jsc.string(),
//test             u: invoke_of (jsc.string ())
//test         },
//test         compare_with: equals
//test     },
//test     traversable: {
//test         T: testT,
//test         signature: {
//test             A: pair_of_bool_strT,
//test             B: maybe_of_stringT,
//test             a: function () {
//test                 return pair_of_bool_strT.create (
//test                     jsc.boolean() ()
//test                 ) (
//test                     jsc.string() ()
//test                 );
//test             },
//test             f: jsc.literal(function (pr) {
//test                 return maybe_of_stringT.just (pr.snd);
//test             }),
//test             g: jsc.wun_of(test_fxs),
//test             u: invoke_of (
//test                 function () {
//test                     return pair_of_bool_strT.create (
//test                         jsc.boolean() ()
//test                     ) (
//test                         maybe_of_stringT.just(jsc.string() ())
//test                     );
//test                 }
//test             )
//test         },
//test         compare_with: array_map (prop ("equals")) ([
//test             maybe_of_stringT,
//test             compose (maybe_type) (type_factory) (maybe_of_stringT),
//test             compose (maybe_type) (type_factory) (pair_of_bool_strT),
//test             pair_type (slm.bool) (maybe_type (testT))
//test         ])
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.string ()),
//test             b: invoke_of (jsc.string ()),
//test             c: invoke_of (jsc.string ())
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.string ())
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.wun_of([jsc.string(), "matcher"])),
//test             b: invoke_of (jsc.wun_of([jsc.string(), "matcher"])),
//test             c: invoke_of (jsc.wun_of([jsc.string(), "matcher"]))
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of (jsc.string ()),
//test             b: invoke_of (jsc.string ()),
//test             c: invoke_of (jsc.string ())
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