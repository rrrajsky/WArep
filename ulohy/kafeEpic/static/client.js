let socket;
let retryCount = 0;

function connectWebSocket() {
    socket = new WebSocket("ws://dev.spsejecna.net:20496");

    socket.onopen = () => {
        console.log("Připojeno k WebSocket serveru.");
        retryCount = 0; // Reset pokusů
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "stats") {
                displayOverview(data.data);
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
            setTimeout(connectWebSocket, 1000 * retryCount); // Exponenciální čekání
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
                user_id: user, // Simuluje ID uživatele
                amount: coffeeCount
            };
            socket.send(JSON.stringify(message));
            console.log("Zpráva odeslána:", message);
        } else {
            alert("WebSocket spojení není otevřené.");
        }
    };

    // Logika pro přepínání záložek
    document.getElementById("tab-drink").onclick = () => {
        document.getElementById("drink-tab-content").classList.add("active");
        document.getElementById("overview-tab-content").classList.remove("active");
    };

    document.getElementById("tab-overview").onclick = () => {
        document.getElementById("overview-tab-content").classList.add("active");
        document.getElementById("drink-tab-content").classList.remove("active");
    };
});
