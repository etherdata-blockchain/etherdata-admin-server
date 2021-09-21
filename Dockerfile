FROM node:16

ARG APP_ID



ENV NEXT_PUBLIC_APP_ID=${APP_ID}

WORKDIR /app/etdadmin_server
COPY . .
RUN yarn


RUN yarn build
CMD ["yarn", "start"]