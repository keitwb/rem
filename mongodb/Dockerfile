FROM mongo:3.6

RUN apt update &&\
    apt install -y mime-support

COPY migrations /opt/migrations

# Fixtures that help out with development
COPY dev/ /opt/dev/
WORKDIR "/opt/migrations"
CMD ["mongo", "mongodb:27017/rem", "/opt/migrations/setup.js"]
