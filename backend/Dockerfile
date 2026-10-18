# Etapa 1: compilar el binario de Go
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /api .

# Etapa 2: imagen mínima que solo contiene el binario
FROM alpine:latest
COPY --from=build /api /api
EXPOSE 8082
CMD ["/api"]
