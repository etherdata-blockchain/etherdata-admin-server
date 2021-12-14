FROM node:16-alpine as builder

ARG APP_ID
ARG PUBLIC_CLIENT_PASSWORD
ARG PUBLIC_STATS_SERVER
ARG VERSION

ENV NEXT_PUBLIC_APP_ID=${APP_ID}
ENV NEXT_PUBLIC_CLIENT_PASSWORD=${PUBLIC_CLIENT_PASSWORD}
ENV NEXT_PUBLIC_STATS_SERVER=${PUBLIC_STATS_SERVER}
ENV NEXT_PUBLIC_VERSION=${VERSION}
ENV NEXT_PUBLIC_SECRET=${NEXT_PUBLIC_SECRET}

RUN apk add --no-cache python3 py3-pip
RUN apk update && apk add make g++ && rm -rf /var/cache/apk/*

WORKDIR /app/
COPY . .
RUN yarn
RUN yarn build


FROM node:16-alpine
WORKDIR /app/
# copy from build image
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next .next


CMD ["yarn", "start"]
