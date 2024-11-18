public function up()
{
    Schema::create('firms', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('city')->nullable();
        $table->timestamps();
    });
}
