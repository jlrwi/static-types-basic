# pair_type   
Basic Pair data type. Additiona algebras become available if instantiated with types for both elements.   
## Module methods   
### .create(first_value)(second_value)   
Returns a pair.   
Example:   
```   
type_module.create("first")(7);   
{type_name: "Pair", fst: "first", snd: 7}   
```   
### .fst(a)   
Retrieve the first value of a pair.   
### .snd(a)   
Retrieve the second value of a pair.   
### .equals(a)(b)   
Only available when type is instantiated with a pair of Setoids.   
### .includes(x)(a)   
Only available when type is instantiated with a pair of Ords. Returns true if either element of pair equals 'x'.   
### .lte(a)(b)   
Only available when type is instantiated with a pair of Ords. Measures if `b` is less than or equal to `a`.   
### .concat(a)(b)   
Concatenates each element of the pair. Only available when type is instantiated with a pair of Semigroups.   
### .empty()   
Only available when type is instantiated with a pair of Monoids. Each element is set to the appropriate empty value.   
### .map(f)(a)   
Applies `f` to the second value of the pair.   
### .ap(f)(a)   
Only available when type is instantiated with a Semigroup. The first elements of the pairs are concatenated. The function in the second element of the first pair is applied to the value in the second element of the second pair.   
### .of(x)   
Returns a pair with an empty first element, setting the second element to `x`. Only available when type is instantiated with a Monoid.   
### .chain(f)(a)   
Returns the result of concatenating the first element of `a` and the result of `f`, and the second element of the result of `f`. Only available when type is instantiated with a Semigroup.   
### .bimap(f)(g)(a)   
Applies `f` to the first element in `a`, and `g` to the second.   
### .extend(f)(a)   
Return value is the first element from `a` and the result of `f`.   
### .extract(a)   
Returns the second element of the pair.   
### .reduce(f)(initial_value)(a)   
Returns the result of applying `f` to `initial_value` and the second element of the pair.   
### .traverse(type_module)(f)(a)   
Returns pair of first element and function result wrapped in `type_module`.   
### .compose(a)(b)   
Returns pair of first element of `a` and second element of `b`.   
### .toArray(a)   
Returns the pair as a two-element array.   
### .validate(a)   
Validates internal structure of pair. If instantiated with types, elements will also be validated.   
