import React from "react";
import { useNavigate } from "react-router-dom";

function About() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    navigate("./contact");
  };
  const navigate = useNavigate();

  return (
    <>
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <textarea placeholder="Message"></textarea>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default About;
