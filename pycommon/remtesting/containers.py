"""
Logic for running containers used for testing dependencies
"""
import asyncio
import logging
import socket
from functools import partial as p
from contextlib import asynccontextmanager

import docker

from .util import asyncify
from .wait import wait_for_async

logging.getLogger("elasticsearch").setLevel(logging.ERROR)


async def build_async(*args, **kwargs):
    """
    Builds a docker container in an executor so it doesn't block the event loop.
    """
    client = docker.client.from_env()

    return await asyncio.get_event_loop().run_in_executor(None, p(client.images.build, *args, **kwargs))


def tcp_socket_open(host, port):
    """
    Returns true if the given host/port is listening for TCP connections
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    return sock.connect_ex((host, port)) == 0


def container_ip(container):
    """
    Returns the IP address of the given container.
    """
    container.reload()
    return container.attrs["NetworkSettings"]["IPAddress"]


@asynccontextmanager
async def run_container(image, wait_for_port=None, **kwargs):
    """
    Run a container using a context manager, yielding the container object and making sure it is
    shut down when the context is exited.
    """
    client = docker.client.from_env()

    cont = await asyncify(client.containers.run, image, detach=True, **kwargs)()

    try:
        assert await wait_for_async(p(container_ip, cont)), "Container did not get an IP address"

        if wait_for_port:
            assert await wait_for_async(p(tcp_socket_open, container_ip(cont), wait_for_port)), (
                "TCP port %d did not get opened" % wait_for_port
            )

        yield cont
    finally:
        try:
            print("Removing container %s" % image)
            print("Container %s logs:\n%s" % (image, cont.logs().decode("utf-8")))
        finally:
            cont.remove(v=True, force=True)
