class dbdriver {
    constructor(conn) {
        if (!conn) throw new Error('Connection is required');
        this.cn = conn;
    }

    async query(sql) {
        const [rows] = await this.cn.query(sql);
        return rows[0]; 
    }

    async select(tab, colm) {
        let list = '*';
        let res = [];

        if (Array.isArray(colm)) {
            list = colm.join(', ');
        } else {
            list = colm;
        }

        const sql = `SELECT ${list} FROM ${tab}`;
        const [rows] = await this.cn.query(sql);

        rows.forEach((row, index) => {
            res[index + 1] = row; 
        });

        return res;
    }

    async insertRow(arr) {
        if (!Array.isArray(arr)) return -1;

        const val = arr.map(value => `'${value}'`).join(',');
        const sql = `INSERT INTO drinks VALUES(NULL, ${val})`; 
        const [result] = await this.cn.query(sql);

        return result.affectedRows;
    }

    async selectQ(sql) {
        const res = [];
        const [rows] = await this.cn.query(sql);

        rows.forEach((row, index) => {
            res[index] = row;
        });

        return res;
    }
}

module.exports = dbdriver;
