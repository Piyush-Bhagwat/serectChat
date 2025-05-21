import { context } from "@/context/context";
import { useContext } from "react";

export default function MessageBubble({
    text,
    sender = "me",
    createdAt,
    readBy,
}) {
    const { user } = useContext(context);
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
                <p className="text-sm">{text}</p>

                {time && (
                    <div
                        className={`mt-1 flex gap-1 text-xs text-neutral-400 ${
                            isMe ? "justify-end" : "justify-start"
                        }`}
                    >
                        <span>{time} </span> |
                        <span>{sender == "pi" ? "Exilir" : "Diamond"}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
