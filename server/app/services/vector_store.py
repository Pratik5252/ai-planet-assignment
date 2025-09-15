from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from app.config import CHROMA_PERSIST_DIR


def get_embeddings(
    api_key: str = None, model: str = "text-embedding-3-small"
) -> OpenAIEmbeddings:
    """Get OpenAI embeddings with provided API key - no fallback"""
    if not api_key:
        raise ValueError(
            "OpenAI API key is required for embeddings. Please provide it in the component."
        )

    return OpenAIEmbeddings(model=model, openai_api_key=api_key)


def get_vector_store(
    api_key: str = None,
    model: str = "text-embedding-3-small",
    collection_name: str = "my_collection",
) -> Chroma:
    """Get Chroma vector store with custom API key and model"""
    embeddings = get_embeddings(api_key, model)

    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
    )
