/*jslint
    fudge
*/

import {
//test     apply,
    compose,
    constant,
    converge,
    flip
} from "@jlrwi/combinators";
import {
//test     log,
//test     string_concat,
//test     array_map,
//test     add,
//test     exponent,
//test     multiply,
//test     max,
    and,
    andf,
    either,
    prop,
    is_object,
    type_check,
    minimal_object,
    object_has_property
} from "@jlrwi/esfunctions";
//test import {
//test     slm,
//test     array_type
//test } from "@jlrwi/es-static-types";
//test import either_type from "../src/Either_Type.js";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of a point

const type_name = "2D Point";

const x = prop ("x");
const y = prop ("y");

// Pair<a, b> -> a
//const fst = prop ("fst");

// Pair<a, b> -> b
//const snd = prop ("snd");

// a -> b -> Pair<a, b>
// Morphism between functors Function and Pair
const create = function (x) {
    return function (y) {
        return minimal_object ({
            toJSON: constant (
                "2D Point (" + JSON.stringify(x) + "," + JSON.stringify(y) + ")"
            ),
            x,
            y
        });
    };
};

// Setoid :: T -> a -> a -> boolean
const equals = function (b) {
    return function (a) {
        return (a.x === b.x) && (a.y === b.y);
    };
};

// Ord :: T -> a -> a -> boolean
const lte = function function (b) {
    return function (a) {
        return (
            (a.x === b.x)
            ? a.y <= b.y
            : a.x <= b.x
        );
    };
};

// Semigroup :: T -> a -> a -> a
const concat = function (a) {
    return function (b) {
        return create (a.x + b.x) (a.y + b.y);
    };
};

// Monoid :: T -> _ -> a
const empty = function () {
    return create (0) (0);
};

// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return converge (create) (compose (f) (x)) (y);
};

// Applicative :: a -> F<a>
// const of = create ();
const of = flip (create) (0);

// Bifunctor :: (a->b) -> (c->d) -> Pair<a, c> -> Pair<b, d>
const bimap = function (f) {
    return function (g) {
        return converge (create) (compose (f) (x)) (compose (g) (y));
    };
};

// Chain :: (b -> (a, c)) -> (a, b) -> (a, c)
const chain = function (f) {
    const apply_f = compose (f) (snd);
    const to_fst = converge (spec_fst.concat) (
        fst
    ) (
        compose (fst) (apply_f)
    );
    const to_snd = compose (snd) (apply_f);
    return converge (create) (to_fst) (to_snd);
};

// Extend :: ((a, b)-> c) -> (a, b) -> (a, c)
const extend = function (f) {
    return converge (create) (fst) (f);
};

const extract = snd;

// Foldable :: ((b, a) -> b, b, <a>) -> b
const reduce = function (f) {
    return function (acc) {
        return function (a) {
            return f (acc) (a.x);
        };
    };
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> T<a> -> U<T<b>>
const traverse = function (to_T) {
    return function (f) {
        return converge (
            to_T.map
        ) (
            compose (create) (fst)
        ) (
            compose (f) (snd)
        );
    };
};

// Semigroupoid :: (a, b) -> (b, c) -> (a, c)
const adt_compose = function (a) {
    return function (b) {
        return create (a.x) (b.y);
    };
};

const validate = either (is_object) (
    andf (
        compose (type_check ("number")) (x)
    ) (
        compose (type_check ("number")) (y)
    )
) (
    constant (false)
);

const type_factory = function (spec_fst) {
    return function (spec_snd) {
        const base_type = {
            spec: "StaticLand",
            version: 1,
            type_name,
            bimap,
            create,
            validate,
            reduce,
            map,
            of: create (),
            traverse,
            extend,
            extract,
            compose: adt_compose
        };

        if (is_object (spec_fst) && is_object (spec_snd)) {

            const check_for_prop = and (
                flip (object_has_property) (spec_fst)
            ) (
                flip (object_has_property) (spec_snd)
            );

            if (check_for_prop ("equals")) {
                base_type.equals = equals (spec_fst) (spec_snd);
            }

            if (check_for_prop ("lte")) {
                base_type.lte = lte (spec_fst) (spec_snd);
            }

            if (check_for_prop ("concat")) {
                base_type.concat = concat (spec_fst) (spec_snd);
                base_type.ap = ap (spec_fst) (spec_snd);
                base_type.chain = chain (spec_fst) (spec_snd);
            }

            if (check_for_prop ("empty")) {
                base_type.empty = empty (spec_fst) (spec_snd);
                base_type.of = of (spec_fst) (spec_snd);
            }

            if (check_for_prop ("validate")) {
                base_type.validate = validate (spec_fst) (spec_snd);
            }

            base_type.type_name += "<" +
                spec_fst.type_name + ", " + spec_snd.type_name +
            ">";
        }

        return base_type;
    };
};

//test const testT = type_factory (slm.str) (slm.num_prod);
//test const either_str_numT = either_type (slm.str) (slm.num_prod);
//test const array_of_numT = array_type (slm.num_prod);
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
//test const num_fxs = array_map (jsc.literal) ([
//test     add (10),
//test     exponent (2),
//test     multiply (3),
//test     multiply (-1),
//test     Math.floor
//test ]);
//test const either_to_array = function (x) {
//test     if (x.type_name === "Left") {
//test         return [];
//test     }
//test     return array_of_numT.of (x.value);
//test };
//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(num_fxs),
//test             g: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             u: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.wun_of(num_fxs)
//test             ),
//test             v: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.wun_of(num_fxs)
//test             )
//test         }
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             u: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.wun_of(num_fxs)
//test             ),
//test             f: jsc.wun_of(num_fxs),
//test             x: jsc.integer(-99, 99)
//test         }
//test     },
//test     bifunctor: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(str_fxs),
//test             g: jsc.wun_of(str_fxs),
//test             h: jsc.wun_of(num_fxs),
//test             i: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     chain: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(
//test                 converge (testT.create) (String) (jsc.wun_of(num_fxs) ())
//test             ),
//test             g: jsc.literal(
//test                 converge (testT.create) (String) (jsc.wun_of(num_fxs) ())
//test             ),
//test             u: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     monad: {
//test         T: testT,
//test         signature: {
//test             a: jsc.integer(-99, 99),
//test             f: jsc.literal(
//test                 converge (testT.create) (String) (jsc.wun_of(num_fxs) ())
//test             ),
//test             u: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     extend: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(compose (jsc.wun_of(num_fxs) ()) (snd)),
//test             g: jsc.literal(compose (jsc.wun_of(num_fxs) ()) (snd)),
//test             w: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     comonad: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(compose (jsc.wun_of(num_fxs) ()) (snd)),
//test             w: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         },
//test         compare_with: array_map (prop ("equals")) ([
//test             testT,
//test             slm.num_prod
//test         ])
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(jsc.wun_of([add, max])),
//test             x: 0,
//test             u: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         },
//test         compare_with: slm.num_prod.equals
//test     },
//test     traversable: {
//test         T: testT,
//test         signature: {
//test             A: either_str_numT,
//test             B: array_of_numT,
//test             a: jsc.wun_of([
//test                 compose (either_str_numT.left) (jsc.string()),
//test                 compose (either_str_numT.right) (jsc.integer(-99, 99))
//test             ]),
//test             f: jsc.literal(either_to_array),
//test             g: jsc.wun_of(num_fxs),
//test             u: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.wun_of([
//test                     compose (either_str_numT.left) (jsc.string()),
//test                     compose (either_str_numT.right) (
//test                         jsc.array(
//test                             jsc.integer(3, 8),
//test                             jsc.integer(-99, 99)
//test                         )
//test                     )
//test                 ])
//test             )
//test         },
//test         compare_with: array_map (prop ("equals")) ([
//test             array_of_numT,
//test             compose (array_type) (type_factory (slm.str)) (array_of_numT),
//test             compose (array_type) (type_factory (slm.str)) (
//test                 either_type (slm.str) (array_of_numT)
//test             ),
//test             compose (either_type (slm.str)) (array_type) (testT)
//test         ])
//test     },
//test     semigroupoid: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             c: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             ),
//test             c: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: converge (testT.create) (
//test                 jsc.string()
//test             ) (
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 converge (testT.create) (
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 ) (
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge (testT.create) (
//test                     jsc.string()
//test                 ) (
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 converge (testT.create) (
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 ) (
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge (testT.create) (
//test                     jsc.string()
//test                 ) (
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 converge (testT.create) (
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 ) (
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge (testT.create) (
//test                     jsc.string()
//test                 ) (
//test                     jsc.integer(-99, 99)
//test                 )
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 converge (testT.create) (
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 ) (
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge (testT.create) (
//test                     jsc.string()
//test                 ) (
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 converge (testT.create) (
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 ) (
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge (testT.create) (
//test                     jsc.string()
//test                 ) (
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 converge (testT.create) (
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 ) (
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge (testT.create) (
//test                     jsc.string()
//test                 ) (
//test                     jsc.integer(-99, 99)
//test                 )
//test             ])
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