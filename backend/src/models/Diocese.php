<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diocese extends Model
{
    protected $table = 'Diocese';
    protected $primaryKey = 'DioceseID';
    public $timestamps = false;

    // Updated fillable: remove old 'DioceseState' and add 'StateID'
    protected $fillable = [
        'DioceseName',
        'DioceseStreetNo',
        'DioceseStreetName',
        'DioceseSuburb',
        'StateID',           // numeric foreign key to State
        'DiocesePostcode',
        'DiocesePhone',
        'DioceseEmail',
        'DioceseWebsite',
    ];

    // Relationship: One Diocese belongsTo One State
    public function state()
    {
        return $this->belongsTo(State::class, 'StateID', 'StateID');
    }

    // Relationship: One Diocese has Many Parishes
    public function parishes()
    {
        return $this->hasMany(Parish::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: One Diocese has Many Adorations
    public function adorations()
    {
        return $this->hasMany(\App\Models\Adoration::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: One Diocese has Many Crusades
    public function crusades()
    {
        return $this->hasMany(\App\Models\Crusade::class, 'DioceseID', 'DioceseID');
    }
}
