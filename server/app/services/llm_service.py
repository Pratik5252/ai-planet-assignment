from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import GOOGLE_API_KEY
import os

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)


def generate_response(query: str, context: str = None) -> str:
    try:
        if context:
            prompt = f"""Based on the following context, answer the user's question.

Context: {context}

Question: {query}

Answer:"""
        else:
            prompt = f"""Answer the following question:

Question: {query}

Answer:"""

        response = llm.invoke(prompt)
        return response.content

    except Exception as e:
        return f"Error generating response: {str(e)}"
