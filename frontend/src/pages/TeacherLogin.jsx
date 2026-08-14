import React, { useState } from 'react';

function TeacherLogin({ setRoute, setTeacher }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to login');
        }
        return data;
      })
      .then((data) => {
        setTeacher(data.teacher_name);
        setRoute('teacher-dashboard');
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-md-6 col-lg-5">
        <div className="card-custom signin-card mt-4">
          <div className="logo-container">
            <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
              <span className="brand-dot" style={{ backgroundColor: 'var(--google-blue)' }}></span>
              <span className="brand-dot" style={{ backgroundColor: 'var(--google-red)' }}></span>
              <span className="brand-dot" style={{ backgroundColor: 'var(--google-yellow)' }}></span>
              <span className="brand-dot" style={{ backgroundColor: 'var(--google-green)' }}></span>
              <span className="fw-bold" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', letterSpacing: '-0.5px' }}>iAttend</span>
            </div>
            <div className="fs-4 mt-2 text-dark" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Teacher Sign in
            </div>
            <div className="fs-6 text-secondary fw-normal mt-1">
              to continue to Teacher Panel
            </div>
          </div>

          {error && (
            <div className="alert alert-danger border-0 py-2 text-start small mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom text-start">
              <label htmlFor="username" className="form-label small text-secondary fw-bold">
                Teacher Email / ID
              </label>
              <input
                type="email"
                className="form-control form-control-custom"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="name@gmail.com"
              />
            </div>

            <div className="form-group-custom text-start">
              <label htmlFor="password" className="form-label small text-secondary fw-bold">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-custom"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button 
                type="button" 
                onClick={() => setRoute('landing')} 
                className="btn btn-link text-primary text-decoration-none small p-0"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-google"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;
