FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM dockerhub-proxy.itcapital.io/nginx:1.23.3 AS nginx

COPY .ci/default.conf /etc/nginx/conf.d/

RUN rm -rf /usr/share/nginx/html/*

COPY --from=angular_app /app/dist/apps/aster-landing/*  /usr/share/nginx/html/
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
