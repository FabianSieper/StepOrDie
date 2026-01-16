FROM node:22-alpine as builder
WORKDIR /app

RUN npm install -g npm@11.7.0
RUN npm install -g @angular/cli

COPY . .

RUN npm install
RUN npm run build

FROM caddy:2-alpine

COPY --from=builder /app/dist/StepOrDieFrontend/browser /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

# Required so that the caddyfile can read the property and forward the requests to the backend
ENV BACKEND_UPSTREAM=host.docker.internal:8081

EXPOSE 4200
