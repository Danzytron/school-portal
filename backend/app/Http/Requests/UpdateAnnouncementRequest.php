<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateAnnouncementRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'title' => 'sometimes|string',
            'content' => 'sometimes|string',
            'target_audience' => 'sometimes|in:all,students,teachers,admin'
        ];
    }
}
