# Data Models

The `schema` directory contais JSON Schema files that define the data model for the application.

There is a script `generate.sh` that can be used to render this model to modules in Python and
TypeScript that can be used to parse and provide static and runtime verification of the models.

The Python output includes a set of `@dataclass`es and a list of field names that are convenient for
use with Mongo document dictionaries.

The TypeScript output is a bunch of interfaces.

The code generation uses [quicktype](quicktype.io) for a lot of it, with a quick one-off script used
for the Python field names.
