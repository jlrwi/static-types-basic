/*jslint
    fudge
*/

//erase /*
import nil_type from "../src/Nil_Type.js";
//erase */
//stage import nil_type from "./Nil_Type.min.js";

import {
    compose,
    constant,
    identity,
    flip,
    pipeN
} from "@jlrwi/combinators";
import {
//test     log,
//test     array_map,
//test     string_concat,
    equals,
    is_object,
    minimal_object,
    object_has_property,
    prop,
    andf,
    orf,
    either
} from "@jlrwi/esfunctions";
//test import {
//test     slm,
//test     array_type
//test } from "@jlrwi/es-static-types";
//test import pair_type from "../src/Pair_Type.js";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const nilT = nil_type ();

const type_name = "Maybe";

const extract = prop ("value");

const nothing = function (x) {
    return minimal_object({
        type_name: "Nothing",
        toJSON: constant ("Maybe.Nothing"),
        value: x
    });
};

const just = function (x) {
    return minimal_object({
        type_name: "Just",
        toJSON: constant ("Maybe.Just (" + JSON.stringify(x) + ")"),
        value: x
    });
};

// a -> M<a>
const create = either (nilT.validate) (nothing) (just);

const is_Just = compose (equals ("Just")) (prop ("type_name"));
const is_Nothing = compose (equals ("Nothing")) (prop ("type_name"));

/*
const is_Just = function (x) {
    if (!is_object (x) || !object_has_property ("type_name") (x)) {
        throw new TypeError("Not a Maybe value");
    }

    return (x.type_name === "Just");
};

const is_Nothing = function (x) {
    if (!is_object (x) || !object_has_property ("type_name") (x)) {
        throw new TypeError("Not a Maybe value");
    }

    return (x.type_name === "Nothing");
};
*/

// Setoid :: a -> a -> boolean
const adt_equals = function (T) {
    return function (y) {
        return function (x) {
            if (x.type_name === y.type_name) {
                return (
                    is_Nothing (x)
                    ? true
                    : T.equals (extract (x)) (extract (y))
                );
            }

            return false;
        };
    };
};

// Ord :: a -> a -> Boolean
const lte = function (T) {
    return function (y) {
        return function (x) {

            if (is_Nothing (x)) {
                return true;
            }

            if (is_Nothing (y)) {
                return false;
            }

            return T.lte (extract (y)) (extract (x));
        };
    };
};

// Semigroup :: a -> a -> a
const concat = function (T) {
    return function (y) {
        return function (x) {
            if (is_Nothing (x)) {
                return y;
            }

            if (is_Nothing (y)) {
                return x;
            }

            return just (T.concat (extract (y)) (extract (x)));
        };
    };
};

// Monoid :: () -> a
const empty = function () {
    return nothing ();
};

// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return either (is_Nothing) (identity) (pipeN (
        extract,
        f,
        just
    ));
};

// Alt :: <a> -> <a> -> <a>
const alt = function (y) {
    return either (is_Nothing) (constant (y)) (identity);
};

// Plus :: () -> a
const zero = empty;

// Apply :: <(a -> b)> -> <a> -> <b>
const ap = function (mf) {
    return function (mx) {
        if (is_Nothing (mf) || is_Nothing (mx)) {
            return nothing ();
        }

        return just (extract (mf) (extract (mx)));
    };
};

// Applicative :: a -> <a>
const of = just;

// Chain :: (a -> <b>) -> <a> -> <b>
const chain = function (f) {
    return either (is_Nothing) (identity) (compose (f) (extract));
};

// Foldable :: ((b, a) -> b, b, <a>) -> b
const reduce = function (f) {
    return function (initial) {
        return function (x) {
            return (
                is_Nothing (x)
                ? initial
                : f (initial) (extract (x))
            );
        };
    };
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> T<a> -> U<T<b>>
const traverse = function (to_T) {
    return function (f) {
        return function (x) {
            return (
                is_Nothing (x)
                ? to_T.of (x)
                : to_T.map (just) (f (extract (x)))
            );
        };
    };
};

// Filterable :: (a -> Boolean) -> <a> -> <a>
const filter = function (f) {
    return function (x) {
        if (is_Nothing (x)) {
            return x;
        }

        return (
            f (extract (x)) === true
            ? x
            : nothing ()
        );
    };
};

const validate = function (T) {
    return function (x) {
        if (!is_object (x) || !object_has_property("type_name")) {
            return false;
        }

        return (
            is_Just (x)
            ? T.validate (extract (x))
            : is_Nothing (x)
        );
    };
};

const type_factory = function (type_of) {
    const base_type = {
        spec: "StaticLand",
        version: 1,
        type_name,
        just,
        nothing,
        is_Just,
        is_Nothing,
        create,
        empty,
        reduce,
        map,
        alt,
        zero,
        ap,
        of,
        chain,
        traverse,
        filter,
        validate: andf (is_object) (orf (is_Just) (is_Nothing))
    };

    if (is_object (type_of)) {

        const check_for_prop = flip (object_has_property) (type_of);

        base_type.concat = concat (type_of);
        base_type.type_name += "< " + type_of.type_name + " >";

        if (check_for_prop ("equals")) {
            base_type.equals = adt_equals (type_of);
        }

        if (check_for_prop ("lte")) {
            base_type.lte = lte (type_of);
        }

        if (check_for_prop ("validate")) {
            base_type.validate = validate (type_of);
        }
    }

    return Object.freeze(base_type);
};

//test const testT = type_factory (slm.str);
//test const array_of_str = array_type (slm.str);
//test const pairT = pair_type (slm.num_prod) (array_of_str);
//test const str_fxs = array_map (jsc.literal) ([
//test     string_concat ("_"),
//test     flip (string_concat) ("!"),
//test     function (str) {
//test         return str.slice(0, 2);
//test     },
//test     function (str) {
//test         return str.split("").reverse().join("");
//test     }
//test ]);

//test const str_min = function (a) {
//test     return either (slm.str.lte (a)) (constant (a)) (identity);
//test };

//test const string_add = function (y) {
//test     return function (x) {
//test         if (equals (undefined) (y)) {
//test             return x;
//test         }
//test
//test         if (equals (undefined) (x)) {
//test             return y;
//test         }
//test
//test         return y + x;
//test     };
//test };

//test const filters = array_map (jsc.literal) ([
//test     function (str) {
//test         return (str < "m");
//test     },
//test     function (str) {
//test         return (str.length > 10);
//test     },
//test     function (str) {
//test         return (str[0] <= str[str.length - 1]);
//test     }
//test ]);

//test const make_value = function (maker) {
//test     return function (contents) {
//test         return compose (maker) (contents);
//test     };
//test };

//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs),
//test             g: jsc.wun_of(str_fxs)
//test         }]
//test     },
//test     alt: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs)
//test         }]
//test     },
//test     plus: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs)
//test         }]
//test     },
//test     apply: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             u: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(str_fxs)),
//test                 make_value (nothing) (constant)
//test             ]),
//test             v: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(str_fxs)),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs),
//test             u: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(str_fxs)),
//test                 make_value (nothing) (constant)
//test             ]),
//test             x: jsc.string()
//test         }]
//test     },
//test     chain: {
//test         T: testT,
//test         signature: [{
//test             f: jsc.literal(make_value (just) (jsc.wun_of(str_fxs) ())),
//test             g: jsc.literal(make_value (just) (jsc.wun_of(str_fxs) ())),
//test             u: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     alternative: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(str_fxs)),
//test                 make_value (nothing) (constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(str_fxs)),
//test                 make_value (nothing) (constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     monad: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.string(),
//test             f: jsc.literal(make_value (just) (jsc.wun_of(str_fxs) ())),
//test             u: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: [{
//test             f: jsc.literal(jsc.wun_of([string_add, str_min])),
//test             x: "",
//test             u: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
//test         }],
//test         compare_with: slm.str.equals
//test     },
//test     traversable: {
//test         T: testT,
//test         signature: [{
//test             A: pairT,
//test             B: array_of_str,
//test             a: function () {
//test                 return pairT.create (
//test                     jsc.integer(-99, 99) ()
//test                 ) (
//test                     jsc.string() ()
//test                 );
//test             },
//test             f: jsc.literal(compose (array_of_str.of) (prop ("snd"))),
//test             g: jsc.wun_of(str_fxs),
//test             u: jsc.wun_of([
//test                 function () {
//test                     return just (pairT.create (
//test                         jsc.integer(-99, 99) ()
//test                     ) (
//test                         jsc.array(1, jsc.string) ()
//test                     ));
//test                 },
//test                 make_value (nothing) (constant)
//test             ])
//test         }],
//test         compare_with: array_map (prop ("equals")) ([
//test             array_of_str,
//test             compose (array_type) (type_factory) (array_of_str),
//test             compose (array_type) (type_factory) (
//test                 pair_type (slm.num_prod) (array_of_str)
//test             ),
//test             compose (pair_type (slm.num_prod)) (array_type) (testT)
//test         ])
//test     },
//test     filterable: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }]
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(["ah", "the", "string"])),
//test                 make_value (nothing) (constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(["ah", "the", "string"])),
//test                 make_value (nothing) (constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(["ah", "the", "string"])),
//test                 make_value (nothing) (constant)
//test             ])
//test         }]
//test     },
//test     ord: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(["ah", "the", "string"])),
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(["ah", "the", "string"])),
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value (just) (jsc.wun_of(["ah", "the", "string"])),
//test                 make_value (just) (jsc.string()),
//test                 make_value (nothing) (constant)
//test             ])
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