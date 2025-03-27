<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Diocese;
use App\Models\Parish;
use App\Models\State;

class Adoration extends Model
{
    protected $table = 'Adoration';
    protected $primaryKey = 'AdorationID';
    public $timestamps = false;

    // Updated fillable: remove old 'State' string, add 'StateID'
    protected $fillable = [
        'StateID',
        'DioceseID',
        'ParishID',
        'AdorationType',
        'AdorationLocation',
        'AdorationLocationType',
        'AdorationDay',
        'AdorationStart',
        'AdorationEnd'
    ];

    // Adoration belongs to one Diocese
    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    // Adoration belongs to one Parish
    public function parish()
    {
        return $this->belongsTo(Parish::class, 'ParishID', 'ParishID');
    }

    // Adoration belongs to one State
    public function state()
    {
        return $this->belongsTo(State::class, 'StateID', 'StateID');
    }
}
