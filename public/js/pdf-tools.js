// PDF Tools JavaScript
// Handles all 6 Stirling PDF features

// ========== MERGE PDFs ==========
const mergeFileInput = document.getElementById("mergeFileInput");
const mergeUploadArea = document.getElementById("mergeUploadArea");
const mergeFileList = document.getElementById("mergeFileList");
const mergeBtn = document.getElementById("mergeBtn");

mergeFileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  mergeFiles.push(...files);
  updateMergeFileList();
});

// Drag and drop for merge
mergeUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  mergeUploadArea.classList.add("dragover");
});

mergeUploadArea.addEventListener("dragleave", () => {
  mergeUploadArea.classList.remove("dragover");
});

mergeUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  mergeUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  mergeFiles.push(...files);
  updateMergeFileList();
});

function updateMergeFileList() {
  mergeFileList.innerHTML = "";
  mergeFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removeMergeFile(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    mergeFileList.appendChild(fileItem);
  });

  mergeBtn.disabled = mergeFiles.length < 2;
}

function removeMergeFile(index) {
  mergeFiles.splice(index, 1);
  updateMergeFileList();
}

mergeBtn.addEventListener("click", async () => {
  if (mergeFiles.length < 2) {
    showAlert("mergeAlert", "Please upload at least 2 PDF files");
    return;
  }

  mergeBtn.disabled = true;
  mergeBtn.classList.add("processing");
  mergeBtn.innerHTML = '<div class="spinner"></div> Merging...';

  try {
    const formData = new FormData();
    mergeFiles.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/stirling/merge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to merge PDFs");
    }

    const blob = await response.blob();
    downloadFile(blob, "merged.pdf");

    // Reset
    mergeFiles = [];
    updateMergeFileList();
    mergeFileInput.value = "";
    showAlert("mergeAlert", "PDFs merged successfully!", "success");
  } catch (error) {
    showAlert("mergeAlert", error.message);
  } finally {
    mergeBtn.disabled = false;
    mergeBtn.classList.remove("processing");
    mergeBtn.innerHTML = '<i class="fas fa-magic"></i> Merge PDFs';
  }
});

// ========== COMPRESS PDF ==========
const compressFileInput = document.getElementById("compressFileInput");
const compressUploadArea = document.getElementById("compressUploadArea");
const compressFileList = document.getElementById("compressFileList");
const compressBtn = document.getElementById("compressBtn");

compressFileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    compressFile = e.target.files[0];
    updateCompressFileList();
  }
});

// Drag and drop for compress
compressUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  compressUploadArea.classList.add("dragover");
});

compressUploadArea.addEventListener("dragleave", () => {
  compressUploadArea.classList.remove("dragover");
});

compressUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  compressUploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    compressFile = file;
    updateCompressFileList();
  }
});

function updateCompressFileList() {
  if (!compressFile) {
    compressFileList.innerHTML = "";
    compressBtn.disabled = true;
    return;
  }

  compressFileList.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${compressFile.name}</div>
          <div class="file-size">${formatFileSize(compressFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removeCompressFile()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  compressBtn.disabled = false;
}

function removeCompressFile() {
  compressFile = null;
  compressFileInput.value = "";
  updateCompressFileList();
}

compressBtn.addEventListener("click", async () => {
  if (!compressFile) {
    showAlert("compressAlert", "Please upload a PDF file");
    return;
  }

  compressBtn.disabled = true;
  compressBtn.classList.add("processing");
  compressBtn.innerHTML = '<div class="spinner"></div> Compressing...';

  try {
    const formData = new FormData();
    formData.append("file", compressFile);
    formData.append(
      "optimizeLevel",
      document.getElementById("compressionLevel").value
    );

    const response = await fetch("/api/stirling/compress", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to compress PDF");
    }

    const blob = await response.blob();
    downloadFile(blob, "compressed.pdf");

    // Reset
    removeCompressFile();
    showAlert("compressAlert", "PDF compressed successfully!", "success");
  } catch (error) {
    showAlert("compressAlert", error.message);
  } finally {
    compressBtn.disabled = false;
    compressBtn.classList.remove("processing");
    compressBtn.innerHTML = '<i class="fas fa-compress"></i> Compress PDF';
  }
});

// ========== PDF TO WORD ==========
const pdfToWordFileInput = document.getElementById("pdfToWordFileInput");
const pdfToWordUploadArea = document.getElementById("pdfToWordUploadArea");
const pdfToWordFileList = document.getElementById("pdfToWordFileList");
const pdfToWordBtn = document.getElementById("pdfToWordBtn");

pdfToWordFileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    pdfToWordFile = e.target.files[0];
    updatePdfToWordFileList();
  }
});

// Drag and drop
pdfToWordUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  pdfToWordUploadArea.classList.add("dragover");
});

pdfToWordUploadArea.addEventListener("dragleave", () => {
  pdfToWordUploadArea.classList.remove("dragover");
});

pdfToWordUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  pdfToWordUploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    pdfToWordFile = file;
    updatePdfToWordFileList();
  }
});

function updatePdfToWordFileList() {
  if (!pdfToWordFile) {
    pdfToWordFileList.innerHTML = "";
    pdfToWordBtn.disabled = true;
    return;
  }

  pdfToWordFileList.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${pdfToWordFile.name}</div>
          <div class="file-size">${formatFileSize(pdfToWordFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removePdfToWordFile()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  pdfToWordBtn.disabled = false;
}

function removePdfToWordFile() {
  pdfToWordFile = null;
  pdfToWordFileInput.value = "";
  updatePdfToWordFileList();
}

pdfToWordBtn.addEventListener("click", async () => {
  if (!pdfToWordFile) {
    showAlert("pdfToWordAlert", "Please upload a PDF file");
    return;
  }

  pdfToWordBtn.disabled = true;
  pdfToWordBtn.classList.add("processing");
  pdfToWordBtn.innerHTML = '<div class="spinner"></div> Converting...';

  try {
    const formData = new FormData();
    formData.append("file", pdfToWordFile);

    const response = await fetch("/api/stirling/pdf-to-word", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to convert PDF to Word");
    }

    const blob = await response.blob();
    downloadFile(blob, "converted.docx");

    // Reset
    removePdfToWordFile();
    showAlert(
      "pdfToWordAlert",
      "PDF converted to Word successfully!",
      "success"
    );
  } catch (error) {
    showAlert("pdfToWordAlert", error.message);
  } finally {
    pdfToWordBtn.disabled = false;
    pdfToWordBtn.classList.remove("processing");
    pdfToWordBtn.innerHTML =
      '<i class="fas fa-exchange-alt"></i> Convert to Word';
  }
});

// ========== PDF TO IMAGE ==========
const pdfToImageFileInput = document.getElementById("pdfToImageFileInput");
const pdfToImageUploadArea = document.getElementById("pdfToImageUploadArea");
const pdfToImageFileList = document.getElementById("pdfToImageFileList");
const pdfToImageBtn = document.getElementById("pdfToImageBtn");

pdfToImageFileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    pdfToImageFile = e.target.files[0];
    updatePdfToImageFileList();
  }
});

// Drag and drop
pdfToImageUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  pdfToImageUploadArea.classList.add("dragover");
});

pdfToImageUploadArea.addEventListener("dragleave", () => {
  pdfToImageUploadArea.classList.remove("dragover");
});

pdfToImageUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  pdfToImageUploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    pdfToImageFile = file;
    updatePdfToImageFileList();
  }
});

function updatePdfToImageFileList() {
  if (!pdfToImageFile) {
    pdfToImageFileList.innerHTML = "";
    pdfToImageBtn.disabled = true;
    return;
  }

  pdfToImageFileList.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${pdfToImageFile.name}</div>
          <div class="file-size">${formatFileSize(pdfToImageFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removePdfToImageFile()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  pdfToImageBtn.disabled = false;
}

function removePdfToImageFile() {
  pdfToImageFile = null;
  pdfToImageFileInput.value = "";
  updatePdfToImageFileList();
}

pdfToImageBtn.addEventListener("click", async () => {
  if (!pdfToImageFile) {
    showAlert("pdfToImageAlert", "Please upload a PDF file");
    return;
  }

  pdfToImageBtn.disabled = true;
  pdfToImageBtn.classList.add("processing");
  pdfToImageBtn.innerHTML = '<div class="spinner"></div> Converting...';

  try {
    const formData = new FormData();
    formData.append("file", pdfToImageFile);
    formData.append(
      "imageFormat",
      document.getElementById("imageFormat").value
    );

    const response = await fetch("/api/stirling/pdf-to-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to convert PDF to images");
    }

    const blob = await response.blob();
    downloadFile(blob, "images.zip");

    // Reset
    removePdfToImageFile();
    showAlert(
      "pdfToImageAlert",
      "PDF converted to images successfully!",
      "success"
    );
  } catch (error) {
    showAlert("pdfToImageAlert", error.message);
  } finally {
    pdfToImageBtn.disabled = false;
    pdfToImageBtn.classList.remove("processing");
    pdfToImageBtn.innerHTML = '<i class="fas fa-images"></i> Convert to Images';
  }
});

// ========== ADD WATERMARK ==========
const watermarkFileInput = document.getElementById("watermarkFileInput");
const watermarkUploadArea = document.getElementById("watermarkUploadArea");
const watermarkFileList = document.getElementById("watermarkFileList");
const watermarkBtn = document.getElementById("watermarkBtn");
const watermarkOpacity = document.getElementById("watermarkOpacity");
const opacityValue = document.getElementById("opacityValue");

// Update opacity display
watermarkOpacity.addEventListener("input", (e) => {
  opacityValue.textContent = e.target.value + "%";
});

watermarkFileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    watermarkFile = e.target.files[0];
    updateWatermarkFileList();
  }
});

// Drag and drop
watermarkUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  watermarkUploadArea.classList.add("dragover");
});

watermarkUploadArea.addEventListener("dragleave", () => {
  watermarkUploadArea.classList.remove("dragover");
});

watermarkUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  watermarkUploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    watermarkFile = file;
    updateWatermarkFileList();
  }
});

function updateWatermarkFileList() {
  if (!watermarkFile) {
    watermarkFileList.innerHTML = "";
    watermarkBtn.disabled = true;
    return;
  }

  watermarkFileList.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${watermarkFile.name}</div>
          <div class="file-size">${formatFileSize(watermarkFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removeWatermarkFile()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  watermarkBtn.disabled = false;
}

function removeWatermarkFile() {
  watermarkFile = null;
  watermarkFileInput.value = "";
  updateWatermarkFileList();
}

watermarkBtn.addEventListener("click", async () => {
  if (!watermarkFile) {
    showAlert("watermarkAlert", "Please upload a PDF file");
    return;
  }

  watermarkBtn.disabled = true;
  watermarkBtn.classList.add("processing");
  watermarkBtn.innerHTML = '<div class="spinner"></div> Adding Watermark...';

  try {
    const formData = new FormData();
    formData.append("file", watermarkFile);
    formData.append(
      "watermarkText",
      document.getElementById("watermarkText").value
    );
    formData.append(
      "opacity",
      (parseInt(watermarkOpacity.value) / 100).toFixed(2)
    );

    const response = await fetch("/api/stirling/watermark", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add watermark");
    }

    const blob = await response.blob();
    downloadFile(blob, "watermarked.pdf");

    // Reset
    removeWatermarkFile();
    showAlert("watermarkAlert", "Watermark added successfully!", "success");
  } catch (error) {
    showAlert("watermarkAlert", error.message);
  } finally {
    watermarkBtn.disabled = false;
    watermarkBtn.classList.remove("processing");
    watermarkBtn.innerHTML = '<i class="fas fa-stamp"></i> Add Watermark';
  }
});

// ========== ADD PASSWORD ==========
const passwordFileInput = document.getElementById("passwordFileInput");
const passwordUploadArea = document.getElementById("passwordUploadArea");
const passwordFileList = document.getElementById("passwordFileList");
const passwordBtn = document.getElementById("passwordBtn");

passwordFileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    passwordFile = e.target.files[0];
    updatePasswordFileList();
  }
});

// Drag and drop
passwordUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  passwordUploadArea.classList.add("dragover");
});

passwordUploadArea.addEventListener("dragleave", () => {
  passwordUploadArea.classList.remove("dragover");
});

passwordUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  passwordUploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    passwordFile = file;
    updatePasswordFileList();
  }
});

function updatePasswordFileList() {
  if (!passwordFile) {
    passwordFileList.innerHTML = "";
    passwordBtn.disabled = true;
    return;
  }

  passwordFileList.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${passwordFile.name}</div>
          <div class="file-size">${formatFileSize(passwordFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removePasswordFile()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  passwordBtn.disabled = false;
}

function removePasswordFile() {
  passwordFile = null;
  passwordFileInput.value = "";
  updatePasswordFileList();
}

passwordBtn.addEventListener("click", async () => {
  const password = document.getElementById("pdfPassword").value;

  if (!passwordFile) {
    showAlert("passwordAlert", "Please upload a PDF file");
    return;
  }

  if (!password) {
    showAlert("passwordAlert", "Please enter a password");
    return;
  }

  passwordBtn.disabled = true;
  passwordBtn.classList.add("processing");
  passwordBtn.innerHTML = '<div class="spinner"></div> Adding Password...';

  try {
    const formData = new FormData();
    formData.append("file", passwordFile);
    formData.append("password", password);
    formData.append("canPrint", document.getElementById("canPrint").checked);
    formData.append("canModify", document.getElementById("canModify").checked);

    const response = await fetch("/api/stirling/password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add password");
    }

    const blob = await response.blob();
    downloadFile(blob, "protected.pdf");

    // Reset
    removePasswordFile();
    document.getElementById("pdfPassword").value = "";
    showAlert("passwordAlert", "Password added successfully!", "success");
  } catch (error) {
    showAlert("passwordAlert", error.message);
  } finally {
    passwordBtn.disabled = false;
    passwordBtn.classList.remove("processing");
    passwordBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Add Password';
  }
});
