from setuptools import setup

TEST_DEPS = [
    "black==18.9b",
    "ipdb==0.11",
    "isort==4.3.4",
    "mypy==0.701",
    "pylint==2.3.1",
    "pylint-protobuf==0.2",
    "pytest==3.7.4",
    "pytest-asyncio==0.10.0",
    "pytest-xdist==1.23.0",
    "pytest-timeout==1.3.3",
]

# yapf: disable
setup(
    name='pycommon',
    packages=['remcommon', 'remtesting'],
    # Lock down the versions so that any discrepancies will cause errors when installing test code.
    install_requires=[
        "python-dateutil==2.7.5",
        'docker>=3',
        'pymongo==3.7.1',
        'motor==2.0.0',
        'dnspython>=1.16.0',
        'elasticsearch-async==6.2.0',
        # Fixes pipenv resolution issue, isn't used directly
        'idna==2.7',
        'uvloop==0.12.2',
    ],
    tests_require=TEST_DEPS,
    extras_require={
        'test': TEST_DEPS,
    },
    version='0.0.8'
)
