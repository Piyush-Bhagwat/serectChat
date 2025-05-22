import { anuName, piName } from "@/config";
import { context } from "@/context/context";
import { BsReplyFill } from "react-icons/bs";
import {FiDownload} from "react-icons/fi"
import { useContext, useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/db/firebase.config";
import Image from "next/image";

export default function MessageBubble({
    id,
    text,
    sender,
    createdAt,
    readBy,
    reply,
    imageURL,
}) {
    const { user, setReplyMsg } = useContext(context);
    const isMe = sender === user;

    // Format timestamp (e.g. 9:42 PM)
    const time = createdAt
        ? new Date(createdAt.seconds * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
            <div
                className={`${
                    readBy?.length == 1 &&
                    isMe &&
                    "border-2 border-dashed border-neutral-400"
                } px-3 py-1.5 rounded-xl min-w-20 max-w-xs text-white shadow relative ${
                    isMe ? "bg-neutral-600" : "bg-neutral-800"
                }`}
            >
                {reply && (
                    <div className="text-xs text-neutral-300 border-l-3 border-blue-400 pl-2 mb-1 bg-neutral-700 p-2  rounded-md opacity-80 truncate">
                        {reply}
                    </div>
                )}

                {/* Image with download */}
                {imageURL && (
                    <div className="relative w-full overflow-hidden rounded-lg mb-2 group">
                        <img
                            src={imageURL}
                            alt="Sent image"
                            className="rounded-lg w-full h-auto max-h-72 object-cover"
                        />
                        <a
                            href={imageURL}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        >
                            <FiDownload />
                        </a>
                    </div>
                )}
                <button
                    className={`text-neutral-200 text-xl cursor-pointer hover:scale-115 hover:opacity-100 opacity-45 active:scale-95 transition duration-75 absolute ${
                        isMe
                            ? "-left-2 -translate-x-full"
                            : "-right-2 translate-x-full"
                    }`}
                    onClick={() => setReplyMsg(text)}
                >
                    <BsReplyFill />
                </button>
                <p className="text-sm">{text}</p>

                {time && (
                    <div
                        className={`mt-1 flex gap-1 text-xs text-neutral-400 ${
                            isMe ? "justify-end" : "justify-start"
                        }`}
                    >
                        <span>{time} </span> |
                        <span>{sender == "pi" ? piName : anuName}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
