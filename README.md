# CampusHive — Training & Placement Portal

CampusHive is a comprehensive MERN stack application designed to streamline the placement process for educational institutions. It features an AI-driven resume analyzer and job matching system.

 Features

- **AI Resume Analyzer**: Powered by Groq AI for ATS scoring and optimization suggestions.
- **Job Matching**: Intelligent matching of student profiles with available job opportunities.
- **Project Portal**: Manage and view academic research and college projects.
- **Admin Dashboard**: Full control over placement statistics, student profiles, and job postings.

 Environment Setup

This project requires API keys and environment variables that are **NOT** included in the repository for security reasons.

### Required Keys:
1. **Groq API Key**: Get a free key at [console.groq.com](https://console.groq.com).
2. **MongoDB Atlas URI**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).

### Local Setup:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/campushive
   ```

2. **Configure Environment Variables:**
   - Copy `ai-engine/.env.example` to `ai-engine/.env`
   - Copy `opportunex-bcknd/.env.example` to `opportunex-bcknd/.env`
   - Copy `opportunex_frntd/opportune-x/.env.example` to `opportunex_frntd/opportune-x/.env.local`
   - Fill in your actual keys in the `.env` files.

3. **Install & Run (3 Terminals):**

   **Terminal 1 (Backend):**
   ```bash
   cd opportunex-bcknd
   npm install
   npm run dev
   ```

   **Terminal 2 (AI Engine):**
   ```bash
   cd ai-engine
   npm install
   node server.js
   ```

   **Terminal 3 (Frontend):**
   ```bash
   cd opportunex_frntd/opportune-x
   npm install
   npm run dev
   ```

## 🛡️ Security Note

- **Startup Guards**: Both servers include startup checks that will stop the process if required environment variables are missing.
- **CORS & Helm**: Configured for secure cross-origin requests and protection against common web vulnerabilities.
- **Sanitization**: All inputs are sanitized to prevent NoSQL injection and XSS.
