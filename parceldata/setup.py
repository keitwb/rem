from io import open
from os import path

from setuptools import find_packages, setup

HERE = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(HERE, "README.md"), encoding="utf-8") as f:
    LONG_DESCRIPTION = f.read()

setup(
    name="parceldata",
    version="1.0.0",
    long_description=LONG_DESCRIPTION,
    long_description_content_type="text/markdown",
    packages=find_packages(exclude=["virtualenv"]),
    python_requires=">=3.7",
    # GDAL is also required but installed specially
    install_requires=["shapely==1.6.4", "sanic==19.6.3"],
    extras_require={"dev": []},
)
