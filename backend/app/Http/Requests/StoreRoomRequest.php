<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreRoomRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'required|string|unique:rooms',
            'building' => 'required|string',
            'floor' => 'required|string',
            'capacity' => 'required|integer',
            'type' => 'required|string'
        ];
    }
}
