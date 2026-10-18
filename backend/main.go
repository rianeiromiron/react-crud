package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// cors permite que el frontend (otro origen, p. ej. Vite en :5173) llame a la API.
func cors(next http.Handler) http.Handler {
	origin := getenv("CORS_ORIGIN", "http://localhost:5173")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions { // preflight del navegador
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	ctx := context.Background()
	dbURL := getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5433/crud?sslmode=disable")

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("conectando a Postgres: %v", err)
	}
	defer pool.Close()

	store := &Store{pool: pool}
	if err := store.Init(ctx); err != nil {
		log.Fatalf("creando tabla: %v", err)
	}

	h := &Handlers{store: store}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/clients", h.List)
	mux.HandleFunc("POST /api/clients", h.Create)
	mux.HandleFunc("GET /api/clients/{id}", h.Get)
	mux.HandleFunc("PUT /api/clients/{id}", h.Update)
	mux.HandleFunc("DELETE /api/clients/{id}", h.Delete)

	addr := ":" + getenv("PORT", "8082")
	log.Printf("API escuchando en %s", addr)
	log.Fatal(http.ListenAndServe(addr, cors(mux)))
}
