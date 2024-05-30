import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import { FaRegCirclePause } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";

export default function App() {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlobs, setAudioBlobs] = useState([]);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null); // Track paused audio URL
  const audioRef = useRef(null);
  const audioContext = useRef(null);
  const audioStream = useRef(null);
  const [startTime, setStartTime] = useState(null); // Track recording start time
  const [totalTime, setTotalTime] = useState(0); // Track total paused time
  const [elapsedTime, setElapsedTime] = useState(0); // Track elapsed recording time
  const intervalRef = useRef(null); // Reference for the interval
  const [sendMessage, setSendMessage] = useState(false);
  useEffect(() => {
    audioContext.current = new AudioContext();
  }, []);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  useEffect(() => {
    if (audioBlobs.length > 0) {
      // Fallback: Play the entire recording if no paused audio available
      const audioBlob = new Blob(audioBlobs, { type: "audio/webm" });
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;

      if (sendMessage) {

        if (audioBlobs.length > 0) {
          const audioBlob = new Blob(audioBlobs, { type: "audio/webm" });
          const audioURL = window.URL.createObjectURL(audioBlob);
          console.log("🚀 ~ useEffect ~ audioURL:", audioURL)

          // Create a download link and click it programmatically
          // const anchor = document.createElement("a");
          // anchor.href = audioURL;
          // anchor.download = "recorded_audio.webm";
          // document.body.appendChild(anchor);
          // anchor.click();
          // document.body.removeChild(anchor);
          // window.URL.revokeObjectURL(audioURL);
        }
        setAudioBlobs([]);
        setElapsedTime(0);
        setSendMessage(false);
      }
    }
  }, [audioBlobs,sendMessage]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorderInstance = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorderInstance);
      audioStream.current = stream;

      mediaRecorderInstance.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setAudioBlobs((prevBlobs) => [...prevBlobs, event.data]);
        }
      });

      setStartTime(Date.now());

      mediaRecorderInstance.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      let timeInSeconds = (Date.now() - startTime) / 1000;

      setTotalTime((prev) => prev + timeInSeconds);
      mediaRecorder.pause();
      setIsRecording(false);
      mediaRecorder.requestData();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && !isRecording) {
      setStartTime(Date.now());

      mediaRecorder.resume();
      setIsRecording(true);
      setRecordedAudioURL(null); // Clear paused audio URL when resuming recording
    }
  };

  const stopRecording = () => {
    console.log("is audio");
    if (mediaRecorder && isRecording) {
      
      mediaRecorder.stop();
      setIsRecording(false);
      audioContext.current.close();
      setRecordedAudioURL(null); // Clear paused audio URL when stopping recording
    }
    if(audioBlobs.length > 0){
      setSendMessage(true);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="m-[30px]">
      <div className={`audio-track ${isRecording ? "recording" : ""}`}>
        <div className="flex space-x-[5px] items-center">
          {isRecording ? (
            <div className="flex items-center">
              <h2>{formatTime(elapsedTime)}</h2>
              <img src="/sound.gif" className="w-[120px] h-[35px]" />
            </div>
          ) : audioBlobs.length > 0 ? (
            <audio ref={audioRef} controls />
          ) : (
            ""
          )}

          {!isRecording && (
            <button
              onClick={() => {
                if (audioBlobs.length > 0) {
                  resumeRecording();
                } else {
                  startRecording();
                }
              }}
            >
              {" "}
              <FaMicrophone className="text-[25px] text-[red]" />{" "}
            </button>
          )}
          {isRecording ? (
            <button onClick={pauseRecording}>
              <FaRegCirclePause className="text-[20px] text-[red]" />
            </button>
          ) : (
            ""
          )}
          <button
            onClick={stopRecording}
            className="p-[11px] rounded-full bg-[#2ea75a] text-[white]"
          >
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
}
