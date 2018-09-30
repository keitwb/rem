.PHONY: protobuf-python
protobuf-python:
	python3 -m grpc_tools.protoc --python_out=python/remprotobuf --grpc_python_out=python/remprotobuf -I . *.proto
	sed -i'' -E -e 's/import ([a-z]+)_pb2/from . import \1_pb2/' python/remprotobuf/*_grpc.py
