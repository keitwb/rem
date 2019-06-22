FROM node:11.15-alpine

RUN apk add --no-cache curl make docker bash mongodb mongodb-tools file

WORKDIR /tmp
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.14.1/bin/linux/amd64/kubectl &&\
    chmod +x ./kubectl &&\
    mv ./kubectl /usr/bin/kubectl

RUN curl -LO https://storage.googleapis.com/kubernetes-helm/helm-v2.12.3-linux-amd64.tar.gz &&\
    tar -xf helm-* &&\
    mv linux-amd64/helm /usr/bin/helm

WORKDIR /app
COPY package*.json ./
RUN npm install
