"use client";

import { useState, useEffect, useRef, useContext } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { IoLogOut } from "react-icons/io5";
import { format } from 'date-fns';
// import sendAudio from "../audio/send.mp3";

import {
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/db/firebase.config";
import { onSnapshot, deleteDoc } from "firebase/firestore";
import { context } from "@/context/context";
import SOS from "./SOS";
import { AUTO_DELETE_TIME } from "@/config";

export default function ChatLayout() {
    const { user, setUser, logout } = useContext(context);
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                console.log("Notification permission:", permission);
            });
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const doc = change.doc;
                const data = doc.data();

                if (change.type === "added") {
                    const createdAt = data.createdAt?.toMillis?.();

                    // 👇 Trigger browser notification (not from self)
                    if (
                        data.sender !== user &&
                        Notification.permission === "granted" &&
                        document.visibilityState !== "visible" // only notify if user isn't looking at it
                    ) {
                        console.log("🔔 Notification triggered");
                        new Audio("./audio/recive.wav").play();
                    }
                }
            });
        });

        return () => unsubscribe();
    }, []);

    // Listen to messages in real time
    const [messagesSnapshot, loading, error] = useCollection(q);

    const bottomRef = useRef(null);

    useEffect(() => {
        if (messagesSnapshot && messagesSnapshot.docs.length > 0) {
            const groupedMessages = messagesSnapshot?.docs.reduce((acc, doc) => {
                const data = doc.data();
                const dateStr = format(data.createdAt?.toDate() || new Date(), 'd MMMM yyyy'); // e.g., "6 June 2025"

                if (!acc[dateStr]) {
                    acc[dateStr] = [];
                }

                acc[dateStr].push({
                    id: doc.id,
                    ...data,
                });

                return acc;
            }, {});

            // Convert the grouped object into an array of { date, messages }   
            const groupedArray = Object.entries(groupedMessages).map(
                ([date, messages]) => ({
                    date,
                    messages,
                })
            );

            console.log("groupedArray", groupedArray);


            setMessages(groupedArray);
        }
    }, [messagesSnapshot]);

    const handleDeleteImage = async (imageId) => {
        if (!imageId) return;

        try {
            await fetch("/api/delete-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ public_id: imageId }),
            });

            setImageURL(null);
            setImage(null);
        } catch (e) {
            console.log("Failed to delete image");
        }
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }

        const cleanOldMessages = async () => {
            if (!messagesSnapshot) return;

            const tasks = messagesSnapshot.docs.map(async (d) => {
                //collecting all the promises and running then once
                const now = Date.now();
                const data = d.data();
                const readAt = data.readAt?.toMillis?.();

                if (!readAt) return;

                const expired = now - readAt > AUTO_DELETE_TIME * 60 * 1000;
                if (expired) {
                    if (data.imageId) {
                        console.log(
                            "Deleting image...",
                            data.text,
                            "id: ",
                            data.imageId
                        );
                        await handleDeleteImage(data.imageId);
                    }
                    await deleteDoc(d.ref);
                }
            });

            await Promise.all(tasks);
        };

        cleanOldMessages();
    }, [messagesSnapshot]);

    useEffect(() => {
        const markMessagesAsRead = () => {
            if (
                !messagesSnapshot ||
                !user ||
                document.visibilityState !== "visible"
            )
                return;

            const unread = messagesSnapshot.docs.filter(
                (d) => !d.data().readBy?.includes(user)
            );

            unread.forEach((doc) => {
                updateDoc(doc.ref, {
                    readBy: arrayUnion(user),
                    readAt: serverTimestamp(),
                }).catch((e) => console.error("Read update error:", e));
            });
        };

        // Call immediately if tab is visible and messages are loaded
        markMessagesAsRead();

        // Attach visibility change listener
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                markMessagesAsRead();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [messagesSnapshot, user]);

    return (
        <div className="flex flex-col h-screen relative bg-neutral-900 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto shadow-xl">
            <header className="p-3 sticky top-0 w-full z-50 shadow flex justify-between bg-neutral-800 text-neutral-200">
                <h1 className="text-lg font-bold">Chatting 🔒</h1>
                <SOS />
                <button
                    className="bg-neutral-700 text-xl text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                    onClick={logout}
                >
                    <IoLogOut />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {loading && (
                    <p className="text-lg font-bold text-white">
                        Loading messages...
                    </p>
                )}
                {error && (
                    <p className="text-lg font-bold text-white">
                        Error loading messages: {error.message}
                    </p>
                )}

                {messagesSnapshot?.docs.length == 0 && (
                    <h2 className="text-lg font-bold text-white">
                        Previous Messages Auto deleted
                    </h2>
                )}

                {messages?.map((doc) => {
                    const { date, messages } = doc;

                    return (
                        <div key={date}>
                            {/* Date header */}
                            <div className="text-center my-4 sticky top-0 z-40 text-neutral-200 font-thin text-sm bg-neutral-800
                            w-fit px-2 py-1 rounded-full mx-auto">
                                {date}
                            </div>

                            {/* Messages of that date */}
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    text={message.text}
                                    sender={message.sender}
                                    createdAt={message.createdAt}
                                    readBy={message.readBy}
                                    id={message.id}
                                    reply={message.replyMsg}
                                    imageURL={message.imageURL}
                                />
                            ))}
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </div>

            <MessageInput />
        </div>
    );
}
