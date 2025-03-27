<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    // Explicitly define the underlying table
    protected $table = 'User';

    // Primary key
    protected $primaryKey = 'UserID';

    // Disable timestamps if the User table doesn't have created_at / updated_at
    public $timestamps = false;

    // Fields allowed to be mass assigned
    protected $fillable = [
        'UserName',
        'UserEmail',
        'UserRole',
        'UserPassword',
    ];

    /**
     * Automatically hash the password before saving.
     * Eloquent "Mutator":
     */
    public function setUserPasswordAttribute($value)
    {
        // If $value is already a bcrypt hash, use as-is
        if (
            is_string($value)
            && strlen($value) === 60
            && (substr($value, 0, 4) === '$2y$' || substr($value, 0, 4) === '$2a$')
        ) {
            $this->attributes['UserPassword'] = $value;
        } else {
            // Otherwise, hash the plain password
            $this->attributes['UserPassword'] = password_hash($value, PASSWORD_BCRYPT);
        }
    }
}
