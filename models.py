
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from db import Base, engine
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

class Reports(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_text = Column(Text)
    job_description = Column(Text, nullable=True)
    result = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

if __name__ == "__main__":
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")