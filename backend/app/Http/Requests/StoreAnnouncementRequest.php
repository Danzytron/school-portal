<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreAnnouncementRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'title' => 'required|string',
            'content' => 'required|string',
            'target_audience' => 'required|in:all,students,teachers,admin'
        ];
    }
}
