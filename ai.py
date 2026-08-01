# import os
# from dotenv import load_dotenv
# from google import genai
# from google.genai import types

# # Load environment variables from .env file
# load_dotenv()

# # Initialize the client (automatically uses GEMINI_API_KEY from environment)
# client = genai.Client()

# def analyze_resume(resume_text: str, user_goal: str) -> str:
#     """
#     Analyzes resume text against a target role/goal using Gemini.
#     """
#     prompt = f"""
#     You are an expert AI HR Consultant and Resume Reviewer.
    
#     Analyze the following resume in relation to the target role/goal:
#     Target Role/Goal: {user_goal}
#     STRICT RULES :
#     -- Extract only relevant skills for this role
#     -- Remove irrelevent tools[ excel for backend, etc]
#     -- Generate roadmap only for missing fields
#     -- make output DIFFERENT  based on goal

#     Return only JSON:
#     {{
#         "overall_match": [],
#         "key_strengths":[],
#         "missing goals": [],
#         "roadmap": [],
#         "interview_questions": [],
#         "suggested_changes": [],
#         "summary"
#     }}
    
#     Resume Content:
#     {resume_text}
    
#     Please provide a detailed report including:
#     1. **Overall Match Score** (out of 100%)
#     2. **Key Strengths** for this target role
#     3. **Gaps / Missing Keywords**
#     4. **Actionable Suggestions** to improve the resume for this goal
#     """
    
#     try:
#         response = client.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=prompt,
#             config=types.GenerateContentConfig(
#                 temperature=0.4, # Lower temperature for more focused/analytical output
#             )
#         )
#         return response.text
#     except Exception as e:
#         return f"An error occurred while analyzing the resume: {str(e)}"

# ai.py
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

# Initialize the client (automatically uses GEMINI_API_KEY from environment)
client = genai.Client()

# Define Pydantic schema matching your target JSON keys
class ResumeAnalysis(BaseModel):
    overall_match: str  # e.g., "75%"
    key_strengths: list[str]
    missing_goals: list[str]
    roadmap: list[str]
    interview_questions: list[str]
    suggested_changes: list[str]
    summary: str

def analyze_resume(resume_text: str, user_goal: str) -> dict:
    """
    Analyzes resume text against a target role/goal using Gemini and returns a JSON dict.
    """
    prompt = f"""
    You are an expert AI HR Consultant and Resume Reviewer.
    
    Analyze the following resume in relation to the target role/goal:
    Target Role/Goal: {user_goal}
    
    STRICT RULES:
    -- Extract only relevant skills for this role
    -- Remove irrelevant tools (e.g., Excel for Backend Developer, etc.)
    -- Generate roadmap only for missing fields
    -- Make output DIFFERENT based on goal
    
    Resume Content:
    {resume_text}
    
    Please provide a detailed report including:
    1. Overall Match Score (out of 100%)
    2. Key Strengths for this target role
    3. Gaps / Missing Keywords (missing goals)
    4. Actionable Suggestions (suggested changes) to improve the resume for this goal
    5. A brief executive summary of the overall analysis
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeAnalysis,
                temperature=0.4,
            )
        )
        # Parse returned JSON string into a Python dictionary
        return json.loads(response.text)
        
    except Exception as e:
        return {"error": f"An error occurred while analyzing the resume: {str(e)}"}