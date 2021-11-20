/*jslint
    fudge
*/

// log should be fst because pair map operates on snd

//erase /*
import pair_type from "../src/Pair_Type.js";
//erase */
//stage import pair_type from "./Pair_Type.min.js";

import {
    pipe
} from "@jlrwi/combinators";
//test import {
//test     add,
//test     exponent,
//test     multiply,
//test     array_map
//test } from "@jlrwi/esfunctions";
//test import {
//test     slm,
//test     array_type
//test } from "@jlrwi/es-static-types";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_factory = function (type_name) {
    return function (log_type) {
        return function (value_type) {
            const pairT = pair_type(log_type)(value_type);

// (b->(c,s)) -> (a->(b,s)) -> a -> (c,s)
            const compose = function (f) {
                return function (g) {
                    return function (x) {
                        const gx = g(x);
                        const fx = f(pairT.snd(gx));

                        return pairT.create(
                            log_type.concat(
                                pairT.fst(gx)
                            )(
                                pairT.fst(fx)
                            )
                        )(
                            pairT.snd(fx)
                        );
                    };
                };
            };

            //  id :: a -> (a, s)
            const id = pairT.create(log_type.empty());

            // Embellish a unary fx with a constant
            const embellish_function = function (f) {
                return function (fst) {
                    return pipe(
                        f
                    )(
                        pairT.create(log_type.of(fst))
                    );
                };
            };

// Needed for adt tests
            const equals = pairT.equals;

            return Object.freeze({
                spec: "curried-static-land",
                version: 1,
                typeName: type_name + "< " + value_type.type_name + ">",
                equals,
                compose,
                id,
                embellish_function,
                create: pairT.create,
                valiate: pairT.validate
            });
        };
    };
};

//test const writer_arrT = type_factory("Writer")(
//test     array_type(slm.str)
//test )(
//test     slm.num_prod
//test );

//test const num_fxs = array_map(jsc.literal)([
//test     writer_arrT.embellish_function(add(10))("Add 10"),
//test     writer_arrT.embellish_function(exponent(2))("Square"),
//test     writer_arrT.embellish_function(multiply(3))("Triple"),
//test     writer_arrT.embellish_function(multiply(-1))("Negate"),
//test     writer_arrT.embellish_function(Math.floor)("Floor")
//test ]);

//test const test_roster = adtTests({
//test     semigroupoid: {
//test         T: writer_arrT,
//test         signature: {
//test             a: jsc.wun_of(num_fxs),
//test             b: jsc.wun_of(num_fxs),
//test             c: jsc.wun_of(num_fxs)
//test         },
//test         input: jsc.integer(-99, 99)
//test     },
//test     category: {
//test         T: writer_arrT,
//test         signature: {
//test             a: jsc.wun_of(num_fxs)
//test         },
//test         input: jsc.integer(-99, 99)
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