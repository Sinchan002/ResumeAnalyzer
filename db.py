import os
from dotenv import load_dotenv
load_dotenv()


from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# DB_URL = "mysql+pymysql://3aQLqTVxZAshYjL.root:pvDx4Noz5Ql095wb@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test"

DB_URL =os.getenv("URL")




engine = create_engine(
    DB_URL,
    pool_pre_ping=True,  
)


SessionLocal = sessionmaker(bind=engine)
#SessonLocal = SessionLocal  # Backwards compatibility
Base = declarative_base()

