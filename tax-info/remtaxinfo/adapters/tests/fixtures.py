import os


def load_fixture(file_name: str) -> str:
    with open(os.path.join(os.path.dirname(__file__), "fixtures/", file_name), "r") as fd:
        return fd.read()
