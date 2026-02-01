#!/bin/bash
# Claude Cockpit - One command to launch and expose to your phone
# Usage: ./start.sh

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PORT=3333

echo ""
echo -e "${BLUE}  Claude Cockpit${NC}"
echo -e "  ─────────────────────────────"

# Start the server in the background
echo -e "  Starting server..."
node server.mjs &
SERVER_PID=$!

# Wait for server to be ready
sleep 3

if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo -e "  ${YELLOW}Server failed to start. Run 'npm run dev' to see errors.${NC}"
  exit 1
fi

echo -e "  ${GREEN}Server running on port $PORT${NC}"

# Check if ngrok auth is configured
if ! ngrok config check &>/dev/null 2>&1; then
  echo ""
  echo -e "  ${YELLOW}ngrok needs a free auth token (one-time setup):${NC}"
  echo -e "  1. Sign up free at ${BLUE}https://dashboard.ngrok.com/signup${NC}"
  echo -e "  2. Copy your auth token from the dashboard"
  echo -e "  3. Run: ${GREEN}ngrok config add-authtoken YOUR_TOKEN${NC}"
  echo -e "  4. Then run this script again"
  echo ""
  echo -e "  For now, the app is available locally at:"
  echo -e "  ${GREEN}http://localhost:$PORT${NC}"
  echo ""
  echo -e "  Press Ctrl+C to stop"
  wait $SERVER_PID
  exit 0
fi

# Start ngrok tunnel
echo -e "  Starting tunnel..."
ngrok http $PORT --log=stdout --log-format=json > /tmp/ngrok-cockpit.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to establish tunnel
sleep 3

# Get the public URL from ngrok API
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

echo ""
if [ -n "$PUBLIC_URL" ]; then
  echo -e "  ${GREEN}Ready! Open this URL on your phone:${NC}"
  echo ""
  echo -e "  ${BLUE}$PUBLIC_URL${NC}"
  echo ""
  echo -e "  PIN: ${YELLOW}${COCKPIT_PIN:-0000}${NC}"
  echo -e "  Add to home screen for PWA experience"
else
  echo -e "  ${YELLOW}Tunnel URL not available yet. Check http://localhost:4040${NC}"
  echo -e "  Local access: ${GREEN}http://localhost:$PORT${NC}"
fi

echo ""
echo -e "  Press Ctrl+C to stop"
echo -e "  ─────────────────────────────"
echo ""

# Cleanup on exit
cleanup() {
  echo ""
  echo -e "  Shutting down..."
  kill $NGROK_PID 2>/dev/null
  kill $SERVER_PID 2>/dev/null
  wait $NGROK_PID 2>/dev/null
  wait $SERVER_PID 2>/dev/null
  echo -e "  ${GREEN}Stopped.${NC}"
}
trap cleanup EXIT INT TERM

# Wait for either process to exit
wait $SERVER_PID
