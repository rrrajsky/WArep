public function up()
{
    Schema::create('contacts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('firm_id')->constrained()->onDelete('cascade');
        $table->string('name');
        $table->string('email')->nullable();
        $table->string('phone')->nullable();
        $table->timestamps();
    });
}
