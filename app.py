# pyrefly: ignore [missing-import]
from flask import Flask, request, session, jsonify, send_from_directory
from flask_cors import CORS
from db import engine, Base, SessionLocal
from ai import analyze_resume
import models   
import PyPDF2
import docx
import json
import time
from datetime import datetime

app = Flask(__name__)
app.secret_key = "MyKey"

# Global JSON error handlers to prevent HTML error pages
@app.errorhandler(500)
def handle_500(e):
    return jsonify({"error": f"Server Error (500): {str(e)}"}), 500

@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "API route not found (404)"}), 404

# Enable CORS for React frontend
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5174", "http://127.0.0.1:5174"])

Base.metadata.create_all(bind=engine)

def format_analysis_result(raw_result, target_role, resume_text, file_name=None, report_id=None):
    raw_match = str(raw_result.get("overall_match", "75"))
    score_digits = ''.join(c for c in raw_match if c.isdigit())
    score = int(score_digits) if score_digits else 75

    raw_roadmap = raw_result.get("roadmap", [])
    roadmap_steps = []
    if isinstance(raw_roadmap, list):
        for idx, item in enumerate(raw_roadmap, start=1):
            if isinstance(item, dict):
                roadmap_steps.append(item)
            else:
                roadmap_steps.append({
                    "stepNumber": idx,
                    "timeframe": f"Milestone {idx}",
                    "title": str(item),
                    "description": f"Focus on mastering {item} to meet {target_role} expectations."
                })

    raw_questions = raw_result.get("interview_questions", [])
    interview_qs = []
    categories = ["Technical", "Behavioral", "System Design", "Leadership"]
    if isinstance(raw_questions, list):
        for idx, item in enumerate(raw_questions):
            if isinstance(item, dict):
                interview_qs.append(item)
            else:
                category = categories[idx % len(categories)]
                interview_qs.append({
                    "question": str(item),
                    "category": category,
                    "tip": "Structure your answer using the STAR method (Situation, Task, Action, Result)."
                })

    snippet = (resume_text[:200] + "...") if len(resume_text) > 200 else resume_text

    return {
        "id": str(report_id) if report_id else str(int(time.time() * 1000)),
        "timestamp": datetime.now().strftime("%b %d, %Y • %I:%M %p"),
        "targetRole": target_role,
        "score": score,
        "resumeSnippet": snippet,
        "fileName": file_name,
        "executiveSummary": raw_result.get("summary", "Analysis completed successfully."),
        "strengths": raw_result.get("key_strengths", []),
        "gaps": raw_result.get("missing_goals", []),
        "improvements": raw_result.get("suggested_changes", []),
        "roadmap": roadmap_steps,
        "interviewQuestions": interview_qs
    }

# JSON API: Get current session user
@app.route("/api/me", methods=["GET"])
def api_me():
    if "user" in session:
        return jsonify({"user": {"email": session["user"], "name": session["user"].split('@')[0]}})
    return jsonify({"user": None})

# JSON API: Signup
@app.route("/api/signup", methods=["POST"])
def api_signup():
    data = request.get_json(silent=True) or request.form
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = SessionLocal()
    try:
        existing_user = db.query(models.User).filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400

        user = models.User(email=email, password=password)
        db.add(user)
        db.commit()
        session["user"] = user.email
        return jsonify({"status": "success", "user": {"email": user.email, "name": user.email.split('@')[0]}})
    finally:
        db.close()

# JSON API: Login
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or request.form
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = SessionLocal()
    try:
        user = db.query(models.User).filter_by(email=email, password=password).first()
        if user:
            session["user"] = user.email
            return jsonify({"status": "success", "user": {"email": user.email, "name": user.email.split('@')[0]}})
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    finally:
        db.close()

# JSON API: Logout
@app.route("/api/logout", methods=["POST", "GET"])
def api_logout():
    session.pop("user", None)
    return jsonify({"status": "success"})

# JSON API: Analyze Resume (Limit: 3 per day)
@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    if "user" not in session:
        return jsonify({"error": "Please log in to analyze your resume."}), 401

    user_goal = request.form.get("role") or (request.get_json(silent=True) or {}).get("role")
    resume_text = request.form.get("resume") or (request.get_json(silent=True) or {}).get("resume") or ""

    file = request.files.get("file")
    file_name = None

    if file and file.filename != "":
        file_name = file.filename
        if file.filename.endswith(".pdf"):
            try:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() or ""
                resume_text = text
            except Exception as e:
                return jsonify({"error": f"Error reading PDF: {str(e)}"}), 400
        elif file.filename.endswith(".docx"):
            try:
                doc = docx.Document(file)
                text = ""
                for para in doc.paragraphs:
                    text += para.text + "\n"
                resume_text = text
            except Exception as e:
                return jsonify({"error": f"Error reading DOCX: {str(e)}"}), 400

    if not resume_text or not user_goal:
        return jsonify({"error": "Please provide either resume text or upload a file, along with target role."}), 400

    # Rate limiting check: Max 3 resumes per day per user
    today_scans = 0
    db = SessionLocal()
    try:
        user = db.query(models.User).filter_by(email=session["user"]).first()
        if not user:
            return jsonify({"error": "User session invalid."}), 401

        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_scans = (
            db.query(models.Reports)
            .filter(models.Reports.user_id == user.id, models.Reports.created_at >= today_start)
            .count()
        )
        MAX_DAILY_ANALYSES = 3
        if today_scans >= MAX_DAILY_ANALYSES:
            return jsonify({
                "error": f"Daily limit reached! You have used {today_scans}/{MAX_DAILY_ANALYSES} analyses today. Please try again tomorrow."
            }), 429
    finally:
        db.close()

    try:
        raw_result = analyze_resume(resume_text, user_goal)

        if isinstance(raw_result, dict) and "error" in raw_result:
            return jsonify({"error": raw_result["error"]}), 500

        if isinstance(raw_result, dict):
            raw_result["target_role"] = user_goal

        report_id = None
        if "user" in session:
            db = SessionLocal()
            try:
                user = db.query(models.User).filter_by(email=session["user"]).first()
                if user:
                    report = models.Reports(
                        user_id=user.id,
                        resume_text=resume_text,
                        job_description=user_goal,
                        result=json.dumps(raw_result)
                    )
                    db.add(report)
                    db.commit()
                    db.refresh(report)
                    report_id = report.id
            finally:
                db.close()

        formatted_analysis = format_analysis_result(
            raw_result=raw_result,
            target_role=user_goal,
            resume_text=resume_text,
            file_name=file_name,
            report_id=report_id
        )

        return jsonify({
            "status": "success",
            "analysis": formatted_analysis,
            "today_scans": today_scans + 1,
            "max_daily": 3
        })

    except Exception as e:
        return jsonify({"error": f"Error processing resume analysis: {str(e)}"}), 500

# JSON API: History
@app.route("/api/history", methods=["GET"])
def api_history():
    if "user" not in session:
        return jsonify({"history": [], "today_scans": 0, "max_daily": 3})

    db = SessionLocal()
    try:
        user = db.query(models.User).filter_by(email=session["user"]).first()
        if not user:
            return jsonify({"history": [], "today_scans": 0, "max_daily": 3})

        user_reports = (
            db.query(models.Reports)
            .filter_by(user_id=user.id)
            .order_by(models.Reports.id.desc())
            .all()
        )

        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_scans = (
            db.query(models.Reports)
            .filter(models.Reports.user_id == user.id, models.Reports.created_at >= today_start)
            .count()
        )

        history_items = []
        for r in user_reports:
            try:
                parsed_result = json.loads(r.result)
                target_role = (
                    getattr(r, "job_description", None)
                    or (parsed_result.get("target_role") if isinstance(parsed_result, dict) else None)
                    or "Target Role"
                )
                item = format_analysis_result(
                    raw_result=parsed_result,
                    target_role=target_role,
                    resume_text=r.resume_text or "",
                    report_id=r.id
                )
                history_items.append(item)
            except Exception:
                continue

        return jsonify({"history": history_items, "today_scans": today_scans, "max_daily": 3})
    finally:
        db.close()

# Root API Info route
@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "Career AI Resume Analyzer API",
        "frontend": "http://localhost:5173",
        "endpoints": [
            "/api/me",
            "/api/signup",
            "/api/login",
            "/api/logout",
            "/api/analyze",
            "/api/history"
        ]
    })

# SEO: Serve robots.txt from Frontend public folder if requested via Flask
@app.route('/robots.txt')
def robots():
    return send_from_directory('Frontend/public', 'robots.txt')

# SEO: Serve sitemap.xml from Frontend public folder if requested via Flask
@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('Frontend/public', 'sitemap.xml')

if __name__ == '__main__':
    app.run(debug=True, port=5000)



