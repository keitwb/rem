FROM debian:9 as builder

RUN apt update &&\
    apt install -y curl gnupg2

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - &&\
    apt update &&\
    apt install -y nodejs &&\
    mkdir -p /build/dist

WORKDIR /app
COPY package.json /app/package.json
RUN npm install
ENV PATH=$PATH:/app/node_modules/.bin

COPY tsconfig.json .angular-cli.json /app/
COPY src /app/src

RUN ng build --output-path /build/dist --sourcemaps --deploy-url /static --prod --aot

FROM nginx:1.13.1

COPY --from=builder /build/dist/ /build/dist
COPY conf/nginx.conf /etc/nginx/nginx.conf
