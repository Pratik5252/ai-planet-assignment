from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .vector_store import vector_store


def process_docs(file_path: str):
    loader = PyMuPDFLoader(file_path)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200, add_start_index=True
    )
    docs = text_splitter.split_documents(docs)
    vector_store.add_documents(documents=docs)
    print("Documents successfully added to vector store")
    return True
