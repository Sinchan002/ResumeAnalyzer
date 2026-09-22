1. Database Schema & Auth Sessions
Database Schema
The database uses two tables defined using SQLAlchemy in 

models.py
:

users Table:
id: Primary key (Integer, auto-incremented).
email: User's login email (String(100), unique, non-nullable).
password: Plain-text password string (String(255), non-nullable).
reports Table:
id: Primary key (Integer, auto-incremented).
user_id: Foreign key pointing to users.id (Integer, ForeignKey("users.id")) establishing a one-to-many relationship.
resume_text: Plain-text extracted from the uploaded PDF/DOCX or text-input resume (Text).
result: Stringified JSON containing the match score, strengths, roadmap, etc. (Text).
mermaid
erDiagram
    users ||--o{ reports : owns
    users {
        int id PK
        string email
        string password
    }
    reports {
        int id PK
        int user_id FK
        text resume_text
        text result
    }
Authentication Sessions
Mechanism: Authentication is handled using Flask's client-side cookie session (from flask import session in 

app.py
). Flask stores the session data inside a secure browser cookie.
Security: The cookie is cryptographically signed using app.secret_key = "MyKey" to prevent client-side tampering.
Authentication Flow:
Login: On successful email/password matches (via db.query(models.User).filter_by(...)), the server sets session["user"] = user.email.
Protected Routes: When accessing dashboard or history pages, a session check is run:
python
if "user" not in session:
    return redirect("/login")
Logout: The /logout route clears the session via session.pop("user", None).
2. Match Score Computation
The match score is entirely AI-driven, computed using Gemini 3.5 Flash in 

ai.py
.

Rather than relying on local rule-based keyword matching or cosine similarities of text embeddings:

The raw resume text and the user's target job role are embedded into a structured LLM prompt.
The model evaluates the skills, strengths, and gaps between the resume content and the specified role goal dynamically.
To ensure the score and overall assessment return in a structured form, the app utilizes Gemini's Structured Output feature by passing a Pydantic schema model (ResumeAnalysis):
python
class ResumeAnalysis(BaseModel):
    overall_match: str  # e.g., "75%"
    key_strengths: list[str]
    missing_goals: list[str]
    roadmap: list[str]
    interview_questions: list[str]
    suggested_changes: list[str]
    summary: str
The LLM calculates the score (out of 100%) and formats it into the JSON schema, which is parsed by json.loads() and saved to the database.
3. SQLAlchemy ORM vs. Raw SQL
SQLAlchemy ORM (Object-Relational Mapper) is a database toolkit for Python that translates between SQL databases and Python classes/objects.

Why SQLAlchemy is used here instead of raw SQL:
Pythonic / OOP Interface: Instead of writing raw SQL strings like:
sql
SELECT * FROM users WHERE email = 'user@example.com' LIMIT 1;
We query the database using standard Python:
python
user = db.query(models.User).filter_by(email=email).first()
Database Dialect Abstraction: The code connects to a cloud-based TiDB (MySQL-compatible) instance in 

db.py
:
python
DB_URL = "mysql+pymysql://3aQLqTVxZAshYjL.root:..."
If we decide to swap out TiDB for PostgreSQL, SQLite, or MSSQL, we only have to change the DB_URL string. SQLAlchemy takes care of rewriting queries into the correct SQL dialect automatically.
Automatic DDL Generation: Tables are generated on start using Base.metadata.create_all(bind=engine). We don't need to manually create table schema files or write custom SQL scripts to setup our tables.
SQL Injection Protection: SQLAlchemy automatically uses parameterized queries under the hood, neutralizing user input injection attempts.
Session / Transaction Management: SessionLocal tracks changes to objects and simplifies transaction commits (like writing db.commit()), ensuring reliable database updates and automatically managing connection pools.