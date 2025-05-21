"use client";
import { createContext, useState } from "react";

export const context = createContext(null);

export default function ContextProvider(prop) {
    const [user, setUser] = useState(null);

    const val = {user, setUser};
    return <context.Provider value={val}>{prop.children}</context.Provider>;
}
