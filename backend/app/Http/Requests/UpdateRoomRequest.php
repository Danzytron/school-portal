<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateRoomRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'sometimes|string|unique:rooms,name,'.$this->route('room'),
            'building' => 'sometimes|string',
            'floor' => 'sometimes|string',
            'capacity' => 'sometimes|integer',
            'type' => 'sometimes|string'
        ];
    }
}
