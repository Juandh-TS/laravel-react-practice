<?php

namespace App\Domains\Task\Policies;

use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    use HandlesAuthorization;

   public function view(User $user, Task $task)
   {
        //. Si es de la misma empresa
        if ($task->company_id !== $user->company_id) {
            return Response::deny("No perteneces a la empresa de esta tarea.");
        }

        //2. Dueñom asignador o adminitrador puede verla
        $canAccess = $task->user_id === $user->id
            || $task->assigned_by_user_id === $user->id
            || $user->isAdmin();
        
            return $canAccess ? Response::allow() : Response::deny("No tienes permiso para ver esta tarea.");
   }

   public function update(User $user, Task $task)
   {
        if ($task->company_id !== $user->company_id) {
            return Response::deny("No perteneces a la empresa de esta tarea.");
        }

        // Regla: Si fue asignada por un admin, un usuario normal no puede editarla libremente
        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {
            return Response::allow();
        }
   }

   public function delete(User $user, Task $task): Response
   {
        if ($task->company_id !== $user->company_id) {
            return Response::deny("No perteneces a la empresa de esta tarea.");
        }

        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {
            return Response::deny("No puedes eliminar una tarea asignada por un administrador.");
        }

        return Response::allow();
   }
}