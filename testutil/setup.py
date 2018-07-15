from distutils.core import setup

# yapf: disable
setup(
    name='remtesting',
    packages=['remtesting'],
    # Lock down the versions so that any discrepancies will cause errors when installing test code.
    install_requires=[
        'docker>=3',
        'pymongo==3.6',
        'motor==1.2.2',
    ],
    version='0.0.1'
)
