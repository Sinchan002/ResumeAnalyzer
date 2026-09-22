import os
from dotenv import load_dotenv
load_dotenv()


from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_URL =os.getenv("URL")




engine = create_engine(
    DB_URL,
    pool_pre_ping=True,  
)


SessionLocal = sessionmaker(bind=engine)
#SessonLocal = SessionLocal  # Backwards compatibility
Base = declarative_base()

