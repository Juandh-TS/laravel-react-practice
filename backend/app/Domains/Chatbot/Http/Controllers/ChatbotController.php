<?php

namespace App\Domains\Chatbot\Http\Controllers;

use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Chatbot', description: 'Chatbot assistant endpoint')]
class ChatbotController extends Controller
{
    public function __construct(
        protected TaskRepositoryInterface $taskRepository,
        protected UserRepositoryInterface $userRepository,
        protected CompanyRepositoryInterface $companyRepository,
    ) {
    }

    /**
     * Answer a question using the data currently visible in the app
     * (the same tasks/users/companies the authenticated user can already see).
     */
    #[OA\Post(
        path: '/api/chatbot/ask',
        tags: ['Chatbot'],
        summary: 'Ask the chatbot assistant a question',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 502, description: 'Chatbot upstream request failed'),
            new OA\Response(response: 503, description: 'Chatbot not configured'),
        ]
    )]
    public function ask(Request $request)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:2000'],
        ]);

        $apiKey = config('services.groq.key');

        if (! $apiKey) {
            return response()->json([
                'message' => 'El chatbot no está configurado todavía: falta GROQ_API_KEY en el backend/.env.',
            ], 503);
        }

        $user = $request->user();
        $context = $this->buildContext($user);

        $systemInstruction = "Eres el asistente virtual de esta aplicación de gestión de tareas, usuarios y empresas.\n"
            ."Responde SIEMPRE en español, de forma breve y clara.\n"
            ."Usa únicamente los datos del siguiente contexto JSON para responder; es exactamente lo que el usuario actual puede ver en la app (pestañas Tareas, Usuarios y Empresas).\n"
            ."Si la respuesta no se puede deducir del contexto, dilo honestamente en vez de inventar datos.\n\n"
            .'Usuario actual: '.$user->name." (id {$user->id}, empresa: ".($user->company->name ?? 'sin empresa').")\n\n"
            .'Contexto JSON:'."\n".json_encode($context, JSON_UNESCAPED_UNICODE);

        $messages = collect([['role' => 'system', 'content' => $systemInstruction]])
            ->concat($validated['history'] ?? [])
            ->push(['role' => 'user', 'content' => $validated['message']])
            ->values()
            ->all();

        $model = config('services.groq.model');

        $response = Http::timeout(30)
            ->withToken($apiKey)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
            ]);

        if ($response->failed()) {
            Log::error('Groq chatbot request failed', ['status' => $response->status(), 'body' => $response->body()]);

            return response()->json([
                'message' => 'No se pudo contactar al asistente en este momento. Inténtalo de nuevo más tarde.',
            ], 502);
        }

        $reply = $response->json('choices.0.message.content');

        return response()->json([
            'message' => $reply ?? 'No obtuve una respuesta del asistente. Intenta reformular la pregunta.',
        ]);
    }

    /**
     * Snapshot of the same data the user already sees in the Tasks/Users/Companies tabs.
     */
    private function buildContext($user): array
    {
        $tasks = $this->taskRepository->getAllForUser($user)
            ->take(200)
            ->map(fn ($task) => [
                'id' => $task->id,
                'titulo' => $task->title,
                'completada' => $task->completed,
                'usuario' => $task->user?->name,
                'compartida_con_empresa' => (bool) $task->company_id,
            ]);

        $users = $this->userRepository->getAll()
            ->take(200)
            ->map(fn ($u) => [
                'id' => $u->id,
                'nombre' => $u->name,
                'email' => $u->email,
                'empresa' => $u->company?->name,
                'activo' => $u->is_active,
                'ultimo_login' => optional($u->last_login_at)->toDateTimeString(),
            ]);

        $companies = $this->companyRepository->getAll()
            ->take(200)
            ->map(fn ($c) => [
                'id' => $c->id,
                'nombre' => $c->name,
                'cantidad_usuarios' => $c->users_count,
            ]);

        return [
            'tareas' => $tasks,
            'usuarios' => $users,
            'empresas' => $companies,
        ];
    }
}
