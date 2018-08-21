FROM node:10.9.0-alpine

RUN mkdir -p /root/packages
RUN mkdir -p /root/public

COPY lolla /root/lolla
COPY index.js /root/index.js
COPY package.json /root/package.json
COPY webpack.config.js /root/webpack.config.js

WORKDIR /root

# RUN echo 'nameserver 9.9.9.9' > /etc/resolv.conf

RUN npm install yarn -g \
  && rm -rf /tmp/* \
  && rm -rf /root/.npm/

RUN yarn config set registry https://r.cnpmjs.org/

RUN yarn install

EXPOSE 8090

CMD [ "yarn", "start" ]
