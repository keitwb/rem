from setuptools import setup

# yapf: disable
setup(
    name='remtesting',
    packages=['remtesting'],
    # Lock down the versions so that any discrepancies will cause errors when installing test code.
    install_requires=[
        'docker>=3',
        'pymongo==3.6',
        'motor==1.2.2',
        'async_generator==1.9',
        'pytest==3.6.1',
        'pytest-asyncio==0.8.0',
        'pytest-xdist==1.22.2',
        'pytest-timeout==1.3.0',
        'yapf==0.22.0',
        'pylint==1.9.2',
        'ipdb==0.11',
        'elasticsearch-async==6.1.0',
    ],
    version='0.0.2'
)
