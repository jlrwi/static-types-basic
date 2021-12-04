# vector_type   
A type of pair storing angle in radians and a positive magnitude.   
## Module methods   
### .create(magnitude)(angle)   
Returns a vector object.   
Example:   
```   
type_module.create(7)(Math.PI);   
{type_name: "Vector", angle: 3.1415, magnitude: 7}   
```   
### .equals(a)(b)   
Attempts to reduce angles for accurate comparison.   
### .concat(a)(b)   
Concatenation is graphical - `x` is tacked onto the "end" of `y` and the result is a vector to the resulting position.   
### .empty()   
Returns a zero vector.   
### .invert(a)   
Inverts the angle to point in the opposite direction. Magnitude is unchanged.   
### .map(f)(a)   
Applies `f` to the magnitude of the vector.   
### .bimap(f)(g)(a)   
Applies `f` to the magnitude, and `g` to the angle.   
### .validate(a)   
Validate value structure and positive magnitude.   
