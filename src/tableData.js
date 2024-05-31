import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import { FaRegCirclePause } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import sideData from "./sideBarCon.json";
import conversation from "./message.json";
import { MdDelete } from "react-icons/md";

export default function App() {
  const [sideBarConversationList, setSideBarConversationList] =
    useState(sideData);

  console.log("🚀 ~ App ~ sideBarConversationList:", sideBarConversationList);
  const [messages, setMessages] = useState(
    [...conversation.conversations].reverse()
  );

  function apiCall(currentData, previousId) {
    console.log("🚀 ~ apiCall ~ previousId:", previousId);
    console.log("🚀 ~ apiCall ~ currentData:", currentData);
  }

  function deleteSideMessage(data) {
    let user = conversation.user;
    const index = sideBarConversationList.findIndex(
      (message) => message.user_id == user.id
    );
    console.log("🚀 ~ deleteSideMessage ~ index:", index);
    console.log("🚀 ~ deleteSideMessage ~ user:", user);

    if (index !== -1) {
      // Create a copy of the sidebar conversation list
      const updatedList = [...sideBarConversationList];

      // Update the message and message ID in the copied list
      updatedList[index] = {
        ...updatedList[index],
        message: data.message, // Assuming 'newMessage' is the updated message
        latest_id: data.id, // Assuming 'newMessageId' is the updated message ID
      };

      // Update the state with the modified list
      setSideBarConversationList(updatedList);
      console.log("Updated sidebar conversation list:", updatedList);
    } else {
      console.log("User not found in the sidebar conversation list");
    }
  }

  function deleteMessage(data, index) {
    const reversedMessages = messages;
    if (index === 0) {
      apiCall(data, null);
    } else {
      apiCall(data, reversedMessages[index - 1].id);
    }
    const messagesCopy = [...messages];
    messagesCopy.splice(index, 1);
    setMessages(messagesCopy);
    console.log("🚀 ~ deleteMessage ~ messages.length:", messages.length - 1);
    console.log("🚀 ~ deleteMessage ~ index:", index);

    if (index === messages.length - 1) {
      deleteSideMessage(data);
      console.log("it is last message");
    }
  }

  return (
    <div className="flex">
      <div className="w-[30%] border-r-[2px] border-black px-[1rem]">
        {sideBarConversationList.map((data) => {
          return (
            <div className="flex flex-col mb-[1rem]">
              <h2>{data.user.first_name}</h2>
              <p>{data.message.substring(0, 15)}</p>
            </div>
          );
        })}
      </div>
      <div>
        {messages.map((data, index) => {
          return (
            <div
              className="
flex justify-end my-[1rem] items-center"
            >
              <h1>{data.message}</h1>
              <MdDelete
                className="cursor-pointer"
                onClick={() => {
                  deleteMessage(data, index);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
