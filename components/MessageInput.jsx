import { useState } from "react";
import { BsEmojiSmile, BsImage, BsSend } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { FaFaceSmile } from "react-icons/fa6";

export default function MessageInput({ onSend }) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState("");

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    const sendHandler = () => {
        onSend(message);
        setMessage("");
    };

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

            <div className="flex gap-2 items-center px-2 py-6 border-neutral-400 border-dashed border-t-2 bg-neutral-900 text-white">
                {/* Emoji Button */}
                <button
                    className="bg-neutral-700 text-lg text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    <FaFaceSmile />
                </button>

                {/* Image Upload Button */}
                <button
                    className="text-xl bg-neutral-700 text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                    onClick={() => alert("kaam nai krta ruk")}
                >
                    <BsImage />
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
                    className="bg-neutral-700 text-lg text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                >
                    <IoSend />
                </button>
            </div>
        </div>
    );
}
