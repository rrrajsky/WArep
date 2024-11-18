use App\Http\Controllers\FirmController;

Route::prefix('firms')->group(function () {
    Route::get('list', [FirmController::class, 'listFirms']);
    Route::post('save', [FirmController::class, 'saveFirm']);
    Route::put('{id}', [FirmController::class, 'updateFirm']);
    Route::delete('{id}', [FirmController::class, 'deleteFirm']);
    Route::post('{id}/contacts/save', [FirmController::class, 'saveContact']);
});
