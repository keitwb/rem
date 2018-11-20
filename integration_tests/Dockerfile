FROM node:10.11-alpine

RUN apk add curl make docker bash

WORKDIR /tmp
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.12.0/bin/linux/amd64/kubectl &&\
    chmod +x ./kubectl &&\
    mv ./kubectl /usr/bin/kubectl

RUN curl -LO https://storage.googleapis.com/kubernetes-helm/helm-v2.11.0-linux-amd64.tar.gz &&\
    tar -xf helm-* &&\
    mv linux-amd64/helm /usr/bin/helm
