FROM node:10.12-alpine as builder

RUN mkdir -p /build/dist

WORKDIR /app
COPY webapp/package.json webapp/package-lock.json /app/
RUN npm install
ENV PATH=$PATH:/app/node_modules/.bin

COPY webapp/index.html /app/
COPY webapp/webpack.config.js webapp/tslint.json webapp/tsconfig.json webapp/.postcssrc.js /app/
COPY webapp/typings /app/typings
COPY webapp/src /app/src

ENV NODE_ENV production
RUN webpack

FROM nginx:1.13.1

COPY --from=builder /app/dist/ /build/dist/
COPY webapp/nginx/nginx.conf /etc/nginx/nginx.conf
