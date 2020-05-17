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
    flip,
    on,
    second
} from "@jlrwi/combinators";
import {
//test     log,
//test     string_concat,
//test     array_map,
    is_object,
    prop,
    object_has_property,
    minimal_object
} from "@jlrwi/esfunctions";
//test import {slm} from "@jlrwi/es-static-types";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_name = "Constant";

const extract = prop ("value");

const empty = function (T) {
    return compose (create) (T.empty);
};

const concat = function (T) {
    return function (x) {
        return function (y) {
            return create (T.concat (extract (x)) (extract (y)));
        };
    };
};

const equals = function (T) {
    return function (x) {
        return function (y) {
            return T.equals (extract (x)) (extract (y));
        };
    };
};

const lte = function (T) {
    return on (T.lte) (extract);
//    return function (y) {
//        return function (x) {
//            return T.lte (extract (y)) (extract (x));
//        };
//    };
};

// Discard the f parameter and just return the unchanged Constant
const map = second;

/*
This is how you might expect .ap() to work:

    const ap = function (a) {
        return function (b) {
            return map (a.value) (b);
        };
    };

But it fails the Applicative tests.
*/
const validate = function (T) {
    return function (x) {
        return (
            is_object (x)
            ? T.validate (x.value)
            : false
        );
    };
};

const create = function (x) {
    return minimal_object({
        toJSON: constant ("Constant (" + JSON.stringify(x) + ")"),
        value: x
    });
};

const type_factory = function (type_of) {
    const base_type = {
        spec: "StaticLand",
        version: 1,
        type_name,
//        ap,
        map,
//        of,
        create,
        validate: is_object,
        extract
    };

    if (is_object (type_of)) {

        const check_for_prop = flip (object_has_property) (type_of);

        if (check_for_prop ("concat")) {
            base_type.concat = concat (type_of);
            base_type.ap = base_type.concat;
        }

        if (check_for_prop ("empty")) {
            base_type.empty = empty (type_of);
            base_type.of = base_type.empty;
        }

        if (check_for_prop ("equals")) {
            base_type.equals = equals (type_of);
        }

        if (check_for_prop ("lte")) {
            base_type.lte = lte (type_of);
        }

        if (check_for_prop ("validate")) {
            base_type.validate = validate (type_of);
        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const testT = type_factory (slm.str);
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
//test         signature: [{
//test             a: invoke_of (jsc.string ()),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }]
//test     },
//test     apply: {
//test         T: testT,
//test         signature: [{
//test             a: invoke_of (jsc.string ()),
//test             u: invoke_of (jsc.wun_of(test_fxs)),
//test             v: invoke_of (jsc.wun_of(test_fxs))
//test         }]
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: [{
//test             a: invoke_of (jsc.string ()),
//test             f: jsc.wun_of(test_fxs),
//test             u: invoke_of (jsc.wun_of(test_fxs)),
//test             x: jsc.string()
//test         }]
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: [{
//test             a: invoke_of (jsc.string ()),
//test             b: invoke_of (jsc.string ()),
//test             c: invoke_of (jsc.string ())
//test         }]
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: [{
//test             a: invoke_of (jsc.string ())
//test         }]
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: [{
//test             a: invoke_of (jsc.wun_of([jsc.string(), "matcher"])),
//test             b: invoke_of (jsc.wun_of([jsc.string(), "matcher"])),
//test             c: invoke_of (jsc.wun_of([jsc.string(), "matcher"]))
//test         }]
//test     },
//test     ord: {
//test         T: testT,
//test         signature: [{
//test             a: invoke_of (jsc.string ()),
//test             b: invoke_of (jsc.string ()),
//test             c: invoke_of (jsc.string ())
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