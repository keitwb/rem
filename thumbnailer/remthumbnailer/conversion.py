from io import BytesIO
from typing import Optional

from PIL import Image, UnidentifiedImageError
from wand.image import Image as WandImage


def convert_image_bytes_to_thumbnail(media_bytes: bytes, width: int, height: int) -> Optional[BytesIO]:
    try:
        return convert_with_pil(media_bytes, width=width, height=height)
    except UnidentifiedImageError:
        return convert_with_wand(media_bytes, width=width, height=height)


def convert_with_pil(media_bytes: bytes, width: int, height: int) -> BytesIO:
    image = Image.open(BytesIO(media_bytes))
    image.thumbnail((width, height))
    thumbnail_bytes = BytesIO()
    image.save(thumbnail_bytes, format="jpeg")
    return thumbnail_bytes


def convert_with_wand(media_bytes: bytes, width: int, height: int) -> Optional[BytesIO]:
    with WandImage(blob=media_bytes, resolution=400) as img:
        if len(img.sequence) < 1:
            return None

        with WandImage(img.sequence[0], resolution=400) as thumbnail:
            thumbnail_bytes = BytesIO()
            thumbnail.format = "jpeg"
            thumbnail.compression_quality = 99
            thumbnail.resize(width, height)
            thumbnail.alpha_channel = "remove"
            thumbnail.save(file=thumbnail_bytes)
            return thumbnail_bytes
    return None
