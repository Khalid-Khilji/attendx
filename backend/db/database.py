import motor.motor_asyncio
import certifi
from config.settings import settings

client = motor.motor_asyncio.AsyncIOMotorClient(
    settings.MONGO_URL,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
    tlsAllowInvalidCertificates=True
)

db = client["attendx"]