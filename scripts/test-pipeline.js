const fs = require('fs');
const path = require('path');

// Minimal PDF content
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 21 >>
stream
BT /F1 24 Tf 100 700 Td (Hello World) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000224 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
295
%%EOF`;

async function runTest() {
  const dummy1Path = path.join(__dirname, 'dummy1.pdf');
  const dummy2Path = path.join(__dirname, 'dummy2.pdf');

  fs.writeFileSync(dummy1Path, pdfContent);
  fs.writeFileSync(dummy2Path, pdfContent);

  console.log('Created dummy PDF files.');

  const formData = new FormData();
  const file1 = new Blob([fs.readFileSync(dummy1Path)], { type: 'application/pdf' });
  const file2 = new Blob([fs.readFileSync(dummy2Path)], { type: 'application/pdf' });

  formData.append('files', file1, 'dummy1.pdf');
  formData.append('files', file2, 'dummy2.pdf');

  // Define a simple pipeline: Merge -> Rotate
  const pipelineConfig = {
    outputOptions: {
      zip: false
    },
    operations: [
      {
        operation: 'rotate',
        parameters: { angle: 90 }
      }
    ]
  };

  const jsonBlob = new Blob([JSON.stringify(pipelineConfig)], { type: 'application/json' });
  formData.append('json', jsonBlob, 'config.json');

  console.log('Sending request to /api/pipeline...');

  try {
    const response = await fetch('http://localhost:3000/api/pipeline', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
    }

    const result = await response.json();
    console.log('Pipeline executed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Cleanup
    if (fs.existsSync(dummy1Path)) fs.unlinkSync(dummy1Path);
    if (fs.existsSync(dummy2Path)) fs.unlinkSync(dummy2Path);
  }
}

runTest();
