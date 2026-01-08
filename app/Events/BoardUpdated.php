<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoardUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $boardId;
    public $type;

    /**
     * Create a new event instance.
     * * @param string $boardId
     * @param string $type  
     */
    public function __construct($boardId, $type = 'kanban') 
    {
        $this->boardId = $boardId;
        $this->type = $type;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int,
     */
    public function broadcastOn(): array
    {
        return [
             new PrivateChannel('board.' . $this->boardId),
        ];
    }

    public function broadcastAs () : string
    {
        return 'board.updated';
    }
}