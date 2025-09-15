from .vector_store import get_vector_store


def retrieve_context(
    query: str,
    k: int = 3,
    api_key: str = None,
    embedding_model: str = "text-embedding-3-small",
) -> str:
    """Retrieve context with custom API key and embedding model - API key required"""
    try:
        if not api_key:
            return "Error: API key is required for context retrieval."

        # Use custom vector store with provided API key
        custom_vector_store = get_vector_store(api_key, embedding_model)
        results = custom_vector_store.similarity_search(query, k=k)

        if not results:
            return "No relevant context found."

        context = "\n".join([doc.page_content for doc in results])
        return context

    except Exception as e:
        return f"Error retrieving context: {str(e)}"
