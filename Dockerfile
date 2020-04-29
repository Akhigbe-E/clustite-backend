FROM node:14.0.0

WORKDIR /usr/src/clustite-backend

COPY ./ ./

RUN npm install

CMD [ "/bin/bash" ]