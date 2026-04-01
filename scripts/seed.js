// Run with: node scripts/seed.js
// Seeds 50 teachers and attendance for today (20 Present, 20 Absent, 10 Late)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vmmmvjbctdqhxtlqieaa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hzKEf0zJCAkudf4Dv6a0WA_HeBwhd4C';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Urdu', 'Islamiat', 'Pakistan Studies', 'Computer Science', 'Geography',
  'History', 'Civics', 'Economics', 'Arabic', 'Physical Education',
];

const FIRST = [
  'Muhammad', 'Ahmed', 'Ali', 'Hassan', 'Usman', 'Bilal', 'Tariq', 'Imran', 'Zubair', 'Faisal',
  'Alina', 'Zainab', 'Saima', 'Nadia', 'Hina', 'Sana', 'Rabia', 'Fatima', 'Ayesha', 'Maryam',
  'Kamran', 'Shahid', 'Naveed', 'Waqas', 'Asad', 'Rizwan', 'Junaid', 'Hamid', 'Khalid', 'Sajid',
];

const LAST = [
  'Khan', 'Ahmed', 'Ali', 'Hussain', 'Malik', 'Qureshi', 'Akhtar', 'Butt', 'Chaudhry', 'Sheikh',
  'Noor', 'Tariq', 'Iqbal', 'Raza', 'Baig', 'Mirza', 'Siddiqui', 'Ansari', 'Abbasi', 'Javed',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function phone() { return `+92 3${Math.floor(Math.random()*9+1)}0 ${Math.floor(1000000+Math.random()*9000000)}`; }

async function seed() {
  console.log('🌱 Seeding 50 teachers...');

  // Build unique teacher list
  const teachers = [];
  const usedNames = new Set();
  while (teachers.length < 50) {
    const first = pick(FIRST);
    const last  = pick(LAST);
    const name  = `${first} ${last}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    const avatar = (first[0] + last[0]).toUpperCase();
    teachers.push({ name, subject: pick(SUBJECTS), phone: phone(), avatar });
  }

  const { data: inserted, error: tErr } = await supabase
    .from('teachers')
    .insert(teachers)
    .select('id');

  if (tErr) { console.error('❌ Teachers insert failed:', tErr.message); process.exit(1); }
  console.log(`✅ Inserted ${inserted.length} teachers`);

  // Build attendance for today
  const today = new Date().toISOString().split('T')[0];
  const statuses = [
    ...Array(20).fill('Present'),
    ...Array(20).fill('Absent'),
    ...Array(10).fill('Late'),
  ];

  const attendance = inserted.map((t, i) => ({
    teacher_id: t.id,
    date: today,
    status: statuses[i],
  }));

  const { error: aErr } = await supabase.from('attendance').insert(attendance);
  if (aErr) { console.error('❌ Attendance insert failed:', aErr.message); process.exit(1); }
  console.log(`✅ Inserted attendance: 20 Present, 20 Absent, 10 Late for ${today}`);
  console.log('🎉 Done! Refresh your dashboard.');
}

seed();
