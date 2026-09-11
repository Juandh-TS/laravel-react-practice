# Laravel + React Practice

Monorepo de práctica con un backend API en Laravel y un frontend SPA en React, separados en carpetas independientes.

## Stack

| | Backend | Frontend |
|---|---|---|
| Lenguaje | PHP 8.5 | TypeScript |
| Framework | Laravel 13 | React 19 |
| Build / dev server | Artisan (`php artisan serve`) | Vite 8 |
| Base de datos | SQLite | — |
| Auth scaffolding | Sanctum (instalado, sin UI todavía) | — |
| Testing | Pest | — |

## Estructura

```
laravel-react-practice/
├── backend/    # API Laravel (routes/api.php -> /api/tasks)
└── frontend/   # SPA React + Vite (consume la API por fetch)
```

No hay npm workspaces ni herramientas de monorepo (Turborepo, Nx, etc.) a propósito: cada carpeta es un proyecto independiente con su propio `composer.json` / `package.json`, y así es más simple de entender mientras practicas.

## Cómo correrlo

### Backend

```bash
cd backend
composer install
cp .env.example .env   # si no existe ya
php artisan key:generate
php artisan migrate
php artisan serve
```

Queda corriendo en `http://localhost:8000`, con la API en `http://localhost:8000/api/tasks`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Queda corriendo en `http://localhost:5173` y ya está configurado (`VITE_API_URL` en `.env.example`) para apuntar al backend local.

Corre ambos a la vez (dos terminales) para ver la app completa: una lista de tareas donde puedes agregar, marcar como completadas y eliminar, todo persistido en la API de Laravel.

## Ejemplo de endpoint

```
GET    /api/tasks       lista de tareas
POST   /api/tasks       crear tarea        { "title": "..." }
GET    /api/tasks/{id}  ver una tarea
PUT    /api/tasks/{id}  actualizar tarea   { "title"?: "...", "completed"?: bool }
DELETE /api/tasks/{id}  borrar tarea
```

## Comandos de git para practicar

Este repo existe para practicar, así que aquí una chuleta rápida de los comandos más comunes ya aplicados a este proyecto:

```bash
# Ver el historial
git log --oneline --graph

# Crear una rama para una feature nueva
git checkout -b feature/agregar-prioridad-a-tareas

# Ver qué cambió antes de commitear
git status
git diff

# Commit
git add backend/app/Models/Task.php
git commit -m "Add priority field to Task model"

# Subir la rama y abrir PR
git push -u origin feature/agregar-prioridad-a-tareas
gh pr create --fill

# Traer cambios de main a tu rama
git fetch origin
git rebase origin/main   # o: git merge origin/main

# Deshacer el último commit (conservando los cambios)
git reset --soft HEAD~1

# Guardar cambios sin commitear para cambiar de rama
git stash
git stash pop

# Ver diferencias entre ramas
git diff main..feature/agregar-prioridad-a-tareas
```

Ideas para seguir practicando sobre este repo: agrega un campo `priority` a `Task`, crea una migración nueva, expón el campo en el controlador y en la UI de React — todo en una rama, con varios commits pequeños, y ábrelo como Pull Request contigo mismo para practicar el flujo completo.
