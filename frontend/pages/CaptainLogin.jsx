import React from 'react';
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {CaptainDataContext} from "../context/CaptainContext";


const CaptainLogin = () => {
  // console.log("captain login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  // const [captainData,setCaptainData]=useState("");
  const {captain,setCaptain}=React.useContext(CaptainDataContext);
  const navigate=useNavigate();

  const submitHandler=async (e)=>{
    e.preventDefault();
    console.log("email="+email+" pass="+password);
    const captain={
      email:email,
      password:password
    };

    const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`,captain);
    console.log(response+" mystatus="+response.status);
    if(response.status===200){
      const data=response.data;

      setCaptain(data.captain);
      localStorage.setItem("token",data.token);
      // console.log("token=",data.token);
      navigate("/captain-home");
    }
    // console.log("response not come");

   
  }

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <form onSubmit={(e)=>{
          e.preventDefault();
          // setCaptainData({
          //   email:email,
          //   password:password
          // })
          // console.log("captaindata="+captainData.email+" pass="+captainData.password);
          // console.log(email,password);
          submitHandler(e);
          setEmail("");
          setPassword("");
        }}>
          <h4 className='text-[#ff2d2d]'>AutoTrack</h4>
          <h3 className="text-xl mb-2">Please Enter Captain's Email :</h3>
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
          <h3 className="text-xl mb-2">Enter Captain's Password</h3>
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

          <p className="text-center">New here? <Link className="text-blue-600" to="/captain-signup">Create new Account</Link> </p>
        </form>
      </div>

      <div>
        <Link to="/login"
          className="bg-[#ffff00] flex items-center justify-center text-black font-semibold mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          >Sign in as User</Link>
      </div>
      
    </div>
  )
}

export default CaptainLogin