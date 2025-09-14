from .vector_store import vector_store


def retrieve_context(query: str, k: int = 3) -> str:
    try:
        results = vector_store.similarity_search(query, k=k)
        if not results:
            return "No relevant context found."
        context = "\n".join([doc.page_content for doc in results])
        return context
    except Exception as e:
        return f"Error retrieving context: {str(e)}"
