FROM node:10.13.0-alpine

RUN mkdir -p /root/packages
RUN mkdir -p /root/public

COPY yarn.js /root/yarn.js
COPY dev-server.js /root/dev-server.js
COPY package.json /root/package.json
COPY webpack.config.js /root/webpack.config.js

WORKDIR /root

# RUN echo 'nameserver 8.8.8.8' > /etc/resolv.conf

RUN npm install yarn -g \
  && rm -rf /tmp/* \
  && rm -rf /root/.npm/

RUN yarn config set registry https://registry.npm.taobao.org

RUN yarn install

EXPOSE 8090

CMD [ "yarn", "start" ]
