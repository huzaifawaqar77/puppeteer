const API_BASE_URL = window.location.origin;
let userData = null;

// Check authentication
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login.html";
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  setupEventListeners();
  initSupportEditor();
});

let supportQuill = null;

function initSupportEditor() {
  const editorContainer = document.getElementById("emailEditor");
  if (!editorContainer) return;

  supportQuill = new Quill("#emailEditor", {
    theme: "snow",
    placeholder: "Dear Support Team,\n\nI would like to upgrade my plan...",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
      ],
    },
  });
}

// Setup event listeners
function setupEventListeners() {
  // Logout
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Tab navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const tab = e.target.dataset.tab;

      // If link has a tab attribute, it's an internal tab - switch to it
      if (tab) {
        e.preventDefault();
        switchTab(tab);
        // Close mobile menu
        if (navMenu) navMenu.classList.remove("active");
      }
      // Otherwise, it's an external link (like /branding.html) - let it navigate normally
    });
  });

  // PDF generation tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const genTab = e.target.dataset.genTab;
      switchGenTab(genTab);
    });
  });

  // PDF forms
  document
    .getElementById("htmlPdfForm")
    .addEventListener("submit", generatePdfFromHtml);
  document
    .getElementById("urlPdfForm")
    .addEventListener("submit", generatePdfFromUrl);

  // Preview HTML button
  document
    .getElementById("previewHtmlBtn")
    .addEventListener("click", previewHtml);

  // AI Template form
  document
    .getElementById("aiTemplateForm")
    .addEventListener("submit", generateAITemplate);

  // AI example chips
  document.querySelectorAll(".example-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      const example = e.currentTarget.dataset.example;
      document.getElementById("aiDescription").value = example;
    });
  });

  // AI result actions
  document
    .getElementById("aiPreviewBtn")
    .addEventListener("click", previewAITemplate);
  document
    .getElementById("aiCopyBtn")
    .addEventListener("click", copyAITemplate);
  document
    .getElementById("aiUsePdfBtn")
    .addEventListener("click", useAITemplateForPdf);

  // Upgrade plan button
  document.getElementById("upgradePlanBtn").addEventListener("click", () => {
    // alert(
    //   "Payment integration coming soon! Contact support to upgrade your plan."
    // );
    showSupportModal();
  });

  // Support modal close button
  document
    .querySelector("#supportModal .close-button")
    .addEventListener("click", hideSupportModal);

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const supportModal = document.getElementById("supportModal");
    if (event.target === supportModal) {
      hideSupportModal();
    }
  });

  // Support email form submission
  document
    .getElementById("supportEmailForm")
    .addEventListener("submit", sendSupportEmail);
}

// Show support modal
function showSupportModal() {
  document.getElementById("supportModal").style.display = "flex";
}

// Hide support modal
function hideSupportModal() {
  document.getElementById("supportModal").style.display = "none";
  document.getElementById("emailStatus").style.display = "none"; // Hide status message on close
}

// Send support email
async function sendSupportEmail(e) {
  e.preventDefault();

  const form = e.target;
  const subject = document.getElementById("emailSubject").value;
  // Prefer Quill HTML when available, fallback to textarea value
  const bodyHtml = supportQuill ? supportQuill.root.innerHTML : null;
  const body = document.getElementById("emailBody").value;
  const emailStatusDiv = document.getElementById("emailStatus");
  const sendButton = form.querySelector("button[type='submit']");

  emailStatusDiv.style.display = "none";
  emailStatusDiv.className = "email-status";
  sendButton.disabled = true;
  sendButton.textContent = "Sending...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/support/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subject, body, bodyHtml }),
    });

    const data = await response.json();

    if (response.ok) {
      emailStatusDiv.textContent =
        "Email sent successfully! We will get back to you shortly.";
      emailStatusDiv.classList.add("success");
      form.reset();
      document.getElementById("emailSubject").value = "Plan Upgrade Request"; // Reset subject to default
      if (supportQuill) supportQuill.setText("");
    } else {
      throw new Error(data.message || "Failed to send email.");
    }
  } catch (error) {
    emailStatusDiv.textContent = error.message;
    emailStatusDiv.classList.add("error");
    console.error("Error sending support email:", error);
  } finally {
    emailStatusDiv.style.display = "block";
    sendButton.disabled = false;
    sendButton.textContent = "Send Email";
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        return;
      }
      throw new Error("Failed to load profile");
    }

    const data = await response.json();
    userData = data.data;

    updateDashboard(userData);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showAlert("Failed to load dashboard data", "error", "genAlert");
  }
}

// Update dashboard with user data
function updateDashboard(data) {
  const { user, subscription, api_keys, usage } = data;

  // Stats cards
  document.getElementById("usageCount").textContent =
    usage.conversions_used || 0;
  document.getElementById("usageLimit").textContent =
    usage.conversions_limit === -1 ? "Unlimited" : usage.conversions_limit;
  document.getElementById("planName").textContent = subscription.plan_name;
  document.getElementById("apiKeyCount").textContent = api_keys.filter(
    (k) => k.is_active
  ).length;

  // Usage progress
  const usagePercent =
    usage.conversions_limit === -1
      ? 0
      : Math.round((usage.conversions_used / usage.conversions_limit) * 100);

  document.getElementById("usageText").textContent = `${
    usage.conversions_used
  } / ${
    usage.conversions_limit === -1 ? "Unlimited" : usage.conversions_limit
  } conversions used`;
  document.getElementById("usagePercentage").textContent =
    usage.conversions_limit === -1 ? "Unlimited" : `${usagePercent}%`;
  document.getElementById("progressFill").style.width =
    usage.conversions_limit === -1 ? "0%" : `${usagePercent}%`;

  // Show warnings
  if (usage.conversions_limit !== -1) {
    if (usagePercent >= 100) {
      document.getElementById("limitExceeded").style.display = "block";
      document.getElementById("limitWarning").style.display = "none";
    } else if (usagePercent >= 80) {
      document.getElementById("limitWarning").style.display = "block";
      document.getElementById("limitExceeded").style.display = "none";
    }
  }

  // Show PDF Tools link for Starter+ users
  if (
    ["starter", "professional", "business", "superadmin"].includes(
      subscription.plan_slug
    )
  ) {
    document.getElementById("pdfToolsLink").style.display = "inline-block";
  }

  // Show branding link for Business and SuperAdmin users
  if (["business", "superadmin"].includes(subscription.plan_slug)) {
    document.getElementById("brandingLink").style.display = "inline-block";
  }

  // Subscription info
  document.getElementById("subPlan").textContent = subscription.plan_name;
  document.getElementById("subStatus").textContent =
    subscription.status.toUpperCase();
  document.getElementById(
    "subPrice"
  ).textContent = `$${subscription.price}/month`;
  document.getElementById("subRenewal").textContent =
    subscription.current_period_end
      ? new Date(subscription.current_period_end).toLocaleDateString()
      : "N/A";

  // API Keys
  renderApiKeys(api_keys);

  // Profile
  document.getElementById("profileName").textContent = user.full_name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileStatus").innerHTML = user.is_verified
    ? '<i class="fas fa-check-circle" style="color: #10b981;"></i> Verified'
    : '<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> Not Verified';
  document.getElementById("profileCreated").textContent = new Date(
    user.created_at
  ).toLocaleDateString();

  // Show upgrade section for trial users
  if (subscription.plan_slug === "trial") {
    loadUpgradePlans();
  }
}

// Load upgrade plans for trial users
async function loadUpgradePlans() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscription/plans`);

    if (!response.ok) {
      throw new Error("Failed to load plans");
    }

    const data = await response.json();
    const plans = data.data.filter(
      (plan) =>
        plan.slug !== "trial" && plan.slug !== "superadmin" && plan.is_active
    );

    renderUpgradePlans(plans);
    document.getElementById("upgradePlanSection").style.display = "block";
  } catch (error) {
    console.error("Error loading upgrade plans:", error);
  }
}

// Render upgrade plans
function renderUpgradePlans(plans) {
  const container = document.getElementById("plansGrid");

  container.innerHTML = plans
    .map((plan, index) => {
      const features = JSON.parse(plan.features || "[]");
      const isPopular = plan.slug === "professional";

      return `
      <div class="plan-card ${isPopular ? "popular" : ""}">
        ${isPopular ? '<div class="plan-badge">POPULAR</div>' : ""}
        <h4 class="plan-name">${plan.name}</h4>
        <div class="plan-price">$${plan.price}<span>/month</span></div>
        <p class="plan-description">${plan.description}</p>
        <ul class="plan-features">
          ${features
            .map(
              (feature) => `
            <li><i class="fas fa-check"></i> ${feature}</li>
          `
            )
            .join("")}
        </ul>
        <button class="plan-btn" onclick="selectPlan('${plan.slug}', '${
        plan.name
      }', ${plan.price})">
          Choose ${plan.name}
        </button>
      </div>
    `;
    })
    .join("");
}

// Select plan (placeholder for payment integration)
function selectPlan(slug, name, price) {
  alert(
    `You selected the ${name} plan ($${price}/month).\n\nPayment integration coming soon! Contact support to upgrade your plan.`
  );
}

// Render API keys
function renderApiKeys(apiKeys) {
  const container = document.getElementById("apiKeysList");

  if (!apiKeys || apiKeys.length === 0) {
    container.innerHTML = "<p>No API keys found.</p>";
    return;
  }

  container.innerHTML = apiKeys
    .map(
      (key) => `
        <div class="api-key-item">
            <div class="api-key-header">
                <span class="api-key-name">${key.name || "API Key"}</span>
                <div class="api-key-controls">
                    <label class="toggle-switch">
                        <input
                            type="checkbox"
                            ${key.is_active ? "checked" : ""}
                            onchange="toggleApiKey(${key.id}, this.checked)"
                        />
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="api-key-status ${
                      key.is_active ? "active" : "inactive"
                    }">
                        ${key.is_active ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>
            <div class="api-key-value">
                <div class="api-key-text">${key.api_key}</div>
                <button class="btn-copy" onclick="copyToClipboard('${
                  key.api_key
                }')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <div class="api-key-meta">
                <i class="fas fa-clock"></i> Last used: ${
                  key.last_used_at
                    ? new Date(key.last_used_at).toLocaleString()
                    : "Never"
                }
            </div>
        </div>
    `
    )
    .join("");
}

// Toggle API key active/inactive
async function toggleApiKey(keyId, isActive) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/keys/${keyId}/toggle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: isActive }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification(
        `API key ${isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
      // Reload API keys to reflect changes
      loadApiKeys();
    } else {
      showNotification(data.message || "Failed to toggle API key", "error");
      // Reload to revert the toggle
      loadApiKeys();
    }
  } catch (error) {
    console.error("Error toggling API key:", error);
    showNotification("Failed to toggle API key", "error");
    // Reload to revert the toggle
    loadApiKeys();
  }
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification("API key copied to clipboard!", "success");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showNotification("Failed to copy API key", "error");
    });
}

// Switch main tabs
function switchTab(tabName) {
  // Update nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.tab === tabName) {
      link.classList.add("active");
    }
  });

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(tabName).classList.add("active");
}

// Switch generation tabs
function switchGenTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.genTab === tabName) {
      btn.classList.add("active");
    }
  });

  document.querySelectorAll(".gen-tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabName}-gen`).classList.add("active");
}

// Preview HTML in new tab
function previewHtml() {
  const html = document.getElementById("htmlContent").value;

  if (!html.trim()) {
    showNotification("Please enter HTML content to preview", "error");
    return;
  }

  // Open new window with HTML content
  const previewWindow = window.open("", "_blank");
  if (previewWindow) {
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  } else {
    showNotification("Please allow pop-ups to preview HTML", "error");
  }
}

// Generate PDF from HTML
async function generatePdfFromHtml(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("htmlSubmitBtn");
  const html = document.getElementById("htmlContent").value;
  const format = document.getElementById("htmlFormat").value;
  const printBackground = document.getElementById("htmlBackground").checked;

  await generatePdf(
    {
      html: html,
      options: {
        format: format,
        printBackground: printBackground,
      },
    },
    submitBtn,
    "html"
  );
}

// Generate PDF from URL
async function generatePdfFromUrl(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("urlSubmitBtn");
  const url = document.getElementById("urlContent").value;
  const format = document.getElementById("urlFormat").value;
  const printBackground = document.getElementById("urlBackground").checked;

  await generatePdf(
    {
      url: url,
      options: {
        format: format,
        printBackground: printBackground,
      },
    },
    submitBtn,
    "url"
  );
}

// Common PDF generation function
async function generatePdf(payload, button, type) {
  // Get first active API key
  if (!userData || !userData.api_keys || userData.api_keys.length === 0) {
    showAlert("No API key found. Please contact support.", "error", "genAlert");
    return;
  }

  const apiKey = userData.api_keys.find((k) => k.is_active)?.api_key;
  if (!apiKey) {
    showAlert("No active API key found.", "error", "genAlert");
    return;
  }

  button.disabled = true;
  button.textContent = "Generating PDF...";

  try {
    const endpoint =
      type === "html" ? "/api/pdf/generate" : "/api/pdf/generate-from-url";

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "PDF generation failed");
    }

    // Download PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showAlert("PDF generated successfully!", "success", "genAlert");

    // Reload dashboard data to update usage
    setTimeout(() => loadDashboardData(), 1000);
  } catch (error) {
    console.error("PDF generation error:", error);
    showAlert(error.message || "Failed to generate PDF", "error", "genAlert");
  } finally {
    button.disabled = false;
    button.textContent = "Generate PDF";
  }
}

// Generate AI Template
async function generateAITemplate(e) {
  e.preventDefault();

  const button = document.getElementById("aiSubmitBtn");
  const description = document.getElementById("aiDescription").value;
  const resultDiv = document.getElementById("aiResult");
  const generatedHtmlTextarea = document.getElementById("aiGeneratedHtml");

  try {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const response = await fetch(`${API_BASE_URL}/api/ai/generate-template`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresUpgrade) {
        showAlert(
          data.message + " Available on Professional and Business plans.",
          "error",
          "genAlert"
        );
      } else {
        throw new Error(data.message || "Failed to generate template");
      }
      return;
    }

    // Show the generated template
    generatedHtmlTextarea.value = data.html;
    resultDiv.style.display = "block";
    showAlert(data.message, "success", "genAlert");

    // Scroll to result
    resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    console.error("AI generation error:", error);
    showAlert(
      error.message || "Failed to generate template",
      "error",
      "genAlert"
    );
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-magic"></i> Generate Template with AI';
  }
}

// Preview AI Template
function previewAITemplate() {
  const html = document.getElementById("aiGeneratedHtml").value;
  const previewWindow = window.open("", "_blank");
  previewWindow.document.write(html);
  previewWindow.document.close();
}

// Copy AI Template
async function copyAITemplate() {
  const html = document.getElementById("aiGeneratedHtml").value;
  const button = document.getElementById("aiCopyBtn");

  try {
    await navigator.clipboard.writeText(html);
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      button.innerHTML = originalHtml;
    }, 2000);
  } catch (error) {
    showAlert("Failed to copy to clipboard", "error", "genAlert");
  }
}

// Use AI Template for PDF
function useAITemplateForPdf() {
  const html = document.getElementById("aiGeneratedHtml").value;

  // Switch to HTML tab
  switchGenTab("html");

  // Populate HTML content
  document.getElementById("htmlContent").value = html;

  // Scroll to the form
  document.getElementById("html-gen").scrollIntoView({ behavior: "smooth" });

  showAlert(
    "Template loaded! Click 'Generate PDF' to create your PDF.",
    "success",
    "genAlert"
  );
}

// Show alert
function showAlert(message, type, elementId) {
  const alert = document.getElementById(elementId);
  alert.textContent = message;
  alert.className = `alert ${type}`;
  alert.style.display = "block";

  setTimeout(() => {
    alert.style.display = "none";
  }, 5000);
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}
