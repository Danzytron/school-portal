<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class SchoolFeeResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'semester' => new SemesterResource($this->whenLoaded('semester')),
            'tuition' => $this->tuition, 'miscellaneous' => $this->miscellaneous,
            'laboratory' => $this->laboratory, 'library' => $this->library,
            'other_fees' => $this->other_fees, 'total_amount' => $this->total_amount,
            'amount_paid' => $this->amount_paid, 'balance' => $this->balance,
            'status' => $this->status
        ];
    }
}
