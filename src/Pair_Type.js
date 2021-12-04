/*jslint
    fudge
*/

//MD # pair_type/p
//MD Basic Pair data type. Additiona algebras become available if instantiated
//MD with types for both elements./p

//MD ## Module methods/p

import {
    compose,
    constant,
    converge,
    flip
} from "@jlrwi/combinators";
import {
//test     string_concat,
//test     array_map,
//test     add,
//test     exponent,
//test     multiply,
//test     max,
    and,
    andf,
    functional_if,
    prop,
    is_object,
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

// Static Land implementation of Pair

const type_name = "Pair";

//MD ### .create(first_value)(second_value)/p
//MD Returns a pair./p
//MD Example:/p
//MD ```/p
//MD type_module.create("first")(7);/p
//MD {type_name: "Pair", fst: "first", snd: 7}/p
//MD ```/p
// a -> b -> Pair<a, b>
// Morphism between functors Function and Pair
const create = function (fst) {
    return function (snd) {
        return minimal_object({
            type_name,
            toJSON: constant(
                "Pair (" + JSON.stringify(fst) + "," + JSON.stringify(snd) + ")"
            ),
            fst,
            snd
        });
    };
};

//MD ### .fst(a)/p
//MD Retrieve the first value of a pair./p
// Pair<a, b> -> a
const fst = prop("fst");

//MD ### .snd(a)/p
//MD Retrieve the second value of a pair./p
// Pair<a, b> -> b
const snd = prop("snd");

//MD ### .equals(a)(b)/p
//MD Only available when type is instantiated with a pair of Setoids./p
// Setoid :: T -> a -> a -> boolean
const equals = function (spec_fst) {
    return function (spec_snd) {
        return function (ys) {
            return function (xs) {
                return and(
                    spec_fst.equals(fst(xs))(fst(ys))
                )(
                    spec_snd.equals(snd(xs))(snd(ys))
                );
            };
        };
    };
};

//MD ### .lte(a)(b)/p
//MD Only available when type is instantiated with a pair of Ords. Measures
//MD if `b` is less than or equal to `a`./p
// Ord :: T -> a -> a -> boolean
const lte = function (spec_fst) {
    return function (spec_snd) {
        return function (ys) {
            return function (xs) {
                return (
                    spec_fst.equals(fst(ys))(fst(xs))
                    ? spec_snd.lte(snd(ys))(snd(xs))
                    : spec_fst.lte(fst(ys))(fst(xs))
                );
            };
        };
    };
};

//MD ### .concat(a)(b)/p
//MD Concatenates each element of the pair. Only available when type is
//MD instantiated with a pair of Semigroups./p
// Semigroup :: T -> a -> a -> a
const concat = function (spec_fst) {
    return function (spec_snd) {
        return function (ys) {
            return function (xs) {
                return create(
                    spec_fst.concat(fst(ys))(fst(xs))
                )(
                    spec_snd.concat(snd(ys))(snd(xs))
                );
            };
        };
    };
};

//MD ### .empty()/p
//MD Only available when type is instantiated with a pair of Monoids. Each
//MD element is set to the appropriate empty value./p
// Monoid :: T -> _ -> a
const empty = function (spec_fst) {
    return function (spec_snd) {
        return converge(create)(spec_fst.empty)(spec_snd.empty);
    };
};

// Map, ap, reduce, and of are snd-biased

//MD ### .map(f)(a)/p
//MD Applies `f` to the second value of the pair./p
// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return converge(create)(fst)(compose(f)(snd));
};

//MD ### .ap(f)(a)/p
//MD Only available when type is instantiated with a Semigroup.
//MD The first elements of the pairs are concatenated. The function in the
//MD second element of the first pair is applied to the value in the second
//MD element of the second pair./p
// Apply :: F<a->b> -> F<a> -> F<b>
// Must be given the spec types to harvest the concat function for fst
// Otherwise is not lawful (fails Interchange test)
const ap = function (spec_fst) {
    return function (ignore) {
        return function (fs) {
            return function (xs) {
                return create(
                    spec_fst.concat(fst(xs))(fst(fs))
                )(
                    snd(fs)(snd(xs))
                );
            };
        };
    };
};

//MD ### .of(x)/p
//MD Returns a pair with an empty first element, setting the second element to
//MD `x`. Only available when type is instantiated with a Monoid./p
// Applicative :: a -> F<a>
const of = function (spec_fst) {
    return function (ignore) {
        return create(spec_fst.empty());
    };
};

//MD ### .chain(f)(a)/p
//MD Returns the result of concatenating the first element of `a` and the result
//MD of `f`, and the second element of the result of `f`. Only available when
//MD type is instantiated with a Semigroup./p
// Chain :: (b -> (a, c)) -> (a, b) -> (a, c)
const chain = function (spec_fst) {
    return function (ignore) {
        return function (f) {
            return function (x) {
// Get the result of applying f to snd
                const apply_f = f(snd(x));

                return create(
// Concat the original fst and the resulting fst
                    spec_fst.concat(fst(x))(fst(apply_f))
                )(
// Use the resulting snd
                    snd(apply_f)
                );
/*
// f is applied to snd
            const apply_f = compose(f)(snd);

            const to_fst = converge(
                spec_fst.concat
            )(
                fst
            )(
                compose(fst)(apply_f)
            );

// Retrieve the snd value the result of apply_f
            const to_snd = compose(snd)(apply_f);
            return converge(create)(to_fst)(to_snd);
*/
            };
        };
    };
};

//MD ### .bimap(f)(g)(a)/p
//MD Applies `f` to the first element in `a`, and `g` to the second./p
// Bifunctor :: (a->b) -> (c->d) -> Pair<a, c> -> Pair<b, d>
const bimap = function (f) {
    return function (g) {
        return converge(create)(compose(f)(fst))(compose(g)(snd));
    };
};

//MD ### .extend(f)(a)/p
//MD Return value is the first element from `a` and the result of `f`./p
// Extend :: ((a, b)-> c) -> (a, b) -> (a, c)
const extend = function (f) {
    return converge(create)(fst)(f);
};

//MD ### .extract(a)/p
//MD Returns the second element of the pair./p
// Comonad :: (a, b) -> b
const extract = snd;

//MD ### .reduce(f)(initial_value)(a)/p
//MD Returns the result of applying `f` to `initial_value` and the second
//MD element of the pair./p
// Foldable :: ((b, a) -> b, b, <a>) -> b
const reduce = function (f) {
    return function (acc) {
        return compose(f(acc))(snd);
    };
};

//MD ### .traverse(type_module)(f)(a)/p
//MD Returns pair of first element and function result wrapped in
//MD `type_module`./p
// Traversable :: Applicative<U> -> (a -> U<b>) -> (c, a) -> U<(c, b)>
const traverse = function (to_T) {
    return function (f) {
        return converge(
            to_T.map
        )(
            compose(create)(fst)
        )(
            compose(f)(snd)
        );
    };
};

//MD ### .compose(a)(b)/p
//MD Returns pair of first element of `a` and second element of `b`./p
// Semigroupoid :: (a, b) -> (b, c) -> (a, c)
const adt_compose = function (pairA) {
    return function (pairB) {
        return create(fst(pairA))(snd(pairB));
    };
};

//MD ### .validate(a)/p
//MD Validates internal structure of pair. If instantiated with types, elements
//MD will also be validated./p
const validate = function (fstT) {
    return function (sndT) {
        return function (x) {
            return (
                is_object(x)
                ? fstT.validate(fst(x)) && sndT.validate(snd(x))
                : false
            );
        };
    };
};

const type_factory = function (spec_fst) {
    return function (spec_snd) {
        const base_type = {
            spec: "curried-static-land",
            version: 1,
            type_name,
            fst,
            snd,
            bimap,
            create,
            validate: functional_if(
                is_object
            )(
                andf(object_has_property("fst"))(object_has_property("snd"))
            )(
                constant(false)
            ),
            reduce,
            map,
            of: create(),
            traverse,
            extend,
            extract,
            compose: adt_compose
        };

        if (is_object(spec_fst) && is_object(spec_snd)) {

            const check_for_prop = and(
                flip(object_has_property)(spec_fst)
            )(
                flip(object_has_property)(spec_snd)
            );

            if (check_for_prop("equals")) {
                base_type.equals = equals(spec_fst)(spec_snd);
            }

            if (check_for_prop("lte")) {
                base_type.lte = lte(spec_fst)(spec_snd);
            }

            if (check_for_prop("concat")) {
                base_type.concat = concat(spec_fst)(spec_snd);
                base_type.ap = ap(spec_fst)(spec_snd);
                base_type.chain = chain(spec_fst)(spec_snd);
            }

            if (check_for_prop("empty")) {
                base_type.empty = empty(spec_fst)(spec_snd);
                base_type.of = of(spec_fst)(spec_snd);
            }

            if (check_for_prop("validate")) {
                base_type.validate = validate(spec_fst)(spec_snd);
            }

            base_type.type_name += "<" +
                spec_fst.type_name + ", " + spec_snd.type_name +
            ">";
        }

        return base_type;
    };
};

//test const testT = type_factory(slm.str)(slm.num_prod);
//test const either_str_numT = either_type(slm.str)(slm.num_prod);
//test const array_of_numT = array_type(slm.num_prod);
//test const str_fxs = array_map(jsc.literal)([
//test     string_concat("_"),
//test     flip(string_concat)("!"),
//test     function (str) {
//test         return str.slice(0, 2);
//test     },
//test     function (str) {
//test         return str.split("").reverse().join("");
//test     }
//test ]);
//test const num_fxs = array_map(jsc.literal)([
//test     add(10),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-1),
//test     Math.floor
//test ]);
//test const either_to_array = function (x) {
//test     if (x.type_name === "Left") {
//test         return [];
//test     }
//test     return array_of_numT.of(x.value);
//test };
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(num_fxs),
//test             g: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             u: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.wun_of(num_fxs)
//test             ),
//test             v: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.wun_of(num_fxs)
//test             )
//test         }
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             u: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.wun_of(num_fxs)
//test             ),
//test             f: jsc.wun_of(num_fxs),
//test             x: jsc.integer(-99, 99)
//test         }
//test     },
//test     bifunctor: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
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
//test                 converge(testT.create)(String)(jsc.wun_of(num_fxs)())
//test             ),
//test             g: jsc.literal(
//test                 converge(testT.create)(String)(jsc.wun_of(num_fxs)())
//test             ),
//test             u: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     monad: {
//test         T: testT,
//test         signature: {
//test             a: jsc.integer(-99, 99),
//test             f: jsc.literal(
//test                 converge(testT.create)(String)(jsc.wun_of(num_fxs)())
//test             ),
//test             u: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     extend: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(compose(jsc.wun_of(num_fxs)())(snd)),
//test             g: jsc.literal(compose(jsc.wun_of(num_fxs)())(snd)),
//test             w: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     comonad: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(compose(jsc.wun_of(num_fxs)())(snd)),
//test             w: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             testT,
//test             slm.num_prod
//test         ])
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(jsc.wun_of([add, max])),
//test             x: 0,
//test             u: converge(testT.create)(
//test                 jsc.string()
//test             )(
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
//test                 compose(either_str_numT.left)(jsc.string()),
//test                 compose(either_str_numT.right)(jsc.integer(-99, 99))
//test             ]),
//test             f: jsc.literal(either_to_array),
//test             g: jsc.wun_of(num_fxs),
//test             u: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.wun_of([
//test                     compose(either_str_numT.left)(jsc.string()),
//test                     compose(either_str_numT.right)(
//test                         jsc.array(
//test                             jsc.integer(3, 8),
//test                             jsc.integer(-99, 99)
//test                         )
//test                     )
//test                 ])
//test             )
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             array_of_numT,
//test             compose(array_type)(type_factory(slm.str))(array_of_numT),
//test             compose(array_type)(type_factory(slm.str))(
//test                 either_type(slm.str)(array_of_numT)
//test             ),
//test             compose(either_type(slm.str))(array_type)(testT)
//test         ])
//test     },
//test     semigroupoid: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             c: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             ),
//test             c: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.string()
//test             )(
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 )(
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.string()
//test                 )(
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 )(
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.string()
//test                 )(
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 )(
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.string()
//test                 )(
//test                     jsc.integer(-99, 99)
//test                 )
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 )(
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.string()
//test                 )(
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 )(
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.string()
//test                 )(
//test                     jsc.integer(-99, 99)
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.wun_of(["ah", "the", "string"])
//test                 )(
//test                     jsc.wun_of([11, 31, 97])
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.string()
//test                 )(
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