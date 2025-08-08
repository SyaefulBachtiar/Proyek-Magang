<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UndanganGabungTim extends Mailable
{
    use Queueable, SerializesModels;

    public $email, $role, $undanganId;

    public function __construct($email, $role, $signedUrl)
    {
        $this->email = $email;
        $this->role = $role;
        $this->undanganId = $signedUrl;
        
    }

    
    public function build()
    {
        return $this->subject('Undangan Bergabung ke Tim')
                    ->view('emails.undangan-gabung');
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
