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

import {
    constant,
    compose,
    compose2,
    flip,
    on,
    second
} from "@jlrwi/combinators";
import {
//test     string_concat,
//test     array_map,
//test     equals,
    is_object,
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

const type_name = "Constant";

const extract = prop("value");

const empty = function (T) {
    return compose(create)(T.empty);
};

const concat = function (T) {
    return compose2(
        create
    )(
        on(T.concat)(extract)
    );
};

const adt_equals = function (T) {
    return on(T.equals)(extract);
};

const lte = function (T) {
    return on(T.lte)(extract);
};

// Discard the f parameter and just return the unchanged Constant
const map = second;

// Foldable :: ((b, a) -> b) -> b -> C a -> b
//                ignored               ignored
const reduce = function (ignore) {
    return constant;
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> C a -> U<C b>
//                                    ignored
const traverse = function (U) {
    return function (ignore) {
        return U.of;
    };
};

const validate = function (T) {
    return function (x) {
        return (
            is_object(x)
            ? T.validate(x.value)
            : false
        );
    };
};

const create = function (x) {
    return minimal_object({
        type_name,
        toJSON: constant("Constant (" + JSON.stringify(x) + ")"),
        value: x
    });
};

const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name,
        map,
        create,
        reduce,
        traverse,
        validate: is_object,
        extract
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        if (check_for_prop("concat")) {
            base_type.concat = concat(type_of);
            base_type.ap = base_type.concat;
        }

        if (check_for_prop("empty")) {
            base_type.empty = empty(type_of);
            base_type.of = base_type.empty;
        }

        if (check_for_prop("equals")) {
            base_type.equals = adt_equals(type_of);
        }

        if (check_for_prop("lte")) {
            base_type.lte = lte(type_of);
        }

        if (check_for_prop("validate")) {
            base_type.validate = validate(type_of);
        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const testT = type_factory(slm.str);
//test const pair_of_bool_strT = pair_type(slm.bool)(slm.str);
//test const maybe_of_stringT = maybe_type(slm.str);
//test const test_fxs = array_map(jsc.literal)([
//test     string_concat("_"),
//test     flip(string_concat)("!"),
//test     function (str) {
//test         return str.slice(0, 2);
//test     },
//test     function (str) {
//test         return str.split("").reverse().join("");
//test     }
//test ]);
//test const invoke_of = function (contentsf) {
//test     return compose(create)(contentsf);
//test };
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.string()),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.string()),
//test             u: invoke_of(jsc.wun_of(test_fxs)),
//test             v: invoke_of(jsc.wun_of(test_fxs))
//test         }
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.string()),
//test             f: jsc.wun_of(test_fxs),
//test             u: invoke_of(jsc.wun_of(test_fxs)),
//test             x: jsc.string()
//test         }
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: {
//test             f: jsc.wun_of(test_fxs),
//test             x: jsc.string(),
//test             u: invoke_of(jsc.string())
//test         },
//test         compare_with: equals
//test     },
//test     traversable: {
//test         T: testT,
//test         signature: {
//test             A: pair_of_bool_strT,
//test             B: maybe_of_stringT,
//test             a: function () {
//test                 return pair_of_bool_strT.create(
//test                     jsc.boolean()()
//test                 )(
//test                     jsc.string()()
//test                 );
//test             },
//test             f: jsc.literal(function (pr) {
//test                 return maybe_of_stringT.just(pr.snd);
//test             }),
//test             g: jsc.wun_of(test_fxs),
//test             u: invoke_of(
//test                 function () {
//test                     return pair_of_bool_strT.create(
//test                         jsc.boolean()()
//test                     )(
//test                         maybe_of_stringT.just(jsc.string()())
//test                     );
//test                 }
//test             )
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             maybe_of_stringT,
//test             compose(maybe_type)(type_factory)(maybe_of_stringT),
//test             compose(maybe_type)(type_factory)(pair_of_bool_strT),
//test             pair_type(slm.bool)(maybe_type(testT))
//test         ])
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.string()),
//test             b: invoke_of(jsc.string()),
//test             c: invoke_of(jsc.string())
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.string())
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.wun_of([jsc.string(), "matcher"])),
//test             b: invoke_of(jsc.wun_of([jsc.string(), "matcher"])),
//test             c: invoke_of(jsc.wun_of([jsc.string(), "matcher"]))
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: invoke_of(jsc.string()),
//test             b: invoke_of(jsc.string()),
//test             c: invoke_of(jsc.string())
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