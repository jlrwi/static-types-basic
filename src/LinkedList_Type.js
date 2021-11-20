/*jslint
    fudge
*/

/*
This implementation of a linked list uses arrays. Link is in the form:
    [value, next_link]
The list is terminated by []
Example:
    ["linked", ["list",["example", []]]]
*/

import {
//test     apply_with,
    compose,
    apply2,
    constant,
//    identity,
    flip
} from "@jlrwi/combinators";
import {
//test     string_concat,
//    log,
    prop,
    functional_if,
    andf,
    equals,
//test     array_map,
    is_object,
    object_has_property
} from "@jlrwi/esfunctions";
//test import {
//test     slm
//test } from "@jlrwi/es-static-types";
//test import pair_type from "../src/Pair_Type.js";
//test import maybe_type from "../src/Maybe_Type.js";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Array
const type_name = "Linked_List";

const last_link = compose(equals(0))(prop("length"));

//const array_pair = function (fst) {
//    return function (snd) {
//        return [fst, snd];
//    };
//};

// Utility mapping function
// tail_callback is executed when end of list is reached
const map_thru = function (tail_callback) {
    const mapper = function (f) {
        return function (link) {
            if (last_link(link)) {
                return tail_callback(link);
            }

            return [
                f(link[0]),
                mapper(f)(link[1])
            ];
        };
    };
    return mapper;
};

// Setoid :: a -> a -> boolean
const adt_equals = function (content_type) {
    const is_equal = function (y_link) {
        return function (x_link) {

// Lists must be same length to be equal
            if (last_link(x_link) || last_link(y_link)) {
                return (x_link.length === y_link.length);
            }

// Check equality of values, if equal call with next links
            return (
                (content_type.equals(y_link[0])(x_link[0]))
                ? is_equal(y_link[1])(x_link[1])
                : false
            );
        };
    };

    return is_equal;
};

// Ord :: a -> a -> Boolean
// true at first index where x[n] < y[n]
// or identical up to identical list lengths
// or y is longer
const lte = function (content_type) {
    const is_lte = function (y_link) {
        return function (x_link) {

// If at end of xs, xs must be shorter or equal to ys
            if (last_link(x_link)) {
                return true;
            }

// If at end of ys, ys is shorter than xs -> not lte
            if (last_link(y_link)) {
                return false;
            }

            return (
// Check equality of values
                (content_type.equals(y_link[0])(x_link[0]))
// Equal values -> call with next links
                ? is_lte(y_link[1])(x_link[1])
// Unequal values -> determine if lte
                : content_type.lte(y_link[0])(x_link[0])
            );
        };
    };

    return is_lte;
};

// Semigroup :: [a] -> [a] -> [a]
const concat = function (ys) {
    return function (xs) {

// Check if nothing to concat
        if (last_link(xs)) {
            return ys;
        }

        const list_join = function (link) {
// Reached end of ys -> append xs
            if (last_link(link)) {
                return xs;
            }

            return [
                link[0],
                list_join(link[1])
            ];
        };

        return list_join(ys);
    };
};

// Monoid :: () -> []
const empty = constant(Object.freeze([]));

// Functor :: (a -> b) -> [a] -> [b]
const map = map_thru(constant([]));

// Apply :: [(a -> b)] -> [a] -> [b]
const ap = function (f_link) {
    return function (x_link) {

// If f_link is empty, return empty list
        if (last_link(f_link)) {
            return f_link;
        }

// If x-link is empty, return empty list
        if (last_link(x_link)) {
            return x_link;
        }

// When current f_link function has been applied, call with the next
        const tail_link = function () {
            return (
                (last_link(f_link[1]))
                ? f_link[1]
                : ap(f_link[1])(x_link)
            );
        };

        return map_thru(tail_link)(f_link[0])(x_link);
    };
};

// Applicative :: x -> [x]
const of = function (x) {
    return Object.freeze([x, []]);
};

// Chain :: (a -> [b]) -> [a] -> [b]
const chain = function (f) {
    const reducer = function (acc) {
        return compose(concat(acc))(f);
    };

    return reduce(reducer)([]);
};

// Extend :: ([a] -> b) -> [a] -> [b]
const extend = function (f) {
    const each = function (link) {
        if (last_link(link)) {
            return link;
        }

// Apply f first to entire list, then all but first value, then all but second
        return [
            f(link),
            each(link[1])
        ];
    };

    return each;
};

// Comonad :: [a] -> a
/*
const extract = function (x_link) {
    if (last_link(x_link)) {
        throw new TypeError("Cannot extract from empty list");
    }

    return x_link[0];
}; */

// Filterable :: (a -> Boolean) -> [a] -> [a]
const filter = function (f) {
    const each = function (x_link) {
        if (last_link(x_link)) {
            return x_link;
        }

        if (f(x_link[0]) === true) {
            return [
                x_link[0],
                each(x_link[1])
            ];
        }

        return each(x_link[1]);
    };

    return each;
};

// Alt :: [a] -> [a] -> [a]
const alt = concat;

// [a] -> a -> [a]
const append = function (list) {
    return function (x) {
        return [x, list];
    };
};

// Foldable :: ((b, a) -> b) -> (_->b) -> [a] -> b
const reduce = function (f) {
    const each = function (acc) {
        return function (val) {
            if (last_link(val)) {
                return acc;
            }

            return each(
                f(acc)(val[0])
            )(
                val[1]
            );
        };
    };
    return each;
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> List<a> -> U<List<b>>
// Concat for this type is expensive because the result list has to be rebuilt
// at each concat. This traverse works impurely under the hood to mutate the
// contents of the returned U<> by adding on values as the original list is
// traversed.
const traverse = function (of_T) {
    return function (f) {
/*
        const head = [];
        let link;                       // Link to current link in list
        let result = of_T.of([]);                     // The U<List<b>>

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
// Catch empty list
            if (x_link.length === 0) {
                link[1] = x_link;
                return result;
            }
            if (result === undefined) {
// Defined U<List<b>>, List<b> being a reference to a List that will be built
                result = of_T.map(initialize_result)(f(x_link[0]));
            } else {
// The value from f is stolen and the output from .map() is discarded
                of_T.map(build_link)(f(x_link[0]));
            }
//            if (x_link[1].length === 0) {
//                link[1] = [];
//                return result;
//            }
            return each(x_link[1]);
        };
        return each;
*/
        const reducer = function (acc) {
            return function (val) {

// For first pass, don't need to concat (concat is expensive)
                if (acc.length === 0) {
                    return of_T.map(of)(f(val));
                }

// Make an apply that's waiting for the acc to concat
//  Apply f to each value from array (which puts it into an applicative),
//  Then use the applicative's map to concat the value to the accumulator's
//      array of values
                return of_T.ap(
                    of_T.map(compose(flip(concat))(of))(f(val))
                )(
                    acc
                );
            };
        };

        return reduce(reducer)(of_T.of([]));
    };
};

// Plus :: () -> []
const zero = empty;

// Sanctuary has chainRec


const get = function (idx) {
    const stepper = function (position) {
        return function (link) {

// Reached end without finding idx
            if (last_link(link)) {
                return undefined;
            }

// Found it!
            if (position === idx) {
                return link[0];
            }

// Keep iterating
            return stepper(position + 1)(link[1]);
        };
    };
    return stepper(0);
};


const set = function (idx) {
    return function (val) {
        const stepper = function (position) {
            return function (link) {

// Never reached desired idx
                if (last_link(link)) {
                    return link;
                }

// Found it
                if (position === idx) {
                    return [
                        val,
                        link[1]
                    ];
                }

// Keep iterating
                return [
                    link[0],
                    stepper(position + 1)(link[1])
                ];
            };
        };

        return stepper(0);
    };
};

const is_array_of_two = andf(
    compose(equals(2))(prop("length"))
)(
    Array.isArray
);

const validate = function (predicate) {

    const check_link = function (position) {

// Check for end of list
        return functional_if(
            andf(
                compose(equals(0))(prop("length"))
            )(
                Array.isArray
            )
        )(
            constant(true)
        )(
// Validity check
            functional_if(
                compose(andf(predicate)(is_array_of_two))(prop(0))
            )(
                compose(apply2(check_link)(position + 1))(prop(1))
            )(
                constant(false)
            )
        );
    };

    return check_link(0);
};

// Takes an array and returns a frozen copy
// Needs self-reference to get name and validate()
const create = of;

// Have to pass a sl type module to get Setoid
const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
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
        validate: validate(constant(true)),
        create
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        if (check_for_prop("equals")) {
            base_type.equals = adt_equals(type_of);
        }

        if (check_for_prop("lte")) {
            base_type.lte = lte(type_of);
        }

        if (check_for_prop("validate")) {
            base_type.validate = validate(
                compose(type_of.validate)(prop(0))
            );
        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const stringT = slm.str;
//test const list_of_stringT = type_factory(stringT);
//test const pair_of_bool_strT = pair_type(slm.bool_and)(stringT);
//test const maybe_of_stringT = maybe_type(stringT);

//test const array_to_list = function (arr) {
//test     return arr.reduce(function (acc, val) {
//test         return [val, acc];
//test     }, []);
//test };
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

//test const chainer = function (array_of_fs) {
//test     const stripped_list = array_to_list(array_of_fs());
//test     return function (x) {
//test         return map(apply_with(x))(stripped_list);
//test     };
//test };

//test const mapper_to_reducer = function (mapper) {
//test     return jsc.literal(function (acc) {
//test         return compose(string_concat(acc))(mapper());
//test     });
//test };

//test const extend_fxs = array_map(jsc.literal)([
//test     reduce(function (acc) {
//test         return function (val) {
//test             return (
//test                 acc < val
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     })(""),
//test     reduce(function (acc) {
//test         return function (val) {
//test             return (
//test                 acc.length < val.length
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     })(""),
//test     reduce(function (acc) {
//test         return compose(string_concat(acc))(prop(0));
//test     })(""),
//test     reduce(function (acc) {
//test         return string_concat(acc);
//test     })("")
//test ]);

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
//test const build_test_list = compose(array_to_list);
//test const test_roster = adtTests({
//test     functor: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     alt: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             b: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             c: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             f: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     plus: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             f: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     apply: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             u: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             ),
//test             v: build_test_list(
//test                 jsc.array(jsc.integer(3), jsc.wun_of(test_fxs))
//test             )
//test         }
//test     },
//test     applicative: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             f: jsc.wun_of(test_fxs),
//test             u: build_test_list(
//test                 jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test             ),
//test             x: jsc.string()
//test         }
//test     },
//test     chain: {
//test         T: list_of_stringT,
//test         signature: {
//test             f: function () {
//test                 return chainer(
//test                     jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             g: function () {
//test                 return chainer(
//test                     jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             u: build_test_list(
//test                 jsc.array(jsc.integer(0, 15), jsc.string())
//test             )
//test         }
//test     },
//test     alternative: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test             ),
//test             b: build_test_list(
//test                 jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test             ),
//test             c: build_test_list(
//test                 jsc.array(jsc.integer(0, 15), jsc.string())
//test             )
//test         }
//test     },
//test     monad: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: jsc.string(),
//test             f: function () {
//test                 return chainer(
//test                     jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             u: build_test_list(
//test                 jsc.array(jsc.integer(0, 15), jsc.string())
//test             )
//test         }
//test     },
//test     extend: {
//test         T: list_of_stringT,
//test         signature: {
//test             f: jsc.wun_of(extend_fxs),
//test             g: jsc.wun_of(extend_fxs),
//test             w: build_test_list(
//test                 jsc.array(jsc.integer(0, 15), jsc.string())
//test             )
//test         }
//test     },
//test     foldable: {
//test         T: list_of_stringT,
//test         signature: {
//test             f: jsc.wun_of(array_map(mapper_to_reducer)(test_fxs)),
//test             x: "",
//test             u: build_test_list(jsc.array(jsc.integer(10), jsc.string()))
//test         },
//test         compare_with: stringT.equals
//test     },
//test     traversable: {
//test         T: list_of_stringT,
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
//test             u: build_test_list(jsc.array(
//test                 jsc.integer(0, 10),
//test                 function () {
//test                     return pair_of_bool_strT.create(
//test                         jsc.boolean()()
//test                     )(
//test                         maybe_of_stringT.just(jsc.string()())
//test                     );
//test                 }
//test             ))
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             maybe_of_stringT,
//test             compose(maybe_type)(type_factory)(maybe_of_stringT),
//test             compose(maybe_type)(type_factory)(pair_of_bool_strT),
//test             pair_type(slm.bool)(maybe_type(list_of_stringT))
//test         ])
//test     },
//test     filterable: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(jsc.array(jsc.integer(15), jsc.string())),
//test             b: build_test_list(jsc.array(jsc.integer(15), jsc.string())),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }
//test     },
//test     semigroup: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             b: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             c: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             )
//test         }
//test     },
//test     monoid: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             )
//test         }
//test     },
//test     setoid: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 build_test_list(
//test                     jsc.array(jsc.integer(0, 25), jsc.string())
//test                 ),
//test                 build_test_list(jsc.array(4, "x"))
//test             ]),
//test             b: jsc.wun_of([
//test                 build_test_list(
//test                     jsc.array(jsc.integer(0, 25), jsc.string())
//test                 ),
//test                 build_test_list(jsc.array(4, "x"))
//test             ]),
//test             c: jsc.wun_of([
//test                 build_test_list(
//test                     jsc.array(jsc.integer(0, 25), jsc.string())
//test                 ),
//test                 build_test_list(jsc.array(4, "x"))
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: list_of_stringT,
//test         signature: {
//test             a: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             b: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             ),
//test             c: build_test_list(
//test                 jsc.array(jsc.integer(0, 25), jsc.string())
//test             )
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