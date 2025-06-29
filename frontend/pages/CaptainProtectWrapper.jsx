import React,{useContext,useState,useEffect} from "react";
// import { UserDataContext } from "../context/UserContext";
import {useNavigate, Navigate} from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainProtectWrapper=({children})=>{
    // const {user}=useContext(UserDataContext);
    const token=localStorage.getItem("token");
    const navigate=useNavigate();
    console.log("token="+token);

    const {captain,setCaptain}=useContext(CaptainDataContext);
    const [isLoading,setIsLoading]=useState(true);

    // if(!token){
    //     console.log("navigating to captain login")

        
    //     // Calling navigate("/login") inside the render phase of a component (UserProtectWrapper) is not safe.
    //     /*
    //     navigate("/login");
    //     */

    //     // replace ensure redirection doesnot add new entry to browser history stack
    //     return <Navigate to="/captain-login" replace />
    // }

    useEffect(()=>{
        if(!token){
            navigate("/captain-login");
        }
    },[token]);

    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    }).then(response=>{
        if(response.status===200){
            setCaptain(response.data.captain);
            setIsLoading(false);
        }
    }).catch(err=>{
        localStorage.removeItem("token");
        console.log(err);
        navigate("/captain-login");
    });


    if(isLoading){
        return (
            <div>Loading...</div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default CaptainProtectWrapper;