"use client";

import { useState, useEffect, useRef, useContext } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

import {
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/db/firebase.config";
import { onSnapshot, deleteDoc } from "firebase/firestore";
import { context } from "@/context/context";

export default function ChatLayout() {
    const { user, setUser } = useContext(context);
    const messagesRef = collection(db, "messages");
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    useEffect(() => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = Date.now();

            snapshot.docs.forEach(async (docSnap) => {
                const data = docSnap.data();
                const createdAt = data.createdAt?.toMillis?.();

                // ✅ Skip if no timestamp
                if (!createdAt) return;

                const age = now - createdAt;

                // ✅ If older than 24 hours (in ms), delete
                if (age > 24 * 60 * 60 * 1000) {
                    console.log("Deleting expired message:", docSnap.id);
                    await deleteDoc(docSnap.ref);
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

    async function sendMessage(text) {
        if (!text.trim()) return;

        setSending(true);
        try {
            await addDoc(messagesRef, {
                text,
                sender: user, // you can enhance later for auth-based sender
                createdAt: serverTimestamp(),
                imageURL: "",
            });
        } catch (e) {
            console.error("Error sending message: ", e);
        }
        setSending(false);
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-900 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto shadow-xl">
            <div className="p-4 shadow flex justify-between bg-neutral-800 text-neutral-200">
                <h1 className="text-lg font-bold">Chatting 🔒</h1>
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
