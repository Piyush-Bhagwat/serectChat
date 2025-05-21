import { db } from "@/db/firebase.config";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import React from "react";

const SOS = () => {
    const messagesRef = collection(db, "messages");

    async function handleSOS() {
        if (!confirm("Are you sure you want to delete all messages?")) return;

        try {
            const snapshot = await getDocs(messagesRef);
            const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletions);
            alert("All messages deleted.");
        } catch (err) {
            console.error("SOS delete failed:", err);
            alert("Failed to delete messages.");
        }
    }

    return (
        <button
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full ml-2"
            onClick={handleSOS}
        >
            SOS 🚨
        </button>
    );
};

export default SOS;
