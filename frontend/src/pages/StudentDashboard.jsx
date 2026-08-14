import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StudentDashboard() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [subjectMaxCounts, setSubjectMaxCounts] = useState({});
  const [top5, setTop5] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student-dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.records) setRecords(data.records);
        if (data.summary) setSummary(data.summary);
        if (data.subject_max_counts) setSubjectMaxCounts(data.subject_max_counts);
        if (data.top_5_students) setTop5(data.top_5_students);
      })
      .catch(err => console.error("Error fetching dashboard statistics", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Configure dataset labels & series
  const subjectsList = Object.keys(subjectMaxCounts);
  
  // Theme palettes (Google Brand colors)
  const googleColors = [
    'rgba(26, 115, 232, 0.85)',   // Blue
    'rgba(52, 168, 83, 0.85)',    // Green
    'rgba(251, 188, 5, 0.85)',    // Yellow
    'rgba(234, 67, 53, 0.85)'     // Red
  ];
  const googleBorders = [
    '#1a73e8',
    '#34a853',
    '#fbbc05',
    '#ea4335'
  ];

  const chartData = {
    labels: summary.map(row => row.Name),
    datasets: subjectsList.map((subject, index) => ({
      label: subject,
      data: summary.map(row => row[subject] || 0),
      backgroundColor: googleColors[index % googleColors.length],
      borderColor: googleBorders[index % googleBorders.length],
      borderWidth: 1.5,
      borderRadius: 4
    }))
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#dadce0'
        },
        title: {
          display: true,
          text: 'Classes Attended',
          font: {
            family: 'Roboto',
            weight: 'bold'
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Students',
          font: {
            family: 'Roboto',
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Outfit'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 12,
        titleFont: {
          family: 'Outfit',
          size: 14
        },
        bodyFont: {
          family: 'Roboto'
        }
      }
    }
  };

  return (
    <div className="row pt-2">
      {/* Header Title */}
      <div className="col-12 mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h2 className="mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Student Attendance Dashboard</h2>
          <p className="text-secondary mb-0">Real-time statistics and summary logs.</p>
        </div>
        <div>
          <a 
            href="/api/download-summary" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-google btn-google-success d-flex align-items-center gap-1"
          >
            <span className="material-icons">download</span> Download Summary CSV
          </a>
        </div>
      </div>

      {/* Section 1: Top 5 Rankings */}
      <div className="col-12 mb-4 fade-in-up">
        <div className="card-custom">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span className="material-icons text-warning">emoji_events</span>
            <h4 className="mb-0">Top 5 Students by Attendance</h4>
          </div>
          
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '80px' }}>Rank</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th className="text-center">Total Attendance</th>
                  <th className="text-center">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {top5.length > 0 ? (
                  top5.map((student, idx) => (
                    <tr key={idx}>
                      <td className="text-center fw-bold text-primary">{idx + 1}</td>
                      <td className="fw-semibold">{student.Name}</td>
                      <td>{student['Roll No']}</td>
                      <td className="text-center">{student.Total}</td>
                      <td className="text-center fw-semibold text-primary">
                        {student['Max Total'] ? `${((student.Total / student['Max Total']) * 100).toFixed(1)}%` : '0%'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No student records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Subject-wise Summary Table */}
      <div className="col-12 mb-4 slide-in-left">
        <div className="card-custom">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span className="material-icons text-primary">menu_book</span>
            <h4 className="mb-0">Subject-wise Attendance Summary</h4>
          </div>
          
          <div className="table-responsive">
            <table className="table-custom text-center">
              <thead>
                <tr>
                  <th className="text-start">Name</th>
                  <th className="text-start">Roll No</th>
                  {subjectsList.map((subject, idx) => (
                    <th key={idx}>
                      {subject}
                      <div className="text-secondary small fw-normal">Total: {subjectMaxCounts[subject]}</div>
                    </th>
                  ))}
                  <th>Total Attended <div className="text-secondary small fw-normal">(with %)</div></th>
                </tr>
              </thead>
              <tbody>
                {summary.length > 0 ? (
                  summary.map((row, idx) => (
                    <tr key={idx}>
                      <td className="text-start fw-semibold">{row.Name}</td>
                      <td className="text-start">{row['Roll No']}</td>
                      {subjectsList.map((subject, sIdx) => (
                        <td key={sIdx}>
                          <div className="fw-bold">{row[subject] || 0}</div>
                          {row[subject + ' %'] !== undefined && (
                            <span className="small text-secondary" style={{ fontSize: '11px' }}>
                              ({row[subject + ' %']}%)
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="fw-bold text-primary">
                        {row.Total}
                        {row['Max Total'] && (
                          <div className="small text-secondary fw-normal" style={{ fontSize: '11px' }}>
                            ({((row.Total / row['Max Total']) * 100).toFixed(1)}%)
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3 + subjectsList.length} className="text-center text-muted py-4">
                      No summary statistics available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Analytics Chart */}
      <div className="col-12 mb-4 slide-in-right">
        <div className="card-custom">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span className="material-icons text-success">bar_chart</span>
            <h4 className="mb-0">Attendance Chart Representation</h4>
          </div>
          
          <div style={{ position: 'relative', height: '350px' }}>
            {summary.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                No visualization data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: All Raw Records */}
      <div className="col-12 mb-4 fade-in-up">
        <div className="card-custom">
          <div className="card-header-custom d-flex align-items-center gap-2">
            <span class="material-icons text-secondary">view_list</span>
            <h4 class="mb-0">All Logged Attendance Records</h4>
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
                  <th>Teacher Assigned</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((record, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{record[0]}</td>
                      <td>{record[1]}</td>
                      <td><span className="badge-custom">{record[4]}</span></td>
                      <td>{record[2]}</td>
                      <td>{record[3]}</td>
                      <td>{record[5]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No raw logs available.</td>
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

export default StudentDashboard;
