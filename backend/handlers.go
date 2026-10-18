package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type Handlers struct {
	store *Store
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// fail traduce un error de la capa de datos a una respuesta HTTP.
func fail(w http.ResponseWriter, err error) {
	if errors.Is(err, ErrNotFound) {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	log.Printf("error interno: %v", err)
	writeError(w, http.StatusInternalServerError, "error interno del servidor")
}

// readInput lee y valida el cuerpo JSON. Devuelve false si ya respondió con error.
func readInput(w http.ResponseWriter, r *http.Request) (ClientInput, bool) {
	var in ClientInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "JSON inválido")
		return in, false
	}
	if err := in.Validate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return in, false
	}
	return in, true
}

func (h *Handlers) List(w http.ResponseWriter, r *http.Request) {
	clients, err := h.store.List(r.Context())
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, http.StatusOK, clients)
}

func (h *Handlers) Get(w http.ResponseWriter, r *http.Request) {
	c, err := h.store.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *Handlers) Create(w http.ResponseWriter, r *http.Request) {
	in, ok := readInput(w, r)
	if !ok {
		return
	}
	c, err := h.store.Create(r.Context(), in)
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (h *Handlers) Update(w http.ResponseWriter, r *http.Request) {
	in, ok := readInput(w, r)
	if !ok {
		return
	}
	c, err := h.store.Update(r.Context(), r.PathValue("id"), in)
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *Handlers) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.store.Delete(r.Context(), r.PathValue("id")); err != nil {
		fail(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
