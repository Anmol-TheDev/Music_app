import React, { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "./music/MusicPlayer";
import { Outlet } from "react-router-dom";
import Sidebar from "./search/Sidebar";

import { getAuth , onAuthStateChanged } from "firebase/auth";
import {app} from "../Auth/firebase";
import { useStore } from "../zustand/store";
import InputBar from "./search/InputBar";
import { fetchFireStore } from "../Api";
export default function home() {
  

  const navigate = useNavigate()
  const {setIsUser} = useStore()
  useEffect(()=>{
    const auth = getAuth(app)
    const pathName= `/search?searchTxt=${localStorage.getItem('search')||"parmish+verma"}`
    onAuthStateChanged(auth, (user)=>{
      if(user){
        setIsUser(true)
      }
    })
    fetchFireStore()

    navigate(pathName)

  },[])

  return (

<>
  <div className="flex justify-evenly">
<Sidebar/>
    <InputBar/>
    </div>
  <Suspense fallback={<div>...Loading</div>}>
  <Outlet/>
  </Suspense>
  <MusicPlayer/>
</>
  )
}
