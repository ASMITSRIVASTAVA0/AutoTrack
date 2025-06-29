import React from 'react'
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
// import UserContext from "../context/UserContext";
import { UserDataContext } from '../context/UserContext';

const UserSignup = () => {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [firstName,setFirstname]=useState("");
  const [lastName,setLastname]=useState("");
  const [userData,setUserData]=useState("");

  const navigate=useNavigate();

  // const {user,setUser}=React.useContext(UserContext);
  const {user,setUser}=React.useContext(UserDataContext);

  const submitHandler=async (e)=>{
    e.preventDefault();


    const newUser={
      fullname:{
        firstname:firstName,
        lastname:lastName
      },
      email:email,
      password:password
    }

    const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`,newUser);
    console.log("response=");
    console.log(response);

    if(response.status===201){
      const data=response.data;

      setUser(data.user);
      localStorage.setItem("token",data.token);
      navigate("/home");
    }

    // console.log(userData);
    setEmail("");
    setFirstname("");
    setLastname("");
    setPassword("");
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
          console.log("userdata="+userData);
          // console.log(email,password);
          submitHandler(e);
          setEmail("");
          setPassword("");
        }}>
          <h4 className='text-[#ff2d2d]'>AutoTrack</h4>
          <h3 className="text-xl mb-2">What's your name</h3>
          <div className="flex gap-4 mb-6">
            <input
            required
            type="text"
            placeholder="Firstname"
            className="bg-[#f2f2f2]  w-1/2 rounded px-4 py-2 border  text-lg placeholder:text-base"
            value={firstName}
            onChange={(e)=>{
              setFirstname(e.target.value);
            }}
            />
            <input 
            required
            type="text"
            placeholder="Lastname"
            className="bg-[#f2f2f2]  w-1/2 rounded px-4 py-2 border  text-lg placholder:text-base "
            value={lastName}
            onChange={(e)=>{
              setLastname(e.target.value);
            }}
            />
          </div>



          <h3 className="text-xl mb-2">Please Enter Your Email :</h3>
          <input
          value={email}
          onChange={(e)=>{
            setEmail(e.target.value)
          }}
          required
          type="email"
          placeholder="email@example.com"
          className="bg-[#f2f2f2] mb-6 rounded px-4 py-2 border w-full  text-lg placeholder:text-base"
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
          className="bg-[#f2f2f2] mb-6 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          />
          <button
          className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          >Create Account</button>

          <p className="text-center">Already of an Account? <Link className="text-blue-600" to="/login">Login here</Link> </p>
        </form>
      </div>

      <div>
        <p className="text-xs leading-tight">By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from AutoTrack and its affiliates to the number provided.</p>
      </div>
      
    </div>
  )
}

export default UserSignup