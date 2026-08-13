const takePhotoButton = document.getElementById("takePhotoButton");

takePhotoButton.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    console.log("Camera opened successfully:", stream);

    // Stop the camera for now.
    // We'll build the actual camera preview next.
    stream.getTracks().forEach((track) => track.stop());

    alert("Camera access works! 📷");
  } catch (error) {
    console.error("Camera error:", error);
    alert("We couldn't access your camera. Please allow camera access and try again.");
  }
});
