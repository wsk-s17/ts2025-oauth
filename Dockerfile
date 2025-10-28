FROM node:lts-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 7000

CMD ["npm", "start"]