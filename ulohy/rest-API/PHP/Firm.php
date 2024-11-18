namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Firm extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'city'];

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }
}