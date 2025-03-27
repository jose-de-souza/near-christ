<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Diocese;
use App\Models\Parish;
use App\Models\State;

class Crusade extends Model
{
    protected $table = 'Crusade';
    protected $primaryKey = 'CrusadeID';
    public $timestamps = false;

    // Updated fillable: remove old 'State' string, add 'StateID'
    protected $fillable = [
        'StateID',
        'DioceseID',
        'ParishID',
        'ConfessionStartTime',
        'ConfessionEndTime',
        'MassStartTime',
        'MassEndTime',
        'CrusadeStartTime',
        'CrusadeEndTime',
        'ContactName',
        'ContactPhone',
        'ContactEmail',
        'Comments'
    ];

    // Crusade belongs to one Diocese
    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    // Crusade belongs to one Parish
    public function parish()
    {
        return $this->belongsTo(Parish::class, 'ParishID', 'ParishID');
    }

    // Crusade belongs to one State
    public function state()
    {
        return $this->belongsTo(State::class, 'StateID', 'StateID');
    }
}
