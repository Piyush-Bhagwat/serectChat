import { useContext, useEffect, useState } from "react";
import { IoImage, IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { FaFaceSmile } from "react-icons/fa6";
import { context } from "@/context/context";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/db/firebase.config";

export default function MessageInput() {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState("");
    const [replayMessageText, setReplayMessageText] = useState(null);
    const { replyMsg, user, setReplyMsg } = useContext(context);
    const [sending, setSending] = useState(false);

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    async function sendMessage(text) {
        if (!text.trim()) return;

        setSending(true);
        try {
            await addDoc(collection(db, "messages"), {
                text,
                sender: user, // you can enhance later for auth-based sender
                createdAt: serverTimestamp(),
                imageURL: "",
                readBy: [user],
                replyMsg,
            });

            new Audio("./audio/send.mp3").play();
        } catch (e) {
            console.error("Error sending message: ", e);
        }
        setSending(false);
    }

    const sendHandler = async () => {
        if (sending) return;
        await sendMessage(message);
        setMessage("");
        setReplyMsg(null);
    };

    useEffect(() => {
        console.log(replyMsg);

        if (!replyMsg) return;

        async function fetch() {
            const ref = collection(db, "messages");
            const dRef = doc(ref, replyMsg);

            const d = (await getDoc(dRef)).data();
            if (!d) return;

            setReplayMessageText(d.text);
        }

        fetch();
    }, [replyMsg]);

    return (
        <div className="relative mb-2">
            {showEmojiPicker && (
                <div className="absolute bottom-24 left-2 z-10">
                    <EmojiPicker
                        theme="dark"
                        onEmojiClick={handleEmojiClick}
                        height={350}
                        width={300}
                    />
                </div>
            )}

            {replayMessageText && (
                <div className="bg-neutral-800 px-4 py-2 border-l-4 border-blue-500 rounded-t-md mb-1 mx-2 relative">
                    <div className="text-xs text-blue-400 font-semibold">
                        Replying to
                    </div>
                    <div className="text-sm text-white truncate pr-6">
                        {replayMessageText}
                    </div>

                    <button
                        className="absolute top-1 right-2 text-neutral-400 hover:text-red-400 text-lg"
                        onClick={() => setReplayMessageText(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex gap-2 items-center px-2 py-6 border-neutral-400 border-dashed border-t-2 bg-neutral-900 text-white">
                {/* Emoji Button */}
                <button
                    className="bg-neutral-700 text-lg text-white w-10 aspect-square flex justify-center cursor-pointer  items-center active:scale-95 rounded-full"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    <FaFaceSmile />
                </button>

                {/* Image Upload Button */}
                <button
                    className="text-xl bg-neutral-700 cursor-pointer text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                    onClick={() => alert("kaam nai krta ruk")}
                >
                    <IoImage />
                </button>

                {/* Message Input */}
                <input
                    type="text"
                    value={message}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            sendHandler();
                        }
                    }}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 active:scale-x-[99%] transition duration-75 border-neutral-400 border-dotted border rounded-full bg-neutral-700"
                />

                {/* Send Button */}
                <button
                    onClick={sendHandler}
                    className="bg-neutral-700 text-lg text-white w-10 aspect-square flex justify-center cursor-pointer items-center active:scale-95 rounded-full"
                >
                    <IoSend />
                </button>
            </div>
        </div>
    );
}
