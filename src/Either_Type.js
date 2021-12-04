/*jslint
    fudge
*/

//MD # either_type/p
//MD This type includes the Left and Right types./p

//MD ## Module methods/p

//erase /*
import nil_type from "../src/Nil_Type.js";
//erase */
//stage import nil_type from "./Nil_Type.min.js";

import {
    constant,
    compose,
    identity,
    pipeN,
    on,
    flip
} from "@jlrwi/combinators";
import {
//test     string_concat,
//test     array_map,
//test     add,
//test     exponent,
//test     multiply,
//test     max,
    andf,
    orf,
    equals,
    functional_if,
    is_object,
    prop,
    object_has_property,
    minimal_object
} from "@jlrwi/esfunctions";
//test import {
//test     slm,
//test     array_type
//test } from "@jlrwi/es-static-types";
//test import maybe_type from "../src/Maybe_Type.js";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const nilT = nil_type();
const type_name = "Either";

//MD ### .left(x)/p
//MD Returns `x` wrapped in a Left./p
//MD Example:/p
//MD ```/p
//MD type_module.left(7);/p
//MD {type_name: "Left", value: 7}/p
//MD ```/p
const left = function (x) {
    return minimal_object({
        type_name: "Left",
        toJSON: constant("Either.left (" + JSON.stringify(x) + ")"),
        value: x
    });
};

//MD ### .right(x)/p
//MD Returns `x` wrapped in a Right./p
//MD Example:/p
//MD ```/p
//MD type_module.right(7);/p
//MD {type_name: "Right", value: 7}/p
//MD ```/p
const right = function (x) {
    return minimal_object({
        type_name: "Right",
        toJSON: constant("Either.right (" + JSON.stringify(x) + ")"),
        value: x
    });
};

//MD ### .is_left(Either<a>)/p
//MD Returns a boolean indicating if parameter is a Left./p
const is_left = compose(equals("Left"))(prop("type_name"));

//MD ### .is_right(Either<a>)/p
//MD Returns a boolean indicating if parameter is a Right./p
const is_right = compose(equals("Right"))(prop("type_name"));

//MD ### .create(left_value)(right_value)/p
//MD If left is a bottom value, returns `right(right_value)`. Otherwise returns
//MD `left(left_value`./p
//MD Example:/p
//MD ```/p
//MD type_module.create(7)("right");/p
//MD {type_name: "Left", value: 7}/p
//MD ```/p
// a -> b -> Either<a b>
const create = function (left_value) {
    return function (right_value) {
        return (
            nilT.validate(left_value)
            ? right(right_value)
            : left(left_value)
        );
    };
};


//MD ### .equals(Either<a>)(Either<b>)/p
//MD This method is only available if the type is instantiated with Setoid type
//MD modules for both left and right./p
// Setoid :: (T -> T) -> a -> a -> boolean
const adt_equals = function (T_left) {
    return function (T_right) {
        return function (x) {
            return function (y) {

                if (x.type_name !== y.type_name) {
                    return false;
                }

                const useT = (
                    is_right(x)
                    ? T_right
                    : T_left
                );

                return useT.equals(extract(y))(extract(x));
            };
        };
    };
};

//MD ### .lte(Either<a>)(Either<b>)/p
//MD This method is only available if the type is instantiated with Ord type
//MD modules for both left and right. Evaluates if `b` is less than or equal to
//MD `a`./p
// Ord :: ((T) -> (T)) -> a -> a -> Boolean
const lte = function (T_left) {
    return function (T_right) {
        return function (y) {
            return function (x) {

                if (x.type_name !== y.type_name) {
                    return is_left(x);           // Left is always lte Right
                }

                const useT = (
                    is_right(x)
                    ? T_right
                    : T_left
                );

                return useT.lte(extract(y))(extract(x));
            };
        };
    };
};

//MD ### .concat(Either<a>)(Either<b>)/p
//MD This method is only available if the type is instantiated with Semigroup
//MD type modules for both left and right. If both parameters are the same, `b`
//MD is concatted to `a`. If parameters are not the same Either type, the Right
//MD is returned unchanged./p
// Semigroup :: (T -> T) -> a -> a -> a
const concat = function (T_left) {
    return function (T_right) {
        return function (x) {
            return function (y) {

// If a mix of right & left, return the right
                if (x.type_name !== y.type_name) {
                    return (
                        is_right(x)
                        ? x
                        : y
                    );
                }

// If two Rights, concat them
                if (is_right(x)) {
                    return right(on(T_right.concat)(extract)(x)(y));
                }

// Concat two Lefts
                return left(on(T_left.concat)(extract)(x)(y));
            };
        };
    };
};

// Monoid can't pass tests with a Left

//MD ### .map(f)(Either<a>)/p
//MD This method is right-biased - the function `f` is only applied to Right
//MD values. Left values are returned unchanged./p
// Functor :: (a -> b) -> F<a> -> F<b>
const map = function (f) {
    return functional_if(
        is_right
    )(
        pipeN(
            extract,
            f,
            right
        )
    )(
        identity
    );
};

//MD ### .alt(Either<a>)(Either<b>)/p
//MD Returns first value if it is Right, otherwise second value./p
// Alt :: <a> -> <a> -> <a>
const alt = function (x) {
    return function (y) {
        return (
            is_right(x)
            ? x
            : y
        );
    };
};

//MD ### .ap(Either<f>)(Either<a>)/p
//MD If both parameters are Right, apply the function from the first to the
//MD value from the second. If the first parameter is a Left, return it. If only
//MD the second parameter is a Left, return it./p
//MD Example:/p
//MD ```/p
//MD type_module.ap(type_module.right(add(7)))(type_module.right(13));/p
//MD {type_name: "Right", value: 20}/p
//MD ```/p
// Apply :: F<(a -> b)> -> F<a> -> F<b>
const ap = function (ff) {
    return (
        is_right(ff)

// If 'ff' is a Right, do the ap
        ? functional_if(
            is_right
        )(
            pipeN(
                extract,
                extract(ff),
                right
            )
        )(

// Return second parameter unchanged if is a Left
            identity
        )

// If 'ff' parameter is Left, just return it
        : constant(ff)
    );
};

//MD ### .of(x)/p
//MD Synonymous with .right(), wraps parameter in a Right./p
// Applicative :: a -> <a>
const of = right;

//MD ### .chain(f)(Either<a>)/p
//MD If the Either is a Right, apply the function to it. Otherwise return the
//MD Either unchanged./p
// Chain :: (a -> <b>) -> <a> -> <b>
const chain = function (f) {
    return functional_if(
        is_right
    )(
        compose(f)(extract)
    )(
        identity
    );
};

//MD ### .bimap(f)(g)(Either<a>)/p
//MD If the Either is a Left, apply `f` to it. If it's a Right, apply `g` to
//MD it./p
// Bifunctor :: (a->b) -> (c->d) -> Either<a, c> -> Either<b, d>
const bimap = function (f) {
    return function (g) {
        return functional_if(
            is_right
        )(
            pipeN(
                extract,
                g,
                right
            )
        )(
            pipeN(
                extract,
                f,
                left
            )
        );
    };
};

//MD ### .extend(f)(Either<a>)/p
//MD If the Either is a Right, apply the function to it and package the result
//MD in a Right. Otherwise return the Either unchanged./p
// Extend :: (Either <a b> -> c) -> Either <a b> -> Either <a c>
const extend = function (f) {
    return functional_if(
        is_right
    )(
        compose(right)(f)
    )(
        identity
    );
};

//MD ### .extract(Either<a>)/p
//MD Extract the value from an Either./p
// Comonad :: Either<a> -> a
const extract = prop("value");

//MD ### .reduce(f)(initial_value)(Either<a>)/p
//MD If the Either is a Right, run the reduction function primed with
//MD `initial_value`. Otherwise, return `initial_value`./p
// Foldable :: ((b, a) -> b, b, <a>) -> b
const reduce = function (f) {
    return function (initial) {
        return functional_if(
            is_right
        )(
            compose(f(initial))(extract)
        )(
            constant(initial)
        );
    };
};

//MD ### .traverse(type_module)(f)(Either<a>)/p
//MD If the Either is a Right, execute the traversal function. Otherwise, wrap
//MD the value in type_module./p
// Traversable :: Applicative<U> -> (a -> U<b>) -> T<a> -> U<T<b>>
const traverse = function (to_T) {
    return function (f) {
        return functional_if(
            is_right
        )(
            pipeN(
                extract,
                f,
                to_T.map(right)
            )
        )(
            to_T.of
        );
    };
};

//MD ### .validate(Either<a>)/p
//MD Validate the Either structure. If type module has been instantiated with
//MD Left and Right type modules, validate the contents./p
// a -> boolean
const validate = function (type_left) {
    return function (type_right) {
        return function (x) {
            if (!is_object(x) || !object_has_property("value")(x)) {
                return false;
            }

            if (is_left(x)) {
                return type_left.validate(extract(x));
            }

            if (is_right(x)) {
                return type_right.validate(extract(x));
            }

            return false;
        };
    };
};

// Sanctuary has chainrec
const type_factory = function (spec_left) {
    return function (spec_right) {
        const base_type = {
            spec: "curried-static-land",
            version: 1,
            type_name,
            left,
            right,
            is_right,
            is_left,
            reduce,
            map,
            alt,
            ap,
            of,
            chain,
            traverse,
            bimap,
            extend,
            create,
            validate: andf(orf(is_right)(is_left))(is_object)
        };

        if (is_object(spec_left) && is_object(spec_right)) {

            const check_for_prop = andf(
                flip(object_has_property)(spec_left)
            )(
                flip(object_has_property)(spec_right)
            );

            if (check_for_prop("concat")) {
                base_type.concat = concat(spec_left)(spec_right);
            }

            if (check_for_prop("equals")) {
                base_type.equals = adt_equals(spec_left)(spec_right);
            }

            if (check_for_prop("lte")) {
                base_type.lte = lte(spec_left)(spec_right);
            }

            if (check_for_prop("validate")) {
                base_type.validate = validate(spec_left)(spec_right);
            }

            base_type.type_name += "< " +
                spec_left.type_name + "||" + spec_right.type_name +
            " >";
        }

        return Object.freeze(base_type);
    };
};

//test const testT = type_factory(slm.str)(slm.num_prod);
//test const maybe_of_numT = maybe_type(slm.num_prod);
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

//test const extender = function (f) {
//test     return jsc.literal(compose(extract)(map(f)));
//test };

//test const make_either = function (side) {
//test     return function (contentsf) {
//test         return compose(side)(contentsf);
//test     };
//test };

//test const maybe_to_array = function (mx) {
//test     return array_of_numT.of(
//test         mx.type_name === "Nothing"
//test         ? mx
//test         : mx.value
//test     );
//test };

//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: jsc.wun_of([
//test             {
//test                 a: make_either(left)(jsc.string()),
//test                 f: jsc.wun_of(str_fxs),
//test                 g: jsc.wun_of(str_fxs)
//test             },
//test             {
//test                 a: make_either(right)(jsc.integer(-99, 99)),
//test                 f: jsc.wun_of(num_fxs),
//test                 g: jsc.wun_of(num_fxs)
//test             }
//test         ])
//test     },
//test     alt: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ]),
//test             b: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ]),
//test             c: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ]),
//test             f: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ]),
//test             u: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.wun_of(num_fxs))
//test             ]),
//test             v: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.wun_of(num_fxs))
//test             ])
//test         }
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: jsc.wun_of([
//test             {
//test                 a: jsc.wun_of([
//test                     make_either(left)(jsc.string()),
//test                     make_either(right)(jsc.integer(-99, 99))
//test                 ]),
//test                 u: jsc.wun_of([
//test                     make_either(left)(jsc.wun_of(str_fxs)),
//test                     make_either(right)(jsc.wun_of(num_fxs))
//test                 ]),
//test                 f: jsc.wun_of(str_fxs),
//test                 x: jsc.string()
//test             },
//test             {
//test                 a: jsc.wun_of([
//test                     make_either(left)(jsc.string()),
//test                     make_either(right)(jsc.integer(-99, 99))
//test                 ]),
//test                 u: jsc.wun_of([
//test                     make_either(left)(jsc.wun_of(str_fxs)),
//test                     make_either(right)(jsc.wun_of(num_fxs))
//test                 ]),
//test                 f: jsc.wun_of(num_fxs),
//test                 x: jsc.integer(-99, 99)
//test             }
//test         ])
//test     },
//test     chain: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(make_either(right)(jsc.wun_of(num_fxs)())),
//test             g: jsc.literal(make_either(right)(jsc.wun_of(num_fxs)())),
//test             u: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ])
//test         }
//test     },
//test     monad: {
//test         T: testT,
//test         signature: {
//test             a: jsc.integer(-99, 99),
//test             f: jsc.literal(make_either(right)(jsc.wun_of(num_fxs)())),
//test             u: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ])
//test         }
//test     },
//test     bifunctor: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ]),
//test             f: jsc.wun_of(str_fxs),
//test             g: jsc.wun_of(str_fxs),
//test             h: jsc.wun_of(num_fxs),
//test             i: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     extend: {
//test         T: testT,
//test         signature: {
//test             f: extender(jsc.wun_of(num_fxs)()),
//test             g: extender(jsc.wun_of(num_fxs)()),
//test             w: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ])
//test         }
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(jsc.wun_of([add, max])),
//test             x: 0,
//test             u: jsc.wun_of([
//test                 make_either(left)(jsc.string()),
//test                 make_either(right)(jsc.integer(-99, 99))
//test             ])
//test         },
//test         compare_with: slm.num_prod.equals
//test     },
//test     traversable: {
//test         T: testT,
//test         signature: {
//test             A: maybe_of_numT,
//test             B: array_of_numT,
//test             a: make_either(maybe_of_numT.of)(jsc.integer(-99, 99)),
//test             f: jsc.literal(maybe_to_array),
//test             g: jsc.wun_of(num_fxs),
//test             u: make_either(
//test                 compose(right)(maybe_of_numT.just)
//test             )(
//test                 jsc.array(jsc.integer(5, 8), jsc.integer(-99, 99))
//test             )
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             array_of_numT,
//test             compose(array_type)(type_factory(slm.str))(array_of_numT),
//test             compose(array_type)(type_factory(slm.str))(maybe_of_numT),
//test             compose(maybe_type)(array_type)(testT)
//test         ])
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ]),
//test             b: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ]),
//test             c: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ])
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ]),
//test             b: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ]),
//test             c: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ]),
//test             b: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
//test             ]),
//test             c: jsc.wun_of([
//test                 make_either(left)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_either(right)(jsc.wun_of([11, 31, 97]))
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