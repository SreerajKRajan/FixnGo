from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

# Route to handle notification requests from Django
@app.route('/notification', methods=['POST'])
def handle_notification():
    try:
        data = request.get_json()  # Changed from request.json
        user_id = data.get('user_id')
        message = data.get('message')
        
        print(f"Received notification request for user {user_id}: {message}")  # Debug log
        
        if user_id and message:
            event_name = f"notification_{user_id}"
            socketio.emit(event_name, {'message': message})
            print(f"Emitted event {event_name}")  # Debug log
            return jsonify({'status': 'success'}), 200
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400
    except Exception as e:
        print(f"Error in handle_notification: {str(e)}")  # Debug log
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Add a test route
@app.route('/')
def test():
    return "Socket.IO server is running"

if __name__ == '__main__':
    print("Starting Socket.IO server on port 5000...")  # Debug log
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)