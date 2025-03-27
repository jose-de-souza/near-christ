<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Diocese;
use App\Models\Adoration;
use App\Models\Crusade;
use App\Models\State;

class Parish extends Model
{
    protected $table = 'Parish';
    protected $primaryKey = 'ParishID';
    public $timestamps = false;

    // Updated fillable: remove old 'ParishState', add 'StateID'
    protected $fillable = [
        'DioceseID',
        'ParishName',
        'ParishStNumber',
        'ParishStName',
        'ParishSuburb',
        'StateID',
        'ParishPostcode',
        'ParishPhone',
        'ParishEmail',
        'ParishWebsite'
    ];

    // Many Parishes belong to One Diocese
    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    // One Parish has Many Adorations
    public function adorations()
    {
        return $this->hasMany(Adoration::class, 'ParishID', 'ParishID');
    }

    // One Parish has Many Crusades
    public function crusades()
    {
        return $this->hasMany(Crusade::class, 'ParishID', 'ParishID');
    }

    // Parish belongs to one State
    public function state()
    {
        return $this->belongsTo(State::class, 'StateID', 'StateID');
    }
}
