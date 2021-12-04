# nil_type   
A type representing all bottom values in Javascript.   
## Module methods   
### .create(x)   
Returns an empty, frozen object.   
### .equals(a)(b)   
Returns true because all bottom values are considered to be equal.   
### .lte(a)(b)   
Returns true because all bottom values are considered to be equal.   
### .concat(a)(b)   
The result of concatenating two bottom values is a bottom value.   
### .empty()   
Returns an empty, frozen object.   
### .map(f)(a)   
Returns the value `a` because a bottom value cannot be changed.   
### .validate(a)   
Tests for one of the following: undefined, null, NaN, or a frozen,empty object.   
