// pages/api/delete-image.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: "dsdqo228u",
    api_key: "462317136856447",
    api_secret: "ofS93cU_8UgLaWvSgwaoTu6z1mQ", // Keep this secret!
});

export async function POST(request) {
    try {
        const { public_id } = await request.json();

        if (!public_id) {
            return Response.json(
                { error: "Missing public_id" },
                { status: 400 }
            );
        }

        const result = await cloudinary.uploader.destroy(public_id);

        return Response.json({ success: true, result });
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        return Response.json(
            { error: "Failed to delete image" },
            { status: 500 }
        );
    }
}
