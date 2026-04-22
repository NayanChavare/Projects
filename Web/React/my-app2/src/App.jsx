import React from 'react';
// import {Comp1, Comp2, Comp3, Comp4} from "../compents/compents";
// function App(){
//     return(
//         <>
//             <Comp1/>
//             <Comp2/>
//             <Comp3/>
//             <Comp4/>
//         </>
//     )
// }

class App extends React.Component{
    constructor(){
        super();
        this.state={
            count:0,
            name:"Nayan",
            task:"Incompleted"
        }
    }
    render(){
        return(
            <>
                <h1>Hello {this.state.name}</h1>
                <span>Count: </span>
                <h1>{this.state.count}</h1>
                <button onClick={()=>this.setState({count:this.state.count+1})}>+</button>
                <button onClick={()=>this.setState({count:this.state.count-1})}>-</button>
                <button onClick={()=>this.setState({count:0})}>Reset</button>
                {this.state.count < 0 && this.setState({count:0})} 
                <br />
                <h1>Task: {this.state.task}</h1>
                <br />
                <label htmlFor="task">Name:</label>
                <input type="text" id="name" onChange={(e)=>this.setState({name:e.target.value})}/>
                <br />
                <button onClick={()=>this.setState({task:"Completed"})}>Complete Task</button>
                <button onClick={()=>this.setState({task:"Incompleted"})}>Incompleted Task</button>
            </>
        )
    }
}

export default App;