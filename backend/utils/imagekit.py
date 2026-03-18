from imagekitio import ImageKit
from config.settings import settings

client = ImageKit(private_key=settings.IMAGEKIT_PRIVATE_KEY)

async def upload_image(file_bytes: bytes, file_path: str) -> str | None:
    try:
        parts = file_path.rsplit('/', 1)
        folder = f"/attendance_system/{parts[0]}/" if len(parts) > 1 else "/attendance_system/"
        file_name = parts[-1]

        response = client.files.upload(
            file=file_bytes,
            file_name=file_name,
            folder=folder
        )
        return response.url
    except Exception as e:
        print(f"ImageKit error: {e}")
        return None