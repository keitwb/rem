FROM softinstigate/restheart:3.0.3

ENTRYPOINT ["/bin/bash", "/opt/entrypoint.sh"]

RUN apk add --no-cache wget ca-certificates &&\
    wget -O /usr/bin/gomplate https://github.com/hairyhenderson/gomplate/releases/download/v1.8.0/gomplate_linux-amd64 &&\
    chmod +x /usr/bin/gomplate

COPY entrypoint.sh /opt/entrypoint.sh
COPY restheart.yml.tmpl /opt/restheart.yml.tmpl
