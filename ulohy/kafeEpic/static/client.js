let socket;
        let retryCount = 0;

        function connectWebSocket() {
            socket = new WebSocket("ws://dev.spsejecna.net:20496"); // Opravená adresa serveru

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

        document.addEventListener("DOMContentLoaded", () => {
            connectWebSocket();

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
                        description: desc
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
            overviewDiv.innerHTML = "<h3>Přehled spotřeby kávy:</h3>";

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
            

            if (!Array.isArray(data)) {
                console.error("Přijatá data nejsou pole:", data);
                taskListDiv.innerHTML += "<p>Chyba: Přijatá data nejsou ve správném formátu.</p>";
                return;
            }

            data.forEach(item => {
                const description = item.description || "Neznámý úkol";
                const status = item.status || "Neznámý stav";
                const owner = item.owner || "Neznámý majitel";

                const entry = document.createElement("div");
                entry.textContent = `Úkol: ${description} | Stav: ${status} | Majitel: ${owner}`;
                entry.classList.add("PEPA");
                taskListDiv.appendChild(entry);
            });
        }
