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

    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    public function adorations()
    {
        return $this->hasMany(Adoration::class, 'ParishID', 'ParishID');
    }

    public function crusades()
    {
        return $this->hasMany(Crusade::class, 'ParishID', 'ParishID');
    }

    public function state()
    {
        return $this->belongsTo(State::class, 'StateID', 'StateID');
    }
}
