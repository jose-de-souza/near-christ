<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Crusade extends Model
{
    // Define table name explicitly
    protected $table = 'Crusade';

    // Define primary key
    protected $primaryKey = 'CrusadeID';

    // Disable timestamps as the table does not have created_at / updated_at fields
    public $timestamps = false;

    // Protect against mass assignment vulnerabilities
    protected $fillable = [
        'DioceseID',
        'ParishID',
        'State',
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

    // Relationship: Many Crusades belong to One Diocese
    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: Many Crusades belong to One Parish
    public function parish()
    {
        return $this->belongsTo(Parish::class, 'ParishID', 'ParishID');
    }
}
