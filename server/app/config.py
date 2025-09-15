import os
from dotenv import load_dotenv

load_dotenv()

# API keys are now optional - they can come from user input in components
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# Optional warnings if environment variables are not set
if not OPENAI_API_KEY:
    print(
        "⚠️  OPENAI_API_KEY environment variable is not set. Users must provide API keys in components."
    )
if not GOOGLE_API_KEY:
    print(
        "⚠️  GOOGLE_API_KEY environment variable is not set. Users must provide API keys in components."
    )
