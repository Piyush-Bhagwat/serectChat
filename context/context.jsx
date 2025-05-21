"use client";
import { createContext, useEffect, useState } from "react";

export const context = createContext(null);

export default function ContextProvider(prop) {
    const [user, setUser] = useState(null);
    const [replyMsg, setReplyMsg] = useState(null);

    const val = { user, setUser, replyMsg, setReplyMsg };
    return <context.Provider value={val}>{prop.children}</context.Provider>;
}
