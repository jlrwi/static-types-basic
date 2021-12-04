/*jslint
    fudge
*/

//MD # maybe_type/p
//MD This type includes the Nothing and Just types./p

//MD ## Module methods/p

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
//test     array_map,
//test     string_concat,
    equals,
    is_object,
    minimal_object,
    object_has_property,
    prop,
    andf,
    orf,
    functional_if
} from "@jlrwi/esfunctions";
//test import {
//test     slm,
//test     array_type
//test } from "@jlrwi/es-static-types";
//test import pair_type from "../src/Pair_Type.js";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const nilT = nil_type();

const type_name = "Maybe";

// NOT a comonad - used internally
const extract = prop("value");

//MD ### .nothing(x)/p
//MD Returns `x` wrapped in a Nothing. The value is superflouous./p
//MD Example:/p
//MD ```/p
//MD type_module.nothing(7);/p
//MD {type_name: "Nothing", value: 7}/p
//MD ```/p
const nothing = function (x) {
    return minimal_object({
        type_name: "Nothing",
        toJSON: constant("Maybe.Nothing"),
        value: x
    });
};

//MD ### .just(x)/p
//MD Returns `x` wrapped in a Just./p
//MD Example:/p
//MD ```/p
//MD type_module.just(7);/p
//MD {type_name: "Just", value: 7}/p
//MD ```/p
const just = function (x) {
    return minimal_object({
        type_name: "Just",
        toJSON: constant("Maybe.Just (" + JSON.stringify(x) + ")"),
        value: x
    });
};

//MD ### .is_Nothing(a)/p
//MD Test if an object is a Nothing./p
const is_Nothing = compose(equals("Nothing"))(prop("type_name"));

//MD ### .is_Just(a)/p
//MD Test if an object is a Just./p
const is_Just = compose(equals("Just"))(prop("type_name"));

//MD ### .create(x)/p
//MD If `x` is a bottom value, return a Nothing. Otherwise return a Just./p
// a -> M<a>
const create = functional_if(nilT.validate)(nothing)(just);


//MD ### .equals(a)(b)/p
//MD Type module must be instantiated with a Setoid for this method to be
//MD available./p
// Setoid :: a -> a -> boolean
const adt_equals = function (T) {
    return function (y) {
        return function (x) {
            if (x.type_name !== y.type_name) {
                return false;
            }

            return (
                is_Nothing(x)
                ? true
                : T.equals(extract(x))(extract(y))
            );
        };
    };
};

//MD ### .lte(a)(b)/p
//MD Type module must be instantiated with an Ord for this method to be
//MD available. Evaluates if b is lte a. A Nothing is less than a Just./p
// Ord :: a -> a -> Boolean
const lte = function (T) {
    return function (y) {
        return function (x) {

            if (is_Nothing(x)) {
                return true;
            }

            if (is_Nothing(y)) {
                return false;
            }

            return T.lte(extract(y))(extract(x));
        };
    };
};

//MD ### .concat(a)(b)/p
//MD Type module must be instantiated with a Semigroup for this method to be
//MD available.  A Nothing as either parameter is ignored./p
// Semigroup :: a -> a -> a
const concat = function (T) {
    return function (y) {
        return function (x) {
            if (is_Nothing(x)) {
                return y;
            }

            if (is_Nothing(y)) {
                return x;
            }

            return just(T.concat(extract(y))(extract(x)));
        };
    };
};

//MD ### .empty()/p
//MD Returns a Nothing./p
// Monoid :: () -> a
const empty = nothing;

//MD ### .map(f)(a)/p
//MD The function is only applied to Just values./p
// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return functional_if(
        is_Nothing
    )(
        identity
    )(
        pipeN(
            extract,
            f,
            just
        )
    );
};

//MD ### .alt(a)(b)/p
//MD Returns the `b` value unless it is Nothing./p
// Alt :: <a> -> <a> -> <a>
const alt = function (y) {
    return functional_if(
        is_Nothing
    )(
        constant(y)
    )(
        identity
    );
};

//MD ### .zero()/p
//MD Returns a Nothing./p
// Plus :: () -> a
const zero = empty;

//MD ### .ap(Maybe<f>)(Maybe<a>)/p
//MD Applies the `f` to `a`. If either value is Nothing, Nothing is returned./p
// Apply :: <(a -> b)> -> <a> -> <b>
const ap = function (mf) {
    return function (mx) {
        if (is_Nothing(mf) || is_Nothing(mx)) {
            return nothing();
        }

        return just(extract(mf)(extract(mx)));
    };
};

//MD ### .of(x)/p
//MD Wraps `x` in a Just./p
// Applicative :: a -> <a>
const of = just;

//MD ### .chain(f)(a)/p
//MD Applies `f` to `a` unless it's a Nothing./p
// Chain :: (a -> <b>) -> <a> -> <b>
const chain = function (f) {
    return functional_if(
        is_Nothing
    )(
        identity
    )(
        compose(f)(extract)
    );
};

//MD ### .reduce(f)(initial)(a)/p
//MD If `a` is Nothing, return the initial value./p
// Foldable :: ((b, a) -> b, b, <a>) -> b
const reduce = function (f) {
    return function (initial) {
        return functional_if(
            is_Nothing
        )(
            constant(initial)
        )(
            compose(f(initial))(extract)
        );
    };
};

//MD ### .traverse(type_module)(f)(a)/p
//MD If `a` is Nothing, returns Nothing wrapped in type_module./p
// Traversable :: Applicative<U> -> (a -> U<b>) -> T<a> -> U<T<b>>
const traverse = function (to_T) {
    return function (f) {
        return functional_if(
            is_Nothing
        )(
            to_T.of
        )(
            pipeN(
                extract,
                f,
                to_T.map(just)
            )
        );
    };
};

//MD ### .filter(f)(a)/p
//MD Returns `a` if its contents pass the filter, otherwise returns Nothing/p
// Filterable :: (a -> Boolean) -> <a> -> <a>
const filter = function (f) {
    return functional_if(
        is_Nothing
    )(
        identity
    )(
        functional_if(
            pipeN(
                extract,
                f,
                equals(true)
            )
        )(
            identity
        )(
            nothing
        )
    );
};

//MD ### .validate(a)/p
//MD Validate `a` as a Just or Nothing. If instantiated with a type module,
//MD contents will be validated./p
const validate = function (T) {
    return functional_if(
        andf(object_has_property("type_name"))(is_object)
    )(
        functional_if(
            is_Just
        )(
            compose(T.validate)(extract)
        )(
            is_Nothing
        )
    )(
        constant(false)
    );
};

const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
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
        validate: andf(orf(is_Just)(is_Nothing))(is_object)
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        base_type.concat = concat(type_of);

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
//test const array_of_str = array_type(slm.str);
//test const pairT = pair_type(slm.num_prod)(array_of_str);
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

//test const str_min = function (a) {
//test     return functional_if(slm.str.lte(a))(identity)(constant(a));
//test };

//test const string_add = function (y) {
//test     return function (x) {
//test         if (equals(undefined)(y)) {
//test             return x;
//test         }
//test
//test         if (equals(undefined)(x)) {
//test             return y;
//test         }
//test
//test         return y + x;
//test     };
//test };

//test const filters = array_map(jsc.literal)([
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
//test         return compose(maker)(contents);
//test     };
//test };

//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs),
//test             g: jsc.wun_of(str_fxs)
//test         }
//test     },
//test     alt: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs)
//test         }
//test     },
//test     plus: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs)
//test         }
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             u: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(str_fxs)),
//test                 make_value(nothing)(constant)
//test             ]),
//test             v: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(str_fxs)),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             f: jsc.wun_of(str_fxs),
//test             u: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(str_fxs)),
//test                 make_value(nothing)(constant)
//test             ]),
//test             x: jsc.string()
//test         }
//test     },
//test     chain: {
//test         T: testT,
//test         signature: {
//test             f: jsc.literal(make_value(just)(jsc.wun_of(str_fxs)())),
//test             g: jsc.literal(make_value(just)(jsc.wun_of(str_fxs)())),
//test             u: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     alternative: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(str_fxs)),
//test                 make_value(nothing)(constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(str_fxs)),
//test                 make_value(nothing)(constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     monad: {
//test         T: testT,
//test         signature: {
//test             a: jsc.string(),
//test             f: jsc.literal(make_value(just)(jsc.wun_of(str_fxs)())),
//test             u: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     foldable: {
//test         T: testT,
//test         signature: {
//test             f: jsc.wun_of(array_map(jsc.literal)([string_add, str_min])),
//test             x: "",
//test             u: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ])
//test         },
//test         compare_with: slm.str.equals
//test     },
//test     traversable: {
//test         T: testT,
//test         signature: {
//test             A: pairT,
//test             B: array_of_str,
//test             a: function () {
//test                 return pairT.create(
//test                     jsc.integer(-99, 99)()
//test                 )(
//test                     jsc.string()()
//test                 );
//test             },
//test             f: jsc.literal(compose(array_of_str.of)(prop("snd"))),
//test             g: jsc.wun_of(str_fxs),
//test             u: jsc.wun_of([
//test                 function () {
//test                     return just(pairT.create(
//test                         jsc.integer(-99, 99)()
//test                     )(
//test                         jsc.array(1, jsc.string)()
//test                     ));
//test                 },
//test                 make_value(nothing)(constant)
//test             ])
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             array_of_str,
//test             compose(array_type)(type_factory)(array_of_str),
//test             compose(array_type)(type_factory)(
//test                 pair_type(slm.num_prod)(array_of_str)
//test             ),
//test             compose(pair_type(slm.num_prod))(array_type)(testT)
//test         ])
//test     },
//test     filterable: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_value(nothing)(constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_value(nothing)(constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_value(nothing)(constant)
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             b: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
//test             ]),
//test             c: jsc.wun_of([
//test                 make_value(just)(jsc.wun_of(["ah", "the", "string"])),
//test                 make_value(just)(jsc.string()),
//test                 make_value(nothing)(constant)
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