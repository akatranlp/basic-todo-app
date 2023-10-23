FROM node:alpine as web-builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app/build

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY ./frontend/ ./
RUN pnpm build

FROM golang:1.21 as golang-builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/*.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /basic-todo-app

FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --chown=nonroot:nonroot --from=golang-builder /basic-todo-app /basic-todo-app
COPY --chown=nonroot:nonroot --from=web-builder /app/build/dist /public

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/basic-todo-app"]
