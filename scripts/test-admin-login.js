const fetch = require('node-fetch');

async function testAdminLogin() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Admin Login Process...\n');

  try {
    // Step 1: Test admin login
    console.log('1. 🔐 Testing admin login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@megatienda.com',
        password: '5sadsFSAEjL562213**'
      })
    });

    console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(loginResponse.headers.entries()));

    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      console.log(`   ❌ Login failed: ${errorData}`);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('   ✅ Login successful:', loginData.message);
    
    // Check for cookies in response headers
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('   🍪 Set-Cookie header:', setCookieHeader ? 'Present' : 'Missing');
    
    if (setCookieHeader) {
      console.log('   📋 Cookie details:');
      const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
      cookies.forEach(cookie => {
        console.log(`      ${cookie}`);
      });
    }

    // Step 2: Test admin status with cookies
    console.log('\n2. 🔍 Testing admin status...');
    const statusResponse = await fetch(`${baseUrl}/api/auth/admin/status`, {
      headers: {
        'Cookie': setCookieHeader || ''
      }
    });

    console.log(`   Status: ${statusResponse.status} ${statusResponse.statusText}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('   ✅ Admin status:', statusData);
    } else {
      const errorData = await statusResponse.text();
      console.log(`   ❌ Status check failed: ${errorData}`);
    }

    // Step 3: Test pending orders count with cookies
    console.log('\n3. 📊 Testing pending orders count...');
    const ordersResponse = await fetch(`${baseUrl}/api/admin/orders/pending-count`, {
      headers: {
        'Cookie': setCookieHeader || ''
      }
    });

    console.log(`   Status: ${ordersResponse.status} ${ordersResponse.statusText}`);
    
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('   ✅ Pending orders count:', ordersData);
    } else {
      const errorData = await ordersResponse.text();
      console.log(`   ❌ Pending orders failed: ${errorData}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminLogin();
