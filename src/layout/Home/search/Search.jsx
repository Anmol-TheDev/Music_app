import React, { useState, useEffect } from "react";
import Api from "../../../Api";
import { Label } from "../../../components/ui/label";
import { Card , CardContent} from "../../../components/ui/card";
import { PlayCircle } from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useNavigate , createSearchParams, useLocation } from "react-router-dom";
import { useMain } from "../../../Context";
import RandomArtists from "../Artist/artists";


export default function searchComponent() {
  const {value,setValue} = useMain();
  const url = useLocation()
  const search=url.search.split('=')[1].replace("+"," ")
  const [albums, setAlbums] = useState();
  const [globalResult,setGlobalResult] = useState()
  const [songs,setSongs]= useState()
  const navigate =  useNavigate()
  useEffect(()=>{
    async  function  fetchingGlobal() {
      try {
        const res = await Api(`/api/search?query=${search}`)
        setGlobalResult(res.data.data)
      } catch (error) {
        console.log(error);
      }
    }
  
    async  function  fetchingSong() {
      try {
        const res = await Api(`/api/search/songs?query=${search}`)
        setSongs(res.data.data.results)
        if(value==null){
        setValue(res.data.data.results[0].id)
        }
      } catch (error) {
        console.log(error);
      }
    }
  
   async function fetchingAlbum() {
      try {
        const res = await Api(`/api/search/albums?query=${search}`);
        setAlbums(res.data.data.results)
      } catch (error) {
        console.log(error);
      }
    }
    fetchingGlobal()
    fetchingSong()
    fetchingAlbum()
  },[url,search])
  function handleSongClick(songId){
    setValue(songId)
  }
  function handleAlbumsClick( Id ){ 
      const   path={
          pathname:"/album",
          search: createSearchParams({Id}).toString()
        }
        navigate(path)
  }
  return (
    <ScrollArea className="h-[90vh] w-full flex">
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto sm:p-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {globalResult?.topQuery.results[0] && (
            <div className="w-[90vw] sm:w-full lg:w-1/3 ">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Top Result</h2>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <img
                    src={globalResult?.topQuery?.results[0].image[2].url}
                    alt={globalResult?.topQuery?.results[0].title}
                    loading='lazy'
                    className="w-full max-w-[200px] sm:max-w-[250px] mx-auto mb-4 rounded shadow-lg"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-center mb-2">
                    {globalResult?.topQuery?.results[0].title || globalResult?.songs.results[0].title}
                  </h3>
                </CardContent>
              </Card>
            </div>
          )}
          {songs && (
            <div className="w-[95vw] sm:w-full lg:w-2/3 border rounded-xl p-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Songs</h2>
              <ScrollArea className="h-[40vh] sm:h-[50vh]">
                <ul className="space-y-2 pr-4">
                  {songs.map((song, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors hover:bg-secondary"
                      onClick={() => handleSongClick(song.id)}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="w-4 sm:w-6 text-center text-sm sm:text-base">{index + 1}</span>
                        <img
                          src={song.image ? song.image[2].url : "/api/placeholder/40/40"}
                          alt={song.name}
                          loading='lazy'
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded"
                        />
                        <div>
                          <p className="font-medium text-sm sm:text-base">{song.name}</p>
                          <p className="text-xs sm:text-sm">{song.artists.primary[0].name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-xs sm:text-sm">
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </span>
                        <button className="p-1 sm:p-2 rounded-full">
                          <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
        {albums && (
          <div className="mt-6 w-[95vw] sm:w-full sm:mt-8 border p-4 rounded-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Albums</h2>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4 overflow-x-auto">
                {albums.map((album, index) => (
                  <div
                    onClick={() => handleAlbumsClick(album.id)}
                    key={index}
                    className="bg-secondary rounded-2xl p-3 sm:p-4 flex flex-col items-center flex-shrink-0"
                  >
                    <img
                      src={album.image[2].url}
                      alt={album.name}
                      loading='lazy'
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mb-2"
                    />
                    <Label className="text-center w-24 sm:w-32 text-xs sm:text-sm">{album.name}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        <RandomArtists search={search} />
      </div>
    </div>
  </ScrollArea>
  );
}
