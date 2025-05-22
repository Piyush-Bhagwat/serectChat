async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "appUpload"); // from Cloudinary settings



    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dsdqo228u/image/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await res.json();
    return data.secure_url; // use this URL in your message
}

export {uploadImageToCloudinary}