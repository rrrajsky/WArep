const dbdriver = require('./dbdriver');

class Service {
    constructor(conn) {
        this.OutputArray = [];
        this.OutputJSON = [];
        this.tab_people = "people";
        this.tab_types = "types";
        this.dbdrv = new dbdriver(conn);
    }

    getPeopleList() {
        return this.dbdrv.select(this.tab_people, "*");
    }

    getTypesList() {
        return this.dbdrv.select(this.tab_types, "*");
    }

    processRequest(input) {
        const data = JSON.parse(input);
        let idUser = "";
    }

    saveDrinks(drinks) {
        let res = 0;
        const userID = drinks["user"][0];

        for (let i = 0; i < drinks["type"].length; i++) {
            if (drinks["type"][i] == 0) continue;

            const row = [
                new Date().toISOString().split('T')[0],
                userID,
                i + 1
            ];

            res += this.dbdrv.insertRow(row);
        }

        return res === 0 ? -1 : 1;
    }

    getSummaryOfDrinks(data) {
        const month = data["month"] || 0;
        let sql = "SELECT types.typ, count(drinks.ID) as pocet, people.name FROM `drinks` JOIN people on drinks.id_people = people.ID JOIN types on drinks.id_types = types.ID";
        
        if (month > 0 && month < 13) {
            sql += ` WHERE MONTH( \`date\` ) = ${month}`;
        }
        
        sql += " GROUP BY types.typ";
        return this.dbdrv.selectQ(sql);
    }
}

module.exports = Service;
