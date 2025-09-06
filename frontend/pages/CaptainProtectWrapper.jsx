// import React,{useContext,useState,useEffect} from "react";
// // import { UserDataContext } from "../context/UserContext";
// import {useNavigate, Navigate} from "react-router-dom";
// import { CaptainDataContext } from "../context/CaptainContext";
// import axios from "axios";

// const CaptainProtectWrapper=({children})=>{
//     // const {user}=useContext(UserDataContext);
//     const token=localStorage.getItem("token");
//     const navigate=useNavigate();
//     // console.log("token="+token);

//     const {captain,setCaptain}=useContext(CaptainDataContext);
//     const [isLoading,setIsLoading]=useState(true);

//     // if(!token){
//     //     console.log("navigating to captain login")

        
//     //     // Calling navigate("/login") inside the render phase of a component (UserProtectWrapper) is not safe.
//     //     /*
//     //     navigate("/login");
//     //     */

//     //     // replace ensure redirection doesnot add new entry to browser history stack
//     //     return <Navigate to="/captain-login" replace />
//     // }

//     useEffect(()=>{
//         if(!token){
//             navigate("/captain-login");
//         }
//     },[token]);

//     axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`,{
//         headers:{
//             Authorization:`Bearer ${token}`
//         }
//     }).then(response=>{
//         if(response.status===200){
//             setCaptain(response.data.captain);
//             setIsLoading(false);
//         }
//     }).catch(err=>{
//         localStorage.removeItem("token");
//         // console.log(err);
//         navigate("/captain-login");
//     });


//     if(isLoading){
//         return (
//             <div>Loading...</div>
//         )
//     }

//     return (
//         <>
//             {children}
//         </>
//     )
// }

// export default CaptainProtectWrapper;


import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // if no token, redirect immediately
    if (!token) {
      navigate("/captain-login");
      return; // don't attempt fetch
    }

    let mounted = true;
    const controller = new AbortController(); // used to cancel request if component unmounts

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captains/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal, // works with modern axios
            timeout: 7000, // optional: fail fast if backend is unreachable
          }
        );

        if (!mounted) return;

        if (response.status === 200) {
          setCaptain(response.data.captain);
        } else {
          // unexpected status -> force login
          localStorage.removeItem("token");
          navigate("/captain-login");
        }
      } catch (err) {
        if (!mounted) return;
        // If abort, don't treat as error
        if (err.name === "CanceledError" || err.message === "canceled") {
          // request was cancelled
          return;
        }
        // network or server error -> clear token and redirect
        console.error("Profile fetch failed:", err);
        localStorage.removeItem("token");
        navigate("/captain-login");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
      controller.abort(); // cancel in-flight request
    };
    // Only re-run when token changes (or navigate/setCaptain function identity changes)
  }, [token, navigate, setCaptain]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default CaptainProtectWrapper;
