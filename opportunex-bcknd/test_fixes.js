const http = require('http');

async function testFixes() {
  console.log("--- Starting Tests ---");
  
  // 1. Test CORS
  console.log("\n[1/4] Testing Backend CORS restrictions...");
  try {
    const corsRes = await fetch("http://localhost:5000/api/opportunity", {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://evil-hacker.com',
        'Access-Control-Request-Method': 'POST',
      }
    });
    console.log("CORS Status for unknown origin:", corsRes.status);
    console.log("CORS Headers for unknown origin:", corsRes.headers.get('access-control-allow-origin') || 'null');
    
    const validCorsRes = await fetch("http://localhost:5000/api/opportunity", {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
      }
    });
    console.log("CORS Status for valid origin:", validCorsRes.status);
    console.log("CORS Headers for valid origin:", validCorsRes.headers.get('access-control-allow-origin'));

  } catch(e) { console.error(e) }

  // 2. Test Socket.IO via HTTP Polling
  console.log("\n[2/4] Testing Socket.IO Endpoint...");
  try {
    const socketRes = await fetch("http://localhost:5000/socket.io/?EIO=4&transport=polling");
    const socketText = await socketRes.text();
    console.log("Socket.IO Handshake Status:", socketRes.status);
    console.log("Socket.IO Handshake response includes 'sid':", socketText.includes('sid'));
  } catch(e) { console.error(e) }

  // 3. Test Invalid POST Validation
  console.log("\n[3/4] Testing Validation (Invalid Empty POST)...");
  try {
    const invalidRes = await fetch("http://localhost:5000/api/opportunity", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const invalidJson = await invalidRes.json();
    console.log("Empty POST Status (expected 400 for no token, or validation error):", invalidRes.status);
    console.log("Empty POST Response:", invalidJson);
  } catch(e) { console.error(e) }

  // 4. Test Valid POST Validation
  console.log("\n[4/4] Testing Validation (Valid POST with fake body)...");
  try {
    const validBody = {
      title: "Software Engineer",
      description: "Looking for a great dev.",
      type: "Internship",
      deadline: "2030-01-01T00:00:00Z"
    };

    const validRes = await fetch("http://localhost:5000/api/opportunity", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody)
    });
    const validJson = await validRes.json();
    console.log("Valid POST Status:", validRes.status);
    console.log("Valid POST Response:", validJson); 

    // It should fail gracefully at "Access Denied" (403 or 401) because no token was passed, 
    // BUT the fact it doesn't return Joi validation error confirms schema is valid.
  } catch(e) { console.error(e) }

  console.log("\n--- Tests Completed ---");
}

testFixes();
