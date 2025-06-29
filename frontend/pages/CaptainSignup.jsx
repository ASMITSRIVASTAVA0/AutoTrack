import React from 'react'
import {Link} from "react-router-dom";
import { useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import {useNavigate} from "react-router-dom";
import axios from "axios";

const CaptainSignup = () => {
    const navigate=useNavigate();


    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [firstName,setFirstname]=useState("");
    const [lastName,setLastname]=useState("");
    const [userData,setUserData]=useState("");

    const [vehicleColor,setVehicleColor]=useState("");
    const [vehiclePlate,setVehiclePlate]=useState("");
    const [vehicleCapacity,setVehicleCapacity]=useState("");
    const [vehicleType,setVehicleType]=useState("");
  
    const {captain,setCaptain}=React.useContext(CaptainDataContext);
  
    const submitHandler=async (e)=>{
      e.preventDefault();


      const captainData={
        fullname:{
          firstname:firstName,
          lastname:lastName
        },
        email:email,
        password:password,
        vehicle:{
          color:vehicleColor,
          plate:vehiclePlate,
          capacity:vehicleCapacity,
          vehicleType:vehicleType
        }
      }

      console.log(captainData);

      const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`,captainData);
      
      if(response.status===201){
        const data=response.data;
        setCaptain(data.captain);
        localStorage.setItem("token",data.token);
        navigate("/captain-home");
      }

      setEmail("");
      setFirstname("");
      setLastname("");
      setPassword("");
      setVehicleColor("");
      setVehicleCapacity(0);
      setVehicleType("");
      setVehiclePlate("");

    }

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <form onSubmit={(e)=>{
          e.preventDefault();
          // setUserData({
          //   email:email,
          //   password:password
          // })
          // console.log("userdata="+userData);
          // console.log(email,password);
          submitHandler(e);
          // setEmail("");
          // setPassword("");
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

            <h3 className="text-xl mb-2">Vehicle Information</h3>
            <div className="flex gap-4 mb-6">
            <input
              required
              type="text"
              placeholder="Vehicle Color"
              className="bg-[#f2f2f2] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
            />
            <input
              required
              type="text"
              placeholder="Vehicle Plate"
              className="bg-[#f2f2f2] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
            />
            </div>
            <div className="flex gap-4 mb-6">
            <input
              required
              type="number"
              min="1"
              placeholder="Capacity"
              className="bg-[#f2f2f2] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base"
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
            />
            <select
              required
              className="bg-[#f2f2f2] w-1/2 rounded px-4 py-2 border text-lg"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Car">Car</option>
              <option value="Auto">Auto</option>
              <option value="Motocycle">Motocycle</option>
            </select>
            </div>

          <button
          className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
          >Create Captain Account</button>

          <p className="text-center">Already of an Account? <Link className="text-blue-600" to="/captain-login">Login here</Link> </p>
        </form>
      </div>

      <div>
        <p className="text-xs leading-tight">By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from AutoTrack and its affiliates to the number provided.</p>
      </div>
      
    </div>
  )
}

export default CaptainSignup