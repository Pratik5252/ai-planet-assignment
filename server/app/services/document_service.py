from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .vector_store import get_vector_store


def process_docs(
    file_path: str, api_key: str = None, embedding_model: str = "text-embedding-3-small"
):
    """Process documents with custom API key and embedding model - API key required"""
    try:
        if not api_key:
            print("Error: API key is required for document processing")
            return False

        loader = PyMuPDFLoader(file_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200, add_start_index=True
        )
        docs = text_splitter.split_documents(docs)

        # Use custom vector store with provided API key
        custom_vector_store = get_vector_store(api_key, embedding_model)
        custom_vector_store.add_documents(documents=docs)
        print(f"Documents successfully added to vector store using {embedding_model}")

        return True

    except Exception as e:
        print(f"Error processing documents: {str(e)}")
        return False
