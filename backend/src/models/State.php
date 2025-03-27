<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    // The table name if it's literally 'State' 
    protected $table = 'State';

    // The primary key
    protected $primaryKey = 'StateID';

    // Disable timestamps (no created_at / updated_at columns)
    public $timestamps = false;

    // Allow mass assignment of these columns
    protected $fillable = [
        'StateName',
        'StateAbbreviation',
    ];

    /**
     * Relationship: One State can have many Dioceses.
     */
    public function dioceses()
    {
        // hasMany(<relatedModel>, <foreignKey in Dioceses table>, <localKey in State>)
        return $this->hasMany(Diocese::class, 'StateID', 'StateID');
    }
}
