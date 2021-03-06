import time
from concurrent import futures

import grpc

from remprotobuf import gis_pb2_grpc

from .adapter import get_parcel_data_by_pin


class GISService(gis_pb2_grpc.GISServicer):
    def GetParcelInfo(self, request, context):
        return get_parcel_data_by_pin(request.county, request.state,
                                      request.pin_number)


def serve():
    """
    Start the GRPC server and block indefinitely.
    """
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    gis_pb2_grpc.add_GISServicer_to_server(GISService(), server)
    server.add_insecure_port('0.0.0.0:8080')
    server.start()

    try:
        while True:
            time.sleep(24 * 60 * 60)
    except KeyboardInterrupt:
        server.stop(0)
