"use client";

import { useState, useEffect, useRef, useContext } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { IoLogOut } from "react-icons/io5";
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
    const { user, setUser } = useContext(context);
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

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

    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }

        messagesSnapshot?.docs.map((d) => {
            const now = Date.now();

            const data = d.data();
            const readAt = data.readAt?.toMillis?.();

            if (!readAt) return;

            if (readAt && now - readAt > AUTO_DELETE_TIME * 60 * 1000) {
                deleteDoc(d.ref);
                return;
            }
        });
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
        <div className="flex flex-col h-screen bg-neutral-900 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto shadow-xl">
            <div className="p-4 shadow flex justify-between bg-neutral-800 text-neutral-200">
                <h1 className="text-lg font-bold">Chatting 🔒</h1>
                <SOS />
                <button
                    className="bg-neutral-700 text-xl text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                    onClick={() => setUser(null)}
                >
                    <IoLogOut />
                </button>
            </div>

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

                {messagesSnapshot?.docs.map((doc) => {
                    const data = doc.data();
                    return (
                        <MessageBubble
                            key={doc.id}
                            text={data.text}
                            sender={data.sender}
                            createdAt={data.createdAt}
                            readBy={data.readBy}
                            id={doc.id}
                            reply={data.replyMsg}
                            imageURL={data.imageURL}
                        />
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <MessageInput />
        </div>
    );
}
