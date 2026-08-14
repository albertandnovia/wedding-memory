const API_BASE =
  "https://wedding-memory-api.albertandnovia.workers.dev";

const gallery = document.getElementById("gallery");
const photoCount = document.getElementById("photoCount");
const refreshButton = document.getElementById("refreshButton");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");


// ============================================
// LOAD PHOTOS
// ============================================

async function loadPhotos() {
  gallery.innerHTML = `
    <p class="loading">
      Loading memories...
    </p>
  `;

  refreshButton.disabled = true;
  refreshButton.textContent = "Loading...";

  try {
    const response = await fetch(`${API_BASE}/photos`);

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.error || "Could not load photos."
      );
    }

    photoCount.textContent = data.count;

    renderPhotos(data.photos);

  } catch (error) {
    console.error("Gallery error:", error);

    gallery.innerHTML = `
      <div class="gallery-error">
        <p>We couldn't load the memories.</p>
        <button id="retryButton" type="button">
          Try Again
        </button>
      </div>
    `;

    const retryButton =
      document.getElementById("retryButton");

    retryButton.addEventListener(
      "click",
      loadPhotos
    );

  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh";
  }
}


// ============================================
// RENDER GALLERY
// ============================================

function renderPhotos(photos) {
  if (!photos.length) {
    gallery.innerHTML = `
      <div class="empty-gallery">
        <p>No memories uploaded yet.</p>
      </div>
    `;

    return;
  }

  gallery.innerHTML = "";

  photos.forEach((photo) => {
    const item = document.createElement("button");

    item.className = "gallery-item";
    item.type = "button";

    const image = document.createElement("img");

    image.src = photo.url;
    image.alt = "Wedding memory";
    image.loading = "lazy";

    item.appendChild(image);

    item.addEventListener("click", () => {
      openLightbox(photo.url);
    });

    gallery.appendChild(item);
  });
}


// ============================================
// LIGHTBOX
// ============================================

function openLightbox(photoUrl) {
  lightboxImage.src = photoUrl;
  lightbox.hidden = false;

  document.body.style.overflow = "hidden";
}


function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";

  document.body.style.overflow = "";
}


lightboxClose.addEventListener(
  "click",
  closeLightbox
);


lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});


document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !lightbox.hidden
  ) {
    closeLightbox();
  }
});


// ============================================
// REFRESH
// ============================================

refreshButton.addEventListener(
  "click",
  loadPhotos
);


// ============================================
// START
// ============================================

loadPhotos();