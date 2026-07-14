FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["npx", "next", "dev", "-H", "0.0.0.0"]