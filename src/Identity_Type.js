/*jslint
    fudge
*/

import {
    constant,
//test     compose,
    flip,
    on,
    pipeN
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
//test import {
//test     slm
//test } from "@jlrwi/es-static-types";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_name = "Identity";

const extract = prop ("value");

const of = function (x) {
    return minimal_object({
        type_name,
        toJSON: constant ("Identity (" + JSON.stringify(x) + ")"),
        value: x
    });
};

const concat = function (T) {
// Doesn't work because on is waiting for two more inputs
//    return compose (of) (on (T.concat) (extract));
    return function (y) {
        return function (x) {
            return of (T.concat (extract (x)) (extract (y)));
        };
    };
};

const empty = function (spec) {
    return function () {
        return of (spec.empty ());
    };
};

const equals = function (T) {
    return on (T.equals) (extract);
//    return function (x) {
//        return function (y) {
//            return T.equals (extract (x)) (extract (y));
//        };
//    };
};

const lte = function (T) {
    return on (T.lte) (extract);
//    return function (y) {
//        return function (x) {
//            return T.lte (extract (y)) (extract (x));
//        };
//    };
};

const map = function (f) {
    return pipeN (
        extract,
        f,
        of
    );
};

//const ap = compose (map) (extract);
const ap = function (a) {
    return map (extract (a));
};

const validate = function (T) {
    return function (x) {
        return (
            is_object (x)
            ? T.validate (extract (x))
            : false
        );
    };
};

const create = of;

const type_factory = function (type_of) {
    const base_type = {
        spec: "StaticLand",
        version: 1,
        type_name,
        ap,
        map,
        of,
        create,
        validate: is_object,
        extract
    };

    if (is_object (type_of)) {

        const check_for_prop = flip (object_has_property) (type_of);

        if (check_for_prop ("concat")) {
            base_type.concat = concat (type_of);
        }

        if (check_for_prop ("empty")) {
            base_type.empty = empty (type_of);
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
//test     return compose (of) (contentsf);
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