FROM docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.0

COPY datastores/es/*.index.json /opt/setup/
COPY datastores/es/setup-indexes.sh /opt/setup/
