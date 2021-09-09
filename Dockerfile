FROM node:16
WORKDIR /app/etdadmin_server
COPY . .
RUN yarn
RUN yarn build
CMD ["yarn", "start"]