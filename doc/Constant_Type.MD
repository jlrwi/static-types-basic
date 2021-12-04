# constant_type   
If this type is instantiated with a monoid, it will behave like an Applicative, using .concat() for .ap(), and .empty() for .of(). This allows the sort-of Applicative to be used with traversal functions, with different types of monoids producing different results.   
## References:   
Sanctuary Constant:   
https://github.com/sanctuary-js/sanctuary-constant/   
Explanation of partial lenses:   
https://calmm-js.github.io/partial.lenses/implementation.html   
## Module methods   
### .create(x)   
Returns `x` wrapped in a Constant.   
Example:   
```   
type_module.create(7);   
{type_name: "Constant", value: 7}   
```   
### .equals(a)(b)   
Type module must be instantiated with a Setoid for this method to be available.   
### .lte(a)(b)   
Type module must be instantiated with an Ord for this method to be available. Evaluates if b is lte a.   
### .concat(a)(b)   
Type module must be instantiated with a Semigroup for this method to be available.   
### .empty()   
Type module must be instantiated with a Monoid for this method to be available.   
### .map(f)(a)   
As a constant, f is ignored and a is returned unchanged.   
### .extend(f)(a)   
As a constant, f is ignored and a is returned unchanged.   
### .extract(a)   
Extracts the value from the Constant.   
### .reduce(f)(initial)(a)   
Returns the `initial` value unchanged.   
As a constant, f is ignored and a is returned unchanged.   
### .traverse(type_module)(f)(a)   
Ignores `f` and returns `a` wrapped in type `type_module`.   
### .validate(a)   
If not instantiated with a type module, checks if parameter is an object with a value property. If instantiated with a type module, validates contents.   
