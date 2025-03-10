<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parish extends Model
{
    // Define table name explicitly
    protected $table = 'Parish';

    // Define primary key
    protected $primaryKey = 'ParishID';

    // Disable timestamps as the table does not have created_at / updated_at fields
    public $timestamps = false;

    // Protect against mass assignment vulnerabilities
    protected $fillable = [
        'DioceseID',
        'ParishName',
        'ParishStNumber',
        'ParishStName',
        'ParishSuburb',
        'ParishState',
        'ParishPostcode',
        'ParishPhone',
        'ParishEmail',
        'ParishWebsite'
    ];

    // Relationship: Many Parishes belong to One Diocese
    public function diocese()
    {
        return $this->belongsTo(Diocese::class, 'DioceseID', 'DioceseID');
    }

    // Relationship: One Parish has Many Adorations
    public function adorations()
    {
        return $this->hasMany(Adoration::class, 'ParishID', 'ParishID');
    }

    // Relationship: One Parish has Many Crusades
    public function crusades()
    {
        return $this->hasMany(Crusade::class, 'ParishID', 'ParishID');
    }
}
