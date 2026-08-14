# 📸 iAttend – Intelligent Face Recognition Attendance System

**iAttend** is a real-time, face recognition–based attendance management system designed for educational institutions. Built using Python, Flask, OpenCV, and `face_recognition`, the system allows contactless, secure, and accurate attendance logging with subject-level and teacher-level data separation.

> 🧠 Powered by computer vision and machine learning  
> 🧾 Transparent attendance tracking  
> 🎓 Developed as a B.Tech Final Year Project (2024-25)

---

## 📌 Features

- 🎯 **Face Recognition Attendance**  
  Uses webcam and facial embeddings to detect and verify student identity.

- 🔐 **Teacher Authentication**  
  Teachers must log in before starting an attendance session.

- 🧑‍🏫 **Subject-wise Logging**  
  Attendance data includes subject name and teacher identity.

- 📊 **Dynamic Dashboards**  
  Students can view their subject-wise attendance summaries.

- 💾 **CSV-Based Logging**  
  Attendance records are stored in a structured CSV format for portability.

- 🧮 **Performance Tested**  
  > 95%+ accuracy in well-lit conditions with sub-1 minute session times for 30 students.

---

## 🛠️ Tech Stack

| Component             | Technology Used                      |
|----------------------|---------------------------------------|
| Backend              | Python, Flask                        |
| Face Recognition     | `face_recognition`, dlib, OpenCV     |
| Frontend             | HTML, CSS (Jinja2 templates)         |
| Data Storage         | CSV, Pickle (`.pkl`)                 |
| Visualization        | pandas, numpy                        |
| Deployment           | Localhost Flask Server               |

---

## 📸 Screenshots

- iAttend Landing Page  ![iAttend Landing Page](Screenshots/iattend_landing.png)
- Teacher Login Section  ![Teacher Login Section](Screenshots/iattend_teacher_login.png)
- Live Face Recognition Window  ![Live Face Recognition Window](Screenshots/real_time_window.png)
- Student Attendance Dashboard  ![Student Attendance Dashboard](Screenshots/student_attendance_dashboard.png)
- Subject-wise Attendance Summary  ![Subject-wise Attendance Summary](Screenshots/subjectwise_attendance.png)
- Teacher Panel for Attendance ![Teacher Panel for Attendance](Screenshots/teachers_panel.png)
- Image Database Folder ![Image Database Folder](Screenshots/image_database.png)
- Attendance Logging in CSV File ![Attendance Logging in CSV File](Screenshots/attendance_csv.png)

---

## 🧪 Performance Summary

| Condition                | Accuracy (%) | FAR (%) | FRR (%) |
|--------------------------|--------------|---------|---------|
| Bright Indoor Lighting   | 98.6         | 0.4     | 1.0     |
| Dim Lighting             | 92.3         | 0.7     | 6.9     |
| Wearing Glasses          | 94.7         | 1.0     | 4.3     |
| Side/Partial View        | 85.2         | 3.2     | 11.6    |

- ✅ Real-time face matching speed: ~0.6–1.2s/frame  
- 🧾 CSV I/O latency: < 0.05s per entry  
- 📈 Average full session time (30 students): ~50 seconds

---

## 🧰 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/kunalsahuu/iAttend.git
cd iAttend
```

### 2. Install dependencies

#### Python Backend Setup:
```bash
# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

#### React Frontend Setup:
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
SECRET_KEY=your_very_strong_secret_key_here
TEACHER_USERNAME=teacher@gmail.com
TEACHER_PASSWORD=secure_password
```

### 4. Running the App in Development Mode

You will need two terminal windows running concurrently:

#### Terminal 1: Run the Backend
From the project root:
```bash
.venv\Scripts\activate
python app.py
```
*Backend runs on port `5000`.*

#### Terminal 2: Run the Frontend
From the `frontend/` directory:
```bash
npm run dev
```
*Frontend runs on port `5173`. Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🚀 Production Build & Deployment

To deploy the app as a unified, single-port service, follow these steps:

### 1. Compile the React Frontend
Navigate to the `frontend/` directory and run:
```bash
npm run build
```
This compiles the React app into static optimized files inside the `frontend/dist/` directory.

### 2. Start the Unified Flask Server
Go back to the root directory and run the Flask server:
```bash
python app.py
```
Flask will automatically detect the compiled files inside `frontend/dist/` and serve the entire frontend SPA from its own port! 

### 3. Access in Browser
Open:
```
http://127.0.0.1:5000
```
This is the single-port production-ready instance, suitable for deployment to hosting platforms like Heroku, Render, AWS, or GCP.

---

## 📂 Folder Structure

```
iAttend/
├── app.py                     # Main Flask server (API & static provider)
├── .env                       # Environment configuration credentials
├── requirements.txt           # Python package dependencies
├── known_faces/               # Student facial images
├── data/                      # Generated databases & model cache folder
│   ├── encodings.pkl          # Cached facial encodings
│   ├── attendance.csv         # Structured attendance logs
│   └── summary_attendance.csv # Calculated attendance statistics
├── frontend/                  # React.js frontend application (Vite)
│   ├── src/                   # React source code (pages, components, css)
│   ├── public/                # Public assets
│   ├── index.html             # React entrypoint template
│   └── vite.config.js         # Dev server proxy configuration
├── legacy/                    # Archived prototypes & legacy HTML interface
│   ├── templates/             # Old server-rendered Jinja2 templates
│   └── static/                # Old static CSS and prototypes
└── .gitignore                 # Excluded directories (node_modules, venv, secrets)
```

---

## 🚧 Limitations & Future Work

### Known Limitations:
- ❌ No liveness detection (vulnerable to spoofing with images)
- 💡 Sensitive to lighting and face orientation
- 🖥️ Local-only storage (no cloud or database integration)
- ❌ Not yet mobile responsive or PWA-enabled

### Future Improvements:
- 🔍 Add blink/movement-based liveness detection
- ☁️ Cloud hosting (Firebase/AWS/GCP)
- 📱 Mobile App Companion (Android/iOS)
- 🧠 Automatic face re-encoding (aging, beard, etc.)
- 🔗 LMS/SIS integration via REST APIs
- 🎓 Admin panel for data cleanup and analytics

---

## 👥 Team

Project by Final Year IT students at **Government Engineering College, Bilaspur** (Affiliated to CSVTU, Bhilai):

- **Shubham Sahu**  
- Kunal Sahu  
- Shreya Bakhshi  
- Ishwar Yadu  
Under the guidance of **Prof. Samiksha Shukla**

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).

---

> ⭐ *If you find this project useful, give it a star on GitHub!*  
> 📬 For queries or collaborations, feel free to [reach out](mailto:sshubhamsahu89@gmail.com)
