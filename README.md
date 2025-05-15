# Driver Status Flutter App 🚗📱

A Flutter frontend app connected to a Node.js + Python backend that detects whether a driver is awake or sleepy using camera input.

## 🔧 Features

- ✅ User Signup & Login
- ✅ JWT Authentication
- ✅ View User Profile
- ✅ Camera Integration
- ✅ Face classification with AI (via /api/classify-face)
- ✅ Sleepiness Warning System ⚠️

## 🖼️ App Screens

- 🔑 Login
- 📝 Signup
- 👤 Profile
- 📸 Check Driver Status

## 🔌 Backend Integration

Ensure your backend is running at:

```
http://<YOUR_PC_IP>:5001/api
```

Update it in `lib/services/api_service.dart`:

```dart
const String baseUrl = 'http://192.168.1.7:5001/api';
```

## 🚀 Getting Started

1. Clone the repo
2. Run:
   ```bash
   flutter pub get
   flutter run
   ```

3. Give camera permission when asked.

## 🧠 AI Integration

This app connects to a Python TensorFlow model in the backend which classifies a driver's face as:

- `awake`
- `drowsy`
- `sleeping`

## 🤝 Built With

- Flutter
- Node.js
- MongoDB Atlas
- Python (TensorFlow)
- Express + REST API

## 📂 Folder Structure

```
frontend/
├── lib/
│   ├── main.dart
│   ├── screens/
│   └── services/
├── pubspec.yaml
└── README.md
```
