<?php

namespace App\Domains\Comment\Http\Controllers;

use App\Domains\Comment\Http\Requests\StoreCommentRequest;
use App\Domains\Comment\Http\Resources\CommentResource;
use App\Domains\Comment\Services\CommentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Comments', description: 'Task comment endpoints')]
class CommentController extends Controller
{
    public function __construct(protected CommentService $commentService) {}

    /**
     * Display a listing of the comments for a task.
     */
    #[OA\Get(
        path: '/api/tasks/{task}/comments',
        tags: ['Comments'],
        summary: 'List comments for a task',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 403, description: 'Not authorized to view this task'),
            new OA\Response(response: 404, description: 'Task not found'),
        ]
    )]
    public function index(Request $request, int $task)
    {
        $comments = $this->commentService->listComments($request->user(), $task);

        return CommentResource::collection($comments);
    }

    /**
     * Store a newly created comment for a task.
     */
    #[OA\Post(
        path: '/api/tasks/{task}/comments',
        tags: ['Comments'],
        summary: 'Add a comment to a task',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 201, description: 'Comment created'),
            new OA\Response(response: 403, description: 'Not authorized to comment on this task'),
            new OA\Response(response: 404, description: 'Task not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCommentRequest $request, int $task)
    {
        $comment = $this->commentService->createComment($request->user(), $task, $request->validated());

        return (new CommentResource($comment))->response()->setStatusCode(201);
    }

    /**
     * Remove the specified comment from storage.
     */
    #[OA\Delete(
        path: '/api/tasks/{task}/comments/{comment}',
        tags: ['Comments'],
        summary: 'Delete a comment',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'comment', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Comment deleted'),
            new OA\Response(response: 403, description: 'Not authorized to delete this comment'),
            new OA\Response(response: 404, description: 'Comment not found'),
        ]
    )]
    public function destroy(Request $request, int $task, int $comment)
    {
        $this->commentService->deleteComment($request->user(), $task, $comment);

        return response()->noContent();
    }
}
