TypeJS
======

TypeJS is intented to enhance functional programming JavaScript libraries by adding Haskell-style type definition to functions.

## Basic Example
Lets construct a peculiar `Add` function
```js
var Add = Type ('Num -> Num -> Int', function (a, b) {
	return a + b;
});
```

`Add` takes two `Num`s and returns an `Int`, since `Num` is any number in general but `Int` is more strict, this `Add` function will only be work if the two numbers given sum to a whole number.

```js
Add(1, 2) //3
Add(1.3, 3.7) //5
Add(2, 2.2) //TypeError: Incorrect output type, expected Int, received Num
Add(2, '3') //TypeError: Incorrect input type, expected Num, received String
```

## Type Variables
Lets modify `Add`s type signature a little and add a variable type `a`. Variable types have to be A SINGLE LOWERCASE LETTER!!!
```js
var Add = Type ('Num -> a -> a', function (a, b) {
	return a + b;
});
```
The variable type will be infered on the first use of the function.
```js
Add (1, '2') //"12"
Add (1, 2) //TypeError: Incorrect input type, expected String, received Int
```

## Lists
List types are compound types and are defined as in Haskell like `[a]`. Variable types within lists are infered as you would expect.

```js
var sumReduce = Type ('[a] -> a', function (l) {
	return l.reduce( function(a,b) {return a + b;} );
});
```
`a` will first be infered from the list and will be expected as the output type.
```js
sumReduce (['1','2','3']) //"123"
sumReduce ([1,2,3]) //TypeError: Incorrect input type, expected [String], received [Int]
```
If the function is incorrectly typed, it wont work even in the first use.
```js
var tellSum = Type ('a -> a -> a', function (num1, num2) {
	return "The number is " + (num1 + num2);
});
tellSum (1,2) //TypeError: Incorrect output type, expected Int, received String
```

## Currently Supported Types

<table style="width:300px">
<tr>
  <td>2</td>
  <td>Int</td> 
</tr>
<tr>
  <td>2.0</td>
  <td>Int</td> 
</tr>
<tr>
  <td>2.1</td>
  <td>Num</td> 
</tr>
<tr>
  <td>"2"</td>
  <td>String</td> 
</tr>
<tr>
  <td>[2,3]</td>
  <td>[Int]</td> 
</tr>
<tr>
  <td>[[1,2],[3,4]]</td>
  <td>[[Int]]</td> 
</tr>
</table>

## Missing
1. Add the rest of JavaScript types (easy)
2. Add type() method to Function.prototype you can access a functions type (relatively easy)
3. Support type definition for functions that take functions such as `(a -> b) -> a -> b` (the previous point helps but remains not easy)

## Warning
Typing a function has the extra cost of checking the type of all the arguments and output, don't use this in performance critical applications.


