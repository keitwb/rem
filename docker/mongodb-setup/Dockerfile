FROM mongo:3.4

RUN apt update &&\
    apt install -y mime-support

COPY setup.js /opt/setup.js

# Fixtures that help out with development, not meant for production use
COPY dev/ /opt/dev/

CMD ["mongo", "mongodb:27017/rem", "/opt/setup.js"]
