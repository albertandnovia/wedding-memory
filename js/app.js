const takePhotoButton = document.getElementById("takePhotoButton");
const cameraScreen = document.getElementById("cameraScreen");
const uploadPhotoButton = document.getElementById("uploadPhotoButton");
const galleryInput = document.getElementById("galleryInput");

const cameraPreview = document.getElementById("cameraPreview");
const captureButton = document.getElementById("captureButton");
const closeCameraButton = document.getElementById("closeCameraButton");

const photoCanvas = document.getElementById("photoCanvas");
const photoPreview = document.getElementById("photoPreview");
const previewImage = document.getElementById("previewImage");

const retakeButton = document.getElementById("retakeButton");
const usePhotoButton = document.getElementById("usePhotoButton");

let cameraStream = null;
let photoSource = null;
let imageCapture = null;
let capturedPhotoBlob = null;


// Open camera
takePhotoButton.addEventListener("click", async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment"
        },
        width: {
          ideal: 3840
        },
        height: {
          ideal: 2160
        },
        frameRate: {
          ideal: 30
        }
      },
      audio: false
    });

    cameraPreview.srcObject = cameraStream;

    const videoTrack = cameraStream.getVideoTracks()[0];

    console.log("Camera settings:", videoTrack.getSettings());

    if ("ImageCapture" in window) {
      imageCapture = new ImageCapture(videoTrack);
    }

    cameraScreen.hidden = false;

  } catch (error) {
    console.error("Camera error:", error);

    alert(
      "We couldn't access your camera. Please allow camera access and try again."
    );
  }
});


// Capture photo
captureButton.addEventListener("click", async () => {
  try {
    let photoBlob;

    // Use the camera's still-photo capability when supported.
    if (imageCapture) {
      photoBlob = await imageCapture.takePhoto();

    } else {
      // Fallback for browsers that don't support ImageCapture.
      const width = cameraPreview.videoWidth;
      const height = cameraPreview.videoHeight;

      if (!width || !height) {
        alert("Camera is not ready yet. Please try again.");
        return;
      }

      photoCanvas.width = width;
      photoCanvas.height = height;

      const context = photoCanvas.getContext("2d");

      context.drawImage(
        cameraPreview,
        0,
        0,
        width,
        height
      );

      photoBlob = await new Promise((resolve) => {
        photoCanvas.toBlob(
          resolve,
          "image/jpeg",
          0.95
        );
      });
    }

    capturedPhotoBlob = photoBlob;
    photoSource = "camera";

    previewImage.src = URL.createObjectURL(capturedPhotoBlob);

    retakeButton.textContent = "Retake";

    stopCamera();

    cameraScreen.hidden = true;
    photoPreview.hidden = false;

  } catch (error) {
    console.error("Photo capture error:", error);

    alert(
      "We couldn't capture the photo. Please try again."
    );
  }
});


// Retake photo or choose another gallery photo
retakeButton.addEventListener("click", async () => {
  photoPreview.hidden = true;

  if (photoSource === "gallery") {
    galleryInput.value = "";
    galleryInput.click();
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment"
        },
        width: {
          ideal: 3840
        },
        height: {
          ideal: 2160
        },
        frameRate: {
          ideal: 30
        }
      },
      audio: false
    });

    cameraPreview.srcObject = cameraStream;

    const videoTrack = cameraStream.getVideoTracks()[0];

    console.log("Camera settings:", videoTrack.getSettings());

    if ("ImageCapture" in window) {
      imageCapture = new ImageCapture(videoTrack);
    }

    cameraScreen.hidden = false;

  } catch (error) {
    console.error("Camera error:", error);

    alert(
      "We couldn't access your camera. Please allow camera access and try again."
    );
  }
});


// Close camera
closeCameraButton.addEventListener("click", () => {
  stopCamera();
  cameraScreen.hidden = true;
});


// Stop camera
function stopCamera() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => {
    track.stop();
  });

  cameraStream = null;
  cameraPreview.srcObject = null;
  imageCapture = null;
}


// Use selected photo
usePhotoButton.addEventListener("click", () => {
  if (!capturedPhotoBlob) {
    alert("Please select or capture a photo first.");
    return;
  }

  console.log("Photo ready for upload:", capturedPhotoBlob);

  alert("Photo is ready! Upload functionality comes next. ❤️");
});


// Open the device photo picker
uploadPhotoButton.addEventListener("click", () => {
  galleryInput.click();
});


// Handle selected gallery photo
galleryInput.addEventListener("change", () => {
  const file = galleryInput.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image.");
    return;
  }

  capturedPhotoBlob = file;
  photoSource = "gallery";

  previewImage.src = URL.createObjectURL(capturedPhotoBlob);

  retakeButton.textContent = "Choose Another Photo";

  photoPreview.hidden = false;
});
