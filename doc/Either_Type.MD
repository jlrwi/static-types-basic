# either_type   
This type includes the Left and Right types.   
## Module methods   
### .left(x)   
Returns `x` wrapped in a Left.   
Example:   
```   
type_module.left(7);   
{type_name: "Left", value: 7}   
```   
### .right(x)   
Returns `x` wrapped in a Right.   
Example:   
```   
type_module.right(7);   
{type_name: "Right", value: 7}   
```   
### .is_left(Either<a>)   
Returns a boolean indicating if parameter is a Left.   
### .is_right(Either<a>)   
Returns a boolean indicating if parameter is a Right.   
### .create(left_value)(right_value)   
If left is a bottom value, returns `right(right_value)`. Otherwise returns `left(left_value`.   
Example:   
```   
type_module.create(7)("right");   
{type_name: "Left", value: 7}   
```   
### .equals(Either<a>)(Either<b>)   
This method is only available if the type is instantiated with Setoid type modules for both left and right.   
### .lte(Either<a>)(Either<b>)   
This method is only available if the type is instantiated with Ord type modules for both left and right. Evaluates if `b` is less than or equal to `a`.   
### .concat(Either<a>)(Either<b>)   
This method is only available if the type is instantiated with Semigroup type modules for both left and right. If both parameters are the same, `b` is concatted to `a`. If parameters are not the same Either type, the Right is returned unchanged.   
### .map(f)(Either<a>)   
This method is right-biased - the function `f` is only applied to Right values. Left values are returned unchanged.   
### .alt(Either<a>)(Either<b>)   
Returns first value if it is Right, otherwise second value.   
### .ap(Either<f>)(Either<a>)   
If both parameters are Right, apply the function from the first to the value from the second. If the first parameter is a Left, return it. If only the second parameter is a Left, return it.   
Example:   
```   
type_module.ap(type_module.right(add(7)))(type_module.right(13));   
{type_name: "Right", value: 20}   
```   
### .of(x)   
Synonymous with .right(), wraps parameter in a Right.   
### .chain(f)(Either<a>)   
If the Either is a Right, apply the function to it. Otherwise return the Either unchanged.   
### .bimap(f)(g)(Either<a>)   
If the Either is a Left, apply `f` to it. If it's a Right, apply `g` to it.   
### .extend(f)(Either<a>)   
If the Either is a Right, apply the function to it and package the result in a Right. Otherwise return the Either unchanged.   
### .extract(Either<a>)   
Extract the value from an Either.   
### .reduce(f)(initial_value)(Either<a>)   
If the Either is a Right, run the reduction function primed with `initial_value`. Otherwise, return `initial_value`.   
### .traverse(type_module)(f)(Either<a>)   
If the Either is a Right, execute the traversal function. Otherwise, wrap the value in type_module.   
### .validate(Either<a>)   
Validate the Either structure. If type module has been instantiated with Left and Right type modules, validate the contents.   
