import React from 'react';

function Landing({ setRoute }) {
  return (
    <div className="row justify-content-center align-items-center py-5">
      <div className="col-lg-8 text-center mb-5">
        <h1 className="display-5 fw-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          🤖 Welcome to iAttend
        </h1>
        <p className="lead text-secondary">
          A modern, real-time face recognition attendance logging system designed for schools and universities.
        </p>
      </div>
      
      <div className="col-md-5 mb-4">
        <div className="card-custom scale-hover slide-in-left text-center py-5 h-100 d-flex flex-column align-items-center justify-content-center">
          <span className="material-icons text-primary" style={{ fontSize: '64px', marginBottom: '16px' }}>school</span>
          <h3>Student Dashboard</h3>
          <p className="text-secondary px-3 mb-4">
            View subject-wise attendance logs, overall attendance percentages, and top student rankings.
          </p>
          <button 
            onClick={() => setRoute('student-dashboard')} 
            className="btn btn-google btn-google-secondary mt-auto w-75"
          >
            Open Dashboard
          </button>
        </div>
      </div>

      <div className="col-md-5 mb-4">
        <div className="card-custom scale-hover slide-in-right text-center py-5 h-100 d-flex flex-column align-items-center justify-content-center">
          <span className="material-icons text-success" style={{ fontSize: '64px', marginBottom: '16px' }}>co_present</span>
          <h3>Teacher Panel</h3>
          <p className="text-secondary px-3 mb-4">
            Log in to register new students, configure class sessions, and launch the face recognition camera module.
          </p>
          <button 
            onClick={() => setRoute('login')} 
            className="btn btn-google mt-auto w-75"
          >
            Teacher Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
