# express-typescript-http-api-template

Template for Express-based HTTP API Server template

### Features:

- [x] Latest Typescript
- [x] Express with types
- [x] Structured JSON-logging (pino)
- [x] Context passing with unique Request ID
- [x] Extendable healthcheck handler
- [x] Type-safe config loading from .env file
- [x] Good error-handling for routes
- [ ] Example integration of TypeORM with PostgreSQL
- [ ] Example route
- [ ] Tests
- [ ] Clean architecture separation
- [ ] Gracefull shutdown with finalising all in-flight queries

## Installation

- Node 18+
- Install dependencies with `npm install`

## Running

- `npm start` to run service
- `npm run dev` to run service in watch mode

## Configuration

Loads env variables from `.env` file. You could also specify any desired config path to load by setting `DOTENV_CONFIG_PATH` variable, e.g.:

```
DOTENV_CONFIG_PATH=./test.env npm run dev
```
