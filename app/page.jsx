'use client'
import ChatLayout from "@/components/ChatLayout";
import LoginPage from "@/components/LoginPage";
import { context } from "@/context/context";
import Image from "next/image";
import { useContext } from "react";

export default function Home() {
    const { user } = useContext(context);
    return (
        <div className="flex w-screen justify-center bg-gray-700">
            {user ? <ChatLayout /> : <LoginPage />}
        </div>
    );
}
