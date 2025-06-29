import React,{useContext,useState,useEffect} from "react";
import { UserDataContext } from "../context/UserContext";
import {useNavigate, Navigate} from "react-router-dom";
import axios from "axios";
const UserProtectWrapper=({children})=>{
    // const {user}=useContext(UserDataContext);
    const token=localStorage.getItem("token");
    const navigate=useNavigate();
    console.log("token="+token);

    const {user,setUser}=useContext(UserDataContext);
    const [isLoading,setIsLoading]=useState(true);

    // if(!token){
    //     console.log("navigating to login")

        
    //     // Calling navigate("/login") inside the render phase of a component (UserProtectWrapper) is not safe.
    //     /*
    //     navigate("/login");
    //     */

    //     // replace ensure redirection doesnot add new entry to browser history stack
    //     return <Navigate to="/login" replace />
    // }

    useEffect(()=>{
        if(!token){
            navigate("/login");
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        }).then(response=>{
            if(response.status===200){
                setUser(response.data.user);
                setIsLoading(false);
            }
        }).catch(err=>{
            console.log(err);
            localStorage.removeItem("token");
            navigate("/login");
        })
    },[token]);

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

export default UserProtectWrapper;