FROM node:14-slim

WORKDIR /opt

COPY . .

RUN npm install

RUN chmod +x ./run.sh

ENTRYPOINT ["./run.sh"]
