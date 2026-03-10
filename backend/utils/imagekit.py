from imagekitio import ImageKit
from config.settings import settings

client = ImageKit(
    private_key=settings.IMAGEKIT_PRIVATE_KEY
)

async def upload_image(file_bytes: bytes, file_name: str) -> str | None:
    try:
        response = client.files.upload(
            file=file_bytes,
            file_name=file_name,
            folder="/attendance_system/"
        )
        return response.url
    except Exception as e:
        print(f"ImageKit error: {e}")
        return None