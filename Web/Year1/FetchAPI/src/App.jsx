
import { useEffect } from "react"
import axios from "axios"
function App() {
  const API="https://api.themoviedb.org/3/discover/movie?api_key=857696c41ec9ba15dd7185a7b50478e0&page=1"

  useEffect(()=>{
    async function fetchData(){
      // let res = await fetch(API)
      // let data = await res.json()
      // console.log(data)
      try {
      let response = await axios.get(API)
      console.log(response)}
      catch(err){
        console.log(err)
      }
    }
    fetchData()
    },[])
  }

export default App