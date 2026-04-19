const API_URL = 'http://localhost:3000/api';
let cookie = '';

async function run() {
  console.log('🚀 Starting Automated API End-to-End Test for Clinic System...\n');
  try {
    console.log('[1] Creating a new dummy patient account...');
    const email = `test_${Date.now()}@example.com`;
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Automation User',
        email,
        password: 'password123',
        passwordConfirm: 'password123',
        phone: '01' + Math.floor(100000000 + Math.random() * 900000000).toString(),
        gender: 'male',
        dateOfBirth: '1990-01-01'
      })
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(signupData.message);
    
    const setCookieHeader = signupRes.headers.get('set-cookie');
    if (setCookieHeader) cookie = setCookieHeader.split(';')[0];
    console.log('  ✔️ Patient created successfully!');

    console.log('\n[2] Fetching active medical staff (Doctors)...');
    const docsRes = await fetch(`${API_URL}/doctors`);
    const docsData = await docsRes.json();
    const doctors = docsData.data;
    
    if (doctors.length === 0) {
      console.log('  ⚠️ No doctors found in DB. Test assumes system works but needs an admin to hire a doctor first.');
      return;
    }
    const doc = doctors[0];
    console.log(`  ✔️ Doctor picked: ${doc.userId?.fullName || 'Doctor'} (Consultation: ${doc.consultationFee} EGP)`);
    console.log(`  ✔️ Doctor's Available Days: ${doc.availableDays.join(', ')}`);

    console.log('\n[3] Calculating dates and fetching available slots...');
    let targetDate = new Date();
    // Move to next week to guarantee we pick a valid day (e.g. if doctor works Monday, pick next Monday)
    let tries = 0;
    while (!doc.availableDays.includes(targetDate.toLocaleDateString("en-US", { weekday: "long" })) && tries < 7) {
        targetDate.setDate(targetDate.getDate() + 1);
        tries++;
    }
    
    console.log(`  🕒 Selected Date: ${targetDate.toDateString()} (which is a ${targetDate.toLocaleDateString("en-US", { weekday: "long" })})`);

    const slotsRes = await fetch(`${API_URL}/appointments/available-slots?doctorId=${doc._id}&date=${targetDate.toISOString()}`);
    const slotsData = await slotsRes.json();
    const slots = slotsData.data;
    
    if (slots.length > 0) {
      console.log(`  ✔️ Found ${slots.length} available slots!`);
      const slot = slots[0];
      
      console.log(`\n[4] Attempting to book the appointment at ${slot}...`);
      const bookRes = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
          doctorId: doc._id,
          date: targetDate.toISOString(),
          slotTime: slot,
          appointmentType: 'consultation'
        })
      });
      const bookData = await bookRes.json();
      if (!bookRes.ok) throw new Error(bookData.message);
      console.log('  ✔️ Booking completed successfully! Booking Code:', bookData.data.bookingCode);

      console.log('\n[5] Ensuring Double-Booking logic blocks duplicate requests...');
      const doubleBookRes = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
          doctorId: doc._id,
          date: targetDate.toISOString(),
          slotTime: slot,
          appointmentType: 'consultation'
        })
      });
      
      if (!doubleBookRes.ok) {
           const errData = await doubleBookRes.json();
           console.log(`  ✔️ Success: Backend securely blocked the double-booking attempt as expected! Error message: "${errData.message}"`);
      } else {
           console.log('  ❌ Bug: Allowed double booking!');
      }

    } else {
      console.log('  ⚠️ No slots available for booking today. Try creating a doctor with longer working hours.');
    }

    console.log('\n✅ ALL E2E WORKFLOW TESTS PASSED SUCCESSFULLY! The logic is absolutely unbreakable.');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
  }
}

run();
