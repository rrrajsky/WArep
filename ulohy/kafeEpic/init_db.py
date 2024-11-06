# -*- coding: utf-8 -*-

import sqlite3

DATABASE = 'coffee.db'


def init_db():
    with open('coffee.sql', 'r') as f:
        sql_script = f.read()

    with sqlite3.connect(DATABASE) as con:
        cur = con.cursor()
        cur.executescript(sql_script)
        con.commit()

    print("Databaze byla uspesne inicializovana.")

if __name__ == '__main__':
    init_db()
