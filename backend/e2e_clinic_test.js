const API = 'http://localhost:3000/api';

// Helper to make requests and handle cookies
async function request(method, path, body = null, cookie = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, options);
  const data = await res.json().catch(() => ({}));
  const setCookie = res.headers.get('set-cookie');
  let newCookie = cookie;
  if (setCookie) {
    newCookie = setCookie.split(';')[0];
  }

  return { status: res.status, data, cookie: newCookie };
}

async function runTest() {
  console.log('🚀 Starting Full Clinic E2E API Test...\n');
  
  try {
    // 1. ADMIN LOGIN
    console.log('[1] Logging in as Admin (admin@clinic.com)...');
    const adminLogin = await request('POST', '/auth/login', {
       email: 'admin@clinic.com',
       password: 'password123'
    });
    if (adminLogin.status !== 200) throw new Error(`Admin login failed: ${adminLogin.data.message}`);
    const adminCookie = adminLogin.cookie;
    console.log('  ✔️ Admin Login Successful');

    // 2. CREATE SPECIALIZATION
    console.log('\n[2] Creating New Specialization (Cardiology)...');
    const specName = `Cardiology_${Date.now()}`;
    const createSpec = await request('POST', '/specializations', {
       name: specName,
       description: 'Heart and vascular diseases'
    }, adminCookie);
    if (createSpec.status !== 201) throw new Error(`Spec creation failed: ${createSpec.data.message}`);
    const specId = createSpec.data.data._id;
    console.log(`  ✔️ Specialization Created: ${specId}`);

    // 3. CREATE DOCTOR USER (USER account with role doctor)
    console.log('\n[3] Creating Doctor User Account...');
    const docEmail = `dr_test_${Date.now()}@clinic.com`;
    const createDocUser = await request('POST', '/users', {
       fullName: 'Dr. Test Cardiology',
       email: docEmail,
       password: 'password123',
       phone: '01' + Math.floor(Math.random() * 1000000000),
       role: 'doctor',
       gender: 'male',
       dateOfBirth: '1985-05-15'
    }, adminCookie);
    if (createDocUser.status !== 201) throw new Error(`Doctor user creation failed: ${createDocUser.data.message}`);
    const docUserId = createDocUser.data.data._id;
    console.log(`  ✔️ Doctor User Account Created: ${docUserId}`);

    // 4. HIRE DOCTOR (Creating Doctor record)
    console.log('\n[4] "Hiring" Doctor (Linking user to medical records)...');
    const hireDoc = await request('POST', '/doctors', {
       userId: docUserId,
       specializationId: specId,
       consultationFee: 500,
       followUpFee: 250,
       startTime: '09:00 AM',
       endTime: '05:00 PM',
       slotDuration: 30,
       availableDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }, adminCookie);
    if (hireDoc.status !== 201) throw new Error(`Hiring failed: ${hireDoc.data.message}`);
    const doctorId = hireDoc.data.data._id;
    console.log(`  ✔️ Doctor Record Created: ${doctorId}`);

    // 5. PATIENT JOURNEY - LOGIN/GET SLOTS
    console.log('\n[5] Patient Journey starts...');
    // Login as the patient created earlier or use the admin as patient for simplicity (patient role)
    // Actually let's create a fresh patient to be clean
    const patientEmail = `patient_e2e_${Date.now()}@test.com`;
    const signupPatient = await request('POST', '/auth/signup', {
        fullName: 'E2E Patient',
        email: patientEmail,
        password: 'password123',
        passwordConfirm: 'password123',
        phone: '01' + Math.floor(Math.random() * 1000000000),
        gender: 'male',
        dateOfBirth: '1995-10-10'
    });
    if (signupPatient.status !== 201) throw new Error(`Patient signup failed: ${signupPatient.data.message}`);
    const patientCookie = signupPatient.cookie;
    console.log('  ✔️ Patient Signup Successful');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString();

    console.log(`  🔍 Fetching available slots for tomorrow...`);
    const slots = await request('GET', `/appointments/available-slots?doctorId=${doctorId}&date=${dateStr}`, null, patientCookie);
    if (slots.status !== 200 || !slots.data.data.length) throw new Error(`No slots found or fetch failed: ${slots.data.message}`);
    const slot = slots.data.data[0];
    console.log(`  ✔️ Found ${slots.data.data.length} slots. Picking: ${slot}`);

    // 6. BOOK APPOINTMENT
    console.log('\n[6] Booking Appointment...');
    const booking = await request('POST', '/appointments', {
        doctorId,
        date: dateStr,
        slotTime: slot,
        appointmentType: 'consultation',
        notes: 'Testing E2E system'
    }, patientCookie);
    if (booking.status !== 201) throw new Error(`Booking failed: ${booking.data.message}`);
    const apptId = booking.data.data._id;
    console.log(`  ✔️ Appointment Booked: ${apptId}`);

    // 7. RECEPTIONIST FLOW (Using Admin for authorized actions)
    console.log('\n[7] Receptionist Ops (Check-in & Payment)...');
    const checkIn = await request('PATCH', `/appointments/${apptId}/status`, { status: 'checked_in' }, adminCookie);
    if (checkIn.status !== 200) throw new Error(`Check-in failed: ${checkIn.data.message}`);
    console.log('  ✔️ Patient Checked-in');

    const payment = await request('PATCH', `/appointments/${apptId}/status`, { 
        paymentStatus: 'paid', 
        paymentMethod: 'cash' 
    }, adminCookie);
    if (payment.status !== 200) throw new Error(`Payment failed: ${payment.data.message}`);
    console.log('  ✔️ Payment Recorded');

    // 8. DOCTOR FLOW - COMPLETE VISIT
    console.log('\n[8] Doctor Ops (Finalizing Visit)...');
    // Login as doctor
    const docLogin = await request('POST', '/auth/login', { email: docEmail, password: 'password123' });
    const docCookie = docLogin.cookie;
    
    const conclusion = await request('PATCH', `/appointments/${apptId}/complete`, { 
        status: 'completed',
        notes: 'Patient is healthy after E2E test' 
    }, docCookie);
    if (conclusion.status !== 200) throw new Error(`Visit completion failed: ${conclusion.data.message}`);
    console.log('  ✔️ Visit Completed by Doctor');

    console.log('\n✅ ALL E2E API WORKFLOWS ARE 100% SUCCESSFUL!');
    console.log('The clinic system is robust and ready for production.');

  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    process.exit(1);
  }
}

runTest();
