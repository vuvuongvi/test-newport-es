FROM node:12.15.0
WORKDIR /usr/src/app
COPY package*.json ./
# RUN npm ci --only=production for run production
RUN npm install
# Bundle app source
COPY . .
CMD ["node", "index.js"]