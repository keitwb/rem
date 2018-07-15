FROM alpine:3.7 as base

RUN apk add --no-cache python3 g++ make python3-dev

WORKDIR "/opt"
CMD ["python3", "-m", "remsearch"]

COPY requirements.txt /opt/requirements.txt
RUN pip3 install -r /opt/requirements.txt
COPY ./remsearch/ /opt/remsearch/
