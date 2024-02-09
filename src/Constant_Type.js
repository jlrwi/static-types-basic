/*jslint
    unordered
*/

//MD # constant_type/p
//MD If this type is instantiated with a monoid, it will behave
//MD like an Applicative, using .concat() for .ap(), and .empty() for .of().
//MD This allows the sort-of Applicative to be used with traversal functions,
//MD with different types of monoids producing different results./p
//MD ## References:/p
//MD Sanctuary Constant:/p
//MD https://github.com/sanctuary-js/sanctuary-constant//p
//MD Explanation of partial lenses:/p
//MD https://calmm-js.github.io/partial.lenses/implementation.html/p

//MD ## Module methods/p

/*
Attempts to make this type an Applicative using straightforward logic don't
succeed in passing the tests.
*/

import {
//test     converge,
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
    andf,
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

// Comonad :: <a> -> a
const extract = prop("value");

//MD ### .create(x)/p
//MD Returns `x` wrapped in a Constant./p
//MD Example:/p
//MD ```/p
//MD type_module.create(7);/p
//MD {type_name: "Constant", value: 7}/p
//MD ```/p
const create = function (x) {
    return minimal_object({
        type_name,
        toJSON: constant("Constant (" + JSON.stringify(x) + ")"),
        value: x
    });
};

//MD ### .equals(a)(b)/p
//MD Type module must be instantiated with a Setoid for this method to be
//MD available./p
// Setoid :: a -> a -> boolean
const adt_equals = function (T) {
    return on(T.equals)(extract);
};

//MD ### .lte(a)(b)/p
//MD Type module must be instantiated with an Ord for this method to be
//MD available. Evaluates if b is lte a./p
// Ord :: a -> a -> boolean
const lte = function (T) {
    return on(T.lte)(extract);
};

//MD ### .concat(a)(b)/p
//MD Type module must be instantiated with a Semigroup for this method to be
//MD available./p
// Semigroup: a -> a -> a
const concat = function (T) {
    return compose2(
        create
    )(
        on(T.concat)(extract)
    );
};

//MD ### .empty()/p
//MD Type module must be instantiated with a Monoid for this method to be
//MD available./p
// Monoid :: () -> a
const empty = function (T) {
    return compose(create)(T.empty);
};

//MD ### .map(f)(a)/p
//MD As a constant, f is ignored and a is returned unchanged./p
// Discard the f parameter and just return the unchanged Constant
// Functor :: (a -> b) -> a -> b
const map = second;

//MD ### .extend(f)(a)/p
//MD As a constant, f is ignored and a is returned unchanged./p
// Extend :: (<a> -> b) -> <a> -> <b>
const extend = second;

//MD ### .extract(a)/p
//MD Extracts the value from the Constant./p

//MD ### .reduce(f)(initial)(a)/p
//MD Returns the `initial` value unchanged./p
//MD As a constant, f is ignored and a is returned unchanged./p
// Foldable :: ((b, a) -> b) -> b -> C a -> b
//                ignored             ignored
const reduce = function (ignore) {
    return constant;
};

//MD ### .traverse(type_module)(f)(a)/p
//MD Ignores `f` and returns `a` wrapped in type `type_module`./p
// Traversable :: Applicative<U> -> (a -> U<b>) -> C a -> U<C b>
//                                    ignored
const traverse = function (U) {
    return function (ignore) {
        return U.of;
    };
};

//MD ### .validate(a)/p
//MD If not instantiated with a type module, checks if parameter is an object
//MD with a value property. If instantiated with a type module, validates
//MD contents./p
const validate = function (T) {
    return function (x) {
        return (
            is_object(x)
            ? T.validate(x.value)
            : false
        );
    };
};

const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name,
        map,
        extend,
        create,
        reduce,
        traverse,
        validate: andf(object_has_property("value"))(is_object),
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
//test     extend: {
//test         T: testT,
//test         signature: {
//test             f: converge(compose)(
//test                 jsc.wun_of(test_fxs)
//test             )(
//test                 constant(prop("value"))
//test             ),
//test             g: converge(compose)(
//test                 jsc.wun_of(test_fxs)
//test             )(
//test                 constant(prop("value"))
//test             ),
//test             w: invoke_of(jsc.string())
//test         }
//test     },
//test     comonad: {
//test         T: testT,
//test         signature: {
//test             f: converge(compose)(
//test                 jsc.wun_of(test_fxs)
//test             )(
//test                 constant(prop("value"))
//test             ),
//test             w: invoke_of(jsc.string())
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