import axios from 'axios';

export const getStudentDashboard = ()       => axios.get('/api/student/dashboard');
export const getStudentAttendance = (params) => axios.get('/api/student/attendance', { params });
