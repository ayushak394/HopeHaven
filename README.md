# 🧠 HopeHaven: Mental Wellness Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/SpringBoot-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat&logo=chart.js&logoColor=white)](https://recharts.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-000000?style=flat&logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![AI](https://img.shields.io/badge/AI-Sentiment_Analysis-purple?style=flat)]()
[![Security](https://img.shields.io/badge/Security-JWT-green?style=flat)]()

## 🌐 Live Demo

🔗 [View HopeHaven Live](https://hope-haven-xi.vercel.app/)

HopeHaven is a full-stack mental wellness platform designed to help users understand, regulate, and improve their emotional well-being. It combines mood tracking, journaling, AI-driven sentiment analysis, and interactive dashboards with grounding exercises and safety support features to provide a holistic mental health experience.
Designed to go beyond tracking by helping users actively regulate emotions using grounding techniques and behavioral insights.
## 🚀 Features

- 🔐 Secure Authentication using Firebase
- 😊 Mood Tracking with Emotional Insights
- 📔 Encrypted Journaling System
- 🤖 AI-powered sentiment analysis for emotional insight extraction
- 📊 Interactive Wellness Dashboard (Recharts Visualizations)
- 📄 Downloadable PDF Reports (Playwright-based backend rendering)
- 🌬️ Guided Breathing & Grounding Exercises
- 🛟 Safety & Support Section (Emergency resources + calming tools)
- 🎯 Achievements & Engagement Tracking
- ⚡ Modern UI with smooth animations and responsive design
- 
## 🛠 Tech Stack

### 🖥 Frontend
- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Recharts (Data Visualization)

### ⚙️ Backend
- Spring Boot (Java)
- REST APIs
- JWT Authentication (Firebase Token Verification)

### 🔐 AI/Processing
- Sentiment Analysis for Journal/Mood Entries

### 🧘‍♂️ Mental Wellness Features
- Breathing & Grounding Exercises (frontend-driven)
- Emotional insights & pattern tracking

### ☁️ Deployment & DevOps
- Docker (Containerization)
- Render (Backend Hosting)
- Vercel (Frontend Hosting)

## 🚀 Getting Started

Follow these steps to set up and run the project locally:

### ✅ Prerequisites

- Node.js (LTS version)
- Java 17+
- Maven
- Firebase Project (for Auth)

## 🛠 Setup Guide

1️⃣ **Clone the Repository** :
```bash
git clone https://github.com/ayushak394/HopeHaven.git
cd HopeHaven
```

2️⃣ **Install Dependencies** :

Install packages for both frontend and backend:
```bash
cd client
npm install
cd ../server
mvn clean install
cd ..
```

3️⃣ **Configure Environment Variables** :

Create a client/.env.local file inside the client directory with the following:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Add this inside application.properties in server directory:
```bash
spring.datasource.url=your_database_url
spring.datasource.username=your_username
spring.datasource.password=your_password

jwt.secret=your_secret

firebase.credentials.path=path_to_firebase_config.json
```

4️⃣ **Start the Application** :

Start the Backend:
```bash
cd server
mvn spring-boot:run
```

Start the Frontend:
```bash
cd ../client
npm run dev
```

## 📜 License

This project is created for learning and educational purposes. Contributions and improvements are welcome!
