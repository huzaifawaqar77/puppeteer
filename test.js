const fs = require("fs");
const path = require("path");

// --- CRITICAL: UPDATE THESE CONSTANTS ---
const API_URL = "https://puppeteer.uiflexer.com/api/v1/generate";
// Replace this with the final, correct API Key from your Coolify environment
const API_KEY = "1234LKJADLKFJAJKSD12312321SDAKJFKALSDJFL&&ADJLSF^";

// --- ADVANCED PATIENT REPORT HTML/CSS TEMPLATE ---
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Patient Medical Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        /* Base Styles for Report */
        body {
            font-family: 'Roboto', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
            /* Padding/Margin is controlled via Puppeteer options */
            margin: 0;
            padding: 1.5cm;
        }

        h1, h2, h3 {
            font-family: 'Merriweather', serif;
            color: #1a4567; /* Dark Blue for professionalism */
            margin-top: 20px;
        }
        h1 { font-size: 18pt; border-bottom: 3px solid #e0e7f2; padding-bottom: 5px; }
        h2 { font-size: 14pt; border-left: 5px solid #1a4567; padding-left: 10px; margin-bottom: 15px; }
        h3 { font-size: 12pt; color: #3c7fb7; }

        /* Complex Layout - Demographics and Vitals */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .logo {
            font-family: 'Merriweather', serif;
            font-size: 24pt;
            color: #1a4567;
            font-weight: 700;
        }
        .demographics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 30px;
            padding: 15px;
            background-color: #f7f9fc;
            border-radius: 6px;
            border: 1px solid #e0e7f2;
        }
        .demographics div strong {
            display: inline-block;
            width: 100px; /* Align labels */
            color: #555;
        }

        /* Vitals Card Layout */
        .vitals-grid {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 25px;
        }
        .vitals-card {
            flex: 1;
            text-align: center;
            padding: 15px 10px;
            background-color: #e6f7ff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #cceeff;
        }
        .vitals-card span {
            display: block;
            font-size: 16pt;
            font-weight: 700;
            color: #007bb6;
        }
        .vitals-card small {
            color: #555;
            text-transform: uppercase;
            font-size: 8pt;
        }

        /* Lab Results Table */
        .lab-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .lab-table th, .lab-table td {
            border: 1px solid #e0e7f2;
            padding: 8px 12px;
            text-align: left;
        }
        .lab-table th {
            background-color: #1a4567;
            color: white;
            font-weight: 400;
            font-size: 9pt;
            text-transform: uppercase;
        }
        .lab-table tr.critical td {
            background-color: #ffeaea;
            color: #cc0000;
            font-weight: 700;
        }
        .lab-table .range {
            font-style: italic;
            color: #777;
        }

        /* Print-Specific Styles (For Page Breaks) */
        @media print {
            .section-break {
                page-break-before: always;
            }
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>

    <div class="report-header">
        <div class="logo">MEDICARE REPORTS</div>
        <div>
            Report ID: MR-8392-A<br>
            Date: ${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </div>
    </div>

    <h1>Patient Medical Report</h1>

    <!-- 1. DEMOGRAPHICS -->
    <h2>Patient Information</h2>
    <div class="demographics">
        <div><strong>Name:</strong> John A. Smith</div>
        <div><strong>DOB:</strong> 1985-04-12</div>
        <div><strong>Patient ID:</strong> P-987654</div>
        <div><strong>Age:</strong> 40</div>
        <div><strong>Gender:</strong> Male</div>
        <div><strong>Primary Physician:</strong> Dr. Elara Vance</div>
        <div><strong>Admission:</strong> 2025-11-10</div>
        <div><strong>Discharge:</strong> N/A (Current)</div>
    </div>

    <!-- 2. VITALS -->
    <h2>Vitals at Examination</h2>
    <div class="vitals-grid">
        <div class="vitals-card">
            <span>120/80</span>
            <small>Blood Pressure (mmHg)</small>
        </div>
        <div class="vitals-card">
            <span>98.6°F</span>
            <small>Temperature</small>
        </div>
        <div class="vitals-card">
            <span>72</span>
            <small>Heart Rate (bpm)</small>
        </div>
        <div class="vitals-card">
            <span>98%</span>
            <small>O₂ Saturation</small>
        </div>
    </div>

    <!-- 3. DIAGNOSIS AND PLAN -->
    <div class="section-break"></div> <!-- Force Page Break if content is long -->
    <h2>Diagnosis & Treatment Plan</h2>
    
    <h3>Primary Diagnosis (ICD-10: I21.0)</h3>
    <p>Acute myocardial infarction of anterior wall. Patient presented with severe chest pain radiating to the left arm and jaw.</p>

    <h3>Treatment Plan</h3>
    <ul>
        <li>Immediate cardiology consult and catheterization.</li>
        <li>Medication: Aspirin, Clopidogrel, Beta-Blockers, and Statins initiated.</li>
        <li>Lifestyle modification counseling upon discharge.</li>
        <li>Follow-up appointment scheduled for 4 weeks post-discharge.</li>
    </ul>

    <!-- 4. LAB RESULTS TABLE -->
    <h2>Detailed Laboratory Results</h2>
    <table class="lab-table">
        <thead>
            <tr>
                <th>Test</th>
                <th>Result</th>
                <th>Units</th>
                <th>Reference Range</th>
                <th>Interpretation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Creatinine</td>
                <td>0.9</td>
                <td>mg/dL</td>
                <td class="range">0.6 - 1.3</td>
                <td>Normal</td>
            </tr>
            <tr class="critical">
                <td>Troponin I</td>
                <td>5.8</td>
                <td>ng/mL</td>
                <td class="range">&lt; 0.04</td>
                <td>**Critical Elevation**</td>
            </tr>
            <tr>
                <td>Total Cholesterol</td>
                <td>215</td>
                <td>mg/dL</td>
                <td class="range">&lt; 200</td>
                <td>High</td>
            </tr>
            <tr>
                <td>Glucose (Fasting)</td>
                <td>92</td>
                <td>mg/dL</td>
                <td class="range">70 - 99</td>
                <td>Normal</td>
            </tr>
        </tbody>
    </table>

    <!-- 5. DOCTOR SIGNATURE -->
    <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10pt;">
        <p>Report generated by the automated health system under the supervision of the attending physician.</p>
        <p style="margin-top: 40px; border-top: 1px solid #333; width: 300px; padding-top: 5px;">
            **Dr. Elara Vance, MD** (License #MD76543)
        </p>
    </div>
</body>
</html>
`;

/**
 * Calls the deployed Puppeteer API with the advanced HTML content and saves the result locally.
 * @param {string} htmlContent - The advanced HTML string to be converted.
 */
async function getPdfFromMyApi(htmlContent) {
  console.log("🚀 Attempting to generate Advanced Patient Report PDF...");

  // PDF options to control size, margins, and add page numbers
  const pdfOptions = {
    format: "A4", // Set to A4 size (or use 'Letter')
    margin: {
      top: "1.5cm",
      right: "1.5cm",
      bottom: "1.5cm",
      left: "1.5cm",
    },
    // Adding header/footer for page numbering
    displayHeaderFooter: true,
    footerTemplate:
      '<div style="font-size: 8pt; margin: 0 1cm; width: 100%; text-align: right; color: #555;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    printBackground: true, // Ensure colors and backgrounds print correctly
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      // Pass the HTML content and the new PDF options in the body
      body: JSON.stringify({ html: htmlContent, options: pdfOptions }),
    });

    // Check for non-200 responses
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "No detailed error message" }));
      throw new Error(
        `API Error: ${response.status} ${
          response.statusText
        }. Details: ${JSON.stringify(errorData)}`
      );
    }

    // 1. Get the raw binary data as an ArrayBuffer (standard fetch method)
    const arrayBuffer = await response.arrayBuffer();

    // 2. Convert the ArrayBuffer to a Node.js Buffer for filesystem operations
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Define the output file path
    const outputPath = path.join(__dirname, "Patient_Report.pdf");

    // Write the buffer to a file
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`\n✅ Success!`);
    console.log(`File saved to: ${outputPath}`);
    console.log(`Size: ${pdfBuffer.length} bytes`);
    console.log(`PDF Generated with A4 format and 1.5cm margins.`);
  } catch (error) {
    console.error("\n❌ Failed to generate PDF:", error.message);
    console.log("Please check your API_KEY and ensure your server is running.");
  }
}

getPdfFromMyApi(htmlContent);
