# linked_list_type   
A simple linked list data type implemented using two-element arrays, terminated by an empty array.   
Example:   
```   
["linked", ["list",["example", []]]]   
```   
## Module methods   
### .create(x)   
Returns `x` as a single-item linked list.   
Example:   
```   
type_module.create(7);   
[7, []]   
```   
### .append(list)(x)   
Appends `x` to the front of `list`.   
### .equals(a)(b)   
Type module must be instantiated with a Setoid for this method to be available.   
### .lte(a)(b)   
Type module must be instantiated with an Ord for this method to be available. Evaluates link-by-link, checking if `b` is less than or equal to `a`.   
### .concat(a)(b)   
This method copies `a` and attaches `b` onto the end.   
### .empty()   
Returns an empty array (the list terminator).   
### .map(f)(list)   
### .alt(a)(b)   
Identical to `.concat()`.   
### .zero()   
Identical to `.empty()`.   
### .ap(list<f>)(list<x>)   
Apply each `f` to each `x`.   
### .of(x)   
Identical to `.create()`.   
### .chain(f)(a)   
The function `f` takes contents of `a` and returns a list.   
### .extend(f)(a)   
The function `f` takes a list and returns a value.   
### .reduce(f)(initial_value)(a)   
### .traverse(type_module)(f)(a)   
### .filter(f)(a)   
Filter a list using functon `f` on each element.   
### .get(index)(list)   
The the value at `index`.   
### .set(index)(value)(list)   
Set the `value` at `index`.   
### .validate(list)   
If type is instantiated with a contents type, contents will be validated.   
