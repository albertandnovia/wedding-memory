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

const nativeCameraButton =
  document.getElementById("nativeCameraButton");

const nativeCameraInput =
  document.getElementById("nativeCameraInput");

let cameraStream = null;
let photoSource = null;
let imageCapture = null;
let capturedPhotoBlob = null;



// Temporary native camera test
nativeCameraButton.addEventListener("click", () => {
  nativeCameraInput.click();
});

nativeCameraInput.addEventListener("change", () => {
  const file = nativeCameraInput.files[0];

  if (!file) {
    return;
  }

  console.log("Native camera returned file:", file);

  capturedPhotoBlob = file;
  photoSource = "camera";

  previewImage.src = URL.createObjectURL(file);

  retakeButton.textContent = "Retake";

  photoPreview.hidden = false;
});

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
usePhotoButton.addEventListener("click", async () => {
  if (!capturedPhotoBlob) {
    alert("Please select or capture a photo first.");
    return;
  }

  try {
    usePhotoButton.disabled = true;
    usePhotoButton.textContent = "Preparing Photo...";

    const originalSize = capturedPhotoBlob.size;

    const compressedBlob = await compressImage(capturedPhotoBlob);

    const compressedSize = compressedBlob.size;

    console.log("Original photo size:", originalSize);
    console.log("Compressed photo size:", compressedSize);

    capturedPhotoBlob = compressedBlob;

    usePhotoButton.textContent = "Photo Ready ❤️";

    alert("Photo prepared successfully! Upload functionality comes next. ❤️");

  } catch (error) {
    console.error("Compression error:", error);

    alert(
      "We couldn't prepare your photo. Please try again."
    );

    usePhotoButton.disabled = false;
    usePhotoButton.textContent = "Use This Photo";
  }
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

async function compressImage(blob) {
  const bitmap = await createImageBitmap(blob);

  const maxDimension = 3000;

  let width = bitmap.width;
  let height = bitmap.height;

  // Only resize if the image is larger than our maximum dimension.
  if (width > maxDimension || height > maxDimension) {
    const scale = Math.min(
      maxDimension / width,
      maxDimension / height
    );

    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", {
    alpha: false
  });

  context.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  );

  bitmap.close();

  const compressedBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Image compression failed."));
        }
      },
      "image/jpeg",
      0.90
    );
  });

  return compressedBlob;
}

