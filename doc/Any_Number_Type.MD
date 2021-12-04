# any_number_type   
This is a numeric pair for storing real and complex numbers.   
## Module methods   
### .create(real_component, [imaginary_component])   
The create method takes a numeric value representing the real component of the number and an optional second numeric value that specifies the imaginary component.   
Example:   
```   
type_module.create(3, 7);   
{type_name: "Any Number", r: 3, i: 7}   
```   
### .equals(a)(b)   
### .lte(a)(b)   
Determines if b is less than or equal to a. Comparison is made using the distance from the origin of the complex plane.   
Example:   
```   
type_module.lte({r: -3, i: 7})({r: 1, i: 4});   
true   
```   
### .concat(a)(b)   
The concat method operates as a numeric sum of each component.   
Example:   
```   
type_module.concat({r: 3, i: 7})({r: -1, i: 4});   
{type_name: "Any Number", r: 2, i: 11}   
```   
### .empty()   
Produces a zero value.   
### .invert(a)   
Produces the negative inverse of both component values.   
### .map(f)(a)   
Applies function `f` to both component values.   
Example:   
```   
type_module.map(add(5))({r: -1, i: 4});   
{type_name: "Any Number", r: 4, i: 9}   
```   
### .bimap(f)(g)(a)   
Applies function `f` to the real component and function `g` to the imaginary component.   
### .validate(a)   
### .multiply(a)(b)   
Performs complex number multiplication on two values. Example:   
```   
type_module.multiply({r: 2, i: 1})({r: 1, i: 1});   
{type_name: "Any Number", r: 1, i: 3}   
```   
