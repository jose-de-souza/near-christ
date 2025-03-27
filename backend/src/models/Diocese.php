<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Parish;
use App\Models\Adoration;
use App\Models\Crusade;
use App\Models\State;

class Diocese extends Model
{
    protected $table = 'Diocese';
    protected $primaryKey = 'DioceseID';
    public $timestamps = false;

    protected $fillable = [
        'DioceseName',
        'DioceseStreetNo',
        'DioceseStreetName',
        'DioceseSuburb',
        'StateID',
        'DiocesePostcode',
        'DiocesePhone',
        'DioceseEmail',
        'DioceseWebsite',
    ];

    public function state()
    {
        return $this->belongsTo(State::class, 'StateID', 'StateID');
    }

    public function parishes()
    {
        return $this->hasMany(Parish::class, 'DioceseID', 'DioceseID');
    }

    public function adorations()
    {
        return $this->hasMany(Adoration::class, 'DioceseID', 'DioceseID');
    }

    public function crusades()
    {
        return $this->hasMany(Crusade::class, 'DioceseID', 'DioceseID');
    }
}
