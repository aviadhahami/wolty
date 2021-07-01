FROM node:14-slim

RUN apt-get update

WORKDIR /opt

COPY . .

RUN npm install

RUN chmod +x ./run.sh

ENTRYPOINT ["./run.sh"]
