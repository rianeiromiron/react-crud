package main

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("cliente no encontrado")

type Store struct {
	pool *pgxpool.Pool
}

const columns = "id, nombre, email, telefono, direccion, created_at, updated_at"

func scanClient(row pgx.Row) (*Client, error) {
	var c Client
	err := row.Scan(&c.ID, &c.Nombre, &c.Email, &c.Telefono, &c.Direccion, &c.CreatedAt, &c.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &c, err
}

func (s *Store) Init(ctx context.Context) error {
	_, err := s.pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS clients (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			nombre     TEXT NOT NULL,
			email      TEXT NOT NULL,
			telefono   TEXT NOT NULL DEFAULT '',
			direccion  TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`)
	return err
}

func (s *Store) List(ctx context.Context) ([]Client, error) {
	rows, err := s.pool.Query(ctx, "SELECT "+columns+" FROM clients ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	clients := []Client{} // vacío, no nil: así el JSON es [] y no null
	for rows.Next() {
		c, err := scanClient(rows)
		if err != nil {
			return nil, err
		}
		clients = append(clients, *c)
	}
	return clients, rows.Err()
}

func (s *Store) Get(ctx context.Context, id string) (*Client, error) {
	return scanClient(s.pool.QueryRow(ctx, "SELECT "+columns+" FROM clients WHERE id = $1", id))
}

func (s *Store) Create(ctx context.Context, in ClientInput) (*Client, error) {
	return scanClient(s.pool.QueryRow(ctx,
		`INSERT INTO clients (nombre, email, telefono, direccion)
		 VALUES ($1, $2, $3, $4) RETURNING `+columns,
		in.Nombre, in.Email, in.Telefono, in.Direccion))
}

func (s *Store) Update(ctx context.Context, id string, in ClientInput) (*Client, error) {
	return scanClient(s.pool.QueryRow(ctx,
		`UPDATE clients SET nombre=$2, email=$3, telefono=$4, direccion=$5, updated_at=now()
		 WHERE id=$1 RETURNING `+columns,
		id, in.Nombre, in.Email, in.Telefono, in.Direccion))
}

func (s *Store) Delete(ctx context.Context, id string) error {
	tag, err := s.pool.Exec(ctx, "DELETE FROM clients WHERE id = $1", id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
