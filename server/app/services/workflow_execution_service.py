# app/services/workflow_service.py
from .knowledge_service import retrieve_context
from .llm_service import generate_response


def execute_simple_workflow(user_query: str) -> dict:
    """Execute: User Query → Knowledge → LLM → Output"""

    try:
        print(f"Processing query: {user_query}")

        # Step 1: User Query (already have it)
        query = user_query

        # Step 2: Knowledge Base - retrieve context
        print("Retrieving context from knowledge base...")
        context = retrieve_context(query)

        # Step 3: LLM Engine - generate response
        print("Generating response with LLM...")
        response = generate_response(query, context)

        # Step 4: Output - format result
        result = {
            "query": query,
            "context_found": context is not None,
            "context_preview": (
                context[:200] + "..." if context and len(context) > 200 else context
            ),
            "response": response,
            "success": True,
        }

        print("Workflow completed successfully")
        return result

    except Exception as e:
        print(f"Workflow error: {e}")
        return {
            "query": user_query,
            "context_found": False,
            "context_preview": None,
            "response": f"Error processing query: {str(e)}",
            "success": False,
        }
