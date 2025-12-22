#!/bin/bash

echo "Iniciando servidor backend..."
npx ts-node server.ts &
BACKEND_PID=$!

sleep 2

echo "Iniciando servidor frontend..."
npm run dev &
FRONTEND_PID=$!

echo "Servidores iniciados:"
echo "Backend (API): http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener"

wait
