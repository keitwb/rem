"""
Adapters are what fetch property/tax info from external sites and convert them to a common format
"""
import glob
from os.path import basename, dirname, isfile

MODULES = glob.glob(dirname(__file__) + "/*.py")
__all__ = [basename(f)[:-3] for f in MODULES if isfile(f) and not f.endswith("__init__.py")]
