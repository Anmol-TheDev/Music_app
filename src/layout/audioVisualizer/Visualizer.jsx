import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

const AudioVisualizer = ({ audioUrl }) => {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const fetchAndDecodeAudio = async () => {
    try {
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error('Failed to fetch audio');
      const arrayBuffer = await res.arrayBuffer();
      return await audioContextRef.current.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error fetching and decoding audio:', error);
    }
  };

  useEffect(() => {
    const setupVisualizer = async () => {
      if (!audioContextRef.current || !analyserRef.current || !audioUrl) return;

      try {
        const audioBuffer = await fetchAndDecodeAudio();

        const createSource = (offset = 0) => {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(analyserRef.current);
          source.connect(audioContextRef.current.destination);
          return source;
        };

        if (isPlaying) {
          const offset = played || offsetRef.current;
          sourceRef.current = createSource(offset);
          sourceRef.current.start(0, offset);
          startTimeRef.current = audioContextRef.current.currentTime - offset;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = 800;
          canvas.height = 256;

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const draw = () => {
            if (!isPlaying) return;

            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * canvas.height;
              ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
            }
          };

          draw();
        }
      } catch (error) {
        console.error(error);
      }
    };

    setupVisualizer();

    return () => {
      if (sourceRef.current) {
        try {
          const elapsedTime = audioContextRef.current.currentTime - startTimeRef.current;
          offsetRef.current = elapsedTime;
          sourceRef.current.stop();
          sourceRef.current.disconnect();
        } catch (error) {
          console.error('Error stopping the audio source:', error);
        }
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, audioUrl,]);

  const handlePlay = () => {
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
  };

  return (
    <div className="flex flex-col items-center">
      <ReactPlayer
        ref={playerRef}
        url={audioUrl}
        playing={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        width="100%"
        height="50px"
        controls
      />
      <canvas
        ref={canvasRef}
        className="w-full h-64 mt-4 bg-black"
      />
    </div>
  );
};

export default AudioVisualizer;