# pyrefly: ignore [missing-import]
from flask import Flask, render_template, request, redirect, session
from db import engine, Base,SessionLocal
from ai import analyze_resume
import models   
import PyPDF2
import docx
import json
app = Flask(__name__)
app.secret_key = "MyKey"

Base.metadata.create_all(bind = engine)


# Ensure tables are created when application starts
# with app.app_context():
#     Base.metadata.create_all(bind=engine)

@app.route('/')
def home():
    if "user" in session:
        return redirect("/dashboard")
    return redirect("/login")

# Signup route
@app.route("/signup", methods=["GET","POST"])
def signup():
    db = SessionLocal()

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        existing_user = db.query(models.User).filter_by(email=email).first()
        if existing_user:
            return "User already exists"
        if len(password) <6:
            return "password must be atleast 6 charecters"
    
        user = models.User(email = email, password = password)
        db.add(user)
        db.commit()
        return redirect("/login")

    return render_template("signup.html")


#Login route

@app.route("/login",methods=["GET","POST"])
def login():
    db = SessionLocal()

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = db.query(models.User).filter_by(email = email, password = password).first()

        if user:
            session["user"] = user.email
            return redirect("/dashboard")
        else:
            return "invalid credentials"
    return render_template("login.html")    
        

#Dashboard
@app.route("/dashboard", methods =["GET","POST"])
def dashboard():
    if "user" not in session:
        return redirect("/login")

    result = None

    if request.method == "POST":
        user_goal = request.form.get("role")
        resume_text = request.form.get("resume")

        file = request.files.get("file")

        if file and file.name != "":
            if file.filename.endswith(".pdf"):
                try:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() or ""
                    resume_text = text
                except Exception as e:
                    return f"Error reading PDF : {str(e)}"
            
            elif file and file.filename.endswith(".docx"):
                try:
                    doc = docx.Document(file)
                    text = ""
                    for para in doc.paragraphs:
                        text += para.text + "\n"
                    resume_text = text
                except Exception as e:
                    return f"Error reading DOCX : {str(e)}"

        if resume_text and user_goal:
            try:
                result = analyze_resume(resume_text, user_goal)   

                db = SessionLocal()
                user = db.query(models.User).filter_by(email=session["user"]).first()

                report = models.Reports(
                    user_id=user.id,
                    resume_text=resume_text,
                    result=json.dumps(result)
                )

                db.add(report)
                db.commit()
            except Exception as e:
                return f"Error saving report : {str(e)}"
        else:
            return "Please provide either resume text or upload a file."

    return render_template(
        "dashboard.html",
        user=session["user"],
        result=result
    )

## History show


@app.route("/history")
def history():
    # 1. Ensure user is logged in
    if "user" not in session:
        return redirect("/login")
    
    db = SessionLocal()
    try:
        # 2. Get current user
        user = db.query(models.User).filter_by(email=session["user"]).first()
        
        # 3. Query all past reports sorted by newest first
        user_reports = (
            db.query(models.Reports)
            .filter_by(user_id=user.id)
            .order_by(models.Reports.id.desc())
            .all()
        )
        # Convert Json String to Dict
        parsed_reports = []
        for r in user_reports:
            try:
                parsed_result = json.loads(r.result)
                
            except:
                parsed_result = []

            parsed_reports.append({
                "resume" : r.resume_text,
                "result" : parsed_result
            })
                
        
        return render_template("history.html", user=session["user"], reports=parsed_reports)
    finally:
        db.close()

@app.route("/logout")
def logout():
    session.pop("user",None)
    return redirect("/login")

if __name__ == '__main__':
    app.run(debug=True)

