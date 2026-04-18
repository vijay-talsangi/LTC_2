import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login             from './pages/Login';
import AdminDashboard    from './pages/admin/AdminDashboard';
import UploadSheet       from './pages/admin/UploadSheet';
import ManageHierarchy   from './pages/admin/ManageHierarchy';
import FacultyList       from './pages/admin/FacultyList';
import StudentList       from './pages/admin/StudentList';
import FacultyDashboard  from './pages/faculty/FacultyDashboard';
import AttendanceMark    from './pages/faculty/AttendanceMark';
import AttendanceHistory from './pages/faculty/AttendanceHistory';
import StudentDashboard  from './pages/student/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin"           element={<AdminDashboard />} />
              <Route path="/admin/upload"    element={<UploadSheet />} />
              <Route path="/admin/hierarchy" element={<ManageHierarchy />} />
              <Route path="/admin/faculty"   element={<FacultyList />} />
              <Route path="/admin/students"  element={<StudentList />} />
            </Route>
          </Route>

          {/* Faculty */}
          <Route element={<ProtectedRoute roles={['faculty']} />}>
            <Route element={<Layout />}>
              <Route path="/faculty"            element={<FacultyDashboard />} />
              <Route path="/faculty/attendance" element={<AttendanceMark />} />
              <Route path="/faculty/history"    element={<AttendanceHistory />} />
            </Route>
          </Route>

          {/* Student */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route element={<Layout />}>
              <Route path="/student" element={<StudentDashboard />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
