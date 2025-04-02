const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
var mysql = require("mysql2");
const path = require("path");
const formidable = require("formidable");
const XLSX = require("xlsx");

const listeningIp = "localhost";
const listeningPort = 8082;
const secretKey = "supersecretkey"; // Used for signing JWTs

//console.log(hashPassword("admin"));

const months = { "led": 1, "úno": 2, "bře": 3, "dub": 4, "kvě": 5, "čer": 6, "čec": 7, "srp": 8, "zář": 9, "říj": 10, "lis": 11, "pro": 12 };

const tokenCache = {};

let con = mysql.createConnection({
    host: "localhost",
    user: "apiUser",
    password: "MyPassword123!",
    database: "Vodarenska",
    insecureAuth: true
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL database.");
});

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

function authenticate(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        res.statusCode = 401;
        res.end("Unauthorized: No token provided.");
        return;
    }

    // Check token cache first
    if (tokenCache[token]) {
        req.user = { id: tokenCache[token] }; // Use cached user ID
        next();
        return;
    }

    // Decode token if not in cache
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.statusCode = 401;
            res.end("Unauthorized: Invalid token.");
            return;
        }

        req.user = decoded;
        tokenCache[token] = decoded.id;
        next();
    });
}

// Auto-remove expired tokens from cache
setInterval(() => {
    Object.keys(tokenCache).forEach((token) => {
        jwt.verify(token, secretKey, (err) => {
            if (err) delete tokenCache[token]; // Remove expired tokens
        });
    });
}, 60000);


const server = http.createServer((req, res) => {
    console.log(req.url);

    if (req.method === "GET") {

        if (req.url == "/houses") {
            authenticate(req, res, () => {
                if (!req.user || !req.user.id) {
                    res.statusCode = 401;
                    res.end("Unauthorized: User information missing.");
                    return;
                }

                const userId = req.user.id;

                const query = "SELECT * FROM House WHERE User_ID = ?";
                con.query(query, [userId], (err, results) => {
                    if (err) {
                        console.error("Error retrieving houses:", err);
                        res.statusCode = 500;
                        res.end("Internal Server Error: Unable to retrieve houses.");
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(results));
                });
            });

            return;
        }


        if (req.url == "/gauges") {
            authenticate(req, res, () => {
                const userId = req.user.id; // Use the authenticated user ID to filter results (optional)

                const query = "SELECT * FROM Gauge WHERE House_ID IN (SELECT ID FROM House WHERE User_ID = ?)";
                console.log(userId);
                con.query(query, [userId], (err, results) => {
                    if (err) {
                        console.error("Error retrieving gauges:", err);
                        res.statusCode = 500;
                        res.end("Internal Server Error: Unable to retrieve gauges.");
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(results));
                });
            });

            return;
        }

        else if (req.url === "/form") {
            const filePath = path.join(__dirname, "..", "public", "form.html");
            console.log(filePath)
            fs.readFile(filePath, "utf-8", (err, data) => {
                if (err) {
                    console.log(err)
                    res.statusCode = 500;
                    res.end("Error reading form.html file.");
                    return;
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.end(data);
                    return;
                }
            });

            return;
        } else if (req.url === "/style.css") {
            const filePath = path.join(__dirname, "..", "public", "style.css");
            fs.readFile(filePath, "utf-8", (err, data) => {
                if (err) {
                    console.log(err)
                    res.statusCode = 500;
                    res.end("Error reading style.css file.");
                    return;
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/css");
                    res.end(data);
                    return;
                }
            });

            return;
        } else if (req.url === "/script.js") {
            const filePath = path.join(__dirname, "..", "scripts", "script.js");
            fs.readFile(filePath, "utf-8", (err, data) => {
                if (err) {
                    console.log(err)
                    res.statusCode = 500;
                    res.end("Error reading script.js file.");
                    return;
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/javascript");
                    res.end(data);
                    return;
                }
            });

            return;
        } else {
            res.statusCode = 404;
            res.end("Not Found");
            return;
        }
    }

    if (req.method === "POST" && req.url === "/register") {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            const { name, password } = JSON.parse(body);

            if (!name || !password) {
                res.statusCode = 400;
                res.end("Bad Request: Missing name or password.");
                return;
            }

            const hashedPassword = hashPassword(password);
            con.query("INSERT INTO User (Name, HashedPassword) VALUES (?, ?)", [name, hashedPassword], (err) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.end("Error registering user.");
                    return;
                }

                res.statusCode = 201;
                res.end("User registered successfully.");
            });
        });

        return;
    }

    if (req.method === "POST" && req.url === "/setTriggers") {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const { houseId, triggers } = JSON.parse(body);

                if (!houseId || !Array.isArray(triggers) || triggers.length === 0) {
                    res.statusCode = 400;
                    res.end("Bad Request: Missing houseId or invalid triggers array.");
                    return;
                }

                const query = "INSERT INTO Alerts (House_ID, Month, Year, AlertsType_ID, LimitExceed) VALUES ?";
                const values = triggers.map(trigger => [houseId, trigger.month, trigger.year, trigger.alertTypeId, trigger.limit]);

                con.query(query, [values], (err, result) => {
                    if (err) {
                        console.error("Error inserting triggers:", err);
                        res.statusCode = 500;
                        res.end("Internal Server Error: Unable to save triggers.");
                        return;
                    }

                    res.statusCode = 201;
                    res.end("Triggers saved successfully.");
                });
            } catch (error) {
                res.statusCode = 400;
                res.end("Bad Request: Invalid JSON format.");
            }
        });

        return;
    }

    if (req.method === "POST" && req.url === "/login") {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            const { name, password } = JSON.parse(body);

            if (!name || !password) {
                res.statusCode = 400;
                res.end("Bad Request: Missing name or password.");
                return;
            }

            const hashedPassword = hashPassword(password);
            con.query("SELECT * FROM User WHERE Name = ? AND HashedPassword = ?", [name, hashedPassword], (err, results) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.end("Error logging in.");
                    return;
                }

                if (results.length === 0) {
                    res.statusCode = 401;
                    res.end("Invalid credentials.");
                    return;
                }

                const token = jwt.sign({ id: results[0].ID, name: results[0].Name }, secretKey, { expiresIn: "1h" });

                // Store in cache
                tokenCache[token] = results[0].ID;

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ token }));
            });
        });

        return;
    }

    if (req.method === "POST" && req.url === "/gauge/add") {
        authenticate(req, res, () => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                try {
                    console.log(body);
                    const { serialNumber, type, houseId } = JSON.parse(body);

                    if (!serialNumber || !type || !houseId) {
                        res.statusCode = 400;
                        res.end("Bad Request: Missing serialNumber, type, or houseId.");
                        return;
                    }

                    if (!['Heat', 'ColdWater', 'HotWater'].includes(type)) {
                        res.statusCode = 400;
                        res.end("Bad Request: Invalid type. Must be 'Heat', 'ColdWater', or 'HotWater'.");
                        return;
                    }

                    const query = "INSERT INTO Gauge (SerialNumber, Type, House_ID) VALUES (?, ?, ?)";
                    con.query(query, [serialNumber, type, houseId], (err, result) => {
                        if (err) {
                            console.error(err);
                            res.statusCode = 500;
                            res.end("Error adding gauge: " + err);
                            return;
                        }

                        res.statusCode = 201;
                        res.end("Gauge added successfully.");
                    });
                } catch (exception) {
                    console.log(exception);
                    res.statusCode = 500;
                    res.end("Error adding gauge: " + exception);
                }
            });

        });

        return;
    }

    if (req.method === "POST" && req.url === "/upload") {
        authenticate(req, res, () => {
            const form = new formidable.IncomingForm();

            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error("Error in file upload:", err);
                    res.statusCode = 400;
                    res.end("Error processing the file.");
                    return;
                }

                let gaugeId = fields.gaugeId[0];
                const file = files.file;

                if (!file) {
                    res.statusCode = 400;
                    res.end("No file uploaded.");
                    return;
                }

                try {
                    const data = new Uint8Array(fs.readFileSync(file[0].filepath));
                    const workbook = XLSX.read(data, { type: "array" });

                    const parsedData = {};
                    workbook.SheetNames.forEach((sheetName) => {
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                        const headers = jsonData[0];
                        const rows = jsonData.slice(1);

                        rows.forEach((row) => {
                            headers.forEach((header, index) => {
                                if (header && row[index] !== undefined) {
                                    const key = header.trim();
                                    if (!parsedData[key]) {
                                        parsedData[key] = [];
                                    }
                                    parsedData[key].push(row[index]);
                                }
                            });
                        });

                        console.log(parsedData)
                    });

                    //console.log(parsedData);
                    let year = Object.keys(parsedData)[0];
                    console.log(year)

                    for (let key in months) {
                        if (!parsedData[key] || parsedData[key].length < 3) {
                            console.warn(`Skipping month "${key}" due to missing data:`, parsedData[key]);
                            continue;
                        }

                        let pomJed = parseFloat(parsedData[key][0]) || 0;
                        let coldWater = parseFloat(parsedData[key][1]) || 0;
                        let hotWater = parseFloat(parsedData[key][2]) || 0;

                        if (pomJed === 0 && coldWater === 0 && hotWater === 0) {
                            console.warn(`Skipping month "${key}" because all values are zero.`);
                            continue;
                        }

                        con.query(
                            "INSERT INTO MonthlyUsage(gauge_ID,Month,Year,Heat,ColdWater,HotWater) VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE Heat = VALUES(Heat),ColdWater = VALUES(ColdWater),HotWater = VALUES(HotWater);",
                            [gaugeId, months[key], year, pomJed, coldWater, hotWater],
                            (err, results) => {
                                if (err) console.error("SQL Error:", err);
                            }
                        );
                    }


                    res.statusCode = 200;
                    res.end();
                } catch (error) {
                    res.statusCode = 400;
                    res.end("Invalid data " + error);
                    console.log(error);
                }
            });
        });

        return;
    }

    if (req.method === "POST" && req.url === "/house/add") {
        authenticate(req, res, () => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                const { address } = JSON.parse(body);
                const userId = req.user.id; // Use authenticated user ID
                if (!address) {
                    res.statusCode = 400;
                    res.end("Bad Request: Missing address.");
                    return;
                }

                const query = "INSERT INTO House (Address, User_ID) VALUES (?, ?)";
                con.query(query, [address, userId], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end("Error adding house " + err);
                        return;
                    }

                    res.statusCode = 201;
                    res.end("Success");
                });
            });

        });

        return;
    }

    if (req.method === "POST" && req.url === "/gauge/usage") {
        authenticate(req, res, () => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                try {
                    const { houseId } = JSON.parse(body);

                    if (!houseId) {
                        res.statusCode = 400;
                        res.end("Bad Request: Missing houseId.");
                        return;
                    }

                    const userId = req.user.id; // Get the authenticated user ID

                    // First, check if the house belongs to the authenticated user
                    const checkHouseOwnershipQuery = "SELECT * FROM House WHERE ID = ? AND User_ID = ?";
                    con.query(checkHouseOwnershipQuery, [houseId, userId], (err, results) => {
                        if (err) {
                            console.error("Error checking house ownership:", err);
                            res.statusCode = 500;
                            res.end("Internal Server Error: Unable to check house ownership.");
                            return;
                        }

                        if (results.length === 0) {
                            res.statusCode = 403;
                            res.end("Forbidden: House does not belong to the authenticated user.");
                            return;
                        }

                        // Get current month's data for all gauges in the specified house ID
                        const currentMonth = new Date().getMonth() + 1;
                        const currentYear = new Date().getFullYear();

                        const getUsageQuery = `
                            SELECT g.SerialNumber, g.Type, m.Heat, m.ColdWater, m.HotWater
                            FROM Gauge g
                            JOIN MonthlyUsage m ON g.ID = m.Gauge_ID
                            WHERE g.House_ID = ? AND m.Month = ? AND m.Year = ?
                        `;
                        con.query(getUsageQuery, [houseId, currentMonth, currentYear], (err, results) => {
                            if (err) {
                                console.error("Error retrieving gauge usage data:", err);
                                res.statusCode = 500;
                                res.end("Internal Server Error: Unable to retrieve gauge usage data.");
                                return;
                            }

                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify(results));
                        });
                    });
                } catch (exception) {
                    console.log(exception);
                    res.statusCode = 500;
                    res.end("Error processing request: " + exception);
                }
            });
        });

        return;
    }

    if (req.method === "PUT" && req.url.startsWith("/house/edit")) {
        authenticate(req, res, () => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                const { id, address, userId } = JSON.parse(body);

                if (!id || !address || !userId) {
                    res.statusCode = 400;
                    res.end("Bad Request: Missing id, address, or userId.");
                    return;
                }

                const query = "UPDATE House SET Address = ?, User_ID = ? WHERE ID = ?";
                con.query(query, [address, userId, id], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end("Error updating house.");
                        return;
                    }

                    res.statusCode = 200;
                    res.end("House updated successfully.");
                });
            });

            return;
        });
    }

    if (req.method === "DELETE" && req.url.startsWith("/house/delete")) {
        authenticate(req, res, () => {
            const urlParts = req.url.split("/");
            const houseId = urlParts[urlParts.length - 1];

            if (!houseId) {
                res.statusCode = 400;
                res.end("Bad Request: Missing house ID.");
                return;
            }

            const query = "DELETE FROM House WHERE ID = ?";
            con.query(query, [houseId], (err, result) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.end("Error deleting house.");
                    return;
                }

                res.statusCode = 200;
                res.end("House deleted successfully.");
            });

            return;
        });
    }

    res.statusCode = 404;
    res.end("Not Found");
});

server.listen(listeningPort, listeningIp, () => {
    console.log(`Server is listening on http://${listeningIp}:${listeningPort}`);
});
