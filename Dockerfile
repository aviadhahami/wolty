FROM mhart/alpine-node:14

WORKDIR /opt

COPY . .

RUN npm install

RUN chmod +x ./run.sh

ENTRYPOINT ["./run.sh"]
