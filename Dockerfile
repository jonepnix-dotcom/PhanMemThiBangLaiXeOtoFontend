# Build React
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Serve bằng nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# thêm dòng này
COPY ssl /etc/nginx/ssl

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]