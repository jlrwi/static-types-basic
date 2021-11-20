/*jslint
    fudge
*/

import {
    compose,
    constant,
    converge
} from "@jlrwi/combinators";
import {
//test     array_map,
//test     add,
//test     exponent,
//test     multiply,
    andf,
    gte,
    negate,
    type_check,
    prop,
    is_object,
    functional_if,
    minimal_object
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Vector

const type_name = "Vector";

const angle_constrain = function (min, max) {
    const offset = max - min;

    const simplify = function (angle) {

        if (angle >= max) {
            return simplify(angle - offset);
        }

        if (angle < min) {
            return simplify(angle + offset);
        }

        return angle;
    };

    return simplify;
};

const constrain_pi = angle_constrain(negate(Math.PI), Math.PI);

// a -> b -> Pair<a, b>
// Morphism between functors Function and Pair
const create = function (magnitude) {
    return function (angle) {
        return minimal_object({
            toJSON: constant(
                `Vector ${JSON.stringify(magnitude)} @ ${JSON.stringify(angle)}`
            ),
            magnitude,
            angle
        });
    };
};

// Setoid :: T -> a -> a -> boolean
const equals = function (y) {
    return function (x) {
        return ((
            x.magnitude === y.magnitude
        ) && (
            (x.magnitude === 0)
            ? true
            : constrain_pi(x.angle) === constrain_pi(y.angle)
        ));
    };
};

// Semigroup :: T -> a -> a -> a
// x is added onto y
const concat = function (y) {
    return function (x) {
        const new_x = (
            y.magnitude * Math.cos(y.angle)
        ) + (
            x.magnitude * Math.cos(x.angle)
        );

        const new_y = (
            y.magnitude * Math.sin(y.angle)
        ) + (
            x.magnitude * Math.sin(x.angle)
        );

        const magnitude = Math.sqrt(new_x**2 + new_y**2);

        return create(
            magnitude
        )(
            (magnitude === 0)
            ? 0
            : constrain_pi(Math.acos(new_x / magnitude)) * Math.sign(new_y)
        );
    };
};

// Monoid :: T -> _ -> a
const empty = function () {
    return create(0)(0);
};

// Group :: a -> a
const invert = function ({magnitude, angle}) {
    return create(
        magnitude
    )(
        (angle < Math.PI)
        ? angle + Math.PI
        : angle - Math.PI
    );
};

// Map, ap, reduce, and of are magnitude-biased

// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return converge(
        create
    )(
        compose(f)(prop("magnitude"))
    )(
        prop("angle")
    );
};

// Bifunctor :: (a->b) -> (c->d) -> Pair<a, c> -> Pair<b, d>
const bimap = function (f) {
    return function (g) {
        return converge(
            create
        )(
            compose(f)(prop("magnitude"))
        )(
            compose(g)(prop("angle"))
        );
    };
};

//const extract = snd;

const validate = functional_if(
    is_object
)(
    andf(
        compose(gte(0))(prop("magnitude"))
    )(
        compose(type_check("number"))(prop("angle"))
    )
)(
    constant(false)
);

const type_factory = function (ignore) {
    return Object.freeze({
        spec: "curried-static-land",
        version: 1,
        type_name,
        equals,
        concat,
        empty,
        invert,
        map,
        bimap,
        create,
        validate
    });
};

//test const testT = type_factory();
//test const num_fxs = array_map(jsc.literal)([
//test     add(10),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-1),
//test     add(-4)
//test ]);
//test const close_enough = function (left) {
//test     return function (right) {
//test         const threshold = 0.0001;
//test         return (
//test             ((
//test                 Math.abs(left.magnitude) < threshold
//test             ) && (
//test                 Math.abs(right.magnitude) < threshold
//test             ))
//test             ? true
//test             : (
//test                 Math.abs(
//test                     constrain_pi(left.angle) - constrain_pi(right.angle)
//test                 ) < threshold
//test             ) && (
//test                 Math.abs(left.magnitude - right.magnitude) < threshold
//test             )
//test         );
//test     };
//test };
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.integer(0, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             ),
//test             f: jsc.wun_of(num_fxs),
//test             g: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     bifunctor: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.integer(0, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             ),
//test             f: jsc.wun_of(num_fxs),
//test             g: jsc.wun_of(num_fxs),
//test             h: jsc.wun_of(num_fxs),
//test             i: jsc.wun_of(num_fxs)
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.integer(0, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             ),
//test             b: converge(testT.create)(
//test                 jsc.integer(0, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             ),
//test             c: converge(testT.create)(
//test                 jsc.integer(0, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             )
//test         },
//test         compare_with: close_enough
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.integer(1, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             )
//test         },
//test         compare_with: close_enough
//test     },
//test     group: {
//test         T: testT,
//test         signature: {
//test             a: converge(testT.create)(
//test                 jsc.integer(1, 99)
//test             )(
//test                 jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test             )
//test         },
//test         compare_with: close_enough
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.integer(0, 99)
//test                 )(
//test                     jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.wun_of([11, 31, 97])
//test                 )(
//test                     jsc.wun_of([-(Math.PI / 2), Math.PI, -(2 * Math.PI)])
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.integer(0, 99)
//test                 )(
//test                     jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.wun_of([11, 31, 97])
//test                 )(
//test                     jsc.wun_of([-(Math.PI / 2), Math.PI, -(2 * Math.PI)])
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 converge(testT.create)(
//test                     jsc.integer(0, 99)
//test                 )(
//test                     jsc.number(-(2 * Math.PI), (2 * Math.PI))
//test                 ),
//test                 converge(testT.create)(
//test                     jsc.wun_of([11, 31, 97])
//test                 )(
//test                     jsc.wun_of([-(Math.PI / 2), Math.PI, -(2 * Math.PI)])
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