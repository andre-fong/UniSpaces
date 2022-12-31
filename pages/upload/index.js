import React, { useState } from "react";
import Image from "next/image";

export default function UploadImage() {
  const [image, setImage] = useState("");

  function handleImageChange(e) {
    let reader = new FileReader();
    let file = e.target.files[0];
    console.log(file);

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        name="image"
        onChange={handleImageChange}
      />

      <div
        style={{
          position: "relative",
          width: "100px",
          height: "100px",
        }}
      >
        <Image
          src={image || "/loading.gif"}
          alt="Uploaded img"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
