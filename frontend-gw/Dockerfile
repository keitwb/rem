FROM nginx:1.13.1
MAINTAINER Ben Keith <keitwb@gmail.com>

ENTRYPOINT ["bash", "-e", "/entrypoint.sh"]

RUN apt update &&\
    apt install -y certbot wget &&\
    wget -O /usr/bin/gomplate https://github.com/hairyhenderson/gomplate/releases/download/v1.8.0/gomplate_linux-amd64 &&\
    chmod +x /usr/bin/gomplate

COPY ssl.sh /opt/ssl.sh
COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf.tmpl /opt/nginx.conf.tmpl
