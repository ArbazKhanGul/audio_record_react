
import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import { FaRegCirclePause } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import { LiveAudioVisualizer } from "react-audio-visualize";

export default function App() {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlobs, setAudioBlobs] = useState([]);
  const audioRef = useRef(null);
  const audioStream = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Track elapsed recording time
  const intervalRef = useRef(null); // Reference for the interval
  const [sendMessage, setSendMessage] = useState(false);

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
        const audioFile = new File([audioBlob], "recorded_audio.webm", {
          type: "audio/webm",
          lastModified: Date.now(),
        });
        console.log("🚀 ~ useEffect ~ audioFile:", audioFile);
        setAudioBlobs([]);
        setElapsedTime(0);
        setSendMessage(false);
      }
    }
  }, [audioBlobs, sendMessage]);

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

      mediaRecorderInstance.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.pause();
      setIsRecording(false);
      mediaRecorder.requestData();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && !isRecording) {
      mediaRecorder.resume();
      setIsRecording(true);
      // Clear paused audio URL when resuming recording
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

    }
    setSendMessage(true);
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
              {/* <img src="/sound.gif" className="w-[120px] h-[35px]" />
               */}
              <div>
                {mediaRecorder && (
                  <div className="mx-[7px]">
                    <LiveAudioVisualizer
                      mediaRecorder={mediaRecorder}
                      width={200}
                      height={75}
                    />
                  </div>
                )}
              </div>
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
