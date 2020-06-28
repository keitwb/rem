FROM python:3.8-slim-buster as builder

RUN apt update && apt install -y gcc

WORKDIR "/opt/venv"

COPY pycommon/ /opt/pycommon/

COPY data-streamer/requirements.txt /tmp/requirements.txt
RUN python3 -m venv .
RUN . ./bin/activate && python3 -m pip install -r /tmp/requirements.txt

COPY data-streamer/remdata/ /opt/data-streamer/remdata/

FROM python:3.8-slim-buster

WORKDIR "/opt/data-streamer"
CMD ["/opt/venv/bin/python", "-m", "remdata"]

COPY --from=builder /opt/ /opt/
