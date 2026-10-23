const DB_KEY = 'medicore_pro_db';

function createEmptyDB() {
  return {
    patients: [],
    doctors: [],
    visits: [],
    tests: [],
    billing: []
  };
}

function loadDB() {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (!data) return createEmptyDB();

    const parsed = JSON.parse(data);

    return {
      patients: Array.isArray(parsed.patients) ? parsed.patients : [],
      doctors: Array.isArray(parsed.doctors) ? parsed.doctors : [],
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      tests: Array.isArray(parsed.tests) ? parsed.tests : [],
      billing: Array.isArray(parsed.billing)
        ? parsed.billing
        : (Array.isArray(parsed.payments) ? parsed.payments : [])
    };
  } catch (error) {
    console.error('Error loading DB:', error);
    return createEmptyDB();
  }
}

function saveDB(db) {
  try {
    const normalizedDB = {
      patients: Array.isArray(db.patients) ? db.patients : [],
      doctors: Array.isArray(db.doctors) ? db.doctors : [],
      visits: Array.isArray(db.visits) ? db.visits : [],
      tests: Array.isArray(db.tests) ? db.tests : [],
      billing: Array.isArray(db.billing) ? db.billing : []
    };

    localStorage.setItem(DB_KEY, JSON.stringify(normalizedDB));
    return true;
  } catch (error) {
    console.error('Error saving DB:', error);
    return false;
  }
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateSampleData() {
  const existingDB = loadDB();

  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert',
    'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
  ];

  const conditions = [
    'Hypertension',
    'Type 2 Diabetes',
    'Asthma',
    'Routine Checkup',
    'Acute Bronchitis',
    'Migraine',
    'Back Pain',
    'Gastroenteritis',
    'Allergic Rhinitis',
    'Anxiety'
  ];

  const defaultDoctors = [
    {
      id: 'DOC-101',
      name: 'Dr. Sarah Jenkins',
      dept: 'Cardiology',
      department: 'Cardiology',
      email: 's.jenkins@medicore.com'
    },
    {
      id: 'DOC-102',
      name: 'Dr. Robert Chen',
      dept: 'Neurology',
      department: 'Neurology',
      email: 'r.chen@medicore.com'
    },
    {
      id: 'DOC-103',
      name: 'Dr. Emily Carter',
      dept: 'Pediatrics',
      department: 'Pediatrics',
      email: 'e.carter@medicore.com'
    },
    {
      id: 'DOC-104',
      name: 'Dr. Marcus Vance',
      dept: 'Orthopedics',
      department: 'Orthopedics',
      email: 'm.vance@medicore.com'
    },
    {
      id: 'DOC-105',
      name: 'Dr. Anita Patel',
      dept: 'General Medicine',
      department: 'General Medicine',
      email: 'a.patel@medicore.com'
    }
  ];

  const doctors = existingDB.doctors.length > 0
    ? existingDB.doctors
    : defaultDoctors;

  // Generate unique patient IDs without overwriting existing patients.
  const existingPatientIds = new Set(
    existingDB.patients.map(patient => String(patient.id))
  );

  let nextPatientNumber = 1000;

  existingPatientIds.forEach(id => {
    const match = id.match(/^PAT-(\d+)$/);

    if (match) {
      nextPatientNumber = Math.max(
        nextPatientNumber,
        Number(match[1])
      );
    }
  });

  function generatePatientId() {
    let id;

    do {
      nextPatientNumber++;
      id = `PAT-${nextPatientNumber}`;
    } while (existingPatientIds.has(id));

    existingPatientIds.add(id);
    return id;
  }

  const newPatients = [];

  // Exactly 50 new random patients per button click.
  for (let i = 0; i < 50; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);

    newPatients.push({
      id: generatePatientId(),
      name: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 60) + 18,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      phone: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      condition: randomItem(conditions)
    });
  }

  // Preserve all existing records and append the new patients.
  const patients = [...existingDB.patients, ...newPatients];
  const visits = [...existingDB.visits];
  const tests = [...existingDB.tests];
  const billing = [...existingDB.billing];

  const testTypes = [
    'Complete Blood Count (CBC)',
    'Lipid Panel',
    'Chest X-Ray',
    'MRI Brain',
    'Blood Glucose Test',
    'ECG'
  ];

  const paymentMethods = [
    'Card',
    'Cash',
    'Insurance',
    'Bank Transfer'
  ];

  // Generate a visit, test, and bill for each new patient.
  newPatients.forEach((patient, index) => {
    const day = (index % 28) + 1;
    const date = formatDate(2026, 3, day);
    const doctor = randomItem(doctors);
    const paymentMethod = randomItem(paymentMethods);

    visits.push({
      id: `VST-${String(day).padStart(2, '0')}-${visits.length + 1}`,
      date,
      visitDate: date,
      patient: patient.name,
      patientName: patient.name,
      patientId: patient.id,
      doctor: doctor.name,
      doctorName: doctor.name,
      doctorId: doctor.id,
      reason: patient.condition,
      diagnosis: patient.condition,
      status: 'Completed'
    });

    tests.push({
      id: `TST-${String(day).padStart(2, '0')}-${tests.length + 1}`,
      date,
      patient: patient.name,
      patientName: patient.name,
      patientId: patient.id,
      testName: randomItem(testTypes),
      result: 'Normal / Negative'
    });

    billing.push({
      id: `INV-${String(day).padStart(2, '0')}-${billing.length + 1}`,
      date,
      paymentDate: date,
      patient: patient.name,
      patientName: patient.name,
      patientId: patient.id,
      description: patient.condition,
      service: 'Hospital consultation',
      method: paymentMethod,
      paymentMethod: paymentMethod,
      amount: 200,
      total: 200,
      status: 'Paid'
    });
  });

  const finalDB = {
    patients,
    doctors,
    visits,
    tests,
    billing
  };

  if (saveDB(finalDB)) {
    alert(`Success! Total patients now: ${patients.length}`);
    window.location.reload();
  } else {
    alert('Error saving sample data. Please check the browser storage.');
  }
}

function clearMediCoreData() {
  if (confirm('Clear all data?')) {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
}