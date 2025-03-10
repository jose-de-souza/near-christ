<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diocese extends Model
{
    // Define table name explicitly (if different from default pluralization)
    protected $table = 'Diocese';

    // Define primary key
    protected $primaryKey = 'DioceseID';

    // Disable timestamps since the table does not have created_at / updated_at fields
    public $timestamps = false;

    // Protect against mass assignment vulnerabilities
    protected $fillable = [
        'DioceseName',
        'DioceseStreetNo',
        'DioceseStreetName',
        'DioceseSuburb',
        'DioceseState',
        'DiocesePostcode',
        'DiocesePhone',
        'DioceseEmail',
        'DioceseWebsite'
    ];

    // Relationship: One Diocese has Many Parishes
    public function parishes()
    {
        return $this->hasMany(Parish::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: One Diocese has Many Adorations
    public function adorations()
    {
        return $this->hasMany(Adoration::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: One Diocese has Many Crusades
    public function crusades()
    {
        return $this->hasMany(Crusade::class, 'DioceseID', 'DioceseID');
    }
}
