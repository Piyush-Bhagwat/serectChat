import { useContext, useEffect, useRef, useState } from "react";
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
import { uploadImageToCloudinary } from "@/utils/cloudanary";
import Image from "next/image";
import Spinner from "./Spinner";

export default function MessageInput() {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState("");
    const { replyMsg, user, setReplyMsg } = useContext(context);
    const [sending, setSending] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [image, setImage] = useState(null);
    const [imageId, setImageId] = useState(null);

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    const fileInputRef = useRef(null);

    const handleDeleteImage = async () => {
        if (!imageId) return;

        setDeleteLoading(true);

        console.log("imageId", imageId);

        try {
            await fetch("/api/delete-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ public_id: imageId }),
            });

            setImageURL(null);
            setImageId(null);
            setImage(null);
        } catch (e) {
            alert("Failed to delete image");
        }
        setDeleteLoading(false);
    };

    async function sendMessage(data) {
        if (!data.text.trim() && !data.imageURL) return;

        // setSending(true);
        try {
            await addDoc(collection(db, "messages"), data);

            new Audio("./audio/send.mp3").play();
        } catch (e) {
            console.error("Error sending message: ", e);
        }
        // setSending(false);
    }

    const sendHandler = async () => {
        if (sending || uploadLoading) return;
        const data = {
            text: message,
            sender: user,
            createdAt: serverTimestamp(),
            imageURL,
            imageId,
            readBy: [user],
            replyMsg,
        };

        setMessage("");
        setReplyMsg(null);
        setImage(null);
        setImageURL(null);
        setImageId(null);
        
        await sendMessage(data);
    };

    const cancelImage = async () => {
        await handleDeleteImage();
        setImage(null);
        setImageURL(null);
        setImageId(null);
    };

    const handleFileChange = async (e) => {
        if (imageURL) return alert("Image already selected");
        const file = e.target.files[0];
        const obj = URL.createObjectURL(file);
        console.log(obj);

        setImage(obj);
        setUploadLoading(true);
        try {
            const { url, id } = await uploadImageToCloudinary(file);
            setImageURL(url);
            setImageId(id);
        } catch (e) {
            console.log("Error uploading file", e);
            alert("Error uplaoding image");
        }
        setUploadLoading(false);
        console.log("Image selected");
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

            {image && (
                <div className="relative w-20 h-auto mb-2 ml-2">
                    <img
                        src={image}
                        alt="Preview"
                        className="rounded-lg aspect-square max-h-20 object-cover"
                    />
                    <button
                        className="absolute top-1 right-1 text-sm outline outline-neutral-500 outline-solid bg-black/70 rounded-full w-5 aspect-square flex justify-center items-center text-white hover:bg-red-600"
                        onClick={cancelImage}
                        title="Cancel image"
                    >
                        ×
                    </button>
                    {(uploadLoading || deleteLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl font-medium rounded-lg">
                            <Spinner />
                        </div>
                    )}
                </div>
            )}

            {replyMsg && (
                <div className="bg-neutral-800 px-4 py-2 border-l-4 border-blue-500 rounded-t-md mb-1 mx-2 relative">
                    <div className="text-xs text-blue-400 font-semibold">
                        Replying to
                    </div>
                    <div className="text-sm text-white truncate pr-6">
                        {replyMsg}
                    </div>

                    <button
                        className="absolute top-1 right-2 text-neutral-400 hover:text-red-400 text-lg"
                        onClick={() => setReplyMsg(null)}
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

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    autoComplete="false"
                    autoFocus="true"
                    onChange={handleFileChange}
                />

                {/* Image Upload Button */}
                <button
                    className="text-xl bg-neutral-700 cursor-pointer text-white w-10 aspect-square flex justify-center items-center active:scale-95 rounded-full"
                    onClick={() => fileInputRef.current.click()}
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
                    className={`${
                        sending ? "bg-neutral-800 text-lg" : "bg-neutral-700"
                    } text-white w-10 aspect-square flex justify-center cursor-pointer items-center active:scale-95 rounded-full`}
                >
                    {sending ? <Spinner /> : <IoSend />}
                </button>
            </div>
        </div>
    );
}
