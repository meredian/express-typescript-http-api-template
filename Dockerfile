FROM node:18 as builder
WORKDIR	/src
ADD package.json ./
ADD package-lock.json ./
# To build we need all dependecies with types
RUN npm install
ADD . /src
RUN npm run build

# Production image - only code & prod dependencies
FROM builder as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=builder /src/dist /src/dist
COPY --from=builder /src/node_modules /src/node_modules
# Remove unnecessary dependencied after build is done
RUN npm install --omit=dev
WORKDIR	/src

# Run the app
ENTRYPOINT ["node", "dist/index.js"]

FROM production as dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY --from=builder /src /src
COPY --from=builder /src/node_modules /src/node_modules
WORKDIR	/src
# Run the app
ENTRYPOINT ["npm", "run", "dev"]
