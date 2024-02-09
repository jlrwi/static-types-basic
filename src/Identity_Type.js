/*jslint
    unordered
*/

//MD # identity_type/p
//MD The most basic type container. Gains Monoid and Ord if instantiated with a
//MD compliant type module./p

//MD ## Module methods/p

import {
    constant,
    compose,
//test     converge,
    flip,
    on,
    pipe,
    pipeN
} from "@jlrwi/combinators";
import {
//test     string_concat,
//test     array_map,
//test     equals,
//test     add,
    is_object,
    andf,
    functional_if,
    prop,
    object_has_property,
    minimal_object
} from "@jlrwi/esfunctions";
//test import {
//test     slm
//test } from "@jlrwi/es-static-types";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test import maybe_type from "../src/Maybe_Type.js";
//test import pair_type from "../src/Pair_Type.js";
//test let jsc = jsCheck();

// Comonad :: <a> -> a
const type_name = "Identity";

const extract = prop("value");

//MD ### .create(x)/p
//MD Example:/p
//MD ```/p
//MD type_module.create(7);/p
//MD {type_name: "Identity", value: 7}/p
//MD ```/p
const create = function (x) {
    return minimal_object({
        type_name,
        toJSON: constant("Identity (" + JSON.stringify(x) + ")"),
        value: x
    });
};

//MD ### .concat(a)(b)/p
//MD Only available if type module is instantiated with a Semigroup. Value `b`
//MD is concatted onto `a`./p
// Semigroup :: <a> -> <a> -> <a>
const concat = function (T) {
    return function (y) {
        return function (x) {
            return of(T.concat(extract(y))(extract(x)));
        };
    };
};

//MD ### .empty()/p
//MD Only available if type module is instantiated with a Monoid./p
// Monoid :: () -> <a>
const empty = function (spec) {
    return compose(of)(spec.empty);
};

//MD ### .equals(a)(b)/p
//MD Only available if type module is instantiated with a Setoid./p
// Setoid :: <a> -> <a> -> boolean
const adt_equals = function (T) {
    return on(T.equals)(extract);
};

//MD ### .lte(a)(b)/p
//MD Only available if type module is instantiated with an Ord. Determintes if
//MD `b` is less than or equal to `a`./p
// Ord :: <a> -> <a> -> boolean
const lte = function (T) {
    return on(T.lte)(extract);
};

//MD ### .map(f)(a)/p
// Functor :: (a -> b) -> <a> -> <b>
const map = function (f) {
    return pipeN(
        extract,
        f,
        of
    );
};

//MD ### .ap(Identity<a -> b>)(Identity<a>)/p
// Apply :: <a -> b> -> <a> -> <b>
const ap = compose(map)(extract);

//MD ### .of(x)/p
// Applicative :: a -> <a>
const of = create;

//MD ### .extend(f)(a)/p
// Extend :: (<a> -> b) -> <a> -> <b>
const extend = compose(of);

//MD ### .extract(a)/p

//MD ### .reduce(f)(initial_value)(a)/p
// Foldable :: ((b, a) -> b) -> b -> C a -> b
const reduce = function (f) {
    return function (initial_value) {
        return compose(f(initial_value))(extract);
    };
};

//MD ### .traverse(type_module)(f)(a)/p
// Traversable :: Applicative<U> -> (a -> U<b>) -> C a -> U<C b>
const traverse = function (U) {
    return function (f) {
        return pipe(
            compose(f)(extract)
        )(
            U.map(of)
        );
    };
};

//MD ### .validate(a)/p
//MD Checks contents when instantiated with a type_module./p
const validate = function (T) {
    return functional_if(
        andf(object_has_property("value"))(is_object)
    )(
        compose(T.validate)(extract)
    )(
        constant(false)
    );
};


const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name,
        ap,
        extend,
        map,
        of,
        reduce,
        traverse,
        create,
        validate: andf(object_has_property("value"))(is_object),
        extract
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        if (check_for_prop("concat")) {
            base_type.concat = concat(type_of);
        }

        if (check_for_prop("empty")) {
            base_type.empty = empty(type_of);
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
//test const invoke_of = compose(of);

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
//test             f: jsc.literal(function (acc) {
//test                 return compose(add(acc))(prop("length"));
//test             }),
//test             x: 0,
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