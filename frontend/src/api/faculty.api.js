import axios from 'axios';

export const getFacultyDashboard  = ()       => axios.get('/api/faculty/dashboard');
export const getPanelStudents      = ()       => axios.get('/api/faculty/students');
export const markAttendance        = (body)   => axios.post('/api/faculty/attendance', body);
export const getAttendanceForDate  = (date)   => axios.get('/api/faculty/attendance', { params: { date } });
export const getAttendanceDates    = ()       => axios.get('/api/faculty/attendance/dates');
