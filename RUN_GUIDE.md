# How to Run the Resume Analyzer Project

This guide provides simple step-by-step commands to run both the **Flask Backend** and **React Frontend**.

---

## Terminal 1: Run Flask Backend

Open Terminal 1 and run:

```powershell
cd "d:\Resume And Internship Projects\Resume Analyzer"
.\venv\Scripts\Activate.ps1
python app.py
```

> **Backend URL**: [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## Terminal 2: Run React Frontend

Open a new Terminal window (Terminal 2) and run:

```powershell
cd "d:\Resume And Internship Projects\Resume Analyzer\Frontend"
npm run dev
```

> **Frontend Application URL**: [http://localhost:5173](http://localhost:5173) (or the port displayed in terminal)

---

## Summary Command Sheet

| Component | Commands | URL |
| :--- | :--- | :--- |
| **Backend** | `cd "d:\Resume And Internship Projects\Resume Analyzer"`<br>`.\venv\Scripts\Activate.ps1`<br>`python app.py` | `http://127.0.0.1:5000` |
| **Frontend** | `cd "d:\Resume And Internship Projects\Resume Analyzer\Frontend"`<br>`npm run dev` | `http://localhost:5173` |


Code Push Guide 

# 1. Initialize Git in your project folder (skip if already initialized)
git init

# 2. Add all files to staging
git add .

# 3. Commit your files
git commit -m "Initial commit: Resume Analyzer full-stack app"

# 4. Rename main branch to 'main'
git branch -M main

# 5. Link your local project to your GitHub repository 
# (Replace with your actual GitHub URL from Step 2)
git remote add origin https://github.com/YOUR_USERNAME/resume-analyzer.git

# 6. Push your code to GitHub
git push -u origin main


For Future Updates
Whenever you make new changes in the future and want to update GitHub, just run:

git add .
git commit -m "Describe your changes here"
git push
