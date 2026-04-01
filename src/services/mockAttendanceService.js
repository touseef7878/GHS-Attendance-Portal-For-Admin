import { mockTeachers, mockAttendance } from '../mockData';

let teachersInDB = [...mockTeachers];
let attendanceDB = { ...mockAttendance };

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const attendanceService = {
  // --- Teachers ---
  fetchTeachers: async () => {
    await delay(500);
    return [...teachersInDB];
  },

  addTeacher: async (teacherData) => {
    await delay(500);
    const newTeacher = {
      ...teacherData,
      id: Math.random().toString(36).substr(2, 9),
      avatar: teacherData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };
    teachersInDB.push(newTeacher);
    return newTeacher;
  },

  updateTeacher: async (id, teacherData) => {
    await delay(500);
    const idx = teachersInDB.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Teacher not found');
    
    teachersInDB[idx] = { ...teachersInDB[idx], ...teacherData };
    return teachersInDB[idx];
  },

  deleteTeacher: async (id) => {
    await delay(500);
    teachersInDB = teachersInDB.filter((t) => t.id !== id);
    return true;
  },

  // --- Attendance ---
  fetchAttendance: async (date) => {
    await delay(500);
    // Returns { [teacherId]: status }
    return attendanceDB[date] || {};
  },

  saveAttendance: async (date, attendanceData) => {
    await delay(500);
    // TODO: Replace with actual Supabase payload later
    // payload shape expected for DB: [{teacher_id, date, status}, ...]
    attendanceDB[date] = { ...attendanceData };
    return attendanceDB[date];
  },

  // --- Reports ---
  fetchAttendanceHistory: async () => {
    await delay(500);
    const history = [];
    
    // Convert attendance map back to list for reports
    for (const [date, records] of Object.entries(attendanceDB)) {
      for (const [teacherId, status] of Object.entries(records)) {
        const teacher = teachersInDB.find(t => t.id === teacherId);
        if (teacher) {
          history.push({ teacherId, teacherName: teacher.name, date, status });
        }
      }
    }
    
    return history;
  }
};
