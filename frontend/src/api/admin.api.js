import axios from 'axios';

export const getStats       = ()           => axios.get('/api/admin/stats');
export const getFacultyList = (params)     => axios.get('/api/admin/faculty', { params });
export const getStudentList = (params)     => axios.get('/api/admin/students', { params });
export const getHierarchy   = ()           => axios.get('/api/admin/hierarchy');
export const getPanels      = ()           => axios.get('/api/admin/panels');

export const createHierarchyNode = (body) => axios.post('/api/admin/hierarchy', body);

export const uploadFacultySheet  = (file)  => {
  const form = new FormData();
  form.append('file', file);
  return axios.post('/api/admin/upload/faculty', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadStudentSheet  = (file)  => {
  const form = new FormData();
  form.append('file', file);
  return axios.post('/api/admin/upload/students', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
