import asyncio
import websockets
import pyodbc
import json
import datetime


server = '193.85.203.188'
database = 'rajsky'
username = 'rajsky'
password = 'rajsky'
connection_string = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'


def query_database(query, params=None):
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    if params:
        cursor.execute(query, params)
    else:
        cursor.execute(query)
    result = cursor.fetchall()
    conn.commit()
    cursor.close()
    conn.close()
    return result


def log_coffee(user_id, amount):
    timestamp = datetime.datetime.now()
    query = "INSERT INTO coffee_log (user_id, amount, timestamp) VALUES (?, ?, ?)"
    query_database(query, (user_id, amount, timestamp))


def get_coffee_stats():
    query = """
    SELECT u.username, SUM(c.amount) as total_coffee
    FROM users u
    LEFT JOIN coffee_log c ON u.user_id = c.user_id
    GROUP BY u.username
    """
    results = query_database(query)
    return [{'username': row[0], 'total_coffee': row[1]} for row in results]


async def handle_client(websocket, path):
    try:
        
        while True:
          
            coffee_stats = get_coffee_stats()
            message = json.dumps({"type": "stats", "data": coffee_stats})

            
            await websocket.send(message)

           
            try:
                client_message = await asyncio.wait_for(websocket.recv(), timeout=5)
                data = json.loads(client_message)

               
                if data['type'] == 'log_coffee':
                    user_id = data['user_id']
                    amount = data['amount']
                    log_coffee(user_id, amount)

                    
                    coffee_stats = get_coffee_stats()
                    update_message = json.dumps({"type": "stats", "data": coffee_stats})
                    await websocket.send(update_message)

            except asyncio.TimeoutError:
         
                continue

    except websockets.ConnectionClosed:
        print("Connection closed")


start_server = websockets.serve(handle_client, '0.0.0.0', 8081)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
