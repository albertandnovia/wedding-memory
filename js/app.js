const API_UPLOAD_URL =
  "https://wedding-memory-api.albertandnovia.workers.dev/upload";


// ============================================
// ELEMENTS
// ============================================

const uploadPhotoButton =
  document.getElementById("uploadPhotoButton");

const galleryInput =
  document.getElementById("galleryInput");

const nativeCameraButton =
  document.getElementById("nativeCameraButton");

const nativeCameraInput =
  document.getElementById("nativeCameraInput");

const photoPreview =
  document.getElementById("photoPreview");

const previewImage =
  document.getElementById("previewImage");

const retakeButton =
  document.getElementById("retakeButton");

const usePhotoButton =
  document.getElementById("usePhotoButton");

const uploadSuccess =
  document.getElementById("uploadSuccess");

const uploadAnotherButton =
  document.getElementById("uploadAnotherButton");


// Batch gallery elements
const batchPreview =
  document.getElementById("batchPreview");

const batchGrid =
  document.getElementById("batchGrid");

const batchCount =
  document.getElementById("batchCount");

const chooseMoreButton =
  document.getElementById("chooseMoreButton");

const uploadAllButton =
  document.getElementById("uploadAllButton");

const batchProgress =
  document.getElementById("batchProgress");

const progressTrack =
  document.getElementById("progressTrack");

const progressBar =
  document.getElementById("progressBar");

// ============================================
// STATE
// ============================================

let capturedPhotoBlob = null;
let selectedGalleryFiles = [];


// ============================================
// CAMERA
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

  capturedPhotoBlob = file;

  previewImage.src = URL.createObjectURL(file);

  retakeButton.textContent = "Retake";

  batchPreview.hidden = true;
  photoPreview.hidden = false;
});


// ============================================
// GALLERY
// ============================================

uploadPhotoButton.addEventListener("click", () => {
  selectedGalleryFiles = [];

  galleryInput.dataset.mode = "replace";
  galleryInput.value = "";
  galleryInput.click();
});


chooseMoreButton.addEventListener("click", () => {
  galleryInput.dataset.mode = "append";
  galleryInput.value = "";
  galleryInput.click();
});


galleryInput.addEventListener("change", () => {
  const files = Array.from(galleryInput.files);

  if (!files.length) {
    return;
  }

  const imageFiles = files.filter((file) =>
    file.type.startsWith("image/")
  );

  if (!imageFiles.length) {
    alert("Please choose image files.");
    return;
  }

  if (galleryInput.dataset.mode === "append") {
    selectedGalleryFiles.push(...imageFiles);
  } else {
    selectedGalleryFiles = imageFiles;
  }

  renderBatchPreview();
});


// ============================================
// BATCH PREVIEW
// ============================================

function renderBatchPreview() {
  batchGrid.innerHTML = "";

  batchCount.textContent =
    `${selectedGalleryFiles.length} photo${
      selectedGalleryFiles.length === 1 ? "" : "s"
    } selected`;

  selectedGalleryFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "batch-item";

    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.alt = `Selected photo ${index + 1}`;

    const removeButton =
      document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "batch-remove";
    removeButton.textContent = "×";
    removeButton.setAttribute(
      "aria-label",
      `Remove photo ${index + 1}`
    );

    removeButton.addEventListener("click", () => {
      selectedGalleryFiles.splice(index, 1);

      if (!selectedGalleryFiles.length) {
        batchPreview.hidden = true;
        return;
      }

      renderBatchPreview();
    });

    item.appendChild(image);
    item.appendChild(removeButton);

    batchGrid.appendChild(item);
  });

  photoPreview.hidden = true;
  uploadSuccess.hidden = true;
  batchPreview.hidden = false;
}


// ============================================
// BATCH UPLOAD
// ============================================

uploadAllButton.addEventListener("click", async () => {
  if (!selectedGalleryFiles.length) {
    return;
  }

  uploadAllButton.disabled = true;
  chooseMoreButton.disabled = true;

  batchProgress.hidden = false;

  progressTrack.hidden = false;
  progressBar.style.width = "0%";

  let uploadedCount = 0;


  try {
    for (
      let i = 0;
      i < selectedGalleryFiles.length;
      i++
    ) {
      const file = selectedGalleryFiles[i];

      batchProgress.textContent =
        `Preparing ${i + 1} of ${selectedGalleryFiles.length}...`;

      const compressedBlob =
        await compressImage(file);

      batchProgress.textContent =
        `Uploading ${i + 1} of ${selectedGalleryFiles.length}...`;

      await uploadPhoto(compressedBlob);

      uploadedCount += 1;
      const percent =
        Math.round(
          (uploadedCount / selectedGalleryFiles.length) * 100
        );

      progressBar.style.width = `${percent}%`;

      batchProgress.textContent =
        `${uploadedCount} of ${selectedGalleryFiles.length} uploaded`;
    }

      progressBar.style.width = "100%";

      selectedGalleryFiles = [];

      batchPreview.hidden = true;
      uploadSuccess.hidden = false;

  } catch (error) {
    console.error("Batch upload error:", error);

    // Remove photos that already uploaded successfully,
    // so pressing retry does not upload them twice.
    selectedGalleryFiles =
      selectedGalleryFiles.slice(uploadedCount);

    renderBatchPreview();

    batchProgress.hidden = false;
    batchProgress.textContent =
      `${uploadedCount} uploaded successfully. ` +
      `${selectedGalleryFiles.length} still need to upload.`;

    uploadAllButton.disabled = false;
    chooseMoreButton.disabled = false;
  }
});


// ============================================
// SINGLE CAMERA PHOTO
// ============================================

retakeButton.addEventListener("click", () => {
  photoPreview.hidden = true;

  nativeCameraInput.value = "";
  nativeCameraInput.click();
});


usePhotoButton.addEventListener("click", async () => {
  if (!capturedPhotoBlob) {
    alert("Please capture a photo first.");
    return;
  }

  try {
    usePhotoButton.disabled = true;
    usePhotoButton.textContent = "Preparing Photo...";

    const compressedBlob =
      await compressImage(capturedPhotoBlob);

    usePhotoButton.textContent = "Uploading...";

    await uploadPhoto(compressedBlob);

    capturedPhotoBlob = null;

    photoPreview.hidden = true;
    uploadSuccess.hidden = false;

  } catch (error) {
    console.error("Upload error:", error);

    alert(
      "We couldn't upload your photo. " +
      "Please check your connection and try again."
    );

    usePhotoButton.disabled = false;
    usePhotoButton.textContent = "Use This Photo";
  }
});


// ============================================
// UPLOAD HELPER
// ============================================

async function uploadPhoto(blob) {
  const response = await fetch(
    API_UPLOAD_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          blob.type || "image/jpeg"
      },

      body: blob
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Upload failed."
    );
  }

  return result;
}


// ============================================
// IMAGE COMPRESSION
// ============================================

async function compressImage(blob) {
  const bitmap =
    await createImageBitmap(blob);

  const maxDimension = 3000;

  let width = bitmap.width;
  let height = bitmap.height;

  if (
    width > maxDimension ||
    height > maxDimension
  ) {
    const scale = Math.min(
      maxDimension / width,
      maxDimension / height
    );

    width =
      Math.round(width * scale);

    height =
      Math.round(height * scale);
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d", {
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

  const compressedBlob =
    await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(
                new Error(
                  "Image compression failed."
                )
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


// ============================================
// RESET
// ============================================

uploadAnotherButton.addEventListener("click", () => {
  uploadSuccess.hidden = true;

  capturedPhotoBlob = null;
  selectedGalleryFiles = [];

  previewImage.src = "";

  photoPreview.hidden = true;
  batchPreview.hidden = true;

  batchGrid.innerHTML = "";

  batchProgress.hidden = true;
  batchProgress.textContent = "";

  usePhotoButton.disabled = false;
  usePhotoButton.textContent = "Use This Photo";

  uploadAllButton.disabled = false;
  chooseMoreButton.disabled = false;

  galleryInput.value = "";
  nativeCameraInput.value = "";

  progressTrack.hidden = true;
  progressBar.style.width = "0%";
});