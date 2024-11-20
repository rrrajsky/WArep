import asyncio
import websockets
import mysql.connector
import json
import datetime

# Konfigurace připojení k MariaDB (změňte podle potřeby)
db_config = {
    'host': 'localhost',  # Nebo IP adresa vašeho MariaDB serveru
    'user': 'kafe_user',
    'password': 'kafe_password',
    'database': 'kafe_database'
}

# Funkce pro připojení k databázi a provedení dotazu
def query_database(query, params=None):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute(query, params or ())
    if query.strip().upper().startswith("SELECT"):
        result = cursor.fetchall()
    else:
        conn.commit()
        result = None
    cursor.close()
    conn.close()
    return result

# Funkce pro záznam kávové aktivity
def log_coffee(user_id, amount):
    query = "INSERT INTO coffee_log (user_id, amount) VALUES (%s, %s)"
    query_database(query, (user_id, amount))

# Funkce pro získání statistik (kolik kávy vypil každý uživatel)
def get_coffee_stats():
    query = """
    SELECT u.username, SUM(c.amount) as total_coffee
    FROM users u
    LEFT JOIN coffee_log c ON u.user_id = c.user_id
    GROUP BY u.username
    """
    results = query_database(query)
    return [{'username': row[0], 'total_coffee': row[1]} for row in results]

# WebSocket server pro komunikaci s klienty
async def handle_client(websocket, path):
    print(f"New connection: {path}")
    
    try:
        # Průběžně posíláme aktualizace statistik každých 5 sekund
        while True:
            coffee_stats = get_coffee_stats()
            message = json.dumps({"type": "stats", "data": coffee_stats})
            await websocket.send(message)

            try:
                client_message = await asyncio.wait_for(websocket.recv(), timeout=5)
                data = json.loads(client_message)

                # Zpracování zprávy
                if 'type' not in data:
                    print("Chybí 'type' ve zprávě:", data)
                    continue

                if data['type'] == 'log_coffee':
                    user_id = data.get('user_id')  # Bezpečně načteme user_id
                    amount = data.get('amount')   # Bezpečně načteme amount
                    if user_id is not None and amount is not None:
                        log_coffee(user_id, amount)

                        # Po záznamu o kávě pošleme aktualizovaný přehled
                        coffee_stats = get_coffee_stats()
                        update_message = json.dumps({"type": "stats", "data": coffee_stats})
                        await websocket.send(update_message)
            except asyncio.TimeoutError:
                continue
    except websockets.ConnectionClosed:
        print(f"Connection closed: {path}")

# Spuštění serveru na portu 20492
async def main():
    server = await websockets.serve(handle_client, '0.0.0.0', 20492)
    print("WebSocket server běží na portu 20492")
    await server.wait_closed()

# Spuštění serveru
asyncio.run(main())
