<?php

namespace App\models;

use Illuminate\Database\Eloquent\Model;

class Adoration extends Model
{
    // Define table name explicitly
    protected $table = 'Adoration';

    // Define primary key
    protected $primaryKey = 'AdorationID';

    // Disable timestamps as the table does not have created_at / updated_at fields
    public $timestamps = false;

    // Protect against mass assignment vulnerabilities
    protected $fillable = [
        'DioceseID',
        'ParishID',
        'State',
        'AdorationType',
        'AdorationLocation',
        'AdorationLocationType',
        'AdorationDay',
        'AdorationStart',
        'AdorationEnd'
    ];

    // Relationship: Many Adorations belong to One Diocese
    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: Many Adorations belong to One Parish
    public function parish()
    {
        return $this->belongsTo(Parish::class, 'ParishID', 'ParishID');
    }
}
