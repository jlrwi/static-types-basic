# static-types-basic   
Factories for curried-static-land algebraic data type modules based on ECMAScript types.

## Type factories    
   
Factory | Maximal algebras
--------|------------------
any_number_type | Functor, Group, Ord
constant_type | Functor, *Applicative*, Comonad, Traversable, Foldable, *Monoid*, *Ord* 
either_type | Functor, Alt, Applicative, Chain, Monad, Bifunctor, Extend, Traversable, *Semigroup*, *Ord* 
identity_type | Functor, Applicative, Traversable, *Monoid*,  *Ord* 
kleisli_type | *Category*
linkedlist_type | Functor, Alternative, Monad, Chain, Extend, Traversable, Filterable, Monoid, *Ord*
maybe_type | Functor, Alternative, Monad, Chain, Traversable, Filterable, Monoid, *Ord*  
nil_type | Functor, Monoid, Ord
pair_type | Functor, Applicative, Bifunctor, Chain, Comonad, Traversable, *Monoid*, *Ord*
vector_type | Functor, Bifunctor, Group, Setoid

*Italicized* algebras are only achieved when a compliant type module for the contents is supplied to the factory.

### Usage

No or generic contents:
```
const type_module = factory();
```
    
With typed contents:
```
const type_module = factory(content_type_module);
```

### Type documentation
- [any_number_type](doc/Any_Number_Type.MD)
- [constant_type](doc/Constant_Type.MD)
- [either_type](doc/Either_Type.MD)
- [identity_type](doc/Identity_Type.MD)
- [kleisli_type](doc/Kleisli_Type.MD)
- [linkedlist_type](doc/LinkedList_Type.MD)
- [maybe_type](doc/Maybe_Type.MD)
- [nil_type](doc/Nil_Type.MD)
- [pair_type](doc/Pair_Type.MD)
- [pair_type_custom](doc/Pair_Type_Custom.MD)
- [vector_type](doc/Vector_Type.MD)