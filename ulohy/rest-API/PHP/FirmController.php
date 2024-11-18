namespace App\Http\Controllers;

use App\Models\Firm;
use App\Models\Contact;
use Illuminate\Http\Request;

class FirmController extends Controller
{
    public function listFirms()
    {
        return response()->json(Firm::with('contacts')->get());
    }

    public function saveFirm(Request $request)
    {
        $firm = Firm::create($request->only(['name', 'city']));
        return response()->json($firm, 201);
    }

    public function updateFirm(Request $request, $id)
    {
        $firm = Firm::findOrFail($id);
        $firm->update($request->only(['name', 'city']));
        return response()->json($firm);
    }

    public function deleteFirm($id)
    {
        Firm::findOrFail($id)->delete();
        return response()->json(['message' => 'Firm deleted']);
    }

    public function saveContact(Request $request, $firmId)
    {
        $firm = Firm::findOrFail($firmId);
        $contact = $firm->contacts()->create($request->only(['name', 'email', 'phone']));
        return response()->json($contact, 201);
    }
}