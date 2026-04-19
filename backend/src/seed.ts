import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/auth/user.model';
import Doctor from './modules/doctor/doctor.model';
import Specialization from './modules/specialization/specialization.model';
import Appointment from './modules/appointment/appointment.model';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/clinic-management";

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    
    console.log('Cleaning database...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Specialization.deleteMany({});
    await Appointment.deleteMany({});

    console.log('Creating Specializations...');
    const specs = await Specialization.create([
      { name: 'باطنة وجهاز هضمي', description: 'متخصص في علاج أمراض الباطنة والجهاز الهضمي' },
      { name: 'طب الأطفال', description: 'رعاية شاملة لصحة الطفل من الولادة وحتى المراهقة' },
      { name: 'أمراض جلدية وتجميل', description: 'علاج الأمراض الجلدية وأحدث تقنيات التجميل' },
      { name: 'جراحة العظام', description: 'علاج الكسور وإصابات الملاعب وجراحة المفاصل' },
      { name: 'أمراض القلب', description: 'تشخيص وعلاج أمراض القلب والأوعية الدموية' }
    ]);

    console.log('Creating Admin...');
    await User.create({
      fullName: 'أدمن النظام',
      email: 'admin@gamil.com',
      phone: '01000000001',
      password: 'atta',
      role: 'admin',
      gender: 'male'
    });

    console.log('Creating Receptionist and Patients...');
    await User.create({
      fullName: 'موظف الاستقبال',
      email: 'receptionist@gmail.com',
      phone: '01000000002',
      password: 'atta',
      role: 'receptionist',
      gender: 'female'
    });

    const p1 = await User.create({
      fullName: 'أحمد محمود',
      email: 'patient@gmail.com',
      phone: '01000000003',
      password: 'atta',
      role: 'patient',
      gender: 'male'
    });

    const p2 = await User.create({
      fullName: 'سارة علي',
      email: 'sara@gmail.com',
      phone: '01000000004',
      password: 'atta',
      role: 'patient',
      gender: 'female'
    });

    console.log('Creating Doctors...');
    const doctorData = [
      { name: 'د. محمد علي', spec: specs[0]?._id, email: 'dr.mohamed@gmail.com', phone: '01100000001', fee: 300 },
      { name: 'د. ليلى حسن', spec: specs[2]?._id, email: 'dr.layla@gmail.com', phone: '01100000003', fee: 400 }
    ];

    const createdDoctors = [];
    for (const d of doctorData) {
      if (!d.spec) continue;
      const user = await User.create({
        fullName: d.name,
        email: d.email,
        phone: d.phone,
        password: 'atta',
        role: 'doctor',
        gender: d.name.includes('ليلى') ? 'female' : 'male'
      });

      const doctor = await Doctor.create({
        userId: user._id,
        specializationId: d.spec,
        consultationFee: d.fee,
        followUpFee: d.fee / 2,
        availableDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '00:00',
        endTime: '23:59',
        slotDuration: 30
      });
      createdDoctors.push(doctor);
    }

    console.log('Creating Today Appointments for Stats...');
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Paid Appointment (will show in Revenue)
    if (createdDoctors[0]) {
      await Appointment.create({
        patientId: p1._id,
        doctorId: createdDoctors[0]._id,
        date: today,
        slotTime: '11:00 AM',
        status: 'confirmed',
        paymentStatus: 'paid',
        price: 300,
        appointmentType: 'consultation',
        queueNumber: 1,
        bookingCode: 'BK-101'
      });
    }

    // Pending Appointment (will show in New Bookings)
    if (createdDoctors[1]) {
      await Appointment.create({
        patientId: p2._id,
        doctorId: createdDoctors[1]._id,
        date: today,
        slotTime: '12:30 PM',
        status: 'pending',
        paymentStatus: 'unpaid',
        price: 400,
        appointmentType: 'consultation',
        queueNumber: 1,
        bookingCode: 'BK-102'
      });

      // Checked-in Appointment (will show in Arrival)
      await Appointment.create({
        patientId: p1._id,
        doctorId: createdDoctors[1]._id,
        date: today,
        slotTime: '02:00 PM',
        status: 'checked_in',
        paymentStatus: 'paid',
        price: 400,
        appointmentType: 'follow_up',
        queueNumber: 2,
        bookingCode: 'BK-103'
      });
    }

    console.log('Database Seeded with Today Appointments! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
