let socket;
let retryCount = 0;

function connectWebSocket() {
    socket = new WebSocket("ws://dev.spsejecna.net:20492");

    socket.onopen = () => {
        console.log("Connected to WebSocket server");
        retryCount = 0; // Reset retry count
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        displayOverview(data);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
        if (retryCount < 10) {
            retryCount++;
            setTimeout(connectWebSocket, 1000 * retryCount);
        } else {
            console.log("Maximum retry attempts reached.");
        }
    };
}

function displayOverview(data) {
    const overviewDiv = document.getElementById("overview");
    overviewDiv.innerHTML = '';
    data.forEach(item => {
        const entry = document.createElement("div");
        entry.innerText = `${item[0]}: ${item[1]} káv`;
        overviewDiv.appendChild(entry);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    connectWebSocket();

    document.getElementById("submit-button").onclick = () => {
        const user = document.getElementById("user").value;
        const coffeeCount = document.getElementById("coffee-count").value;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ user, coffee_count: coffeeCount }));
        } else {
            alert("Connection is not open");
        }
    };

    // Tab switching logic
    document.getElementById("tab-drink").onclick = () => {
        document.getElementById("drink-tab-content").classList.add("active");
        document.getElementById("overview-tab-content").classList.remove("active");
    };

    document.getElementById("tab-overview").onclick = () => {
        document.getElementById("overview-tab-content").classList.add("active");
        document.getElementById("drink-tab-content").classList.remove("active");
    };
});
