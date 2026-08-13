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
let capturedPhotoBlob = null;


// ============================================
// NATIVE PHONE CAMERA
// ============================================

nativeCameraButton.addEventListener("click", () => {
  nativeCameraInput.value = "";
  nativeCameraInput.click();
});


nativeCameraInput.addEventListener("change", () => {
  const file = nativeCameraInput.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image.");
    return;
  }

  console.log("Native camera photo:", file);

  capturedPhotoBlob = file;
  photoSource = "camera";

  previewImage.src = URL.createObjectURL(file);

  retakeButton.textContent = "Retake";

  photoPreview.hidden = false;
});


// ============================================
// GALLERY
// ============================================

uploadPhotoButton.addEventListener("click", () => {
  galleryInput.value = "";
  galleryInput.click();
});


galleryInput.addEventListener("change", () => {
  const file = galleryInput.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image.");
    return;
  }

  console.log("Gallery photo:", file);

  capturedPhotoBlob = file;
  photoSource = "gallery";

  previewImage.src = URL.createObjectURL(file);

  retakeButton.textContent = "Choose Another Photo";

  photoPreview.hidden = false;
});


// ============================================
// PREVIEW / RETAKE
// ============================================

retakeButton.addEventListener("click", () => {
  photoPreview.hidden = true;

  if (photoSource === "gallery") {
    galleryInput.value = "";
    galleryInput.click();
    return;
  }

  nativeCameraInput.value = "";
  nativeCameraInput.click();
});


// ============================================
// USE PHOTO
// ============================================

usePhotoButton.addEventListener("click", async () => {
  if (!capturedPhotoBlob) {
    alert("Please select or capture a photo first.");
    return;
  }

  try {
    usePhotoButton.disabled = true;
    usePhotoButton.textContent = "Preparing Photo...";

    const originalSize = capturedPhotoBlob.size;

    const compressedBlob =
      await compressImage(capturedPhotoBlob);

    const compressedSize = compressedBlob.size;

    console.log("Original photo size:", originalSize);
    console.log("Compressed photo size:", compressedSize);

    capturedPhotoBlob = compressedBlob;

    usePhotoButton.textContent = "Photo Ready ❤️";

    alert(
      "Photo prepared successfully! Upload functionality comes next. ❤️"
    );

  } catch (error) {
    console.error("Compression error:", error);

    alert(
      "We couldn't prepare your photo. Please try again."
    );

    usePhotoButton.disabled = false;
    usePhotoButton.textContent = "Use This Photo";
  }
});


// ============================================
// OLD CUSTOM BROWSER CAMERA
// ============================================
//
// We are keeping this code in the project for now,
// but it is NOT used by the main Take a Photo button.
//
// We can use it later as a fallback if testing shows
// that some devices don't support native camera capture.
//

captureButton.addEventListener("click", () => {
  alert(
    "The custom browser camera is currently disabled."
  );
});


closeCameraButton.addEventListener("click", () => {
  stopCamera();
  cameraScreen.hidden = true;
});


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


// ============================================
// IMAGE COMPRESSION
// ============================================

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

  const compressedBlob = await new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(
              new Error("Image compression failed.")
            );
          }
        },
        "image/jpeg",
        0.90
      );
    }
  );

  return compressedBlob;
}
