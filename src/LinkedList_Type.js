/*jslint
    fudge
*/

import {
    compose,
    constant,
//    identity,
//test     apply_with,
    flip
} from "@jlrwi/combinators";
import {
//test     string_concat,
    log,
    prop,
    andf,
    equals,
//test     array_map,
    is_object,
    object_has_property
} from "@jlrwi/esfunctions";
//test import {
//test    slm
//test } from "@jlrwi/es-static-types";
//test import pair_type from "../src/Pair_Type.js";
//test import maybe_type from "../src/Maybe_Type.js";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Array
const type_name = "Linked_List";

const map_thru = function (tail_callback) {
    const mapper = function (f) {
        return function (link) {
            if (link.length === 0) {
                return link;
            }

            return [
                f (link[0]),
                (
                    (link[1] === undefined)
                    ? tail_callback (link[0])
                    : mapper (f) (link[1])
                )
            ];
        };
    };
    return mapper;
};

// Setoid :: a -> a -> boolean
const adt_equals = function (content_type) {
    const is_equal = function (x_link) {
        return function (y_link) {
            if ((x_link === undefined) || (y_link === undefined)) {
                return (x_link === y_link);
            }
            return (
                (content_type.equals (y_link[0]) (x_link[0]))
                ? is_equal (y_link[1]) (x_link[1])
                : false
            );
        };
    };
    return is_equal;
};

// Ord :: a -> a -> Boolean
// true at first index where x[n] < y[n]
// or identical up to identical array lengths or y longer
const lte = function (content_type) {
    const is_lte = function (y_link) {
        return function (x_link) {

            if (x_link === undefined) {
                return true;
            }

            if (y_link === undefined) {
                return false;
            }

            return (
                (content_type.equals (y_link[0]) (x_link[0]))
                ? is_lte (y_link[1]) (x_link[1])
                : content_type.lte (y_link[0]) (x_link[0])
            );
        };
    };
    return is_lte;
};

// Semigroup :: [a] -> [a] -> [a]
const concat = function (ys) {
    return function (xs) {
        const list_join = function (list) {
            if (list[0] === undefined) {
                return xs;
            }
            return [
                list[0],
                (
                    (list[1] === undefined)
                    ? (
                        (xs[0] === undefined)
                        ? undefined
                        : xs
                    )
                    : list_join (list[1])
                )
            ];
        };

        return list_join (ys);
    };
};

// Monoid :: () -> []
const empty = constant (Object.freeze([]));

// Functor :: (a -> b) -> [a] -> [b]
const map = function (f) {
    return function (link) {
        if (link.length === 0) {
            return link;
        }

        return [
            f (link[0]),
            (
                (link[1] === undefined)
                ? undefined
                : map (f) (link[1])
            )
        ];
    };
};

// Apply :: [(a -> b)] -> [a] -> [b]
const ap = function (f_link) {
    return function (x_link) {
        const tail_link = function () {
            return (
                f_link[1] === undefined
                ? undefined
                : ap (f_link[1]) (x_link)
            );
        };

        if (f_link.length === 0) {
            return f_link;
        }

        if (x_link.length === 0) {
            return x_link;
        }

        return map_thru (tail_link) (f_link[0]) (x_link);
    };
};

// Applicative :: x -> [x]
const of = function (x) {
    return Object.freeze([x, undefined]);
};

// Chain :: (a -> [b]) -> [a] -> [b]
const chain = function (f) {
    let res;

    const each = function (link) {
        res = (
            (res === undefined)
            ? f (link[0])
            : concat (res) (f (link[0]))
        );
        return (
            (link[1] === undefined)
            ? res
            : each (link[1])
        );
    };

    return each;
};

// Extend :: ([a] -> b) -> [a] -> [b]
const extend = function (f) {
    return function (xs) {
        return Object.freeze(
            xs.map (function (ignore, idx) {
                return f (xs.slice (idx));
            })
        );
    };
};

// Comonad :: [a] -> a
/* const extract = function (xs) {

    if (xs.length === 0) {
        throw new TypeError("Cannot extract from empty list");
    }

    return xs[0];
}; */

const populate = function () {
    const first_link = [];
    let last_link = [];

    const add_link = function (val) {
        let new_link;

        if (val === undefined) {
            last_link[1] = undefined;
        } else if (first_link.length === 0) {
            first_link[0] = val;
            last_link = first_link;
        } else {
            new_link = [val];
            last_link[1] = new_link;
            last_link = new_link;
        }

        return (
            (val === undefined)
            ? first_link
            : add_link
        );
    };

    return add_link;
};

// Filterable :: (a -> Boolean) -> [a] -> [a]
const filter = function (f) {
    const result = populate ();

    const each = function (x_link) {
        if ((x_link.length > 0) && (f (x_link[0]) === true)) {
            result (x_link[0]);
        }
        return (
            (x_link[1] === undefined)
            ? result ()
            : each (x_link[1])
        );
    };
    return each;
};

// Alt :: [a] -> [a] -> [a]
const alt = concat;

const log_list = map (function (x) {
    log(x);
    return x;
});

// [a] -> a -> [a]
const append = function (list) {
    return function (x) {
        return [x, list];
    };
};

// Foldable :: ((b, a) -> b) -> (_->b) -> [a] -> b
const reduce = function (f) {
    return function (initial) {
        let acc = initial;
        const each = function (x_link) {
            acc = f (acc) (x_link[0]);
            return (
                (x_link[1] === undefined)
                ? acc
                : each (x_link[1])
            );
        };
        return each;
    };
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> [a] -> U<List<b>>
// Concat for this type is expensive because the result list has to be rebuilt
// at each concat. This traverse works impurely under the hood to mutate the
// contents of the returned U<> by adding on values as the original list is
// traversed.
const traverse = function (of_T) {
    return function (f) {
        const head = [];
        let link;                       // Link to current link in list
        let result;                     // The U<List<b>>

// Mapping fx to set contents of U<> to be the germ of our result list
        const initialize_result = function (val) {
            head[0] = val;
            link = head;
            return head;
        };

// Mapping fx to add a link to the contents of U<>
        const build_link = function (val) {
            link[1] = [val];
            link = link[1];
            return head;                // Always return the head of the list
        };

        const each = function (x_link) {
            if (result === undefined) {
// Defined U<List<b>>, Lisb<b> being a reference to a List that will be built
                result = of_T.map (initialize_result) (f (x_link[0]));
            } else {
// The value from f is stolen and the output from .map() is discarded
                of_T.map (build_link) (f (x_link[0]));
            }
            if (x_link[1] === undefined) {
                link[1] = undefined;
            }
            return (
                (x_link[1] === undefined)
                ? result
                : each (x_link[1])
            );
        };
        return each;
/*
        return reduce (function (acc) {
            return function (val) {
                if (acc === undefined) {
                    return of_T.map (of) (f (val));
                }
// Make an apply that's waiting for the acc to concat
//  Apply f to each value from array (which puts it into an applicative),
//  Then use the applicative's map to concat the value to the accumulator's
//      array of values
                return of_T.ap (
                    of_T.map (compose (flip (concat)) (of)) (f (val))
                ) (acc);
            };
        }) ([]);
*/
    };
};

// Plus :: () -> []
const zero = empty;

// Sanctuary has chainRec


const get = function (idx) {
    return function (list) {
        let count = 0;
        
        const stepper = function (link) {
            if (count === idx) {
                return link[0];
            }

            if (link[1] === undefined) {
                return undefined;
            }
            
            count += 1;
            return stepper (link[1]);
        }
        
        return stepper (list);
    };
};


const set = function (idx) {
    return function (val) {
        return function (list) {
            let count = 0;
            
            const stepper = function (link) {
                if (link === undefined) {
                    return undefined;
                }
                
                if (count === idx) {
                    return [
                        val,
                        link[1]
                    ];
                }                
            
                count += 1;
                
                return [
                    link[0],
                    stepper (link[1])
                ]; 
            }

            return stepper (list);
        };
    };
};

const is_array_of_two = andf (
    compose (equals (2)) (prop ("length"))
) (
    Array.isArray
);

const validate = function (predicate) {
    let depth = 0;

    const check_link = function (link) {

        // Empty check
        if (depth === 0 && (Array.isArray(link) && (link.length === 0))) {
            return true;
        }

        // End check
        if (link === undefined) {
            return true;
        }

        depth += 1;

        return (
            (andf (predicate) (is_array_of_two) (link))
            ? check_link (link[1])
            : false
        );
    };

    return check_link;
};

// Takes an array and returns a frozen copy
// Needs self-reference to get name and validate()
const create = of;

// Have to pass a sl type module to get Setoid
const type_factory = function (type_of) {
    const base_type = {
        spec: "StaticLand",
        version: 1,
        type_name,
        alt,
        ap,
        chain,
        extend,
//        extract,
        concat,
        filter,
        map,
        of,
        empty,
        zero,
        append,
        traverse,
        get,
        set,
        reduce,
//        indexer,
        validate: validate (constant (true)),
        create
    };

    if (is_object (type_of)) {

        const check_for_prop = flip (object_has_property) (type_of);

        if (check_for_prop ("equals")) {
            base_type.equals = adt_equals (type_of);
        }

        if (check_for_prop ("lte")) {
            base_type.lte = lte (type_of);
        }

        if (check_for_prop ("validate")) {
            base_type.validate = validate (
                compose (type_of.validate) (prop (0))
            );
        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const stringT = slm.str;
//test const list_of_stringT = type_factory (stringT);
//test const pair_of_bool_strT = pair_type (slm.bool_and) (stringT);
//test const maybe_of_stringT = maybe_type (stringT);

//test const array_to_list = function (arr) {
//test     return arr.reduce(function (acc, val) {
//test         return (
//test             (acc.length === 0)
//test             ? [val, undefined]
//test             : [val, acc]
//test         );
//test     }, []);
//test };
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

//test const chainer = function (array_of_fs) {
//test     const stripped_list = array_to_list(array_of_fs ());
//test     return function (x) {
//test         return map (apply_with (x)) (stripped_list);
//test     };
//test };

//test const mapper_to_reducer = function (mapper) {
//test     return jsc.literal(function (acc) {
//test         return compose (string_concat (acc)) (mapper ());
//test     });
//test };

//test const extend_fxs = array_map (jsc.literal) ([
//test     reduce (function (acc) {
//test         return function (val) {
//test             return (
//test                 acc < val
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     }) (""),
//test     reduce (function (acc) {
//test         return function (val) {
//test             return (
//test                 acc.length < val.length
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     }) (""),
//test     reduce (function (acc) {
//test         return compose (string_concat (acc)) (prop (0));
//test     }) (""),
//test     reduce (function (acc) {
//test         return string_concat (acc);
//test     }) ("")
//test ]);

//test const filters = array_map (jsc.literal) ([
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
//test const build_test_list = compose (array_to_list);
//test const test_roster = adtTests ({
//test     functor: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }]
//test     },
//test     alt: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             b: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             c: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             f: jsc.wun_of(test_fxs)
//test         }]
//test     },
//test     plus: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             f: jsc.wun_of(test_fxs)
//test         }]
//test     },
//test     apply: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             u: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             ),
//test             v: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             )
//test         }]
//test     },
//test     applicative: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             f: jsc.wun_of(test_fxs),
//test             u: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             ),
//test             x: jsc.string()
//test         }]
//test     },
//test     chain: {
//test         T: list_of_stringT,
//test         signature: [{
//test             f: function () {
//test                 return chainer (
//test                     jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             g: function () {
//test                 return chainer (
//test                     jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             u: build_test_list(jsc.array(jsc.integer(15), jsc.string()))
//test         }]
//test     },
/*
//test     alternative: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             ),
//test             b: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             ),
//test             c: build_test_list(jsc.array(jsc.integer(15), jsc.string()))
//test         }]
//test     },
//test     monad: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: jsc.string(),
//test             f: function () {
//test                 return chainer (
//test                     jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             u: jsc.array(jsc.integer(15), jsc.string())
//test         }]
//test     },
//test     extend: {
//test         T: list_of_stringT,
//test         signature: [{
//test             f: jsc.wun_of(extend_fxs),
//test             g: jsc.wun_of(extend_fxs),
//test             w: jsc.array(jsc.integer(15), jsc.string())
//test         }]
//test     },
*/
//test     foldable: {
//test         T: list_of_stringT,
//test         signature: [{
//test             f: jsc.wun_of(array_map (mapper_to_reducer) (test_fxs)),
//test             x: "",
//test             u: build_test_list(jsc.array(jsc.integer(10), jsc.string()))
//test         }],
//test         compare_with: stringT.equals
//test     },
//test     traversable: {
//test         T: list_of_stringT,
//test         signature: [{
//test             A: pair_of_bool_strT,
//test             B: maybe_of_stringT,
//test             a: function () {
//test                 return pair_of_bool_strT.create (
//test                     jsc.boolean() ()
//test                 ) (
//test                     jsc.string() ()
//test                 );
//test             },
//test             f: jsc.literal(function (pr) {
//test                 return maybe_of_stringT.just (pr.snd);
//test             }),
//test             g: jsc.wun_of(test_fxs),
//test             u: build_test_list(jsc.array(
//test                 jsc.integer(10),
//test                 function () {
//test                     return pair_of_bool_strT.create (
//test                         jsc.boolean() ()
//test                     ) (
//test                         maybe_of_stringT.just(jsc.string() ())
//test                     );
//test                 }
//test             ))
//test         }],
//test         compare_with: array_map (prop ("equals")) ([
//test             maybe_of_stringT,
//test             compose (maybe_type) (type_factory) (maybe_of_stringT),
//test             compose (maybe_type) (type_factory) (pair_of_bool_strT),
//test             pair_type (slm.bool) (maybe_type (list_of_stringT))
//test         ])
//test     },
//test     filterable: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(15), jsc.string())),
//test             b: build_test_list(jsc.array(jsc.integer(15), jsc.string())),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }]
//test     },
//test     semigroup: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             b: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             c: build_test_list(jsc.array(jsc.integer(25), jsc.string()))
//test         }]
//test     },
//test     monoid: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string()))
//test         }]
//test     },
//test     setoid: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 build_test_list(
//test                     jsc.array(jsc.integer(25), jsc.string())
//test                 ),
//test                 build_test_list(jsc.array(4, "x"))
//test             ]),
//test             b: jsc.wun_of([
//test                 build_test_list(
//test                     jsc.array(jsc.integer(25), jsc.string())
//test                 ),
//test                 build_test_list(jsc.array(4, "x"))
//test             ]),
//test             c: jsc.wun_of([
//test                 build_test_list(
//test                     jsc.array(jsc.integer(25), jsc.string())
//test                 ),
//test                 build_test_list(jsc.array(4, "x"))
//test             ])
//test         }]
//test     },
//test     ord: {
//test         T: list_of_stringT,
//test         signature: [{
//test             a: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             b: build_test_list(jsc.array(jsc.integer(25), jsc.string())),
//test             c: build_test_list(jsc.array(jsc.integer(25), jsc.string()))
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