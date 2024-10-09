const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const Service = require('./service');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const service = new Service();

const genCB = (arr) => {
    let html = "";
    arr.forEach(item => {
        let key = item.ID;
        let value = item.typ;
        html += `<label for='${key}'>${value}</label><input type='number' name='type[]' value='0'><br>`;
    });
    return html;
};

const genOptions = (arr) => {
    let html = "";
    arr.forEach(item => {
        let key = item.ID;
        let value = item.name;
        html += `<label for='${key}'>${value}</label><input type='radio' name='user' value='0'><br>`;
    });
    return html;
};

app.get('/', (req, res) => {
    const peopleList = service.getPeopleList();
    const typesList = service.getTypesList();
    res.send(`
        <!DOCTYPE HTML>
        <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
            <title></title>
            <style>
                #form {width:100rem}
                #form label{width:10rem;display:inline-block}
                #form input{width:80rem;}
                #form label, #form input {height:2rem;margin: 1rem 0} 
            </style>
            <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
            <script src="/js.js"></script>
        </head>
        <body>
            <form action="/requests?cmd=list" method="post">
                <div id="form">
                    ${genOptions(peopleList)}
                    ${genCB(typesList)}
                    <button type="button">Uložit</button>
                </div>
                <input type="submit" value="odeslat">
            </form>
        </body>
        </html>
    `);
});

app.post('/requests', (req, res) => {
    res.send('Form submitted!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
