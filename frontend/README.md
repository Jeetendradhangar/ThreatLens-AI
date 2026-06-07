# ThreatLens AI — Frontend Portal

A React-based user interface for the ThreatLens AI scanning engine. It allows users to submit scanning requests, view real-time security signal breakdowns, browse aggregated threat metrics, and audit past scans.

## 💻 Tech Stack
- **React (v18)**: Component-based UI logic.
- **Vite**: Ultra-fast frontend build tool and dev server.
- **Tailwind CSS (v3)**: Modern utility-first stylesheet layouts.
- **Axios**: Promised-based client interface for backend API communications.
- **Recharts**: Responsive chart libraries used for the dashboard threat distribution.
- **React Router DOM (v6)**: Application view routing.

---

## 🚀 Setup & Execution

### 1. Installation
Navigate to the frontend directory and install the necessary package dependencies:
```bash
cd frontend
npm install
```

### 2. Configure Backend API URL
Create or update your `.env` (or copy `.env.example` to `.env`) and define the backend endpoint base URL:
```ini
VITE_API_BASE_URL=http://localhost:8000
```
*(The React app queries `http://localhost:8000` via [axiosInstance.js](file:///z:/HACKATHON/frontend/src/api/axiosInstance.js).)*

### 3. Run Development Server
Start the local Vite server:
```bash
npm run dev
```
*   The application will host at **`http://localhost:5173`**.

---

## 📂 Main Application Pages

*   **Scanner**: The landing interface containing a single input box to type or paste URLs, domains, and IPs to run live audits.
*   **Dashboard**: Displays 4 global KPI metrics (Total Scans, Safe, Suspicious, Dangerous), a threat distribution Pie Chart, and a table of the 10 most recent scans.
*   **History**: A searchable, filterable log list showing up to 50 of the most recent scans in the database.
*   **Report**: Interactive report detail showing the normalized target information, matched heuristics points, external checks, and user feedback submission forms.
