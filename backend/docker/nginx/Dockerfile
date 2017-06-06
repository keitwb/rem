FROM nginx:1.10.0
MAINTAINER Ben Keith <keitwb@gmail.com>

ENTRYPOINT ["/bin/bash", "-ec"]
CMD ["\
  envsubst '$APP_HOSTNAME' < /etc/nginx/conf.d/rem.template > /etc/nginx/conf.d/rem.conf &&\
  exec nginx -g 'daemon off;' \
  "]

ARG PROTOCOL
COPY rem-${PROTOCOL}.template /etc/nginx/conf.d/rem.template
