FROM mongo:3.6

RUN apt update &&\
    apt install -y mime-support

COPY dev/fixtures/ /opt/dev/
WORKDIR "/opt/dev"
CMD ["/opt/dev/load-fixtures.sh"]
