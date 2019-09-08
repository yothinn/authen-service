FROM node:10.14.1

COPY . /src

WORKDIR /src

RUN npm install --production

EXPOSE 3000

CMD npm start