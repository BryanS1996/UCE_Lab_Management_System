// scripts/test-e2e.js
async function main() {
  const GATEWAY_URL = 'http://localhost:3000';

  console.log('🏁 Starting E2E verification test...\n');

  // 1. Register a student user
  const studentEmail = `student_${Date.now()}@uce.edu.ec`;
  const studentPayload = {
    email: studentEmail,
    firstName: 'Carlos',
    lastName: 'Perez',
    password: 'Password123!'
  };

  console.log(`👤 Registering student: ${studentEmail}...`);
  const regRes = await fetch(`${GATEWAY_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentPayload)
  });
  
  if (!regRes.ok) {
    console.error('❌ Registration failed:', await regRes.text());
    process.exit(1);
  }
  const regData = await regRes.json();
  console.log('✅ Student registered successfully.');

  // 2. Login as student
  console.log('🔑 Logging in as student...');
  const loginRes = await fetch(`${GATEWAY_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentPayload.email,
      password: studentPayload.password
    })
  });

  if (!loginRes.ok) {
    console.error('❌ Student login failed:', await loginRes.text());
    process.exit(1);
  }
  const loginData = await loginRes.json();
  const studentToken = loginData.accessToken;
  console.log('✅ Student logged in successfully. Token obtained.');

  // 3. Fetch laboratories
  console.log('🏫 Fetching available laboratories...');
  const labsRes = await fetch(`${GATEWAY_URL}/api/laboratories`);
  if (!labsRes.ok) {
    console.error('❌ Fetching laboratories failed:', await labsRes.text());
    process.exit(1);
  }
  const labs = await labsRes.json();
  console.log(`✅ Found ${labs.length} laboratories.`);
  if (labs.length === 0) {
    console.error('❌ No laboratories found in database to reserve.');
    process.exit(1);
  }
  const targetLab = labs[0];
  console.log(`👉 Target laboratory for booking: "${targetLab.name}" (ID: ${targetLab.lab_id})`);

  // 4. Create a reservation as student
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1 + Math.floor(Math.random() * 20));
  const dateString = tomorrow.toISOString().split('T')[0];
  const startTime = new Date(`${dateString}T09:00:00Z`).toISOString();
  const endTime = new Date(`${dateString}T11:00:00Z`).toISOString();

  console.log(`📅 Creating reservation for ${dateString} 09:00 - 11:00 UTC...`);
  const bookRes = await fetch(`${GATEWAY_URL}/api/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      lab_id: targetLab.lab_id,
      start_time: startTime,
      end_time: endTime,
      purpose: 'Clase de Redes de Computadoras',
      notes: 'Llevar routers y switches'
    })
  });

  if (!bookRes.ok) {
    console.error('❌ Reservation creation failed:', await bookRes.text());
    process.exit(1);
  }
  const reservation = await bookRes.json();
  console.log(`✅ Reservation created successfully. ID: ${reservation.reservation_id}, Status: ${reservation.status}`);

  // 5. Login as admin
  console.log('\n🔑 Logging in as administrator (admin@uce.edu.ec)...');
  const adminLoginRes = await fetch(`${GATEWAY_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@uce.edu.ec',
      password: 'Administr@dor123'
    })
  });

  if (!adminLoginRes.ok) {
    console.error('❌ Admin login failed:', await adminLoginRes.text());
    process.exit(1);
  }
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.accessToken;
  console.log('✅ Admin logged in successfully. Token obtained.');

  // 6. Fetch Admin Stats
  console.log('📊 Fetching admin dashboard stats...');
  const statsRes = await fetch(`${GATEWAY_URL}/api/reservations/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (!statsRes.ok) {
    console.error('❌ Fetching admin stats failed:', await statsRes.text());
    process.exit(1);
  }
  const stats = await statsRes.json();
  console.log('📊 Admin Stats Response:', JSON.stringify(stats, null, 2));

  // 7. Confirm the reservation
  console.log(`\n✅ Approving/confirming reservation (ID: ${reservation.reservation_id})...`);
  const confirmRes = await fetch(`${GATEWAY_URL}/api/reservations/${reservation.reservation_id}/confirm`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (!confirmRes.ok) {
    console.error('❌ Confirming reservation failed:', await confirmRes.text());
    process.exit(1);
  }
  const confirmedResData = await confirmRes.json();
  console.log(`✅ Reservation confirmed successfully. Status: ${confirmedResData.status}`);

  console.log('\n🎉 E2E verification test completed successfully!');
}

main().catch(console.error);
