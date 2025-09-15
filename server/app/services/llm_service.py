from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI


def generate_response(
    query: str,
    context: str = None,
    custom_prompt: str = None,
    api_key: str = None,
    model: str = "gemini-2.5-flash",
    temperature: float = 0.7,
) -> str:
    try:
        # API key is required - no fallback
        if not api_key:
            return "Error: No API key provided. Please add your OpenAI or Google API key in the component."

        # Determine which LLM to use based on model
        if model.startswith("gpt-"):
            # OpenAI models
            llm = ChatOpenAI(model=model, temperature=temperature, api_key=api_key)
        else:
            # Google models (default)
            llm = ChatGoogleGenerativeAI(
                model=model, temperature=temperature, google_api_key=api_key
            )

        # Build prompt
        if custom_prompt:
            if context:
                prompt = f"""{custom_prompt}

Context: {context}

Question: {query}

Answer:"""
            else:
                prompt = f"""{custom_prompt}

Question: {query}

Answer:"""
        else:
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
