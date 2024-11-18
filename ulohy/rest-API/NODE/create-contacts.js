firmId: {
    type: Sequelize.INTEGER,
    allowNull: false, // Zajišťuje, že hodnota nemůže být NULL
    references: {
        model: 'Firms', // Odkazuje na tabulku 'Firms'
        key: 'id', // Odkazuje na sloupec 'id' tabulky 'Firms'
    },
    onUpdate: 'CASCADE', // Aktualizuje firmId, pokud se změní ID v tabulce 'Firms'
    onDelete: 'CASCADE', // Smaže kontakty, pokud je firma odstraněna
},
