import { context } from "@/context/context";
import { useContext } from "react";

export default function MessageBubble({ text, sender = "me" }) {
    const { user } = useContext(context);
    const isMe = sender === user;
    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
            <div
                className={`px-4 py-2 rounded-2xl max-w-xs text-white shadow ${
                    isMe ? "bg-neutral-600" : "bg-neutral-800"
                }`}
            >
                {text}
            </div>
        </div>
    );
}
