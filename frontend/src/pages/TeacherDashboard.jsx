import React, { useState, useEffect } from 'react';

function TeacherDashboard({ teacherName }) {
  const [records, setRecords] = useState([]);
  const [subject, setSubject] = useState('');
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [photos, setPhotos] = useState(null);
  
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(null);
  const [registerError, setRegisterError] = useState(null);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Load status and attendance records on mount
  useEffect(() => {
    fetchStatus();
    fetchRecords();
  }, []);

  const fetchStatus = () => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.subject) {
          setSubject(data.subject);
        }
      });
  };

  const fetchRecords = () => {
    fetch('/api/records')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          setRecords(data.records);
        }
      })
      .catch(err => console.error("Error fetching records", err));
  };

  // Register Student form submission
  const handleRegister = (e) => {
    e.preventDefault();
    if (!photos) {
      setRegisterError("Please select at least one photo.");
      return;
    }

    setRegisterLoading(true);
    setRegisterMessage(null);
    setRegisterError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('roll', roll);
    for (let i = 0; i < photos.length; i++) {
      formData.append('photos', photos[i]);
    }

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to register student");
        }
        return data;
      })
      .then((data) => {
        setRegisterMessage(data.message);
        setName('');
        setRoll('');
        setPhotos(null);
        // Reset file input
        document.getElementById('photos').value = '';
        fetchRecords();
      })
      .catch((err) => {
        setRegisterError(err.message);
      })
      .finally(() => {
        setRegisterLoading(false);
      });
  };

  // Start Recognition Session
  const handleStartRecognition = (e) => {
    e.preventDefault();
    if (!subject) {
      setScanError("Please select a subject first.");
      return;
    }

    setScanLoading(true);
    setScanResult(null);
    setScanError(null);

    // Save subject on backend
    fetch('/api/select-subject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject })
    })
      .then(res => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        
        // Subject saved, now trigger face recognition webcam stream
        return fetch('/api/start');
      })
      .then(res => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setScanResult(data);
        fetchRecords();
      })
      .catch((err) => {
        setScanError(err.message);
      })
      .finally(() => {
        setScanLoading(false);
      });
  };

  return (
    <div className="row pt-2">
      {/* Header Summary */}
      <div className="col-12 mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h2 className="mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Teacher Dashboard</h2>
          <p className="text-secondary mb-0">
            Logged in as: <strong className="text-dark">{teacherName || 'Instructor'}</strong>
          </p>
        </div>
        <div>
          <span className="badge-custom badge-custom-green py-2 px-3 fw-bold pulse-green">System Active</span>
        </div>
      </div>

      {/* Column 1: Register Student */}
      <div className="col-md-6 mb-4 slide-in-left">
        <div className="card-custom h-100">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span className="material-icons text-primary">person_add</span>
            <h4 className="mb-0">Register New Student</h4>
          </div>

          {registerMessage && (
            <div className="alert alert-success border-0 py-2 small mb-3">
              {registerMessage}
            </div>
          )}
          {registerError && (
            <div className="alert alert-danger border-0 py-2 small mb-3">
              {registerError}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="form-group-custom">
              <label htmlFor="name" className="form-label small text-secondary fw-bold">Full Name</label>
              <input 
                type="text" 
                className="form-control form-control-custom" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                placeholder="John Doe" 
              />
            </div>
            
            <div className="form-group-custom">
              <label htmlFor="roll" class="form-label small text-secondary fw-bold">Roll Number</label>
              <input 
                type="text" 
                className="form-control form-control-custom" 
                id="roll" 
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                required 
                placeholder="e.g. 21000" 
              />
            </div>
            
            <div className="form-group-custom">
              <label htmlFor="photos" className="form-label small text-secondary fw-bold">Student Photos</label>
              <input 
                type="file" 
                className="form-control form-control-custom" 
                id="photos" 
                onChange={(e) => setPhotos(e.target.files)}
                multiple 
                required 
                accept="image/*" 
              />
              <small className="text-muted mt-1 d-block" style={{ fontSize: '12px' }}>
                Select multiple photos from different angles/lighting.
              </small>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-google w-100 mt-2"
              disabled={registerLoading}
            >
              <span className="material-icons">save</span> 
              {registerLoading ? 'Registering & Encoding...' : 'Register & Encode'}
            </button>
          </form>
        </div>
      </div>

      {/* Column 2: Take Attendance */}
      <div className="col-md-6 mb-4 slide-in-right">
        <div className="card-custom h-100 d-flex flex-column">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span className="material-icons text-success">camera_alt</span>
            <h4 class="mb-0">Attendance Actions</h4>
          </div>

          {scanResult && (
            <div className="alert alert-success border-0 py-2 small mb-3">
              🎉 Attendance marked successfully for {scanResult.marked_count} students!
            </div>
          )}
          {scanError && (
            <div className="alert alert-danger border-0 py-2 small mb-3">
              {scanError}
            </div>
          )}
          
          <form onSubmit={handleStartRecognition} className="d-flex flex-column h-100">
            <div className="form-group-custom">
              <label htmlFor="subject" className="form-label small text-secondary fw-bold">Select Course / Subject</label>
              <select 
                className="form-control form-control-custom" 
                id="subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="">-- Choose Subject --</option>
                <option value="BIG DATA">BIG DATA</option>
                <option value="CYBER SECURITY">CYBER SECURITY</option>
                <option value="HADOOP LAB">HADOOP LAB</option>
                <option value="DMW">DMW</option>
              </select>
            </div>
            
            <div className="d-flex flex-column gap-3 mt-auto">
              <button 
                type="submit" 
                className={`btn btn-google w-100 py-3 ${subject && !scanLoading ? 'pulse-blue' : ''}`} 
                style={{ fontSize: '15px' }}
                disabled={scanLoading}
              >
                <span className="material-icons">play_circle</span> 
                {scanLoading ? 'Camera Scanner Running...' : 'Start Camera Recognition'}
              </button>
              
              <a 
                href="/api/download" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-google btn-google-secondary w-100"
              >
                <span className="material-icons">download</span> Download Attendance log (CSV)
              </a>
            </div>
          </form>
          
          <div className="alert alert-info border-0 shadow-sm rounded-3 py-3 px-4 mt-4 mb-0 d-flex align-items-start gap-2">
            <span className="material-icons text-info">info</span>
            <div style={{ fontSize: '13px' }}>
              <strong>Process:</strong> Select a subject, launch the scanner. An OpenCV camera stream window will pop up on your computer. When finished, select that window and press <strong>'q'</strong> to close it.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Column: Attendance Records Table */}
      <div className="col-12 mt-3">
        <div className="card-custom">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span className="material-icons text-warning">analytics</span>
            <h4 className="mb-0">Recent Attendance Records</h4>
          </div>
          
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Subject</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((row, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{row[0]}</td>
                      <td>{row[1]}</td>
                      <td><span className="badge-custom">{row[4]}</span></td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No attendance sessions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
