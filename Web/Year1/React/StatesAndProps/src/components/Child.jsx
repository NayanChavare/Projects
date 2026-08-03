import Child2 from "./Child2";
function Child({ count, message }) {
    return (
        <>
            <Child2 count={count}/>
            <h1>Count : {count}</h1>
            <h2>Child Component</h2>
            <p>Received from Parent: {message}</p>
        </>
    );
}

export default Child;