<?php

namespace App\Domains\Tag\Http\Controllers;

use App\Domains\Tag\Http\Requests\StoreTagRequest;
use App\Domains\Tag\Http\Resources\TagResource;
use App\Domains\Tag\Services\TagService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Tags', description: 'Tag management endpoints')]
class TagController extends Controller
{
    public function __construct(protected TagService $tagService) {}

    public function index(Request $request)
    {
        $tags = $this->tagService->listTags($request->user());

        return TagResource::collection($tags);
    }

    public function store(StoreTagRequest $request)
    {
        $tag = $this->tagService->createTag($request->user(), $request->validated());

        return (new TagResource($tag))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, int $id)
    {
        $this->tagService->deleteTag($request->user(), $id);

        return response()->noContent();
    }
}
