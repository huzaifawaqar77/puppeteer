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

// ========== AUTO REDACT PDF ==========
const autoRedactFileInput = document.getElementById("autoRedactFileInput");
const autoRedactUploadArea = document.getElementById("autoRedactUploadArea");
const autoRedactFileList = document.getElementById("autoRedactFileList");
const autoRedactBtn = document.getElementById("autoRedactBtn");

autoRedactFileInput.addEventListener("change", (e) => {
  autoRedactFile = e.target.files[0];
  updateAutoRedactFileList();
});

// Drag and drop for auto redact
autoRedactUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  autoRedactUploadArea.classList.add("dragover");
});

autoRedactUploadArea.addEventListener("dragleave", () => {
  autoRedactUploadArea.classList.remove("dragover");
});

autoRedactUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  autoRedactUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length > 0) {
    autoRedactFile = files[0];
    updateAutoRedactFileList();
  }
});

function updateAutoRedactFileList() {
  autoRedactFileList.innerHTML = "";
  if (autoRedactFile) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${autoRedactFile.name}</div>
          <div class="file-size">${formatFileSize(autoRedactFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removeAutoRedactFile()">
        <i class="fas fa-times"></i>
      </button>
    `;
    autoRedactFileList.appendChild(fileItem);
  }
  autoRedactBtn.disabled = !autoRedactFile;
}

function removeAutoRedactFile() {
  autoRedactFile = null;
  autoRedactFileInput.value = "";
  updateAutoRedactFileList();
}

autoRedactBtn.addEventListener("click", async () => {
  if (!autoRedactFile) {
    showAlert("autoRedactAlert", "Please upload a PDF file");
    return;
  }

  const textToRedact = document.getElementById("autoRedactText").value;
  if (!textToRedact.trim()) {
    showAlert("autoRedactAlert", "Please enter text to redact");
    return;
  }

  autoRedactBtn.disabled = true;
  autoRedactBtn.classList.add("processing");
  autoRedactBtn.innerHTML = '<div class="spinner"></div> Processing...';

  try {
    const formData = new FormData();
    formData.append("fileInput", autoRedactFile);
    formData.append(
      "listOfText",
      textToRedact
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s)
        .join(";")
    );
    formData.append(
      "useRegex",
      document.getElementById("autoRedactUseRegex").checked
    );
    formData.append(
      "wholeWordSearch",
      document.getElementById("autoRedactWholeWord").checked
    );
    formData.append(
      "redactColor",
      document.getElementById("autoRedactColor").value
    );
    formData.append(
      "customPadding",
      document.getElementById("autoRedactPadding").value
    );
    formData.append(
      "convertPDFToImage",
      document.getElementById("autoRedactConvertToImage").checked
    );

    const response = await fetch("/api/stirling/auto-redact", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to redact PDF");
    }

    const blob = await response.blob();
    const filename = document.getElementById("autoRedactConvertToImage").checked
      ? "redacted.png"
      : "redacted.pdf";
    downloadFile(blob, filename);

    // Reset
    removeAutoRedactFile();
    document.getElementById("autoRedactText").value = "";
    showAlert("autoRedactAlert", "PDF redacted successfully!", "success");
  } catch (error) {
    showAlert("autoRedactAlert", error.message);
  } finally {
    autoRedactBtn.disabled = false;
    autoRedactBtn.classList.remove("processing");
    autoRedactBtn.innerHTML = '<i class="fas fa-ban"></i> Auto Redact PDF';
  }
});

// ========== MANUAL REDACT PDF ==========
const manualRedactFileInput = document.getElementById("manualRedactFileInput");
const manualRedactUploadArea = document.getElementById(
  "manualRedactUploadArea"
);
const manualRedactFileList = document.getElementById("manualRedactFileList");
const manualRedactBtn = document.getElementById("manualRedactBtn");

manualRedactFileInput.addEventListener("change", (e) => {
  manualRedactFile = e.target.files[0];
  updateManualRedactFileList();
});

// Drag and drop for manual redact
manualRedactUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  manualRedactUploadArea.classList.add("dragover");
});

manualRedactUploadArea.addEventListener("dragleave", () => {
  manualRedactUploadArea.classList.remove("dragover");
});

manualRedactUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  manualRedactUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length > 0) {
    manualRedactFile = files[0];
    updateManualRedactFileList();
  }
});

function updateManualRedactFileList() {
  manualRedactFileList.innerHTML = "";
  if (manualRedactFile) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${manualRedactFile.name}</div>
          <div class="file-size">${formatFileSize(manualRedactFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removeManualRedactFile()">
        <i class="fas fa-times"></i>
      </button>
    `;
    manualRedactFileList.appendChild(fileItem);
  }
  manualRedactBtn.disabled = !manualRedactFile;
}

function removeManualRedactFile() {
  manualRedactFile = null;
  manualRedactFileInput.value = "";
  updateManualRedactFileList();
}

manualRedactBtn.addEventListener("click", async () => {
  if (!manualRedactFile) {
    showAlert("manualRedactAlert", "Please upload a PDF file");
    return;
  }

  manualRedactBtn.disabled = true;
  manualRedactBtn.classList.add("processing");
  manualRedactBtn.innerHTML = '<div class="spinner"></div> Processing...';

  try {
    const formData = new FormData();
    formData.append("fileInput", manualRedactFile);
    formData.append(
      "pageNumbers",
      document.getElementById("manualRedactPages").value
    );
    formData.append(
      "pageRedactionColor",
      document.getElementById("manualRedactColor").value
    );
    formData.append(
      "convertPDFToImage",
      document.getElementById("manualRedactConvertToImage").checked
    );

    const response = await fetch("/api/stirling/redact", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to redact PDF");
    }

    const blob = await response.blob();
    const filename = document.getElementById("manualRedactConvertToImage")
      .checked
      ? "redacted.png"
      : "redacted.pdf";
    downloadFile(blob, filename);

    // Reset
    removeManualRedactFile();
    showAlert("manualRedactAlert", "PDF redacted successfully!", "success");
  } catch (error) {
    showAlert("manualRedactAlert", error.message);
  } finally {
    manualRedactBtn.disabled = false;
    manualRedactBtn.classList.remove("processing");
    manualRedactBtn.innerHTML =
      '<i class="fas fa-highlighter"></i> Redact Pages';
  }
});

// ========== SANITIZE PDF ==========
const sanitizeFileInput = document.getElementById("sanitizeFileInput");
const sanitizeUploadArea = document.getElementById("sanitizeUploadArea");
const sanitizeFileList = document.getElementById("sanitizeFileList");
const sanitizeBtn = document.getElementById("sanitizeBtn");

sanitizeFileInput.addEventListener("change", (e) => {
  sanitizeFile = e.target.files[0];
  updateSanitizeFileList();
});

// Drag and drop for sanitize
sanitizeUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  sanitizeUploadArea.classList.add("dragover");
});

sanitizeUploadArea.addEventListener("dragleave", () => {
  sanitizeUploadArea.classList.remove("dragover");
});

sanitizeUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  sanitizeUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length > 0) {
    sanitizeFile = files[0];
    updateSanitizeFileList();
  }
});

function updateSanitizeFileList() {
  sanitizeFileList.innerHTML = "";
  if (sanitizeFile) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div>
          <div class="file-name">${sanitizeFile.name}</div>
          <div class="file-size">${formatFileSize(sanitizeFile.size)}</div>
        </div>
      </div>
      <button class="remove-file" onclick="removeSanitizeFile()">
        <i class="fas fa-times"></i>
      </button>
    `;
    sanitizeFileList.appendChild(fileItem);
  }
  sanitizeBtn.disabled = !sanitizeFile;
}

function removeSanitizeFile() {
  sanitizeFile = null;
  sanitizeFileInput.value = "";
  updateSanitizeFileList();
}

sanitizeBtn.addEventListener("click", async () => {
  if (!sanitizeFile) {
    showAlert("sanitizeAlert", "Please upload a PDF file");
    return;
  }

  sanitizeBtn.disabled = true;
  sanitizeBtn.classList.add("processing");
  sanitizeBtn.innerHTML = '<div class="spinner"></div> Processing...';

  try {
    const formData = new FormData();
    formData.append("fileInput", sanitizeFile);
    formData.append(
      "removeJavaScript",
      document.getElementById("sanitizeRemoveJavaScript").checked
    );
    formData.append(
      "removeEmbeddedFiles",
      document.getElementById("sanitizeRemoveEmbeddedFiles").checked
    );
    formData.append(
      "removeXMPMetadata",
      document.getElementById("sanitizeRemoveXMPMetadata").checked
    );
    formData.append(
      "removeMetadata",
      document.getElementById("sanitizeRemoveMetadata").checked
    );
    formData.append(
      "removeLinks",
      document.getElementById("sanitizeRemoveLinks").checked
    );
    formData.append(
      "removeFonts",
      document.getElementById("sanitizeRemoveFonts").checked
    );

    const response = await fetch("/api/stirling/sanitize-pdf", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sanitize PDF");
    }

    const blob = await response.blob();
    downloadFile(blob, "sanitized.pdf");

    // Reset
    removeSanitizeFile();
    showAlert("sanitizeAlert", "PDF sanitized successfully!", "success");
  } catch (error) {
    showAlert("sanitizeAlert", error.message);
  } finally {
    sanitizeBtn.disabled = false;
    sanitizeBtn.classList.remove("processing");
    sanitizeBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Sanitize PDF';
  }
});

// ========== UPDATE METADATA ==========
const updateMetadataFileInput = document.getElementById(
  "updateMetadataFileInput"
);
const updateMetadataUploadArea = document.getElementById(
  "updateMetadataUploadArea"
);
const updateMetadataFileList = document.getElementById(
  "updateMetadataFileList"
);
const updateMetadataBtn = document.getElementById("updateMetadataBtn");

updateMetadataFileInput.addEventListener("change", (e) => {
  updateMetadataFile = e.target.files[0];
  updateMetadataFileListUpdate();
});

updateMetadataUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  updateMetadataUploadArea.classList.add("dragover");
});
updateMetadataUploadArea.addEventListener("dragleave", () =>
  updateMetadataUploadArea.classList.remove("dragover")
);
updateMetadataUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  updateMetadataUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    updateMetadataFile = files[0];
    updateMetadataFileListUpdate();
  }
});

function updateMetadataFileListUpdate() {
  updateMetadataFileList.innerHTML = "";
  if (!updateMetadataFile) {
    updateMetadataBtn.disabled = true;
    return;
  }
  updateMetadataFileList.innerHTML = `
      <div class="file-item">
        <div class="file-info">
          <i class="fas fa-file-pdf"></i>
          <div>
            <div class="file-name">${updateMetadataFile.name}</div>
            <div class="file-size">${formatFileSize(
              updateMetadataFile.size
            )}</div>
          </div>
        </div>
        <button class="remove-file" onclick="(function(){ updateMetadataFile=null; updateMetadataFileInput.value=''; updateMetadataFileListUpdate(); })()">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
  updateMetadataBtn.disabled = false;
}

updateMetadataBtn.addEventListener("click", async () => {
  if (!updateMetadataFile) {
    showAlert("updateMetadataAlert", "Please upload a PDF file");
    return;
  }
  updateMetadataBtn.disabled = true;
  updateMetadataBtn.classList.add("processing");
  updateMetadataBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", updateMetadataFile);
    formData.append(
      "deleteAll",
      document.getElementById("metadataDeleteAll").checked
    );
    formData.append(
      "author",
      document.getElementById("metadataAuthor").value || ""
    );
    formData.append(
      "title",
      document.getElementById("metadataTitle").value || ""
    );
    formData.append(
      "subject",
      document.getElementById("metadataSubject").value || ""
    );
    formData.append(
      "keywords",
      document.getElementById("metadataKeywords").value || ""
    );
    const customRaw = document.getElementById("metadataCustom").value.trim();
    if (customRaw) {
      try {
        JSON.parse(customRaw);
        formData.append("allRequestParams", customRaw);
      } catch (err) {
        throw new Error("Custom params must be valid JSON");
      }
    }

    const response = await fetch("/api/v1/misc/update-metadata", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to update metadata");
    }
    const blob = await response.blob();
    downloadFile(blob, "metadata-updated.pdf");
    updateMetadataFile = null;
    updateMetadataFileInput.value = "";
    updateMetadataFileListUpdate();
    showAlert(
      "updateMetadataAlert",
      "Metadata updated successfully!",
      "success"
    );
  } catch (error) {
    showAlert("updateMetadataAlert", error.message);
  } finally {
    updateMetadataBtn.disabled = false;
    updateMetadataBtn.classList.remove("processing");
    updateMetadataBtn.innerHTML =
      '<i class="fas fa-info-circle"></i> Update Metadata';
  }
});

// ========== UNLOCK FORMS ==========
const unlockFormsFileInput = document.getElementById("unlockFormsFileInput");
const unlockFormsUploadArea = document.getElementById("unlockFormsUploadArea");
const unlockFormsFileList = document.getElementById("unlockFormsFileList");
const unlockFormsBtn = document.getElementById("unlockFormsBtn");

unlockFormsFileInput.addEventListener("change", (e) => {
  unlockFormsFile = e.target.files[0];
  updateUnlockFormsList();
});
unlockFormsUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  unlockFormsUploadArea.classList.add("dragover");
});
unlockFormsUploadArea.addEventListener("dragleave", () =>
  unlockFormsUploadArea.classList.remove("dragover")
);
unlockFormsUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  unlockFormsUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    unlockFormsFile = files[0];
    updateUnlockFormsList();
  }
});

function updateUnlockFormsList() {
  unlockFormsFileList.innerHTML = "";
  if (!unlockFormsFile) {
    unlockFormsBtn.disabled = true;
    return;
  }
  unlockFormsFileList.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <i class="fas fa-file-pdf"></i>
        <div><div class="file-name">${
          unlockFormsFile.name
        }</div><div class="file-size">${formatFileSize(
    unlockFormsFile.size
  )}</div></div>
      </div>
      <button class="remove-file" onclick="(function(){ unlockFormsFile=null; unlockFormsFileInput.value=''; updateUnlockFormsList(); })()"><i class="fas fa-times"></i></button>
    </div>`;
  unlockFormsBtn.disabled = false;
}

unlockFormsBtn.addEventListener("click", async () => {
  if (!unlockFormsFile) {
    showAlert("unlockFormsAlert", "Please upload a PDF file");
    return;
  }
  unlockFormsBtn.disabled = true;
  unlockFormsBtn.classList.add("processing");
  unlockFormsBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", unlockFormsFile);
    const response = await fetch("/api/v1/misc/unlock-pdf-forms", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to unlock forms");
    }
    const blob = await response.blob();
    downloadFile(blob, "unlocked.pdf");
    unlockFormsFile = null;
    unlockFormsFileInput.value = "";
    updateUnlockFormsList();
    showAlert("unlockFormsAlert", "Forms unlocked successfully!", "success");
  } catch (e) {
    showAlert("unlockFormsAlert", e.message);
  } finally {
    unlockFormsBtn.disabled = false;
    unlockFormsBtn.classList.remove("processing");
    unlockFormsBtn.innerHTML = '<i class="fas fa-unlock-alt"></i> Unlock Forms';
  }
});

// ========== SHOW JAVASCRIPT ==========
const showJsFileInput = document.getElementById("showJsFileInput");
const showJsUploadArea = document.getElementById("showJsUploadArea");
const showJsFileList = document.getElementById("showJsFileList");
const showJsBtn = document.getElementById("showJsBtn");

showJsFileInput.addEventListener("change", (e) => {
  showJsFile = e.target.files[0];
  updateShowJsList();
});
showJsUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  showJsUploadArea.classList.add("dragover");
});
showJsUploadArea.addEventListener("dragleave", () =>
  showJsUploadArea.classList.remove("dragover")
);
showJsUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  showJsUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    showJsFile = files[0];
    updateShowJsList();
  }
});

function updateShowJsList() {
  showJsFileList.innerHTML = "";
  if (!showJsFile) {
    showJsBtn.disabled = true;
    return;
  }
  showJsFileList.innerHTML = `
    <div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
      showJsFile.name
    }</div><div class="file-size">${formatFileSize(
    showJsFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ showJsFile=null; showJsFileInput.value=''; updateShowJsList(); })()"><i class="fas fa-times"></i></button></div>`;
  showJsBtn.disabled = false;
}

showJsBtn.addEventListener("click", async () => {
  if (!showJsFile) {
    showAlert("showJsAlert", "Please upload a PDF file");
    return;
  }
  showJsBtn.disabled = true;
  showJsBtn.classList.add("processing");
  showJsBtn.innerHTML = '<div class="spinner"></div> Extracting...';
  try {
    const formData = new FormData();
    formData.append("fileInput", showJsFile);
    const response = await fetch("/api/v1/misc/show-javascript", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to extract JS");
    }
    const blob = await response.blob();
    downloadFile(blob, "pdf-javascript.js");
    showJsFile = null;
    showJsFileInput.value = "";
    updateShowJsList();
    showAlert("showJsAlert", "JavaScript extracted successfully!", "success");
  } catch (e) {
    showAlert("showJsAlert", e.message);
  } finally {
    showJsBtn.disabled = false;
    showJsBtn.classList.remove("processing");
    showJsBtn.innerHTML = '<i class="fas fa-code"></i> Extract JS';
  }
});

// ========== SCANNER EFFECT ==========
const scannerEffectFileInput = document.getElementById(
  "scannerEffectFileInput"
);
const scannerEffectUploadArea = document.getElementById(
  "scannerEffectUploadArea"
);
const scannerEffectFileList = document.getElementById("scannerEffectFileList");
const scannerEffectBtn = document.getElementById("scannerEffectBtn");

scannerEffectFileInput.addEventListener("change", (e) => {
  scannerEffectFile = e.target.files[0];
  updateScannerEffectList();
});
scannerEffectUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  scannerEffectUploadArea.classList.add("dragover");
});
scannerEffectUploadArea.addEventListener("dragleave", () =>
  scannerEffectUploadArea.classList.remove("dragover")
);
scannerEffectUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  scannerEffectUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    scannerEffectFile = files[0];
    updateScannerEffectList();
  }
});

function updateScannerEffectList() {
  scannerEffectFileList.innerHTML = "";
  if (!scannerEffectFile) {
    scannerEffectBtn.disabled = true;
    return;
  }
  scannerEffectFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    scannerEffectFile.name
  }</div><div class="file-size">${formatFileSize(
    scannerEffectFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ scannerEffectFile=null; scannerEffectFileInput.value=''; updateScannerEffectList(); })()"><i class="fas fa-times"></i></button></div>`;
  scannerEffectBtn.disabled = false;
}

scannerEffectBtn.addEventListener("click", async () => {
  if (!scannerEffectFile) {
    showAlert("scannerEffectAlert", "Please upload a PDF file");
    return;
  }
  scannerEffectBtn.disabled = true;
  scannerEffectBtn.classList.add("processing");
  scannerEffectBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", scannerEffectFile);
    formData.append("quality", document.getElementById("scannerQuality").value);
    formData.append("rotate", document.getElementById("scannerRotate").value);
    formData.append("noise", document.getElementById("scannerNoise").value);
    const response = await fetch("/api/v1/misc/scanner-effect", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to apply scanner effect");
    }
    const blob = await response.blob();
    downloadFile(blob, "scanned.pdf");
    scannerEffectFile = null;
    scannerEffectFileInput.value = "";
    updateScannerEffectList();
    showAlert("scannerEffectAlert", "Scanner effect applied!", "success");
  } catch (e) {
    showAlert("scannerEffectAlert", e.message);
  } finally {
    scannerEffectBtn.disabled = false;
    scannerEffectBtn.classList.remove("processing");
    scannerEffectBtn.innerHTML = '<i class="fas fa-scanner"></i> Apply Effect';
  }
});

// ========== REPLACE / INVERT ==========
const replaceInvertFileInput = document.getElementById(
  "replaceInvertFileInput"
);
const replaceInvertUploadArea = document.getElementById(
  "replaceInvertUploadArea"
);
const replaceInvertFileList = document.getElementById("replaceInvertFileList");
const replaceInvertBtn = document.getElementById("replaceInvertBtn");

replaceInvertFileInput.addEventListener("change", (e) => {
  replaceInvertFile = e.target.files[0];
  updateReplaceInvertList();
});
replaceInvertUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  replaceInvertUploadArea.classList.add("dragover");
});
replaceInvertUploadArea.addEventListener("dragleave", () =>
  replaceInvertUploadArea.classList.remove("dragover")
);
replaceInvertUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  replaceInvertUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    replaceInvertFile = files[0];
    updateReplaceInvertList();
  }
});

function updateReplaceInvertList() {
  replaceInvertFileList.innerHTML = "";
  if (!replaceInvertFile) {
    replaceInvertBtn.disabled = true;
    return;
  }
  replaceInvertFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    replaceInvertFile.name
  }</div><div class="file-size">${formatFileSize(
    replaceInvertFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ replaceInvertFile=null; replaceInvertFileInput.value=''; updateReplaceInvertList(); })()"><i class="fas fa-times"></i></button></div>`;
  replaceInvertBtn.disabled = false;
}

replaceInvertBtn.addEventListener("click", async () => {
  if (!replaceInvertFile) {
    showAlert("replaceInvertAlert", "Please upload a PDF file");
    return;
  }
  replaceInvertBtn.disabled = true;
  replaceInvertBtn.classList.add("processing");
  replaceInvertBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", replaceInvertFile);
    formData.append(
      "replaceAndInvertOption",
      document.getElementById("replaceInvertOption").value
    );
    formData.append(
      "backGroundColor",
      document.getElementById("replaceBgColor").value || ""
    );
    formData.append(
      "textColor",
      document.getElementById("replaceTextColor").value || ""
    );
    const response = await fetch("/api/v1/misc/replace-invert-pdf", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to process replace/invert");
    }
    const blob = await response.blob();
    downloadFile(blob, "replace-invert.pdf");
    replaceInvertFile = null;
    replaceInvertFileInput.value = "";
    updateReplaceInvertList();
    showAlert("replaceInvertAlert", "Processed successfully!", "success");
  } catch (e) {
    showAlert("replaceInvertAlert", e.message);
  } finally {
    replaceInvertBtn.disabled = false;
    replaceInvertBtn.classList.remove("processing");
    replaceInvertBtn.innerHTML = '<i class="fas fa-adjust"></i> Process';
  }
});

// ========== REPAIR ==========
const repairFileInput = document.getElementById("repairFileInput");
const repairUploadArea = document.getElementById("repairUploadArea");
const repairFileList = document.getElementById("repairFileList");
const repairBtn = document.getElementById("repairBtn");

repairFileInput.addEventListener("change", (e) => {
  repairFile = e.target.files[0];
  updateRepairList();
});
repairUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  repairUploadArea.classList.add("dragover");
});
repairUploadArea.addEventListener("dragleave", () =>
  repairUploadArea.classList.remove("dragover")
);
repairUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  repairUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    repairFile = files[0];
    updateRepairList();
  }
});

function updateRepairList() {
  repairFileList.innerHTML = "";
  if (!repairFile) {
    repairBtn.disabled = true;
    return;
  }
  repairFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    repairFile.name
  }</div><div class="file-size">${formatFileSize(
    repairFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ repairFile=null; repairFileInput.value=''; updateRepairList(); })()"><i class="fas fa-times"></i></button></div>`;
  repairBtn.disabled = false;
}

repairBtn.addEventListener("click", async () => {
  if (!repairFile) {
    showAlert("repairAlert", "Please upload a PDF file");
    return;
  }
  repairBtn.disabled = true;
  repairBtn.classList.add("processing");
  repairBtn.innerHTML = '<div class="spinner"></div> Repairing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", repairFile);
    const response = await fetch("/api/v1/misc/repair", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to repair PDF");
    }
    const blob = await response.blob();
    downloadFile(blob, "repaired.pdf");
    repairFile = null;
    repairFileInput.value = "";
    updateRepairList();
    showAlert("repairAlert", "PDF repaired successfully!", "success");
  } catch (e) {
    showAlert("repairAlert", e.message);
  } finally {
    repairBtn.disabled = false;
    repairBtn.classList.remove("processing");
    repairBtn.innerHTML = '<i class="fas fa-wrench"></i> Repair PDF';
  }
});

// ========== REMOVE BLANKS ==========
const removeBlanksFileInput = document.getElementById("removeBlanksFileInput");
const removeBlanksUploadArea = document.getElementById(
  "removeBlanksUploadArea"
);
const removeBlanksFileList = document.getElementById("removeBlanksFileList");
const removeBlanksBtn = document.getElementById("removeBlanksBtn");

removeBlanksFileInput.addEventListener("change", (e) => {
  removeBlanksFile = e.target.files[0];
  updateRemoveBlanksList();
});
removeBlanksUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  removeBlanksUploadArea.classList.add("dragover");
});
removeBlanksUploadArea.addEventListener("dragleave", () =>
  removeBlanksUploadArea.classList.remove("dragover")
);
removeBlanksUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  removeBlanksUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    removeBlanksFile = files[0];
    updateRemoveBlanksList();
  }
});

function updateRemoveBlanksList() {
  removeBlanksFileList.innerHTML = "";
  if (!removeBlanksFile) {
    removeBlanksBtn.disabled = true;
    return;
  }
  removeBlanksFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    removeBlanksFile.name
  }</div><div class="file-size">${formatFileSize(
    removeBlanksFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ removeBlanksFile=null; removeBlanksFileInput.value=''; updateRemoveBlanksList(); })()"><i class="fas fa-times"></i></button></div>`;
  removeBlanksBtn.disabled = false;
}

removeBlanksBtn.addEventListener("click", async () => {
  if (!removeBlanksFile) {
    showAlert("removeBlanksAlert", "Please upload a PDF file");
    return;
  }
  removeBlanksBtn.disabled = true;
  removeBlanksBtn.classList.add("processing");
  removeBlanksBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", removeBlanksFile);
    formData.append(
      "threshold",
      document.getElementById("removeBlanksThreshold").value
    );
    formData.append(
      "whitePercent",
      document.getElementById("removeBlanksWhitePercent").value
    );
    const response = await fetch("/api/v1/misc/remove-blanks", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to remove blank pages");
    }
    const blob = await response.blob();
    downloadFile(blob, "cleaned.pdf");
    removeBlanksFile = null;
    removeBlanksFileInput.value = "";
    updateRemoveBlanksList();
    showAlert("removeBlanksAlert", "Blank pages removed!", "success");
  } catch (e) {
    showAlert("removeBlanksAlert", e.message);
  } finally {
    removeBlanksBtn.disabled = false;
    removeBlanksBtn.classList.remove("processing");
    removeBlanksBtn.innerHTML =
      '<i class="fas fa-trash-alt"></i> Remove Blanks';
  }
});

// ========== OCR PDF ==========
const ocrFileInput = document.getElementById("ocrFileInput");
const ocrUploadArea = document.getElementById("ocrUploadArea");
const ocrFileList = document.getElementById("ocrFileList");
const ocrBtn = document.getElementById("ocrBtn");

ocrFileInput.addEventListener("change", (e) => {
  ocrFile = e.target.files[0];
  updateOcrList();
});
ocrUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  ocrUploadArea.classList.add("dragover");
});
ocrUploadArea.addEventListener("dragleave", () =>
  ocrUploadArea.classList.remove("dragover")
);
ocrUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  ocrUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    ocrFile = files[0];
    updateOcrList();
  }
});

function updateOcrList() {
  ocrFileList.innerHTML = "";
  if (!ocrFile) {
    ocrBtn.disabled = true;
    return;
  }
  ocrFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    ocrFile.name
  }</div><div class="file-size">${formatFileSize(
    ocrFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ ocrFile=null; ocrFileInput.value=''; updateOcrList(); })()"><i class="fas fa-times"></i></button></div>`;
  ocrBtn.disabled = false;
}

ocrBtn.addEventListener("click", async () => {
  if (!ocrFile) {
    showAlert("ocrAlert", "Please upload a PDF file");
    return;
  }
  ocrBtn.disabled = true;
  ocrBtn.classList.add("processing");
  ocrBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", ocrFile);
    formData.append(
      "languages",
      (document.getElementById("ocrLanguages").value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",")
    );
    formData.append("sidecar", document.getElementById("ocrSidecar").checked);
    formData.append("deskew", document.getElementById("ocrDeskew").checked);
    formData.append("clean", document.getElementById("ocrClean").checked);
    formData.append(
      "cleanFinal",
      document.getElementById("ocrCleanFinal").checked
    );
    const response = await fetch("/api/v1/misc/ocr-pdf", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to OCR PDF");
    }
    const blob = await response.blob();
    downloadFile(blob, "ocr.pdf");
    ocrFile = null;
    ocrFileInput.value = "";
    updateOcrList();
    showAlert("ocrAlert", "OCR completed!", "success");
  } catch (e) {
    showAlert("ocrAlert", e.message);
  } finally {
    ocrBtn.disabled = false;
    ocrBtn.classList.remove("processing");
    ocrBtn.innerHTML = '<i class="fas fa-brain"></i> Run OCR';
  }
});

// ========== FLATTEN ==========
const flattenFileInput = document.getElementById("flattenFileInput");
const flattenUploadArea = document.getElementById("flattenUploadArea");
const flattenFileList = document.getElementById("flattenFileList");
const flattenBtn = document.getElementById("flattenBtn");

flattenFileInput.addEventListener("change", (e) => {
  flattenFile = e.target.files[0];
  updateFlattenList();
});
flattenUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  flattenUploadArea.classList.add("dragover");
});
flattenUploadArea.addEventListener("dragleave", () =>
  flattenUploadArea.classList.remove("dragover")
);
flattenUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  flattenUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    flattenFile = files[0];
    updateFlattenList();
  }
});

function updateFlattenList() {
  flattenFileList.innerHTML = "";
  if (!flattenFile) {
    flattenBtn.disabled = true;
    return;
  }
  flattenFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    flattenFile.name
  }</div><div class="file-size">${formatFileSize(
    flattenFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ flattenFile=null; flattenFileInput.value=''; updateFlattenList(); })()"><i class="fas fa-times"></i></button></div>`;
  flattenBtn.disabled = false;
}

flattenBtn.addEventListener("click", async () => {
  if (!flattenFile) {
    showAlert("flattenAlert", "Please upload a PDF file");
    return;
  }
  flattenBtn.disabled = true;
  flattenBtn.classList.add("processing");
  flattenBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", flattenFile);
    formData.append(
      "flattenOnlyForms",
      document.getElementById("flattenOnlyForms").checked
    );
    const response = await fetch("/api/v1/misc/flatten", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to flatten PDF");
    }
    const blob = await response.blob();
    downloadFile(blob, "flattened.pdf");
    flattenFile = null;
    flattenFileInput.value = "";
    updateFlattenList();
    showAlert("flattenAlert", "Flatten completed!", "success");
  } catch (e) {
    showAlert("flattenAlert", e.message);
  } finally {
    flattenBtn.disabled = false;
    flattenBtn.classList.remove("processing");
    flattenBtn.innerHTML = '<i class="fas fa-compress"></i> Flatten';
  }
});

// ========== EXTRACT IMAGES ==========
const extractImagesFileInput = document.getElementById(
  "extractImagesFileInput"
);
const extractImagesUploadArea = document.getElementById(
  "extractImagesUploadArea"
);
const extractImagesFileList = document.getElementById("extractImagesFileList");
const extractImagesBtn = document.getElementById("extractImagesBtn");

extractImagesFileInput.addEventListener("change", (e) => {
  extractImagesFile = e.target.files[0];
  updateExtractImagesList();
});
extractImagesUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  extractImagesUploadArea.classList.add("dragover");
});
extractImagesUploadArea.addEventListener("dragleave", () =>
  extractImagesUploadArea.classList.remove("dragover")
);
extractImagesUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  extractImagesUploadArea.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  if (files.length) {
    extractImagesFile = files[0];
    updateExtractImagesList();
  }
});

function updateExtractImagesList() {
  extractImagesFileList.innerHTML = "";
  if (!extractImagesFile) {
    extractImagesBtn.disabled = true;
    return;
  }
  extractImagesFileList.innerHTML = `<div class="file-item"><div class="file-info"><i class="fas fa-file-pdf"></i><div><div class="file-name">${
    extractImagesFile.name
  }</div><div class="file-size">${formatFileSize(
    extractImagesFile.size
  )}</div></div></div><button class="remove-file" onclick="(function(){ extractImagesFile=null; extractImagesFileInput.value=''; updateExtractImagesList(); })()"><i class="fas fa-times"></i></button></div>`;
  extractImagesBtn.disabled = false;
}

extractImagesBtn.addEventListener("click", async () => {
  if (!extractImagesFile) {
    showAlert("extractImagesAlert", "Please upload a PDF file");
    return;
  }
  extractImagesBtn.disabled = true;
  extractImagesBtn.classList.add("processing");
  extractImagesBtn.innerHTML = '<div class="spinner"></div> Processing...';
  try {
    const formData = new FormData();
    formData.append("fileInput", extractImagesFile);
    formData.append(
      "format",
      document.getElementById("extractImagesFormat").value
    );
    formData.append(
      "allowDuplicates",
      document.getElementById("extractImagesAllowDuplicates").checked
    );
    const response = await fetch("/api/v1/misc/extract-images", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to extract images");
    }
    const blob = await response.blob();
    downloadFile(blob, "images.zip");
    extractImagesFile = null;
    extractImagesFileInput.value = "";
    updateExtractImagesList();
    showAlert("extractImagesAlert", "Images extracted!", "success");
  } catch (e) {
    showAlert("extractImagesAlert", e.message);
  } finally {
    extractImagesBtn.disabled = false;
    extractImagesBtn.classList.remove("processing");
    extractImagesBtn.innerHTML =
      '<i class="fas fa-file-image"></i> Extract Images';
  }
});
