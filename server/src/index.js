import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { drawState } from './services/drawState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Static routes for logos and SVGs
const LOGO_DIR = path.join(__dirname, '..', '..', 'LOGO_GIAIS5CAYCAM');
const KHUNG_BOCTHAM_DIR = path.join(__dirname, '..', '..', 'khung-boc-tham');
const KHUNG_TONG_DIR = path.join(__dirname, '..', '..', 'khung-tong');
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');

app.use('/logos', express.static(LOGO_DIR));
app.use('/assets/khung-boc-tham', express.static(KHUNG_BOCTHAM_DIR));
app.use('/assets/khung-tong', express.static(KHUNG_TONG_DIR));

// Serve client in production
app.use(express.static(CLIENT_DIST));

// REST APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/state', (req, res) => {
  res.json(drawState.getState());
});

app.post('/api/reset', (req, res) => {
  const newState = drawState.resetState();
  io.emit('STATE_UPDATE', newState);
  res.json({ success: true, state: newState });
});

// Realtime Socket.io handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send current state immediately on connection
  socket.emit('STATE_UPDATE', drawState.getState());

  socket.on('GET_STATE', () => {
    socket.emit('STATE_UPDATE', drawState.getState());
  });

  socket.on('PICK_TEAM', ({ teamId }) => {
    try {
      const state = drawState.pickTeam(teamId);
      io.emit('TEAM_PICKED', state.activeDraw);
      io.emit('STATE_UPDATE', state);
    } catch (err) {
      socket.emit('ERROR', { message: err.message });
    }
  });

  socket.on('ASSIGN_SLOT', ({ teamId, group, slotIndex }) => {
    try {
      const state = drawState.assignSlot(teamId, group, slotIndex);
      io.emit('SLOT_ASSIGNED', {
        activeDraw: state.activeDraw,
        group,
        slotIndex
      });
      io.emit('STATE_UPDATE', state);
    } catch (err) {
      socket.emit('ERROR', { message: err.message });
    }
  });

  socket.on('CLEAR_ACTIVE_DRAW', () => {
    try {
      const state = drawState.clearActiveDraw();
      io.emit('DRAW_CLEARED');
      io.emit('STATE_UPDATE', state);
    } catch (err) {
      socket.emit('ERROR', { message: err.message });
    }
  });

  socket.on('UNDO', () => {
    try {
      const state = drawState.undo();
      io.emit('STATE_UPDATE', state);
    } catch (err) {
      socket.emit('ERROR', { message: err.message });
    }
  });

  socket.on('RESET', () => {
    try {
      const state = drawState.resetState();
      io.emit('STATE_UPDATE', state);
    } catch (err) {
      socket.emit('ERROR', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// React Router fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Draw Backend Server is running on port ' + PORT);
    }
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚽ BOCTHAM BACKEND RUNNING ON http://localhost:${PORT}`);
  console.log(`📺 Overlay Draw: http://localhost:${PORT}/overlay-draw`);
  console.log(`📺 Overlay BG:   http://localhost:${PORT}/overlay-bg`);
  console.log(`🎮 Control Room: http://localhost:${PORT}/control`);
  console.log(`===============================================`);
});

