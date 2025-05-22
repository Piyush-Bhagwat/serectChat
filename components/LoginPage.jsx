"use client";
import { anuName, piName } from "@/config";
import { context } from "@/context/context";
import { useContext, useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("anu");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(context);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password.trim()) return alert("Password is required!");

        if (
            (username == "pi" && password == "69832") ||
            (username == "anu" && password == "58721")
        ) {
            setUser(username);
        } else {
            alert("who are you?? (wrong pass)");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-10 bg-neutral-950 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-800 p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4"
            >
                <h2 className="text-2xl font-bold text-center">
                    Chat Login 🔒
                </h2>

                {/* Username Radio Buttons */}
                <div>
                    <label className="block mb-1">Select User</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="username"
                                value="anu"
                                checked={username === "anu"}
                                onChange={(e) => setUsername(e.target.value)}
                                className="accent-blue-500"
                            />
                            <span>{anuName}</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="username"
                                value="pi"
                                checked={username === "pi"}
                                onChange={(e) => setUsername(e.target.value)}
                                className="accent-blue-500"
                            />
                            <span>{piName}</span>
                        </label>
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full p-2 rounded bg-neutral-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 p-2 rounded font-semibold"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
