"use client";

import { useState, useEffect, useRef, useContext } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
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
            const now = Date.now();

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
                        // new Notification(`💬 New message from ${data.sender}`, {
                        //     body: data.text,
                        //     requireInteraction: true,
                        // });
                        console.log("🔔 Notification triggered");
                        new Audio("./audio/recive.wav").play();
                    }

                    if (!createdAt) return;

                    // 👇 Auto-delete check
                    const age = now - createdAt;
                    if (age > 24 * 60 * 60 * 1000) {
                        deleteDoc(doc.ref);
                        return;
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
                updateDoc(doc.ref, { readBy: arrayUnion(user) }).catch((e) =>
                    console.error("Read update error:", e)
                );
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

    async function sendMessage(text) {
        if (!text.trim()) return;

        setSending(true);
        try {
            await addDoc(messagesRef, {
                text,
                sender: user, // you can enhance later for auth-based sender
                createdAt: serverTimestamp(),
                imageURL: "",
                readBy: [user],
            });

            new Audio("./audio/send.mp3").play();
        } catch (e) {
            console.error("Error sending message: ", e);
        }
        setSending(false);
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-900 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto shadow-xl">
            <div className="p-4 shadow flex justify-between bg-neutral-800 text-neutral-200">
                <h1 className="text-lg font-bold">Chatting 🔒</h1>
                <SOS />
                <button
                    className="bg-neutral-700 px-3 py-2 rounded-full cursor-alias"
                    onClick={() => setUser(null)}
                >
                    Logout
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {loading && <p>Loading messages...</p>}
                {error && <p>Error loading messages: {error.message}</p>}

                {messagesSnapshot?.docs.map((doc) => {
                    const data = doc.data();
                    return (
                        <MessageBubble
                            key={doc.id}
                            text={data.text}
                            sender={data.sender}
                            createdAt={data.createdAt}
                            readBy={data.readBy}
                        />
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <MessageInput
                onSend={async (text) => {
                    if (sending) return;
                    await sendMessage(text);
                }}
            />
        </div>
    );
}
