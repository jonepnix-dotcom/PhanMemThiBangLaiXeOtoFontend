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

# thêm dòng này
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]