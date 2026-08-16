const API_BASE =
  "https://wedding-memory-api.albertandnovia.workers.dev";


// ============================================
// ELEMENTS
// ============================================

const loginCard =
  document.getElementById("loginCard");

const loginForm =
  document.getElementById("loginForm");

const adminPassword =
  document.getElementById("adminPassword");

const loginError =
  document.getElementById("loginError");

const galleryApp =
  document.getElementById("galleryApp");

const gallery =
  document.getElementById("gallery");

const photoCount =
  document.getElementById("photoCount");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const lightbox =
  document.getElementById("lightbox");

const lightboxImage =
  document.getElementById("lightboxImage");

const lightboxClose =
  document.getElementById("lightboxClose");


// ============================================
// AUTH
// ============================================

function getAdminToken() {
  return sessionStorage.getItem("adminToken");
}


function saveAdminToken(token) {
  sessionStorage.setItem(
    "adminToken",
    token
  );
}


function clearAdminToken() {
  sessionStorage.removeItem("adminToken");
}


function showLogin() {
  loginCard.hidden = false;
  galleryApp.hidden = true;

  loginError.hidden = true;

  adminPassword.value = "";
}


function showGallery() {
  loginCard.hidden = true;
  galleryApp.hidden = false;
}


loginForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const token =
      adminPassword.value.trim();

    if (!token) {
      return;
    }

    loginError.hidden = true;

    try {
      const response = await fetch(
        `${API_BASE}/photos`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        loginError.hidden = false;
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.error ||
          "Could not load photos."
        );
      }

      saveAdminToken(token);

      showGallery();

      renderPhotos(data.photos);

      photoCount.textContent =
        data.count;

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      loginError.textContent =
        "Could not connect to the gallery.";

      loginError.hidden = false;
    }
  }
);


logoutButton.addEventListener(
  "click",
  () => {
    clearAdminToken();
    showLogin();
  }
);


// ============================================
// LOAD PHOTOS
// ============================================

async function loadPhotos() {
  const token =
    getAdminToken();

  if (!token) {
    showLogin();
    return;
  }

  gallery.innerHTML = `
    <p class="loading">
      Loading memories...
    </p>
  `;

  refreshButton.disabled = true;
  refreshButton.textContent = "Loading...";

  try {
    const response = await fetch(
      `${API_BASE}/photos`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    if (response.status === 401) {
      clearAdminToken();
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.error ||
        "Could not load photos."
      );
    }

    photoCount.textContent =
      data.count;

    renderPhotos(data.photos);

  } catch (error) {
    console.error(
      "Gallery error:",
      error
    );

    gallery.innerHTML = `
      <div class="gallery-error">
        <p>
          We couldn't load the memories.
        </p>

        <button
          id="retryButton"
          type="button"
        >
          Try Again
        </button>
      </div>
    `;

    const retryButton =
      document.getElementById(
        "retryButton"
      );

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
// RENDER PHOTOS
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
    const item =
      document.createElement("button");

    item.className = "gallery-item";
    item.type = "button";

    const image =
      document.createElement("img");

    image.alt = "Wedding memory";
    image.loading = "lazy";

    loadProtectedImage(
      image,
      photo.key
    );

    item.appendChild(image);

    item.addEventListener(
      "click",
      () => {
        openLightbox(photo.key);
      }
    );

    gallery.appendChild(item);
  });
}


// ============================================
// PROTECTED PHOTO FETCHING
// ============================================

async function loadProtectedImage(
  imageElement,
  key
) {
  const token =
    getAdminToken();

  try {
    const response = await fetch(
      `${API_BASE}/photo?key=${
        encodeURIComponent(key)
      }`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    if (response.status === 401) {
      clearAdminToken();
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        "Photo could not be loaded."
      );
    }

    const blob =
      await response.blob();

    imageElement.src =
      URL.createObjectURL(blob);

  } catch (error) {
    console.error(
      "Photo load error:",
      error
    );
  }
}


// ============================================
// LIGHTBOX
// ============================================

async function openLightbox(key) {
  const token =
    getAdminToken();

  try {
    const response = await fetch(
      `${API_BASE}/photo?key=${
        encodeURIComponent(key)
      }`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        "Could not open photo."
      );
    }

    const blob =
      await response.blob();

    lightboxImage.src =
      URL.createObjectURL(blob);

    lightbox.hidden = false;

    document.body.style.overflow =
      "hidden";

  } catch (error) {
    console.error(
      "Lightbox error:",
      error
    );
  }
}


function closeLightbox() {
  lightbox.hidden = true;

  if (
    lightboxImage.src.startsWith(
      "blob:"
    )
  ) {
    URL.revokeObjectURL(
      lightboxImage.src
    );
  }

  lightboxImage.src = "";

  document.body.style.overflow = "";
}


lightboxClose.addEventListener(
  "click",
  closeLightbox
);


lightbox.addEventListener(
  "click",
  (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  }
);


document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !lightbox.hidden
    ) {
      closeLightbox();
    }
  }
);


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

if (getAdminToken()) {
  showGallery();
  loadPhotos();
} else {
  showLogin();
}