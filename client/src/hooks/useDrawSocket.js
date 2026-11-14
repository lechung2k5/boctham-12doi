import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useDrawSocket() {
  const [state, setState] = useState({
    teams: [],
    groups: { A: [null, null, null, null], B: [null, null, null, null], C: [null, null, null, null] },
    activeDraw: null,
    historyLength: 0
  });
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Check URL query param: ?server=https://...
    // 2. Check localStorage
    // 3. Check VITE_SOCKET_URL env variable
    // 4. Default: localhost in dev, or window.location.origin in production
    const queryServer = new URLSearchParams(window.location.search).get('server');
    if (queryServer) {
      localStorage.setItem('boctham_socket_url', queryServer);
    }
    const savedServer = localStorage.getItem('boctham_socket_url');
    const envServer = import.meta.env.VITE_SOCKET_URL;

    let socketUrl = envServer || savedServer || (window.location.port === '5173' ? 'http://localhost:3001' : window.location.origin);
    
    // Ensure clean URL without trailing slash
    socketUrl = socketUrl.replace(/\/+$/, '');

    console.log('[Socket] Connecting to server:', socketUrl);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Draw Server:', socket.id);
      setConnected(true);
      socket.emit('GET_STATE');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Draw Server');
      setConnected(false);
    });

    socket.on('STATE_UPDATE', (newState) => {
      setState(newState);
    });

    socket.on('TEAM_PICKED', (activeDraw) => {
      setLastEvent({ type: 'TEAM_PICKED', data: activeDraw });
    });

    socket.on('SLOT_ASSIGNED', (payload) => {
      setLastEvent({ type: 'SLOT_ASSIGNED', data: payload });
    });

    socket.on('DRAW_CLEARED', () => {
      setLastEvent({ type: 'DRAW_CLEARED' });
    });

    socket.on('ERROR', (err) => {
      console.error('Socket error received:', err);
      alert('Lỗi: ' + (err.message || 'Không xác định'));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const pickTeam = useCallback((teamId) => {
    if (socketRef.current) {
      socketRef.current.emit('PICK_TEAM', { teamId });
    }
  }, []);

  const assignSlot = useCallback((teamId, group, slotIndex) => {
    if (socketRef.current) {
      socketRef.current.emit('ASSIGN_SLOT', { teamId, group, slotIndex });
    }
  }, []);

  const clearActiveDraw = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('CLEAR_ACTIVE_DRAW');
    }
  }, []);

  const undo = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('UNDO');
    }
  }, []);

  const reset = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('RESET');
    }
  }, []);

  return {
    state,
    connected,
    lastEvent,
    pickTeam,
    assignSlot,
    clearActiveDraw,
    undo,
    reset
  };
}

