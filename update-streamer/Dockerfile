FROM ubuntu:16.04 as base

ENTRYPOINT ["/code/main.py"]

RUN apt update &&\
    apt install -y python3 python3-pip

COPY requirements.txt /code/requirements.txt
RUN pip3 install -r /code/requirements.txt
COPY . /code
