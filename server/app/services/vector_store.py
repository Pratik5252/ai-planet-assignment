from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from app.config import OPENAI_API_KEY, CHROMA_PERSIST_DIR
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vector_store = Chroma(
    collection_name="my_collection",
    embedding_function=embeddings,
    persist_directory=CHROMA_PERSIST_DIR,
)
