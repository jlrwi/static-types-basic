# kleisli_type   
A derivation of pair_type   
## Instantiation Syntax: kleisli_type(type_name)(log_type)(value_type) ## Module methods   
### .create(embellishment)(value)   
### .equals(a)(b)   
### .compose(f)(g)(x)   
Kleisli composition.   
### .id(f)   
Creates value with empty log type.   
### .embellish_function(f)   
Embellish a unary function with a constant   
### .validate(a)   
Validate the Kleisli pair.   
