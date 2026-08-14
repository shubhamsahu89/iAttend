import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [route, setRoute] = useState('landing');
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setTeacher(data.teacher_name);
          setRoute('teacher-dashboard');
        }
      })
      .catch(err => console.error("Error checking auth status", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' })
      .then(() => {
        setTeacher(null);
        setRoute('landing');
      });
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render correct page view
  return (
    <div>
      {/* Google Navbar */}
      <nav className="navbar navbar-expand-lg navbar-custom mb-4">
        <div className="container px-3">
          <button 
            className="navbar-brand-custom border-0 bg-transparent" 
            onClick={() => setRoute('landing')}
          >
            <span className="brand-dot" style={{ backgroundColor: 'var(--google-blue)' }}></span>
            <span className="brand-dot" style={{ backgroundColor: 'var(--google-red)' }}></span>
            <span className="brand-dot" style={{ backgroundColor: 'var(--google-yellow)' }}></span>
            <span className="brand-dot" style={{ backgroundColor: 'var(--google-green)' }}></span>
            iAttend
          </button>
          <div className="ms-auto d-flex align-items-center gap-2">
            {teacher ? (
              <>
                <button 
                  className={`nav-link-custom border-0 bg-transparent ${route === 'teacher-dashboard' ? 'active' : ''}`}
                  onClick={() => setRoute('teacher-dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-google btn-google-secondary px-3 py-2 d-flex align-items-center gap-1 ms-3"
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>logout</span> Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`nav-link-custom border-0 bg-transparent ${route === 'student-dashboard' ? 'active' : ''}`}
                  onClick={() => setRoute('student-dashboard')}
                >
                  Student Dashboard
                </button>
                <button 
                  onClick={() => setRoute('login')} 
                  className="btn btn-google px-3 py-2 d-flex align-items-center gap-1 ms-3"
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>login</span> Teacher Panel
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container px-3 fade-in-up">
        {route === 'landing' && (
          <Landing setRoute={setRoute} />
        )}
        {route === 'login' && (
          <TeacherLogin setRoute={setRoute} setTeacher={setTeacher} />
        )}
        {route === 'teacher-dashboard' && (
          <TeacherDashboard teacherName={teacher} setRoute={setRoute} />
        )}
        {route === 'student-dashboard' && (
          <StudentDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 mt-5 text-secondary border-top bg-white border-light">
        <div className="container">
          <p className="mb-0 small">&copy; iAttend Face Recognition System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
