###### Protobuf compilation ######
FROM python:3 as protobuf

WORKDIR /app
RUN pip3 install grpcio-tools==1.8.4

COPY Makefile .
COPY protos/ ./protos
RUN make protobuf-python

###### Parcel Data Service ######
FROM debian:9 as parcel-data

WORKDIR /app
CMD ["python3", "-m", "parcel_data"]

RUN apt update &&\
    apt install -y python3-pip python3-gdal

COPY parcel_data/requirements.txt .
RUN pip3 install -r requirements.txt

COPY --from=protobuf /app/gis_pb2* /app/
COPY parcel_data/ /app/parcel_data

###### Parcel Data Syncer ######

###### Tax Info Service ######
