/**
 * Test Script for API Key Management Endpoints
 * Tests: Generate, List, and Delete API Keys
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test_user_123'; // Replace with actual user ID for real testing

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_USER_ID}`,
      },
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 API Key Management Endpoint Tests\n');
  console.log('═'.repeat(60) + '\n');
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Test User ID: ${TEST_USER_ID}\n`);

  let generatedKeyId = null;

  try {
    // Test 1: Generate API Key
    console.log('📝 Test 1: Generate API Key');
    console.log('-'.repeat(60));
    const generatePayload = {
      name: 'Test API Key',
      description: 'Created for testing',
      tier: 'free',
      dailyLimit: 100,
    };

    console.log(`POST /api/user/api-keys/generate`);
    console.log(`Payload: ${JSON.stringify(generatePayload, null, 2)}`);

    const generateRes = await makeRequest(
      'POST',
      '/api/user/api-keys/generate',
      generatePayload
    );

    console.log(`\nStatus: ${generateRes.status}`);
    
    if (generateRes.status === 201) {
      console.log('✅ Key generated successfully');
      console.log(`Response:`);
      console.log(`  Key ID: ${generateRes.body.id}`);
      console.log(`  Key Prefix: ${generateRes.body.keyPrefix}`);
      console.log(`  Name: ${generateRes.body.name}`);
      console.log(`  Tier: ${generateRes.body.tier}`);
      console.log(`  Message: ${generateRes.body.message}`);
      generatedKeyId = generateRes.body.id;
    } else {
      console.log('❌ Failed to generate key');
      console.log(`Response: ${JSON.stringify(generateRes.body, null, 2)}`);
    }

    console.log('\n' + '═'.repeat(60) + '\n');

    // Test 2: List API Keys
    console.log('📋 Test 2: List API Keys');
    console.log('-'.repeat(60));
    console.log(`GET /api/user/api-keys`);

    const listRes = await makeRequest('GET', '/api/user/api-keys');

    console.log(`\nStatus: ${listRes.status}`);
    
    if (listRes.status === 200) {
      console.log('✅ Keys retrieved successfully');
      console.log(`Total keys: ${listRes.body.total}`);
      if (listRes.body.keys && listRes.body.keys.length > 0) {
        console.log(`\nKeys:`);
        listRes.body.keys.forEach((key, idx) => {
          console.log(`\n  Key ${idx + 1}:`);
          console.log(`    ID: ${key.id}`);
          console.log(`    Prefix: ${key.keyPrefix}`);
          console.log(`    Name: ${key.name}`);
          console.log(`    Tier: ${key.tier}`);
          console.log(`    Status: ${key.status}`);
          console.log(`    Requests: ${key.requestCount}`);
          console.log(`    Daily Limit: ${key.dailyLimit || 'N/A'}`);
        });
      } else {
        console.log('  (No keys yet)');
      }
    } else {
      console.log('❌ Failed to list keys');
      console.log(`Response: ${JSON.stringify(listRes.body, null, 2)}`);
    }

    console.log('\n' + '═'.repeat(60) + '\n');

    // Test 3: Delete API Key (only if we have a generated key)
    if (generatedKeyId) {
      console.log('🗑️  Test 3: Delete API Key');
      console.log('-'.repeat(60));
      console.log(`DELETE /api/user/api-keys/${generatedKeyId}`);

      const deleteRes = await makeRequest(
        'DELETE',
        `/api/user/api-keys/${generatedKeyId}`
      );

      console.log(`\nStatus: ${deleteRes.status}`);
      
      if (deleteRes.status === 200) {
        console.log('✅ Key revoked successfully');
        console.log(`Response: ${JSON.stringify(deleteRes.body, null, 2)}`);
      } else {
        console.log('❌ Failed to delete key');
        console.log(`Response: ${JSON.stringify(deleteRes.body, null, 2)}`);
      }

      console.log('\n' + '═'.repeat(60) + '\n');
    }

    // Summary
    console.log('📊 Test Summary\n');
    console.log('Tests completed. Check results above for details.\n');
    console.log('⚠️  Note: This script requires the dev server to be running.');
    console.log('    Start the dev server: npm run dev\n');
    console.log('ℹ️  For real testing, replace TEST_USER_ID with an actual Appwrite user ID.\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('  - Ensure dev server is running: npm run dev');
    console.error('  - Check API endpoint URLs above');
    console.error('  - Verify Appwrite collection exists');
    console.error('  - Check browser console for errors\n');
    process.exit(1);
  }
}

runTests();
