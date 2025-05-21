import { useState } from "react";
import { BsEmojiSmile, BsImage, BsSend } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";

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
        <div className="relative">
            {showEmojiPicker && (
                <div className="absolute bottom-16 left-2 z-10">
                    <EmojiPicker
                        theme="dark"
                        onEmojiClick={handleEmojiClick}
                        height={350}
                        width={300}
                    />
                </div>
            )}

            <div className="flex items-center p-2 border-neutral-400 border-dashed border-t-2 mb-10 bg-neutral-900 text-white">
                {/* Emoji Button */}
                <button
                    className="text-xl mr-2"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    <BsEmojiSmile />
                </button>

                {/* Image Upload Button */}
                <button
                    className="text-xl mr-2"
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
                    className="flex-1 p-2 border-neutral-400 border-dotted border rounded-full mr-2 bg-neutral-700"
                />

                {/* Send Button */}
                <button
                    onClick={sendHandler}
                    className="bg-neutral-700 text-white px-4 py-2 rounded-full"
                >
                    <BsSend />
                </button>
            </div>
        </div>
    );
}
