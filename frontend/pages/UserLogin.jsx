import React from 'react'
import {Link} from "react-router-dom"
import { useState } from 'react';
import {useContext} from "react";
import {UserDataContext} from "../context/UserContext";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const UserLogin = () => {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [userData,setUserData]=useState("");

  const {user, setUser}=useContext(UserDataContext);
  const navigate=useNavigate();

  const submitHandler=async (e)=>{
    e.preventDefault();

    // setUserData({
    //   email:email,
    //   password:password
    // });

    const userData={
      email:email,
      password:password
    }

    const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`,userData);

    if(response.status==200){
      const data=response.data;
      setUser(data.user);
      console.log(data);
      localStorage.setItem("token",data.token);
      navigate("/home");
    }

    setEmail("");
    setPassword("");

  
    console.log("hello");
  }

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <form onSubmit={(e)=>{
          e.preventDefault();
          setUserData({
            email:email,
            password:password
          })

          
        
          submitHandler(e);
          setEmail("");
          setPassword("");
        }}>
          <h4 className='text-[#ff2d2d]'>AutoTrack</h4>
          <h3 className="text-xl mb-2">Please Enter Your Email :</h3>
          <input
          value={email}
          onChange={(e)=>{
            // console.log(e.target.value)
            setEmail(e.target.value)
            // console.log(email)
          }}
          required
          type="email"
          placeholder="email@example.com"
          className="bg-[#f2f2f2] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          />
          <h3 className="text-xl mb-2">Enter Password</h3>
          <input 
          required 
          value={password}
          onChange={(e)=>{
            setPassword(e.target.value)
          }}
          type="password" 
          placeholder="Password"
          className="bg-[#f2f2f2] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          />
          <button
          className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          >Login</button>

          <p className="text-center">New here? <Link className="text-blue-600" to="/signup">Create new Account</Link> </p>
        </form>
      </div>

      <div>
        <Link to="/captain-login"
          className="bg-[#ff2d2d] flex items-center justify-center text-white font-semibold mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          >Sign in as Captain</Link>
      </div>
      
    </div>
  )
}

export default UserLogin