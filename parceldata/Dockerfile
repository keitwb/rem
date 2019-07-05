FROM python:3.7 as builder

WORKDIR /opt/venv

RUN apt update &&\
    apt install -y python3-pip libgdal-dev

RUN python3 -m venv .

RUN . ./bin/activate && pip install 'GDAL<='$(gdal-config --version) --global-option=build_ext --global-option="-I/usr/include/gdal"

COPY parceldata/requirements.txt /tmp/requirements.txt

RUN . ./bin/activate && pip install -r /tmp/requirements.txt

FROM python:3.7

WORKDIR /opt/parceldata
CMD ["/opt/venv/bin/python", "-m", "remparceldata"]

RUN apt update && apt install -y libgdal20

COPY --from=builder /opt/venv /opt/venv
COPY parceldata/ ./
