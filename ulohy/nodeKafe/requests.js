const express = require('express');
const Service = require('./service');

class Requests {
    constructor(conn) {
        this.ser = new Service(conn);
        this.method = '';
        this.GETdata = {};
        this.POSTdata = {};

        if (typeof window !== 'undefined') {
            this.method = window.request.method;
            this.GETdata = window.request.GET;
            this.POSTdata = window.request.POST;
        } else {
            this.method = 'GET';
            this.GETdata = {};
            this.POSTdata = {};
        }
    }

    controller(cmd) {
        cmd = cmd.replace('cmd/', '');
        switch (cmd) {
            case 'getPeopleList':
                this.output(this.ser.getPeopleList());
                break;
            case 'getTypesList':
                this.output(this.ser.getTypesList());
                break;
            case 'saveDrinks':
                this.output(this.ser.saveDrinks(this.POSTdata));
                break;
            case 'listCmd':
                this.output(['getPeopleList', 'getTypesList', 'saveDrinks', 'getSummaryOfDrinks']);
                break;
            case 'getSummaryOfDrinks':
                this.output(this.ser.getSummaryOfDrinks(this.GETdata));
                break;
            default:
                this.output('err');
        }
    }

    output(str) {
        if (!Array.isArray(str)) {
            console.log(JSON.stringify({ msg: str }));
        } else {
            console.log(JSON.stringify(str));
        }
    }
}


const conn = {}; 
const requests = new Requests(conn);

requests.controller('getPeopleList');

module.exports = Requests;
