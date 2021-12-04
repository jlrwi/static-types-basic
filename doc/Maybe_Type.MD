# maybe_type   
This type includes the Nothing and Just types.   
## Module methods   
### .nothing(x)   
Returns `x` wrapped in a Nothing. The value is superflouous.   
Example:   
```   
type_module.nothing(7);   
{type_name: "Nothing", value: 7}   
```   
### .just(x)   
Returns `x` wrapped in a Just.   
Example:   
```   
type_module.just(7);   
{type_name: "Just", value: 7}   
```   
### .is_Nothing(a)   
Test if an object is a Nothing.   
### .is_Just(a)   
Test if an object is a Just.   
### .create(x)   
If `x` is a bottom value, return a Nothing. Otherwise return a Just.   
### .equals(a)(b)   
Type module must be instantiated with a Setoid for this method to be available.   
### .lte(a)(b)   
Type module must be instantiated with an Ord for this method to be available. Evaluates if b is lte a. A Nothing is less than a Just.   
### .concat(a)(b)   
Type module must be instantiated with a Semigroup for this method to be available.  A Nothing as either parameter is ignored.   
### .empty()   
Returns a Nothing.   
### .map(f)(a)   
The function is only applied to Just values.   
### .alt(a)(b)   
Returns the `b` value unless it is Nothing.   
### .zero()   
Returns a Nothing.   
### .ap(Maybe<f>)(Maybe<a>)   
Applies the `f` to `a`. If either value is Nothing, Nothing is returned.   
### .of(x)   
Wraps `x` in a Just.   
### .chain(f)(a)   
Applies `f` to `a` unless it's a Nothing.   
### .reduce(f)(initial)(a)   
If `a` is Nothing, return the initial value.   
### .traverse(type_module)(f)(a)   
If `a` is Nothing, returns Nothing wrapped in type_module.   
### .filter(f)(a)   
Returns `a` if its contents pass the filter, otherwise returns Nothing   
### .validate(a)   
Validate `a` as a Just or Nothing. If instantiated with a type module, contents will be validated.   
