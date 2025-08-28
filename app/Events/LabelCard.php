<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use PhpParser\Node\Expr\Cast\Array_;

class LabelCard implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $cardId;
    public $action;
    public $labelData;
    public $userId;
    /**
     * Create a new event instance.
     */
    public function __construct($cardId, $action, $labelData, $userId)
    {
        $this->cardId = $cardId;
        $this->action = $action;
        $this->labelData = $labelData;
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('labelcard.' .$this->cardId),
        ];
    }

    public function broadcastAs () : string
    {
        return 'label.card.updated';
    }

    public function broadcastWith () : array
    {
        return [
            'card_id' => $this->cardId,
            'action' => $this->action,
            'label' => $this->labelData,
            'user_id' => $this->userId,
            'timestamp' => now()->toISOString()
        ];
    }
}
