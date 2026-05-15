# 🌾 FieldSync AI - NGO Operations Management Platform

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/VishKal07/FieldSyncAI)](https://github.com/VishKal07/FieldSyncAI/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/VishKal07/FieldSyncAI)](https://github.com/VishKal07/FieldSyncAI/issues)

## 📋 Overview

**FieldSync AI** is a comprehensive MERN stack application designed for NGO field operations management. It provides separate dashboards for **Admins** and **Field Workers**, AI-powered insights, activity tracking, and task assignment capabilities.

### 🎯 Key Features

- **👨‍💼 Admin Dashboard**
  - Overview with key metrics and charts
  - AI-generated insights using Anthropic Claude
  - Worker management (add, edit, delete)
  - Intelligent task assignment
  - Region performance tracking

- **👷 Field Worker Dashboard**
  - Personal dashboard with task tracking
  - Activity logging with spreadsheet-style interface
  - AI-generated daily summaries
  - Activity history view

- **🤖 AI Integration**
  - Real-time insights powered by Claude API
  - Automated daily summaries for workers
  - Smart recommendations for admins

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Anthropic Claude API** - AI integration

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 📁 Project Structure
FieldSyncAI/
├── backend/
│ ├── controllers/ # Business logic
│ ├── models/ # Database models
│ ├── routes/ # API endpoints
│ ├── middleware/ # Auth middleware
│ ├── server.js # Entry point
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── contexts/ # Context API
│ │ ├── utils/ # Utilities
│ │ ├── App.js
│ │ └── index.js
│ └── package.json
└── README.md


## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
echo PORT=5000 > .env
echo MONGODB_URI=your_mongodb_connection_string >> .env
echo JWT_SECRET=your_jwt_secret_key >> .env
echo ANTHROPIC_API_KEY=your_claude_api_key >> .env

# Seed demo users (optional)
node seedUsers.js

# Start backend server
npm run dev

Demo Credentials
Admin Login:
Email: admin@fieldsync.com
Password: admin123

Worker Login:
Email: arjun@fieldsync.com
Password: worker123

📊 API Endpoints
Method	Endpoint	Description
POST	/api/auth/login	User login
GET	/api/auth/me	Get current user
GET	/api/workers	Get all workers (admin)
POST	/api/workers	Add new worker (admin)
GET	/api/activities	Get activities
POST	/api/activities	Log new activity
POST	/api/tasks/assign	Assign task (admin)
GET	/api/tasks/my-tasks	Get worker tasks
POST	/api/ai/summary	Generate AI summary
POST	/api/ai/insights	Generate AI insights
