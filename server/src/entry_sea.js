import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

// Default 12 teams embedded directly in binary
const DEFAULT_TEAMS = [
  { "id": "HDF", "code": "HDF", "name": "HUDA FC", "logo": "/logos/HDF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "KMF", "code": "KMF", "name": "KHMER FC", "logo": "/logos/KMF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "KPF", "code": "KPF", "name": "KHẢI PHÁT FC", "logo": "/logos/KPF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "LMMF", "code": "LMMF", "name": "TIỆM VÀNG LÂM MINH MẠNH", "logo": "/logos/LMMF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "LPF", "code": "LPF", "name": "LỘC PHÁT FC", "logo": "/logos/LPF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "PQF", "code": "PQF", "name": "PHÚ QUÝ FC", "logo": "/logos/PQF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "PUWA", "code": "PUWA", "name": "PUWA FC", "logo": "/logos/PUWA.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "PVF", "code": "PVF", "name": "PHÚ VINH FC", "logo": "/logos/PVF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "TAF", "code": "TAF", "name": "THÙY AN FC", "logo": "/logos/TAF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "TPF", "code": "TPF", "name": "TRƯỜNG PHÚC FC", "logo": "/logos/TPF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "TTCF", "code": "TTCF", "name": "TRÍ THÀNH CNC FC", "logo": "/logos/TTCF.jpg", "group": null, "slot": null, "drawn": false },
  { "id": "WFF", "code": "WFF", "name": "WESTERN FORD FC", "logo": "/logos/WFF.jpg", "group": null, "slot": null, "drawn": false }
];

const INITIAL_GROUPS = {
  A: [null, null, null, null],
  B: [null, null, null, null],
  C: [null, null, null, null]
};

// Determine base dir: next to the executable
const baseDir = path.dirname(process.execPath);
const BACKUP_FILE = path.join(baseDir, 'boc_tham_state.json');

class DrawStateManager {
  constructor() {
    this.loadState();
  }

  loadState() {
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const saved = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
        this.teams = saved.teams || JSON.parse(JSON.stringify(DEFAULT_TEAMS));
        this.groups = saved.groups || JSON.parse(JSON.stringify(INITIAL_GROUPS));
        this.activeDraw = saved.activeDraw || null;
        this.history = saved.history || [];
        console.log('[State] Đã tải trạng thái giải đấu từ cache:', BACKUP_FILE);
        return;
      } catch (e) {
        console.error('[State] Lỗi đọc cache, khởi tạo mới:', e);
      }
    }
    this.resetState();
  }

  saveState() {
    try {
      const state = {
        teams: this.teams,
        groups: this.groups,
        activeDraw: this.activeDraw,
        history: this.history
      };
      fs.writeFileSync(BACKUP_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[State] Lỗi lưu cache:', e);
    }
  }

  getState() {
    return {
      teams: this.teams,
      groups: this.groups,
      activeDraw: this.activeDraw,
      historyLength: this.history.length
    };
  }

  pickTeam(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team || team.drawn) {
      throw new Error('Đội bóng không tồn tại hoặc đã được bốc');
    }

    this.activeDraw = {
      team: { ...team },
      status: 'picked',
      target: null
    };

    this.saveState();
    return this.getState();
  }

  assignSlot(teamId, group, slotIndex) {
    if (!['A', 'B', 'C'].includes(group)) {
      throw new Error('Bảng đấu không hợp lệ');
    }
    if (slotIndex < 0 || slotIndex > 3) {
      throw new Error('Slot index không hợp lệ');
    }
    if (this.groups[group][slotIndex] !== null) {
      throw new Error(`Vị trí ${group}${slotIndex + 1} đã có đội bóng!`);
    }

    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Đội bóng không tồn tại');
    }

    this.history.push({
      teams: JSON.parse(JSON.stringify(this.teams)),
      groups: JSON.parse(JSON.stringify(this.groups)),
      activeDraw: this.activeDraw ? JSON.parse(JSON.stringify(this.activeDraw)) : null
    });

    team.drawn = true;
    team.group = group;
    team.slot = slotIndex;

    this.groups[group][slotIndex] = { ...team };

    this.activeDraw = {
      team: { ...team },
      status: 'assigned',
      target: { group, slotIndex }
    };

    this.saveState();
    return this.getState();
  }

  clearActiveDraw() {
    this.activeDraw = null;
    this.saveState();
    return this.getState();
  }

  undo() {
    if (this.history.length === 0) {
      throw new Error('Không có thao tác nào để hoàn tác');
    }

    const previousState = this.history.pop();
    this.teams = previousState.teams;
    this.groups = previousState.groups;
    this.activeDraw = previousState.activeDraw;

    this.saveState();
    return this.getState();
  }

  resetState() {
    this.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
    this.groups = JSON.parse(JSON.stringify(INITIAL_GROUPS));
    this.activeDraw = null;
    this.history = [];
    this.saveState();
    return this.getState();
  }
}

const drawState = new DrawStateManager();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Resolve static assets
const LOGO_DIR = path.join(baseDir, 'LOGO_GIAIS5CAYCAM');
const KHUNG_BOCTHAM_DIR = path.join(baseDir, 'khung-boc-tham');
const KHUNG_TONG_DIR = path.join(baseDir, 'khung-tong');
const CLIENT_DIST = path.join(baseDir, 'client', 'dist');

if (fs.existsSync(LOGO_DIR)) app.use('/logos', express.static(LOGO_DIR));
if (fs.existsSync(KHUNG_BOCTHAM_DIR)) app.use('/assets/khung-boc-tham', express.static(KHUNG_BOCTHAM_DIR));
if (fs.existsSync(KHUNG_TONG_DIR)) app.use('/assets/khung-tong', express.static(KHUNG_TONG_DIR));
if (fs.existsSync(CLIENT_DIST)) app.use(express.static(CLIENT_DIST));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/state', (req, res) => res.json(drawState.getState()));
app.post('/api/reset', (req, res) => {
  const state = drawState.resetState();
  io.emit('STATE_UPDATE', state);
  res.json({ success: true, state });
});

io.on('connection', (socket) => {
  socket.emit('STATE_UPDATE', drawState.getState());

  socket.on('GET_STATE', () => socket.emit('STATE_UPDATE', drawState.getState()));

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
      io.emit('SLOT_ASSIGNED', { activeDraw: state.activeDraw, group, slotIndex });
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
});

app.get('*', (req, res) => {
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Server bốc thăm đang chạy. Vui lòng kiểm tra thư mục client/dist.');
  }
});

server.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🏆 HỆ THỐNG BỐC THĂM GIẢI ĐẤU 12 ĐỘI - PRODUCTION EXECUTABLE`);
  console.log(`============================================================`);
  console.log(`📡 Server đang chạy tại:  http://localhost:${PORT}`);
  console.log(`🎮 Bàn điều khiển (Control):   http://localhost:${PORT}/control`);
  console.log(`📺 Overlay Bốc thăm (Draw):    http://localhost:${PORT}/overlay-draw`);
  console.log(`📺 Overlay Nền họp báo (BG):   http://localhost:${PORT}/overlay-bg`);
  console.log(`============================================================\n`);
  console.log(`Đang tự động mở Bàn điều khiển trên trình duyệt của bạn...`);

  // Auto open browser on Windows
  exec(`start http://localhost:${PORT}/control`, (err) => {
    if (err) console.log('Vui lòng mở trình duyệt và truy cập: http://localhost:' + PORT + '/control');
  });
});

