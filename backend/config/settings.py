from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URL: str
    DB_NAME: str = "attendx"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    IMAGEKIT_PUBLIC_KEY: str
    IMAGEKIT_PRIVATE_KEY: str
    IMAGEKIT_URL_ENDPOINT: str

    class Config:
        env_file = ".env"

settings = Settings()