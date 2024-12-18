import asyncio
import websockets
import mysql.connector
import json
import hashlib  

# Configuration for MariaDB connection
db_config = {
    'host': 'localhost',
    'user': 'SEVER',
    'password': 'heslo123',
    'database': 'kafe_databaze'
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

# Function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Function to handle login
def login_user(username, password):
    hashed_password = hash_password(password)
    query = "SELECT user_id FROM users WHERE username = %s AND password = %s"
    result = query_database(query, (username, hashed_password))
    return result[0][0] if result else None

# Function to handle registration
def register_user(username, password):
    hashed_password = hash_password(password)
    # Check if the username is already taken
    query = "SELECT user_id FROM users WHERE username = %s"
    result = query_database(query, (username,))
    if result:
        return False  # Username already exists
    # Register the new user
    query = "INSERT INTO users (username, password) VALUES (%s, %s)"
    query_database(query, (username, hashed_password))
    return True

# Function to log coffee activity
def log_coffee(username, amount):
    query = "CALL insert_into_log(%s, %s)"
    query_database(query, (username, amount))

# Function to log tasks
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
    return [{'username': row[0], 'total_coffee': int(row[1]) if row[1] is not None else 0} for row in results]

# Function to get tasks statistics
def get_tasks_stats():
    query = """
    SELECT t.description, t.status, t.owner
    FROM tasks t
    """
    results = query_database(query)
    return [{'description': row[0], 'status': row[1], 'owner': row[2]} for row in results]

# WebSocket handler for client connections
def update_task_owner(task_description, new_owner):
    query = "UPDATE tasks SET owner = %s WHERE description = %s"
    query_database(query, (new_owner, task_description))


def delete_task(task_description, owner):
    query = "DELETE FROM tasks WHERE description = %s AND owner = %s"
    query_database(query, (task_description, owner))


async def handle_client(websocket):
    print("New connection.")
    try:
        
        coffee_stats = get_coffee_stats()
        await websocket.send(json.dumps({"type": "stats", "data": coffee_stats}))

        tasks_stats = get_tasks_stats()
        await websocket.send(json.dumps({"type": "tasks", "data": tasks_stats}))

        while True:
            try:
                client_message = await asyncio.wait_for(websocket.recv(), timeout=5)
                data = json.loads(client_message)

                
                if data.get('type') == 'login':
                    username = data.get('username')
                    password = data.get('password')
                    user_id = login_user(username, password)
                    response = {"type": "auth_success", "user_id": user_id} if user_id else {"type": "auth_fail", "reason": "Invalid username or password."}
                    await websocket.send(json.dumps(response))

                elif data.get('type') == 'register':
                    username = data.get('username')
                    password = data.get('password')
                    response = {"type": "register_success"} if register_user(username, password) else {"type": "register_fail", "reason": "Username already exists."}
                    await websocket.send(json.dumps(response))

                elif data.get('type') == 'update_task_owner':
                    description = data.get('description')
                    new_owner = data.get('owner')
                    update_task_owner(description, new_owner)
                    print(f"Task '{description}' assigned to '{new_owner}'.")

                elif data.get('type') == 'delete_task':
                    description = data.get('description')
                    owner = data.get('owner')
                    delete_task(description, owner)
                    print(f"Task '{description}' deleted by '{owner}'.")

               
                tasks_stats = get_tasks_stats()
                await websocket.send(json.dumps({"type": "tasks", "data": tasks_stats}))

            except asyncio.TimeoutError:
                continue

    except websockets.ConnectionClosed:
        print("Connection closed.")
    except Exception as e:
        print(f"Error occurred: {e}")


# Start the server
async def main():
    server = await websockets.serve(handle_client, '0.0.0.0', 8081)
    print("WebSocket server running on port 8081")
    await server.wait_closed()

asyncio.run(main())
