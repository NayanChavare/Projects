import { use } from "react";
import { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const [task, setTask] = useState('Pending');
  const countchange = () => {    
    setCount(count + 1);
  }
  const namechange = () => {    
    setName('Doe');
  }
  const taskchange = () => {    
    setTask('Completed');
  }
  useEffect(() => {
    console.log('change');
  },[count, name, task]);
  return(
    <div>
      <h1>Hello</h1>

      <p>Count: {count}</p>
      <button onClick={countchange}>Increment</button>
      <p>Name: {name}</p>
      <button onClick={namechange}>Change Name</button>

      <p>Task: {task}</p>
      <button onClick={taskchange}>Change Task</button>
    </div>
  );
}

export default App;