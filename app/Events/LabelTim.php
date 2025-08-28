<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LabelTim
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $timId;
    public $action;
    public $labelData;
    /**
     * Create a new event instance.
     */
    public function __construct($timId, $action, $labelData)
    {
        $this->timId = $timId;
        $this->action = $action;
        $this->labelData = $labelData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('labeltim.' . $this->timId),
        ];
    }

    public function broadcastAs () : string
    {
       return 'label.tim.updated';
    }

    public function broadcastWith () : array
    {
         return [
            'tim_id' => $this->timId,
            'action' => $this->action,
            'label' => $this->labelData,
        ];
    }
}
