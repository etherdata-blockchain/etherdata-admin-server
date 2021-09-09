FROM node:16
WORKDIR /app/etdadmin_server
COPY . .
RUN yarn
ENV NEXT_PUBLIC_APP_ID=${APP_ID}
RUN yarn build
CMD ["yarn", "start"]