FROM node:22

WORKDIR /app

ARG DOCKER=false
ENV DOCKER=$DOCKER

COPY package*.json ./
RUN npm install

COPY . ./

RUN npm run build

RUN npm install -g serve
CMD ["serve", "-s", "dist", "-1", "3000"]
