# 🚀 SkillSage – Personalized AI Career Roadmap Generator

## 📌 Overview

SkillSage is an AI-powered career guidance and roadmap generation platform that helps students and aspiring professionals identify their current skill level, analyze resumes, discover skill gaps, and generate personalized learning roadmaps aligned with their career goals.

The platform bridges the gap between a learner's current abilities and industry requirements by providing structured learning plans, progress tracking, resume intelligence, and AI-assisted career recommendations.

---

## 🎯 Problem Statement

Students often face difficulties in:

- Identifying their current technical skill level
- Understanding industry expectations
- Choosing the right learning path
- Tracking progress effectively
- Preparing for job-ready roles

SkillSage solves these challenges by generating personalized career roadmaps based on user goals, skills, experience, and resume analysis.

---

## ✨ Key Features

### 📄 Resume Intelligence
- Resume upload (PDF/DOC/DOCX)
- Automatic skill extraction
- Resume parsing and analysis
- Experience level detection
- Cloud-based resume storage

### 🧠 AI-Powered Career Guidance
- Personalized career recommendations
- Skill gap identification
- Dynamic roadmap generation
- Goal-based learning paths

### 🛣️ Adaptive Roadmap Generator
- Career-specific roadmaps
- Multiple timeline options
  - 3 Months
  - 6 Months
  - 1 Year
- Milestone-based progression
- Industry-aligned skills and projects

### 📊 Skill Gap Analysis
- Detect existing skills
- Identify missing skills
- Learning priority recommendations
- Career readiness evaluation

### 📈 Progress Tracking
- Milestone completion tracking
- Roadmap progress monitoring
- Learning analytics dashboard

### 🤖 AI Career Companion
- Interactive chatbot
- Career guidance support
- Learning assistance
- Roadmap-related recommendations

---

## 🏗️ System Architecture

```text
User
 │
 ▼
Frontend (Next.js + React)
 │
 ▼
API Layer (Next.js API Routes)
 │
 ├── Resume Parser
 ├── Resume Analyzer
 ├── Skill Extractor
 ├── Skill Gap Analyzer
 ├── Roadmap Generator
 └── AI Career Assistant
 │
 ▼
Prisma ORM
 │
 ▼
SQLite Database
 │
 ▼
Cloudinary Storage
```

---

## 🛠️ Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- ShadCN UI

### Backend
- Node.js
- Next.js API Routes

### Database
- Prisma ORM
- SQLite

### Authentication
- NextAuth.js

### Cloud Storage
- Cloudinary

### AI & Analysis Modules
- Resume Parsing
- Resume Analysis
- Skill Extraction
- Skill Gap Analysis
- Adaptive Roadmap Generation

---

## 📂 Project Structure

```text
src
│
├── app
│   ├── api
│   ├── dashboard
│   ├── login
│   └── signup
│
├── components
│   ├── ResumeUpload
│   ├── GoalSetting
│   ├── RoadmapDisplay
│   ├── ReadinessScore
│   ├── SkillAnalysisCard
│   ├── SkillGapCard
│   └── AICompanion
│
├── context
│   └── RoadmapContext
│
├── lib
│   ├── resume-parser
│   ├── resume-analyzer
│   ├── skill-extractor
│   ├── skill-gap
│   ├── roadmap-generator
│   ├── readiness
│   └── career-data
│
└── prisma
```

---

## 🔄 Application Workflow

### Step 1: User Registration
- User creates an account.
- Authentication handled through NextAuth.

### Step 2: Resume Upload
- Resume uploaded to Cloudinary.
- Resume content extracted.
- Skills identified automatically.

### Step 3: Goal Selection
Users can choose:
- AI Engineer
- Data Scientist
- Java Full Stack Developer
- Custom Career Goal

### Step 4: Skill Gap Analysis

```text
Current Skills
       VS
Required Industry Skills
```

The system identifies:
- Existing skills
- Missing skills
- Improvement areas

### Step 5: Roadmap Generation

The platform generates:
- Learning phases
- Required technologies
- Project recommendations
- Certifications
- Interview preparation topics

### Step 6: Progress Tracking

Users can:
- Track completed milestones
- Monitor roadmap completion
- View readiness score

---

## 📸 Core Modules

### Resume Intelligence Module
Extracts:
- Skills
- Technical keywords
- Experience indicators

### Skill Gap Analysis Module
Calculates:
- Existing skills
- Missing skills
- Career readiness

### Adaptive Roadmap Engine
Generates:
- Personalized milestones
- Learning plans
- Project suggestions
- Certification recommendations

### Career Readiness Module
Evaluates:
- Skill completeness
- Job readiness score
- Improvement opportunities

---

## 🎓 Academic Significance

This project demonstrates practical implementation of:

- Software Engineering
- Artificial Intelligence
- Full Stack Web Development
- Database Management Systems
- Human Computer Interaction
- Recommendation Systems

---

## 🚀 Future Enhancements

- OpenAI / Gemini Integration
- Real-Time Job Market Analysis
- LinkedIn Profile Analysis
- AI Interview Simulator
- Personalized Study Planner
- Course Recommendation Engine
- Company-Specific Roadmaps
- Advanced Learning Analytics

---

## 📚 Conclusion

SkillSage is an intelligent career development platform that transforms career aspirations into structured, actionable learning journeys. By combining resume analysis, skill-gap detection, roadmap generation, and AI-powered guidance, the platform helps learners make informed decisions and become industry-ready professionals.

---

## ⭐ Final Year Engineering Project

---

## 👩‍💻 Developed By

- **Sonam Yadav**
- **Chetana Ingle**
- **Sakshi Nimsadkar**

**SkillSage – Personalized AI Career Roadmap Generator**

**Academic Year:** 2025–2026  
**Department:** Computer Engineering  
**Institute:** Dr. D. Y. Patil Institute of Engineering, Management & Research, Akurdi, Pune

---
