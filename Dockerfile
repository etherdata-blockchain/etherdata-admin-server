FROM node:16
WORKDIR /app/etdadmin_server
COPY . .
RUN yarn
RUN yarn build
ENV NEXT_PUBLIC_APP_ID=${APP_ID}
CMD ["yarn", "start"]