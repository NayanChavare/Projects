import { useState } from "react";
import Child from "./components/Child";



function App(){
  const [count, setCount] = useState(0);
  return(
    <>
      <Child count={count} message={"Hello"}/>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </>
  )
}
export default App;

// Context API : 
// Redux (Library) : 