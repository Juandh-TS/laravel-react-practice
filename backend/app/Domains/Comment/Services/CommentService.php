<?php

namespace App\Domains\Comment\Services;

use App\Domains\Comment\Models\Comment;
use App\Domains\Comment\Repositories\Contracts\CommentRepositoryInterface;
use App\Domains\Task\Services\TaskService;
use App\Domains\User\Models\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CommentService
{
    public function __construct(
        protected CommentRepositoryInterface $commentRepository,
        protected TaskService $taskService,
    ) {}

    public function listComments(User $user, int $taskId)
    {
        $this->taskService->authorizedTask($user, $taskId);

        return $this->commentRepository->getAllForTask($taskId);
    }

    public function createComment(User $user, int $taskId, array $data): Comment
    {
        $this->taskService->authorizedTask($user, $taskId);

        return $this->commentRepository->create([
            'task_id' => $taskId,
            'user_id' => $user->id,
            'body' => $data['body'],
        ]);
    }

    public function deleteComment(User $user, int $taskId, int $commentId): void
    {
        $this->taskService->authorizedTask($user, $taskId);

        $comment = $this->commentRepository->getById($commentId);

        if (!$comment || $comment->task_id !== $taskId) {
            throw new NotFoundHttpException('Comment not found');
        }

        abort_unless(
            $comment->user_id === $user->id || $user->isAdmin(),
            403,
            'No autorizado para borrar este comentario'
        );

        $this->commentRepository->delete($commentId);
    }
}
