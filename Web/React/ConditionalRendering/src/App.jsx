// Conditional Rendering in React allows you to render different components or elements based on certain conditions. This is typically done using JavaScript conditional statements like if-else, ternary operators, or logical && operator within the JSX.
// import React from 'react';
// function App() {
//   let flag = false;
//   if (flag) {
//     return <h1>Hello, True</h1>;
//   } else {
//     return <p>Hello, False</p>;
//   }
// }
// export default App;

function App() {
  let flag = true;
  return (
    <>
      <h1>Conditional Rendering in React</h1>
      <p>Conditional Rendering in React allows you to render different components or elements based on certain conditions. 
        This is typically done using JavaScript conditional statements like if-else, ternary operators, 
        or logical && operator within the JSX.</p>
      {flag==true ? <h1>Hello, True</h1> : <p>Hello, False</p>}
    </>
  )

}
export default App;