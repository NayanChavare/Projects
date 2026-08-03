import mystore from "./mystore";
import { useState } from "react";

function App() { 
  const [name, setName] = useState("Nayan");
  const [age, setAge] = useState("21");
  return (
    <>
      <mystore.Provider value={{name, age}}>
        
      </mystore.Provider>
    </>
  )
}

export default App;