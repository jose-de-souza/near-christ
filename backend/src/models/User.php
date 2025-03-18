<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    // Explicitly define the underlying table
    protected $table = 'User';

    // Define the primary key column
    protected $primaryKey = 'UserID';

    // This table does not have created_at / updated_at columns
    public $timestamps = false;

    // Which attributes can be mass-assigned
    protected $fillable = [
        'UserName',
        'UserEmail',
        'UserRole',
        'UserPassword',
    ];

    /**
     * Mutator for UserPassword:
     * Automatically hash the password before saving to DB.
     */
    public function setUserPasswordAttribute($value)
    {
        // Check if the provided value is already hashed
        if (password_get_info($value)['algo'] === 0) {
            // If not hashed, use password_hash with BCRYPT
            $this->attributes['UserPassword'] = password_hash($value, PASSWORD_BCRYPT);
        } else {
            // If it's already hashed, store as-is
            $this->attributes['UserPassword'] = $value;
        }
    }
}
