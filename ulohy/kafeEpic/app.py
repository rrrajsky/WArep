import asyncio
import websockets
import mysql.connector
import json

# Configuration for MariaDB connection
db_config = {
    'host': 'localhost',  # Or use IP address of your MariaDB server
    'user': 'SEVER',       # Database username
    'password': 'heslo123',  # Database password
    'database': 'kafe_databaze'   # Database name
}

# Function to query the database
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

# Function to log coffee activity
def log_coffee(username, amount):
    query = "CALL insert_into_log(%s, %s)"
    query_database(query, (username, amount))

def log_task(description):
    query = "INSERT INTO tasks(description) VALUES (%s)"
    query_database(query, (description,))

# Function to get coffee statistics
def get_coffee_stats():
    query = """
    SELECT u.username, SUM(c.amount) as total_coffee
    FROM users u
    LEFT JOIN coffee_log c ON u.user_id = c.user_id
    GROUP BY u.username
    """
    results = query_database(query)
    return [{'username': row[0], 'total_coffee': int(row[1])} for row in results]

def get_tasks_stats():
    query = """
    SELECT t.description, t.status, t.owner
    FROM tasks s
    GROUP BY t.owner
    """
    results = query_database(query)
    return [{'description': row[0], 'status': row[1], 'owner': row[2]} for row in results]

# WebSocket handler for client connections
async def handle_client(websocket):
    print("New connection.")
    try:
        while True:
            coffee_stats = get_coffee_stats()
            message = json.dumps({"type": "stats", "data": coffee_stats})
            await websocket.send(message) 

            try:
                client_message = await asyncio.wait_for(websocket.recv(), timeout=5)
                data = json.loads(client_message)

                if data.get('type') == 'log_coffee':
                    user_id = data.get('user_id')
                    amount = data.get('amount')
                    if user_id and amount:
                        log_coffee(user_id, amount)
                        print(f"Logged: {user_id} drank {amount} coffees.")

                        coffee_stats = get_coffee_stats()
                        update_message = json.dumps({"type": "stats", "data": coffee_stats})
                        await websocket.send(update_message)
		        
                if data.get('type') == 'log_tasks':
                    description = data.get('description')
                    if description:
                        log_task(description)
                        print(f"Logged: {description} task added")

                        

            except asyncio.TimeoutError:
                continue

    except websockets.ConnectionClosed:
        print("Connection closed.")

# Start the server
async def main():
    server = await websockets.serve(handle_client, '0.0.0.0', 8081)
    print("WebSocket server running on port 8081")
    await server.wait_closed()

asyncio.run(main())
