let socket;
let retryCount = 0;

function connectWebSocket() {
    socket = new WebSocket("ws://dev.spsejecna.net:20496"); // Adresa serveru

    socket.onopen = () => {
        console.log("Připojeno k WebSocket serveru.");
        retryCount = 0;
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("Přijatá data ze serveru:", data);

            if (data.type === "stats") {
                displayOverview(data.data); // Přehled spotřeby kávy
            } else if (data.type === "tasks") {
                displayOverviewTasks(data.data); // Přehled úkolů
            } else if (data.type === "auth_success") {
                alert("Přihlášení úspěšné.");
                document.getElementById("auth-section").style.display = "none";
                document.getElementById("app-section").style.display = "block";
            } else if (data.type === "auth_fail") {
                alert("Přihlášení selhalo: " + data.reason);
            } else if (data.type === "register_success") {
                alert("Registrace úspěšná, nyní se můžete přihlásit.");
            } else if (data.type === "register_fail") {
                alert("Registrace selhala: " + data.reason);
            } else {
                console.warn("Neznámý typ zprávy:", data);
            }
        } catch (error) {
            console.error("Chyba při zpracování zprávy:", event.data, error);
        }
    };

    socket.onclose = () => {
        console.warn("WebSocket spojení uzavřeno. Pokus o znovupřipojení...");
        if (retryCount < 10) {
            retryCount++;
            setTimeout(connectWebSocket, 1000 * retryCount);
        } else {
            console.error("Maximální počet pokusů o připojení dosažen.");
        }
    };

    socket.onerror = (error) => {
        console.error("Chyba WebSocket:", error);
    };
}
let loged_user;
document.addEventListener("DOMContentLoaded", () => {
    connectWebSocket();

    // Sekce pro přihlášení/registraci
    const authSection = document.getElementById("auth-section");
    const appSection = document.getElementById("app-section");

    document.getElementById("login-button").onclick = () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        loged_user = username;
        if (!username || !password) {
            alert("Vyplňte všechna pole.");
            return;
        }

        if (socket.readyState === WebSocket.OPEN) {
            const message = {
                type: "login",
                username,
                password
            };
            socket.send(JSON.stringify(message));
            console.log("Login request sent:", message);
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };
    
    document.getElementById("register-button").onclick = () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            alert("Vyplňte všechna pole.");
            return;
        }

        if (socket.readyState === WebSocket.OPEN) {
            const message = {
                type: "register",
                username,
                password
            };
            socket.send(JSON.stringify(message));
            console.log("Register request sent:", message);
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };

    // Stávající funkce aplikace
    document.getElementById("submit-button").onclick = () => {
        const user = document.getElementById("user").value.trim();
        const coffeeCount = parseInt(document.getElementById("coffee-count").value, 10);

        if (!user) {
            alert("Jméno uživatele je povinné.");
            return;
        }

        if (isNaN(coffeeCount) || coffeeCount <= 0) {
            alert("Počet káv musí být kladné číslo.");
            return;
        }

        if (socket.readyState === WebSocket.OPEN) {
            const message = {
                type: "log_coffee",
                user_id: user,
                amount: coffeeCount
            };
            socket.send(JSON.stringify(message));
            console.log("Zpráva odeslána:", message);
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };

    document.getElementById("add-task").onclick = () => {
        const desc = document.getElementById("task-desc").value.trim();
       
        if (!desc) {
            alert("Popis je povinný.");
            return;
        }

        if (socket.readyState === WebSocket.OPEN) {
            const message = {
                type: "log_tasks",
                description: desc,
                owner : loged_user
            };
            socket.send(JSON.stringify(message));
            console.log("Zpráva odeslána:", message);
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };

    document.getElementById("tab-drink").onclick = () => {
        document.getElementById("drink-tab-content").classList.add("active");
        document.getElementById("overview-tab-content").classList.remove("active");
        document.getElementById("tasks-tab-content").classList.remove("active");
    };

    document.getElementById("tab-overview").onclick = () => {
        document.getElementById("overview-tab-content").classList.add("active");
        document.getElementById("drink-tab-content").classList.remove("active");
        document.getElementById("tasks-tab-content").classList.remove("active");

        if (socket.readyState === WebSocket.OPEN) {
            const message = { type: "get_stats" };
            socket.send(JSON.stringify(message));
            console.log("Žádost o přehled odeslána.");
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };

    document.getElementById("tab-tasks").onclick = () => {
        document.getElementById("tasks-tab-content").classList.add("active");
        document.getElementById("drink-tab-content").classList.remove("active");
        document.getElementById("overview-tab-content").classList.remove("active");

        if (socket.readyState === WebSocket.OPEN) {
            const message = { type: "get_tasks" };
            socket.send(JSON.stringify(message));
            console.log("Žádost o úkoly odeslána.");
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };
});

function displayOverview(data) {
    const overviewDiv = document.getElementById("overview");
    overviewDiv.innerHTML = "";

    if (!Array.isArray(data)) {
        console.error("Přijatá data nejsou pole:", data);
        overviewDiv.innerHTML += "<p>Chyba: Přijatá data nejsou ve správném formátu.</p>";
        return;
    }

    data.forEach(item => {
        const userName = item.username || "Neznámý uživatel";
        const coffeeCount = item.total_coffee || 0;

        const entry = document.createElement("div");
        entry.textContent = `Uživatel: ${userName}, Počet káv: ${coffeeCount}`;
        entry.classList.add("PEPA");
        overviewDiv.appendChild(entry);
    });
}

function displayOverviewTasks(data) {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = "";

    if (!Array.isArray(data)) {
        console.error("Přijatá data nejsou pole:", data);
        taskListDiv.innerHTML += "<p>Chyba: Přijatá data nejsou ve správném formátu.</p>";
        return;
    }

    data.forEach(item => {
        const description = item.description || "Neznámý úkol";
        const status = item.status || "Neznámý stav";
        const owner = item.owner || "Neznámý majitel";

        // Hlavní kontejner pro jeden řádek
        const row = document.createElement("div");
        row.classList.add("task-row");

        const textContainer = document.createElement("div");
        textContainer.textContent = `Úkol: ${description} | Stav: ${status} | Majitel: ${owner}`;
        textContainer.classList.add("task-text");

        const button = document.createElement("button");

        if (owner === loged_user) { 
            button.textContent = "Smazat úkol";
            button.style.backgroundColor = "red";
            button.onclick = () => {
                if (socket.readyState === WebSocket.OPEN) {
                    const message = {
                        type: "delete_task",
                        description: description,
                        owner: loged_user
                    };
                    socket.send(JSON.stringify(message));
                    console.log("Úkol smazán:", description);
                }
            };
        } else {
            button.textContent = "Přiřadit sobě";
            button.style.backgroundColor = "green";
            button.onclick = () => {
                if (socket.readyState === WebSocket.OPEN) {
                    const message = {
                        type: "update_task_owner",
                        description: description,
                        owner: loged_user
                    };
                    socket.send(JSON.stringify(message));
                    console.log("Úkol přiřazen:", description);
                }
            };
        }

        row.appendChild(textContainer);
        row.appendChild(button);

        taskListDiv.appendChild(row);
    });
}
