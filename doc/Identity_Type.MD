# identity_type   
The most basic type container. Gains Monoid and Ord if instantiated with a compliant type module.   
## Module methods   
### .create(x)   
Example:   
```   
type_module.create(7);   
{type_name: "Identity", value: 7}   
```   
### .concat(a)(b)   
Only available if type module is instantiated with a Semigroup. Value `b` is concatted onto `a`.   
### .empty()   
Only available if type module is instantiated with a Monoid.   
### .equals(a)(b)   
Only available if type module is instantiated with a Setoid.   
### .lte(a)(b)   
Only available if type module is instantiated with an Ord. Determintes if `b` is less than or equal to `a`.   
### .map(f)(a)   
### .ap(Identity<a -> b>)(Identity<a>)   
### .of(x)   
### .extend(f)(a)   
### .extract(a)   
### .reduce(f)(initial_value)(a)   
### .traverse(type_module)(f)(a)   
### .validate(a)   
Checks contents when instantiated with a type_module.   
