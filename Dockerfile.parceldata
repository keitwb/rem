FROM debian:9

WORKDIR /app/parceldata
CMD ["python3", "-m", "remparceldata"]

RUN apt update &&\
    apt install -y python3-pip python3-gdal

COPY protobuf/python/ /app/protobuf/python/
COPY parceldata/requirements.txt ./
RUN pip3 install -r requirements.txt

COPY parceldata/ ./
