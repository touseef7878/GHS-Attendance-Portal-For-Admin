import { supabase } from './supabaseClient';

export const attendanceService = {

  // ── TEACHERS ──────────────────────────────────────────────

  fetchTeachers: async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  addTeacher: async ({ name, subject, phone }) => {
    const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const { data, error } = await supabase
      .from('teachers')
      .insert([{ name, subject, phone, avatar }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateTeacher: async (id, { name, subject, phone }) => {
    // Only send editable fields — never overwrite id / avatar / created_at
    const { data, error } = await supabase
      .from('teachers')
      .update({ name, subject, phone })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteTeacher: async (id) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── ATTENDANCE ────────────────────────────────────────────

  fetchAttendance: async (date) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('teacher_id, status')
      .eq('date', date);
    if (error) throw error;
    // { [teacher_id]: status }
    return Object.fromEntries((data ?? []).map(r => [r.teacher_id, r.status]));
  },

  saveAttendance: async (date, attendanceMap) => {
    const payload = Object.entries(attendanceMap).map(([teacher_id, status]) => ({
      teacher_id, date, status,
    }));
    const { data, error } = await supabase
      .from('attendance')
      .upsert(payload, { onConflict: 'teacher_id,date' })
      .select();
    if (error) throw error;
    return data;
  },

  // ── REPORTS ───────────────────────────────────────────────

  fetchAttendanceHistory: async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status, teacher_id, teachers(name)')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(r => ({
      teacherId:   r.teacher_id,
      teacherName: r.teachers?.name ?? 'Unknown',
      date:        r.date,
      status:      r.status,
    }));
  },

  // Returns last 6 school days attendance % for the dashboard trend chart
  fetchWeeklyTrend: async () => {
    const { data: teachers, error: te } = await supabase
      .from('teachers')
      .select('id');
    if (te) throw te;
    const total = teachers?.length ?? 0;
    if (total === 0) return [];

    // Get last 6 dates that have any attendance records
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .order('date', { ascending: false })
      .limit(total * 6); // enough rows to cover 6 days
    if (error) throw error;

    // Group by date
    const byDate = {};
    (data ?? []).forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === 'Present' || r.status === 'Late') byDate[r.date].present++;
    });

    const sorted = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    return sorted.map(([date, { present, total: t }]) => ({
      date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-PK', { weekday: 'short' }),
      pct: t > 0 ? Math.round((present / t) * 100) : 0,
    }));
  },

  // ── ATTENDANCE REQUESTS ───────────────────────────────────

  fetchRequests: async () => {
    const { data, error } = await supabase
      .from('attendance_requests')
      .select('*, teachers(name, subject, avatar)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(r => ({
      id:         r.id,
      teacherId:  r.teacher_id,
      name:       r.teachers?.name    ?? 'Unknown',
      subject:    r.teachers?.subject ?? '',
      avatar:     r.teachers?.avatar  ?? '??',
      date:       r.date,
      note:       r.note ?? '',
      status:     r.status,
      createdAt:  r.created_at,
      resolvedAt: r.resolved_at,
    }));
  },

  // Teacher submits a self-check-in request
  submitRequest: async (teacher_id, date, note = '') => {
    // Prevent duplicate pending request for same teacher+date
    const { data: existing } = await supabase
      .from('attendance_requests')
      .select('id')
      .eq('teacher_id', teacher_id)
      .eq('date', date)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) throw new Error('A pending request already exists for this date.');

    const { data, error } = await supabase
      .from('attendance_requests')
      .insert([{ teacher_id, date, note }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Principal approves → auto-marks attendance as Present
  approveRequest: async (requestId, teacherId, date) => {
    // 1. Mark attendance Present
    const { error: attErr } = await supabase
      .from('attendance')
      .upsert([{ teacher_id: teacherId, date, status: 'Present' }], { onConflict: 'teacher_id,date' });
    if (attErr) throw attErr;

    // 2. Update request status
    const { error: reqErr } = await supabase
      .from('attendance_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', requestId);
    if (reqErr) throw reqErr;
    return true;
  },

  // Principal rejects
  rejectRequest: async (requestId) => {
    const { error } = await supabase
      .from('attendance_requests')
      .update({ status: 'rejected', resolved_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) throw error;
    return true;
  },
};
