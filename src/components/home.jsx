import React, { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import MusicPlayer from "./music/MusicPlayer";
import { Outlet } from "react-router-dom";
import Sidebar from "./search/Sidebar";
import { useRef } from "react";
import { createSearchParams , useSearchParams } from "react-router-dom";
import { getAuth , onAuthStateChanged } from "firebase/auth";
import app from "../Auth/firebase";
import { useMain } from "../Context";
export default function home() {
  const [searchTxt , setSearchTxt] = useState(localStorage.getItem('search')||"permish verma")
  const inputRef= useRef()
  const [searchQuery,setSearchQuery] = useSearchParams()
  const navigate = useNavigate()
  const {setIsUser} = useMain()
  function handleSubmit(e) {
    e.preventDefault();
    const search = inputRef.current.value;
    setSearchQuery({search})
    localStorage.setItem('search',search)
  }
  useEffect(()=>{
    const auth = getAuth(app)
    const pathName= `/search?searchTxt=${localStorage.getItem('search')||"parmish+verma"}`
    onAuthStateChanged(auth, (user)=>{
      if(user){
        console.log(user)
        setIsUser(true)
      }
    })

    navigate(pathName)

  },[])
  return (

<div >
  <div className="flex justify-evenly">
<Sidebar/>
<form className="sticky ml-10 top-0 z-10 p-2 sm:p-4 shadow-md bg-background w-[90vw]" onSubmit={handleSubmit}>
      <div className="max-w-3xl mx-auto flex justify-center items-center gap-2 sm:gap-3">
        <Input
          placeholder="Search for music..."
          className="text-sm sm:text-base md:text-lg flex-grow"
          ref={inputRef}
          type="search"
        />
        <button type="submit" className="p-1 sm:p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </form>
    </div>
  <Suspense fallback={<div>...Loading</div>}>
  <Outlet/>
  </Suspense>
  <MusicPlayer/>
</div>
  )
}
