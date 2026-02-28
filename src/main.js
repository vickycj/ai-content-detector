import { analyzeContent } from "./detector.js";

// --- Constants ---
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_VIDEO_DURATION = 120; // 2 minutes in seconds
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

// --- DOM Elements ---
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const previewSection = document.getElementById("previewSection");
const imagePreview = document.getElementById("imagePreview");
const videoPreview = document.getElementById("videoPreview");
const fileInfo = document.getElementById("fileInfo");
const removeBtn = document.getElementById("removeBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingSection = document.getElementById("loadingSection");
const resultSection = document.getElementById("resultSection");
const resultBadge = document.getElementById("resultBadge");
const confidenceFill = document.getElementById("confidenceFill");
const confidenceValue = document.getElementById("confidenceValue");
const resultText = document.getElementById("resultText");
const resultIndicators = document.getElementById("resultIndicators");
const tryAgainBtn = document.getElementById("tryAgainBtn");

let selectedFile = null;

// --- Utility ---
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function showSection(section) {
  [previewSection, loadingSection, resultSection].forEach((s) =>
    s.classList.add("hidden")
  );
  if (section) section.classList.remove("hidden");
}

function showError(message) {
  const existing = document.querySelector(".error-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "error-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

// --- Validation ---
async function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    showError(
      "Unsupported format. Please use JPG, PNG, GIF, WebP, MP4, WebM, or MOV."
    );
    return false;
  }

  const isVideo = file.type.startsWith("video/");

  if (isVideo) {
    if (file.size > MAX_VIDEO_SIZE) {
      showError(
        `Video too large (${formatFileSize(file.size)}). Maximum is 30MB.`
      );
      return false;
    }
    const duration = await getVideoDuration(file);
    if (duration > MAX_VIDEO_DURATION) {
      showError(
        `Video too long (${Math.round(duration)}s). Maximum is 2 minutes.`
      );
      return false;
    }
  } else {
    if (file.size > MAX_IMAGE_SIZE) {
      showError(
        `Image too large (${formatFileSize(file.size)}). Maximum is 10MB.`
      );
      return false;
    }
  }

  return true;
}

// --- Preview ---
async function handleFile(file) {
  if (!(await validateFile(file))) return;

  selectedFile = file;
  const isVideo = file.type.startsWith("video/");

  imagePreview.classList.add("hidden");
  videoPreview.classList.add("hidden");

  if (isVideo) {
    videoPreview.src = URL.createObjectURL(file);
    videoPreview.classList.remove("hidden");
  } else {
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.classList.remove("hidden");
  }

  fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
  showSection(previewSection);
}

// --- Event Listeners ---

// Click to browse
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

// Drag and drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

// Remove file
removeBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  imagePreview.src = "";
  videoPreview.src = "";
  showSection(null);
});

// Analyze
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  showSection(loadingSection);

  try {
    const result = await analyzeContent(selectedFile);
    displayResult(result);
  } catch (err) {
    console.error("Analysis failed:", err);
    let message = "Analysis failed. ";
    if (err.message?.includes("429") || err.message?.includes("rate")) {
      message += "Rate limit reached. Please wait a moment and try again.";
    } else if (err.message?.includes("too large") || err.message?.includes("size")) {
      message += "File may be too large for processing.";
    } else {
      message += err.message || "Please try again.";
    }
    showError(message);
    showSection(previewSection);
  }
});

// Try again
tryAgainBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  imagePreview.src = "";
  videoPreview.src = "";
  showSection(null);
});

// --- Display Result ---
function displayResult(result) {
  const verdictConfig = {
    AI_GENERATED: { label: "AI Generated", class: "verdict-ai", color: "#ef4444" },
    LIKELY_AI: { label: "Likely AI", class: "verdict-likely-ai", color: "#f97316" },
    UNCERTAIN: { label: "Uncertain", class: "verdict-uncertain", color: "#eab308" },
    LIKELY_REAL: { label: "Likely Real", class: "verdict-likely-real", color: "#22c55e" },
    REAL: { label: "Real / Authentic", class: "verdict-real", color: "#10b981" },
  };

  const config = verdictConfig[result.verdict] || verdictConfig.UNCERTAIN;

  // Badge
  resultBadge.textContent = config.label;
  resultBadge.className = `result-badge ${config.class}`;

  // Confidence
  const confidence = Math.max(0, Math.min(100, result.confidence));
  confidenceFill.style.width = confidence + "%";
  confidenceFill.style.backgroundColor = config.color;
  confidenceValue.textContent = confidence + "%";

  // Summary
  resultText.textContent = result.summary;

  // Indicators
  resultIndicators.innerHTML = "";
  if (result.indicators && result.indicators.length > 0) {
    result.indicators.forEach((ind) => {
      const div = document.createElement("div");
      div.className = `indicator indicator-${ind.type}`;
      const icon = ind.type === "ai" ? "&#x26A0;" : "&#x2713;";
      div.innerHTML = `<span class="indicator-icon">${icon}</span> ${escapeHtml(ind.detail)}`;
      resultIndicators.appendChild(div);
    });
  }

  // Result card border
  const resultCard = document.getElementById("resultCard");
  resultCard.style.borderColor = config.color;

  showSection(resultSection);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
