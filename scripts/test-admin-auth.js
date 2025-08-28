const fetch = require('node-fetch');

async function testAdminAuth() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Admin Authentication...\n');

  try {
    // Step 1: Test admin login
    console.log('1. Testing admin login...');
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

    if (!loginResponse.ok) {
      console.log(`❌ Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
      const errorData = await loginResponse.text();
      console.log('Error details:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.message);
    
    // Get cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');

    // Step 2: Test admin status
    console.log('\n2. Testing admin status...');
    const statusResponse = await fetch(`${baseUrl}/api/auth/admin/status`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Admin status:', statusData);
    } else {
      console.log(`❌ Status check failed: ${statusResponse.status}`);
    }

    // Step 3: Test pending orders count
    console.log('\n3. Testing pending orders count...');
    const ordersResponse = await fetch(`${baseUrl}/api/admin/orders/pending-count`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ Pending orders count:', ordersData);
    } else {
      console.log(`❌ Pending orders failed: ${ordersResponse.status} ${ordersResponse.statusText}`);
      const errorData = await ordersResponse.text();
      console.log('Error details:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAuth();
