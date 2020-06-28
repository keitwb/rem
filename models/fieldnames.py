#!/usr/env/python3

"""
Generates a Python module that has constants that represent all of the field names on the data
models.
"""

import json
import os
import re
import sys
import subprocess


def generate_json_schema():
    """
    Makes the schema less normalized so it is simpler to transform.
    """
    com = subprocess.run(
        "quicktype --src-lang schema --lang schema schema/*.json",
        capture_output=True,
        shell=True,
        check=True,
        cwd=os.path.dirname(os.path.abspath(__file__)),
    )
    return json.loads(com.stdout)


CAMEL_CASE_WORD_BOUNDARY = re.compile(r"([a-z])([A-Z])")


def camel_case_to_snake_case(s: str) -> str:
    return CAMEL_CASE_WORD_BOUNDARY.sub(lambda m: m.group(1) + "_" + m.group(2), s)


def make_constants(schema):
    for name, sc in schema["definitions"].items():
        if sc["type"] != "object" or name == "OID":
            continue

        for pname in sc["properties"].keys():
            print(
                f'{camel_case_to_snake_case(name).upper()}_{camel_case_to_snake_case(pname).upper()} = "{pname}"'
            )

        print("")


if __name__ == "__main__":
    try:
        make_constants(generate_json_schema())
    except subprocess.CalledProcessError as e :
        sys.stderr.write("Failed to run: %s" % e.stderr)
