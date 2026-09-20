🎓 AttendX

🧠 AI-Powered Facial Recognition Attendance Management System

<p align="center">
  <b>Automated • Intelligent • Non-Intrusive • Scalable</b>
</p><p align="center">"Python" (https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
"React" (https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
"FastAPI" (https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
"MongoDB" (https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
"OpenCV" (https://img.shields.io/badge/OpenCV-Computer_Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
"InsightFace" (https://img.shields.io/badge/InsightFace-Face_AI-orange?style=for-the-badge)
"ONNX" (https://img.shields.io/badge/ONNX_Runtime-1.24.3-005CED?style=for-the-badge&logo=onnx&logoColor=white)
"Vite" (https://img.shields.io/badge/Vite-Frontend_Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</p><p align="center">"Status" (https://img.shields.io/badge/Status-Completed-success?style=flat-square)
"Academic Project" (https://img.shields.io/badge/Project-Academic-blue?style=flat-square)
"Machine Learning" (https://img.shields.io/badge/Domain-Machine%20Learning-purple?style=flat-square)
"Computer Vision" (https://img.shields.io/badge/Domain-Computer%20Vision-red?style=flat-square)

</p>---

📌 Overview

AttendX is an automated attendance management system that uses Machine Learning, Computer Vision, and Facial Recognition to identify multiple students from a classroom image and automatically record their attendance.

Unlike conventional roll-call, RFID, or fingerprint-based systems that process students sequentially, AttendX is designed around parallel multi-face recognition, allowing attendance to be captured from a classroom perspective using a standard camera.

The system combines:

- 👁️ SCRFD for face detection
- 🧠 ArcFace for face recognition
- 🔢 512-dimensional facial embeddings
- 📐 Cosine Similarity for identity matching
- ⚡ FastAPI for asynchronous backend processing
- ⚛️ React + Vite for the frontend
- 🍃 MongoDB Atlas for academic and attendance data
- ☁️ ImageKit for image storage and delivery
- 🛡️ JWT-based authentication
- 👨‍🏫 Human-in-the-loop manual correction

The reported experimental results achieved an overall accuracy of approximately 85%, while reducing attendance processing from several minutes to approximately 15–20 seconds.

---

🎯 Problem Statement

Traditional attendance systems face several problems:

Problem| Description
⏱️ Time Consumption| Manual roll calls can consume valuable lecture time
🤝 Proxy Attendance| Students can mark attendance on behalf of absent students
🗂️ Data Fragmentation| Attendance information can be distributed across multiple records
📅 Scheduling Complexity| Faculty may need to manually select subjects, batches and sessions
📈 Limited Analytics| Traditional systems provide limited centralized attendance intelligence
🔌 Hardware Dependency| Some biometric systems require dedicated scanners/readers

AttendX addresses these challenges through a centralized, ML-powered attendance workflow.

---

💡 Key Features

👨‍💼 Admin Module

- 👤 Faculty registration and management
- 🎓 Student enrollment
- 🏫 Department and academic-year management
- 📚 Subject and course management
- 📅 Timetable configuration
- 🔐 User roles and authentication
- 📊 Centralized attendance monitoring
- 🔎 Search and filtering
- 📈 Global attendance reporting

👨‍🏫 Faculty Module

- ▶️ One-click attendance session
- 📷 Classroom camera capture
- 🤖 Automated multi-face recognition
- 🕒 Context-aware timetable detection
- ✅ Automatic attendance marking
- ✏️ Manual attendance override
- 🔍 Recognition result verification

👨‍🎓 Student Module

- 📊 Attendance percentage tracking
- 📚 Subject-wise attendance information
- 🧾 Attendance record visibility
- 🔎 Academic compliance monitoring

These modules are designed around the report's centralized administration, faculty workflow, biometric enrollment, dynamic scheduling, reporting, and manual-override objectives.

---

🧠 Machine Learning Pipeline

                 📷 CLASSROOM IMAGE
                         │
                         ▼
                ┌─────────────────┐
                │  Image Quality  │
                │     Check       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │      SCRFD      │
                │  Face Detection │
                └────────┬────────┘
                         │
                  Detected Faces
                         │
                         ▼
                ┌─────────────────┐
                │    ArcFace      │
                │ Face Recognition│
                └────────┬────────┘
                         │
                  512-D Embeddings
                         │
                         ▼
                ┌─────────────────┐
                │ Cosine Similarity│
                │     Matching    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Identity Match  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Attendance      │
                │    Record       │
                └────────┬────────┘
                         │
                         ▼
                🍃 MongoDB Atlas

---

🔬 ML Methodology

1️⃣ Face Detection — SCRFD

AttendX uses SCRFD (Sample and Computation Redistribution Face Detector) for detecting multiple faces in classroom images.

The detector is designed to handle:

- 👥 Multiple faces
- 📏 Different face scales
- 📐 Different orientations
- 💡 Varying lighting
- 🪑 Students seated at different distances

The report specifies the use of the "det_10g.onnx" model for the detection stage.

---

2️⃣ Face Recognition — ArcFace

After face detection, each detected face is processed using ArcFace.

ArcFace generates a 512-dimensional embedding representing the facial identity.

Face
 │
 ▼
ArcFace
 │
 ▼
512-D Vector
 │
 ▼
Compare with Stored Embeddings

The report describes ArcFace using a ResNet-50 backbone and deep metric learning to produce discriminative facial representations.

---

3️⃣ Identity Matching — Cosine Similarity

The generated embedding is compared with the student's stored biometric embedding using Cosine Similarity.

Conceptually:

New Face Embedding
        │
        ▼
Cosine Similarity
        │
        ▼
Stored Student Embeddings
        │
        ▼
Highest Valid Similarity
        │
        ▼
Student Identity

Low-confidence matches can be flagged for review rather than being blindly accepted.

---

🏗️ System Architecture

AttendX follows a layered architecture consisting of:

┌───────────────────────────────────────┐
│             👥 CLIENT LAYER           │
│   Admin │ Teacher │ Student │ Camera  │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│           ⚛️ FRONTEND LAYER           │
│       React + Vite + TanStack Query   │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│          ⚡ API GATEWAY LAYER          │
│              FastAPI + JWT            │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│            🧠 SERVICE LAYER           │
│ Business Logic │ ML │ Image Storage  │
└───────────────┬───────────┬───────────┘
                │           │
                ▼           ▼
        🤖 InsightFace   ☁️ ImageKit
                │
                ▼
┌───────────────────────────────────────┐
│             🍃 DATA LAYER             │
│             MongoDB Atlas             │
└───────────────────────────────────────┘

The architecture separates frontend interaction, API orchestration, business logic, ML processing, image management, and persistent storage.

---

🛠️ Technology Stack

🎨 Frontend

Technology| Purpose
⚛️ React 18| User interface
⚡ Vite| Frontend development/build tooling
🔄 TanStack Query| Data fetching, caching and synchronization
🔐 JWT| Authentication/session management
📷 WebRTC| Browser camera access

⚙️ Backend

Technology| Purpose
🐍 Python 3.11| Backend programming language
🚀 FastAPI| Asynchronous REST API
🔐 JWT| Authentication & authorization
🌐 CORS| Cross-origin communication
🖼️ OpenCV| Image processing

🤖 Machine Learning

Technology| Purpose
🧠 InsightFace 0.7.3| Facial recognition framework
👁️ SCRFD| Face detection
🧬 ArcFace| Face recognition
⚡ ONNX Runtime 1.24.3| Optimized model inference
📐 Cosine Similarity| Embedding comparison

🗄️ Database & Storage

Technology| Purpose
🍃 MongoDB Atlas| Cloud database
🔄 Motor| Async MongoDB driver
☁️ ImageKit| Image storage/CDN

The technology stack and versions above are based on the project report.

---

📊 Database Design

AttendX uses MongoDB Atlas to store both academic information and biometric-related data.

Main Collections

🍃 MongoDB Atlas
│
├── 👤 Users
├── 🏫 Academic
├── 📅 Timetable
├── 📝 Attendance
├── 🧬 Embeddings
├── 🎓 Enrollments
├── 📚 Courses
└── 📋 Activity Logs

The database stores academic hierarchy, timetable information, attendance sessions, facial embeddings, enrollment mappings and system activity logs.

---

🔄 Attendance Workflow

👨‍🏫 Teacher
     │
     ▼
▶️ Start Session
     │
     ▼
📅 Detect Current Lecture
     │
     ▼
📷 Capture Classroom Frames
     │
     ▼
🔍 Image Quality Check
     │
     ▼
👁️ SCRFD Face Detection
     │
     ▼
🧠 ArcFace Embeddings
     │
     ▼
📐 Cosine Similarity
     │
     ▼
👤 Student Identification
     │
     ▼
✅ Mark Attendance
     │
     ▼
🍃 Store in MongoDB
     │
     ▼
📊 Display Results
     │
     ▼
✏️ Manual Override if Required

The documented workflow includes session initiation, timetable retrieval, camera capture, image-quality validation, SCRFD detection, ArcFace feature extraction, matching, and attendance recording.

---

📈 Performance & Results

AttendX was evaluated under multiple classroom conditions.

Environment| Reported Accuracy
👤 Single person — optimal lighting| 92–95%
👥 Multiple faces — classroom setting| 78–85%
🌙 Low light / extreme angles| 45–60%
📊 Overall average| ~85%

⚡ Processing Performance

Metric| Result
🧮 Average single-frame inference| ~280 ms
⏱️ Average attendance session| ~15.4 sec
❌ False Acceptance Rate| ~3.2%
⚠️ False Rejection Rate| ~11.5%

The report states that these measurements were obtained using CPU-based inference and classroom-oriented testing scenarios.

---

🧪 Testing

AttendX was tested using a combination of:

- ✅ Functional Unit Testing
- 🤖 ML Model Testing
- 🔗 Integration Testing
- 🧩 System Debugging
- 👥 User Acceptance Testing
- ⚫ Black-Box Testing
- ⚪ White-Box Testing

Testing covered authentication, authorization, registration, data integrity, timetable conflicts, facial recognition thresholds and practical classroom conditions.

---

🛡️ Reliability & Human-in-the-Loop

Machine Learning systems can encounter difficult conditions such as:

- 💡 Poor lighting
- 😷 Partial face occlusion
- 📐 Extreme viewing angles
- 🏃 Motion blur
- 👥 Crowded classrooms

Instead of forcing an automated decision in every situation, AttendX provides a manual override mechanism that allows faculty members to review and correct attendance.

This creates a Human + AI workflow:

        🤖 AI Recognition
               │
        ┌──────┴──────┐
        │             │
   High Confidence   Low Confidence
        │             │
        ▼             ▼
   ✅ Auto Mark    👨‍🏫 Review
                      │
                      ▼
                 ✏️ Manual
                  Override

---

⚠️ Current Limitations

The current implementation has several documented limitations:

🖥️ CPU-Based Processing

The system is designed to run without requiring a dedicated GPU. However, CPU-based inference limits the achievable FPS for continuous video processing.

💡 Lighting Sensitivity

Poor or uneven lighting can reduce face detection and recognition performance.

📷 Camera Position

Recognition performance depends on camera quality, placement and viewing angle.

🎥 Snapshot-Based Processing

AttendX primarily processes high-resolution image snapshots rather than maintaining a continuous 24/7 video stream.

🌍 Environmental Scope

The current system is primarily intended for controlled indoor classroom environments rather than outdoor environments with highly variable lighting.

These boundaries are explicitly defined in the project report.

---

🚀 Future Scope

Possible future extensions of the system include:

- ⚡ GPU-accelerated inference
- 🎥 More advanced real-time video processing
- 🛡️ Improved liveness/anti-spoofing mechanisms
- 📊 Advanced attendance analytics
- 📈 Predictive academic-risk analysis
- 🏫 Multi-department institutional deployment
- 🔗 Learning Management System integration
- ☁️ Expanded cloud deployment
- 📱 Dedicated mobile application
- 🧠 More robust recognition under extreme lighting and occlusion

The report also identifies future integration possibilities with LMS platforms, automated performance tracking and smart classroom analytics.

---

💻 Hardware Requirements

According to the project specification:

Requirement| Minimum
🖥️ Processor| Intel Core i5
🧠 RAM| 8 GB
📷 Camera| 720p or higher
🎮 GPU| Not required for CPU inference
🌐 Camera Interface| WebRTC-compatible

The system is intended to work with standard commercially available camera hardware rather than specialized biometric devices.

---

📁 Suggested Repository Structure

AttendX/
│
├── 📁 frontend/
│   ├── 📁 src/
│   ├── 📁 public/
│   ├── package.json
│   └── vite.config.*
│
├── 📁 backend/
│   ├── 📁 app/
│   ├── 📁 services/
│   ├── 📁 ml/
│   ├── 📁 models/
│   ├── 📁 routes/
│   └── requirements.txt
│
│
├── 📄 .gitignore
└── 📄 README.md

«Note: This structure is a recommended organization for the GitHub repository; it is not presented as the exact repository structure in the project report.»

---

🔐 Privacy & Security Considerations

AttendX handles biometric information, so responsible handling of facial data is important.

The system incorporates:

- 🔐 JWT authentication
- 👥 Role-based access
- 🗄️ Centralized database management
- 📋 Activity logging
- ✏️ Human verification for uncertain results
- 🔒 Controlled access to attendance information

For any real-world deployment, biometric-data handling should additionally comply with the institution's applicable privacy, consent, retention and security requirements.

---

📚 Academic Context

Project: AttendX
Domain: Machine Learning & Computer Vision
Institution: Anjuman-I-Islam's M. H. Saboo Siddik College of Engineering
Department: Information Technology
Academic Year: 2025–26
University: University of Mumbai

👥 Project Team

- Khalid Khilji
- Rizwan Khan
- Zaid Kotimbire
- Izhar Khan

👨‍🏫 Project Guide

Er. Rasheed Noor

The report identifies AttendX as an IT Mini Project – 2B based on Machine Learning.

---

🏆 Why AttendX?

AttendX aims to transform attendance from a simple administrative task into an automated, centralized and data-driven academic process.

Traditional Approach

👨‍🏫 Teacher
     │
     ▼
📢 Roll Call
     │
     ▼
✍️ Manual Entry
     │
     ▼
🗂️ Separate Records
     │
     ▼
📊 Manual Analysis

AttendX

📷 Classroom
     │
     ▼
👁️ Face Detection
     │
     ▼
🧠 Face Recognition
     │
     ▼
📐 Identity Matching
     │
     ▼
✅ Automated Attendance
     │
     ▼
🍃 Centralized Database
     │
     ▼
📊 Analytics & Reports

---

📜 License

This project was developed as an academic project.

If you plan to reuse, modify or deploy the system commercially, review the licensing requirements of the third-party libraries, models and services used by the project.

---

⭐ Acknowledgements

Special thanks to the faculty and staff of the Information Technology Department, M. H. Saboo Siddik College of Engineering, and to the project guide for their guidance and support throughout the development of AttendX.

---

<p align="center">🎓 AttendX

Smarter Attendance. Faster Classrooms. Better Data.

⭐ If you found this project useful, consider giving the repository a star!

</p>
