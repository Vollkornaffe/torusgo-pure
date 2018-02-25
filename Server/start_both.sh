echo "Starting up HTTP server..."

(cd http_server && npm start) &

echo "Starting up SOCKET server..."

(cd socket_server && npm start) &
