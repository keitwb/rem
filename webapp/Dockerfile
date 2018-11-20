FROM node:10.12-alpine as builder

RUN mkdir -p /build/dist

WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install
ENV PATH=$PATH:/app/node_modules/.bin

COPY index.html /app/
COPY webpack.config.js tslint.json tsconfig.json .postcssrc.js /app/
COPY typings /app/typings
COPY src /app/src

ENV NODE_ENV production
RUN webpack

FROM nginx:1.13.1

COPY --from=builder /app/dist/ /build/dist/
COPY nginx/nginx.conf /etc/nginx/nginx.conf
