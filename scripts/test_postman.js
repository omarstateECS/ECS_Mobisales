const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('Testing API endpoints...\n');

    // Test 1: GET all salesmen
    console.log('1. Testing GET /api/salesmen');
    const salesmenResponse = await axios.get('http://localhost:3000/api/salesmen');
    console.log('✅ Success - Found', salesmenResponse.data.length, 'salesmen\n');

    // Test 2: GET all authorities
    console.log('2. Testing GET /api/authorities');
    const authoritiesResponse = await axios.get('http://localhost:3000/api/authorities');
    console.log('✅ Success - Found', authoritiesResponse.data.data.length, 'authorities\n');

    // Test 3: GET a specific salesman
    if (salesmenResponse.data.length > 0) {
      const salesmanId = salesmenResponse.data[0].id;
      console.log(`3. Testing GET /api/salesmen/${salesmanId}`);
      const salesmanResponse = await axios.get(`http://localhost:3000/api/salesmen/${salesmanId}`);
      console.log('✅ Success - Retrieved salesman:', salesmanResponse.data.name, '\n');
    }

    // Test 4: POST - Create a new salesman (with proper JSON)
    console.log('4. Testing POST /api/salesmen');
    const newSalesmanData = {
      "name": "Test Salesman",
      "phone": "9999999999",
      "address": "Test Address",
      "status": "ACTIVE",
      "password": "testpass123",
      "deviceId": "TESTDEVICE123"
    };
    
    const createResponse = await axios.post('http://localhost:3000/api/salesmen', newSalesmanData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Success - Created salesman:', createResponse.data.name, '\n');

    // Test 5: PUT - Update the salesman
    console.log('5. Testing PUT /api/salesmen');
    const updateData = {
      "name": "Updated Test Salesman",
      "phone": "8888888888",
      "address": "Updated Test Address",
      "status": "INACTIVE",
      "password": "updatedpass123",
      "deviceId": "UPDATEDDEVICE123"
    };
    
    const updateResponse = await axios.put(`http://localhost:3000/api/salesmen/${createResponse.data.id}`, updateData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Success - Updated salesman:', updateResponse.data.name, '\n');

    // Test 6: DELETE - Delete the test salesman
    console.log('6. Testing DELETE /api/salesmen');
    const deleteResponse = await axios.delete(`http://localhost:3000/api/salesmen/${createResponse.data.id}`);
    console.log('✅ Success - Deleted test salesman\n');

    console.log('🎉 All tests passed! The API is working correctly.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testEndpoints();
