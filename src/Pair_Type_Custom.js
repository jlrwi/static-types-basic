/*jslint
    unordered
*/

//MD # pair_type_custom/p
//MD Pair data type permitting custom names for elements. Additiona algebras
//MD become available if instantiated with types for both elements./p

//MD ## Module methods/p

import {
    constant
} from "@jlrwi/combinators";
import {
    empty_object,
    object_concat
} from "@jlrwi/esfunctions";
import pair_type from "../Pair_Type.min.js";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_factory = function (spec_fst) {
    return function (spec_snd) {

// Generate the basic Pair type
        const base_type = pair_type(spec_fst.type)(spec_snd.type);

        const custom_type = empty_object();

// Functions for retrieving fst & snd using custom method names
        custom_type[spec_fst.name] = base_type.fst;
        custom_type[spec_snd.name] = base_type.snd;

//MD ### .export(pair_value)/p
//MD Returns a pair with custom-named properties./p
//MD /p
        custom_type.export = function (pair_value) {
            const newval = empty_object();

            newval.type_name = pair_value.type_name;
            newval.toJSON = constant(
                "Pair (" +
                JSON.stringify(base_type.fst(pair_value)) + "," +
                JSON.stringify(base_type.snd(pair_value)) +
                ")"
            );

            newval[spec_fst.name] = base_type.fst(pair_value);
            newval[spec_snd.name] = base_type.snd(pair_value);

            return Object.freeze(newval);
        };

// Include the custom property names in type_name
        custom_type.type_name = "Pair <" +
            spec_fst.name + ":" + spec_fst.type_name + ", " +
            spec_snd.name + ":" +  spec_snd.type_name +
        ">";

        return object_concat(base_type)(custom_type);
    };
};

//testbatch /*
//test jsc.check({
//test     on_report: log
//test });
//testbatch */
//testbatch export {jsc};

export default Object.freeze(type_factory);