#LLM Configution 
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

load_dotenv()


class LLMConfig:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.0,
        streaming=True
    )


class EmbeddingConfig:
    embedding_model = OpenAIEmbeddings(
        model="text-embedding-3-small"
    )
