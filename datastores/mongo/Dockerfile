FROM mongo:3.6.9

COPY setup/ /opt/setup/

CMD [ "mongod", "--bind_ip", "0.0.0.0", "--replSet", "rem" ]
