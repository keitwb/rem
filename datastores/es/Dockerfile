FROM docker.elastic.co/elasticsearch/elasticsearch-oss:6.6.1

COPY datastores/es/*.index.json /opt/setup/
COPY datastores/es/setup-indexes.sh /opt/setup/
