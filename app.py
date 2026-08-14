# CURR 
from flask import Flask, request, send_file, session, jsonify, send_from_directory
from flask_cors import CORS
import os
import cv2
import face_recognition
import pandas as pd
import numpy as np
from datetime import datetime
import pickle
import json
from pathlib import Path
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

SUMMARY_CSV_FILE = Path("data/summary_attendance.csv") 

# Load environment variables from .env if present
def load_env():
    env_path = Path('.env')
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip()

load_env()

app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')
# Enable CORS for frontend dev server
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Secure secret key generation if none is provided in env
app.secret_key = os.environ.get('SECRET_KEY')
if not app.secret_key:
    app.secret_key = os.urandom(24)

# Configure session cookie security flags
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,  # Set to True if serving over HTTPS in production
    SESSION_COOKIE_SAMESITE='Lax',
)

# Custom login decorator returning JSON
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('teacher'):
            return jsonify({'error': 'Unauthorized', 'message': 'Please log in to continue.'}), 401
        return f(*args, **kwargs)
    return decorated_function

FACES_DIR = Path('known_faces')
DATA_DIR = Path('data')
ENCODINGS_FILE = DATA_DIR / 'encodings.pkl'
CSV_FILE = DATA_DIR / 'attendance.csv'
VIDEO_SOURCE = 0  # Use the IP shown on your phone
MIN_FACE_DISTANCE = 0.5
FRAME_SCALE_FACTOR = 0.25

FACES_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

TEACHERS_FILE = DATA_DIR / 'teachers.json'

def load_teacher_credentials():
    default_accounts = {
        'samiksha@gmail.com': {'password': generate_password_hash('admin'), 'name': 'Samiksha Shukla'},
        'kunal@gmail.com': {'password': generate_password_hash('admin1'), 'name': 'Kunal kumar'},
        'himanshu@gmail.com': {'password': generate_password_hash('admin2'), 'name': 'Himanshu Mokashe'},
        'priyanka@gmail.com': {'password': generate_password_hash('admin3'), 'name': 'Priyanka Sahu'}
    }
    
    # Initialize file if missing (ignored by Git)
    if not TEACHERS_FILE.exists():
        with open(TEACHERS_FILE, 'w') as f:
            json.dump(default_accounts, f, indent=4)
            
    # Load from JSON file
    try:
        with open(TEACHERS_FILE, 'r') as f:
            credentials = json.load(f)
    except Exception:
        credentials = default_accounts

    # Merge custom credential from .env if defined
    env_teacher_username = os.environ.get('TEACHER_USERNAME')
    env_teacher_password = os.environ.get('TEACHER_PASSWORD')
    if env_teacher_username and env_teacher_password:
        credentials[env_teacher_username] = {
            'password': generate_password_hash(env_teacher_password),
            'name': env_teacher_username.split('@')[0].capitalize()
        }
        
    return credentials

TEACHER_CREDENTIALS = load_teacher_credentials()

def load_or_encode_faces():
    if ENCODINGS_FILE.exists():
        with open(ENCODINGS_FILE, 'rb') as f:
            data = pickle.load(f)
        return data['encodings'], data['names'], data.get('roll_nos', [])

    encodings, names, roll_nos = [], [], []

    for person_folder in FACES_DIR.iterdir():
        if person_folder.is_dir():
            try:
                name, roll = person_folder.name.rsplit('_', 1)
            except ValueError:
                continue

            for img_file in person_folder.glob('*'):
                img = cv2.imread(str(img_file))
                if img is None:
                    continue
                face_locations = face_recognition.face_locations(img)
                if face_locations:
                    enc = face_recognition.face_encodings(img, face_locations)
                    if enc:
                        encodings.append(enc[0])
                        names.append(name)
                        roll_nos.append(roll)

    with open(ENCODINGS_FILE, 'wb') as f:
        pickle.dump({'encodings': encodings, 'names': names, 'roll_nos': roll_nos}, f)

    return encodings, names, roll_nos

def mark_attendance(name, roll_no):
    now = datetime.now()
    subject = session.get('subject', 'Unknown')
    teacher_name = session.get('teacher_name', 'Unknown')
    new_record = pd.DataFrame({
        'Name': [name],
        'Roll No': [roll_no],
        'Time': [now.strftime('%H:%M:%S')],
        'Date': [now.strftime('%Y-%m-%d')],
        'Subject': [subject],
        'Teacher': [teacher_name]
    })
    new_record.to_csv(CSV_FILE, mode='a', header=not CSV_FILE.exists(), index=False)

# API ENDPOINTS

@app.route('/api/status', methods=['GET'])
def api_status():
    if session.get('teacher'):
        return jsonify({
            'authenticated': True,
            'teacher_name': session.get('teacher_name'),
            'subject': session.get('subject', '')
        })
    return jsonify({'authenticated': False})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    teacher = TEACHER_CREDENTIALS.get(username)
    if teacher and check_password_hash(teacher['password'], password):
        session['teacher'] = True
        session['teacher_name'] = teacher['name']
        return jsonify({
            'success': True,
            'teacher_name': teacher['name']
        })
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/select-subject', methods=['POST'])
@login_required
def api_select_subject():
    data = request.get_json() or {}
    subject = data.get('subject')
    if not subject:
        return jsonify({'error': 'Subject is required'}), 400
    session['subject'] = subject
    return jsonify({'success': True, 'subject': subject})

@app.route('/api/student-dashboard', methods=['GET'])
def api_student_dashboard():
    data = []
    summary = []
    subject_max_counts = {}
    top_5_students = []

    if CSV_FILE.exists():
        df = pd.read_csv(CSV_FILE)
        df_display = df.copy()
        # Convert date to display format
        df_display['Date'] = pd.to_datetime(df_display['Date']).dt.strftime('%Y-%m-%d')
        data = df_display.values.tolist()

        # Group data to count subject-specific attendance
        summary_df = df.groupby(['Name', 'Roll No', 'Subject']).size().unstack(fill_value=0)
        subject_max_counts = summary_df.max().to_dict()

        for subject in subject_max_counts:
            max_count = subject_max_counts[subject]
            if max_count > 0:
                summary_df[subject + ' %'] = (summary_df[subject] / max_count * 100).round(1)

        summary_df['Total'] = summary_df[[subj for subj in subject_max_counts]].sum(axis=1)
        summary_df['Max Total'] = sum(subject_max_counts.values())
        
        summary_df = summary_df.reset_index()
        summary_df.to_csv(SUMMARY_CSV_FILE, index=False)

        summary = summary_df.to_dict(orient='records')
        sorted_summary = summary_df.sort_values(by='Total', ascending=False)
        top_5_students = sorted_summary.head(5).to_dict(orient='records')

    return jsonify({
        'records': data,
        'summary': summary,
        'subject_max_counts': subject_max_counts,
        'top_5_students': top_5_students
    })

@app.route('/api/records', methods=['GET'])
@login_required
def api_records():
    data = []
    if CSV_FILE.exists():
        df = pd.read_csv(CSV_FILE)
        df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
        data = df.values.tolist()
    return jsonify({'records': data})

def calculate_ear(eye):
    # Vertical distances
    a = np.linalg.norm(np.array(eye[1]) - np.array(eye[5]))
    b = np.linalg.norm(np.array(eye[2]) - np.array(eye[4]))
    # Horizontal distance
    c = np.linalg.norm(np.array(eye[0]) - np.array(eye[3]))
    if c == 0:
        return 0.0
    return (a + b) / (2.0 * c)

@app.route('/api/start', methods=['GET'])
@login_required
def api_start_recognition():
    if not session.get('subject'):
        return jsonify({'error': 'Please select a subject first'}), 400

    known_encodings, known_names, known_rolls = load_or_encode_faces()
    
    cap = None
    if isinstance(VIDEO_SOURCE, int):
        for index in [VIDEO_SOURCE, 1, 2]:
            c = cv2.VideoCapture(index, cv2.CAP_DSHOW)
            if c.isOpened():
                cap = c
                break
            c.release()
            c = cv2.VideoCapture(index)
            if c.isOpened():
                cap = c
                break
            c.release()
    else:
        cap = cv2.VideoCapture(VIDEO_SOURCE)

    if cap is None or not cap.isOpened():
        return jsonify({'error': 'Could not open the webcam/camera device.'}), 500

    attendance = set()
    marked_list = []
    
    # Blink detection settings
    EYE_AR_THRESH = 0.18  # Below this threshold, eye is considered closed
    student_blink_status = {}  # Tracks blink states for live subjects

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            small_frame = cv2.resize(frame, (0, 0), fx=FRAME_SCALE_FACTOR, fy=FRAME_SCALE_FACTOR)
            rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            face_landmarks_list = face_recognition.face_landmarks(rgb_frame, face_locations)

            for face_encoding, face_location, face_landmarks in zip(face_encodings, face_locations, face_landmarks_list):
                distances = face_recognition.face_distance(known_encodings, face_encoding)
                min_distance = np.min(distances) if len(distances) > 0 else None
                top, right, bottom, left = [int(pos / FRAME_SCALE_FACTOR) for pos in face_location]

                is_recognized = min_distance is not None and min_distance < MIN_FACE_DISTANCE

                if is_recognized:
                    best_match_index = np.argmin(distances)
                    name = known_names[best_match_index]
                    roll_no = known_rolls[best_match_index]

                    # Scale landmarks to draw eye outlines on the original frame
                    left_eye = face_landmarks.get('left_eye', [])
                    right_eye = face_landmarks.get('right_eye', [])

                    if roll_no in attendance:
                        label = f"Name: {name} | Roll No: {roll_no} | Present"
                        color = (0, 255, 0)  # Green for recognized & marked
                    else:
                        if left_eye and right_eye:
                            left_ear = calculate_ear(left_eye)
                            right_ear = calculate_ear(right_eye)
                            ear = (left_ear + right_ear) / 2.0

                            # Initialize blink tracker for this student
                            if roll_no not in student_blink_status:
                                student_blink_status[roll_no] = {'state': 'open', 'blinked': False}

                            status = student_blink_status[roll_no]

                            if ear < EYE_AR_THRESH:
                                status['state'] = 'closed'
                            else:
                                if status['state'] == 'closed':
                                    status['state'] = 'open'
                                    status['blinked'] = True
                                    
                                    # Blink completed! Mark attendance
                                    mark_attendance(name, roll_no)
                                    attendance.add(roll_no)
                                    marked_list.append({'name': name, 'roll_no': roll_no})

                            label = f"{name} ({roll_no}) | Blink to verify"
                            color = (255, 165, 0)  # Orange for recognized but pending blink
                        else:
                            label = f"{name} ({roll_no}) | Face too far"
                            color = (0, 0, 255)

                    # Draw eye outlines on original frame
                    for eye in [left_eye, right_eye]:
                        pts = np.array([[int(pt[0] / FRAME_SCALE_FACTOR), int(pt[1] / FRAME_SCALE_FACTOR)] for pt in eye], np.int32)
                        pts = pts.reshape((-1, 1, 2))
                        cv2.polylines(frame, [pts], True, color, 1)

                else:
                    label = "Unknown"
                    color = (0, 0, 255)

                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(frame, (left, bottom + 20 - text_size[1] - 4), (left + text_size[0] + 2, bottom + 20 + 4), color, cv2.FILLED)
                cv2.putText(frame, label, (left, bottom + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            cv2.imshow("Face Recognition - Press 'q' to quit", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        if cap:
            cap.release()
        cv2.destroyAllWindows()

    return jsonify({
        'success': True,
        'marked_count': len(marked_list),
        'marked_students': marked_list
    })

@app.route('/api/upload', methods=['POST'])
@login_required
def api_upload():
    name = request.form.get('name', '').strip()
    roll_no = request.form.get('roll', '').strip()
    files = request.files.getlist('photos')

    if not name or not roll_no:
        return jsonify({'error': 'Name and Roll No are required'}), 400

    folder_path = FACES_DIR / f"{name}_{roll_no}"
    folder_path.mkdir(exist_ok=True)

    uploaded_count = 0
    for file in files:
        if file.filename:
            safe_filename = secure_filename(file.filename)
            file.save(str(folder_path / safe_filename))
            uploaded_count += 1

    if ENCODINGS_FILE.exists():
        ENCODINGS_FILE.unlink()

    return jsonify({
        'success': True,
        'message': f'Student {name} registered successfully with {uploaded_count} photos.',
        'name': name,
        'roll_no': roll_no
    })

@app.route('/api/download')
@login_required
def download():
    if not CSV_FILE.exists():
        return jsonify({'error': 'No attendance records found'}), 404
    return send_file(
        str(CSV_FILE),
        as_attachment=True,
        download_name='attendance.csv',
        mimetype='text/csv'
    )

@app.route('/api/download-summary')
@login_required
def download_summary():
    if not SUMMARY_CSV_FILE.exists():
        return jsonify({'error': 'Summary CSV not available'}), 404
    return send_file(
        str(SUMMARY_CSV_FILE),
        as_attachment=True,
        download_name='summary_attendance.csv',
        mimetype='text/csv'
    )

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
