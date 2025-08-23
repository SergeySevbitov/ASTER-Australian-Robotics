FROM node:24-alpine AS angular_app
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.23.3 AS nginx

COPY default.conf /etc/nginx/conf.d/

RUN rm -rf /usr/share/nginx/html/*

COPY --from=angular_app /app/dist/apps/aster-landing/*  /usr/share/nginx/html/
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
