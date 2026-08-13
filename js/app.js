const takePhotoButton = document.getElementById("takePhotoButton");
const cameraScreen = document.getElementById("cameraScreen");
const cameraPreview = document.getElementById("cameraPreview");
const captureButton = document.getElementById("captureButton");
const closeCameraButton = document.getElementById("closeCameraButton");

const photoCanvas = document.getElementById("photoCanvas");
const photoPreview = document.getElementById("photoPreview");
const previewImage = document.getElementById("previewImage");

const retakeButton = document.getElementById("retakeButton");
const usePhotoButton = document.getElementById("usePhotoButton");

let cameraStream = null;
let capturedPhoto = null;


// Open camera
takePhotoButton.addEventListener("click", async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    cameraPreview.srcObject = cameraStream;

    cameraScreen.hidden = false;
  } catch (error) {
    console.error("Camera error:", error);

    alert(
      "We couldn't access your camera. Please allow camera access and try again."
    );
  }
});


// Capture photo
captureButton.addEventListener("click", () => {
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

  capturedPhoto = photoCanvas.toDataURL("image/jpeg", 0.9);

  previewImage.src = capturedPhoto;

  stopCamera();

  cameraScreen.hidden = true;
  photoPreview.hidden = false;
});


// Retake
retakeButton.addEventListener("click", async () => {
  photoPreview.hidden = true;

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    cameraPreview.srcObject = cameraStream;
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
}


// Temporary button
usePhotoButton.addEventListener("click", () => {
  alert("Photo captured! Upload functionality comes next. ❤️");
});
