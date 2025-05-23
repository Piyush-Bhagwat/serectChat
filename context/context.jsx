"use client";
import { TOKEN_EXPIRY_TIME } from "@/config";
import { createContext, useEffect, useState } from "react";

export const context = createContext(null);

export default function ContextProvider(prop) {
    const [user, setUser] = useState(null);
    const [replyMsg, setReplyMsg] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem(
                "user",
                JSON.stringify({ user, time: Date.now() })
            );
        }
    }, [user]);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u) {
            if (Date.now() - u.time < TOKEN_EXPIRY_TIME * 60 * 1000) {
                setUser(u.user);
            } else {
                localStorage.removeItem("user");
            }
        }
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const val = { user, setUser, replyMsg, setReplyMsg, logout };
    return <context.Provider value={val}>{prop.children}</context.Provider>;
}
