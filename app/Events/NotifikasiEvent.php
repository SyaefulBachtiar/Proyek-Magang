<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotifikasiEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user_id;
    public $company_users;
    /**
     * Create a new event instance.
     */
    public function __construct($user_id, $company_users = [])
    {
        $this->user_id = $user_id;
        $this->company_users = $company_users;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
         $channels = [];
        
        // Broadcast ke semua user dalam perusahaan yang sama
        foreach ($this->company_users as $userId) {
            $channels[] = new PrivateChannel('user.' . $userId);
        }
        
        return $channels;
    }

    public function broadcastAs () : string
    {
        return 'notif.updated';
    }
}
