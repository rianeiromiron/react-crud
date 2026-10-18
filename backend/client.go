package main

import (
	"errors"
	"strings"
	"time"
)

type Client struct {
	ID        string    `json:"id"`
	Nombre    string    `json:"nombre"`
	Email     string    `json:"email"`
	Telefono  string    `json:"telefono"`
	Direccion string    `json:"direccion"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ClientInput es lo que el frontend envía al crear o editar.
type ClientInput struct {
	Nombre    string `json:"nombre"`
	Email     string `json:"email"`
	Telefono  string `json:"telefono"`
	Direccion string `json:"direccion"`
}

func (c *ClientInput) Validate() error {
	c.Nombre = strings.TrimSpace(c.Nombre)
	c.Email = strings.TrimSpace(c.Email)
	if c.Nombre == "" {
		return errors.New("el nombre es obligatorio")
	}
	if c.Email == "" || !strings.Contains(c.Email, "@") {
		return errors.New("el email es obligatorio y debe ser válido")
	}
	return nil
}
