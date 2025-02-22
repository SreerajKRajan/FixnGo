import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

let socket;

function useSocket(userId, callback) {
    useEffect(() => {
        // Initialize socket connection if it doesn't exist
        if (!socket) {
            socket = io('http://localhost:5000', {
                transports: ['websocket'],
                reconnection: true,
            });
        }

        if (userId) {
            const event = `notification_${userId}`;
            
            // Handler function
            const handleNotification = (data) => {
                console.log(`Received notification for ${event}:`, data);
                if (callback) {
                    callback(data);
                }
            };

            // Register event listener
            socket.on(event, handleNotification);
            
            // Verify connection
            socket.on('connect', () => {
                console.log('Socket for notification connected successfully');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            // Cleanup function
            return () => {
                socket.off(event, handleNotification);
            };
        }
    }, [userId, callback]);

    return socket;
}

export default useSocket;