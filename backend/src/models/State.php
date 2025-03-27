<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Diocese;

class State extends Model
{
    protected $table = 'State';
    protected $primaryKey = 'StateID';
    public $timestamps = false;

    protected $fillable = [
        'StateName',
        'StateAbbreviation',
    ];

    public function dioceses()
    {
        return $this->hasMany(Diocese::class, 'StateID', 'StateID');
    }
}
