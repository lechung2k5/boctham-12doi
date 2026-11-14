import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'data', 'teams.json');
const BACKUP_FILE = path.join(__dirname, '..', 'data', 'state_backup.json');

const INITIAL_GROUPS = {
  A: [null, null, null, null],
  B: [null, null, null, null],
  C: [null, null, null, null]
};

class DrawStateManager {
  constructor() {
    this.initialTeams = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    this.loadState();
  }

  loadState() {
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const saved = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
        this.teams = saved.teams || JSON.parse(JSON.stringify(this.initialTeams));
        this.groups = saved.groups || JSON.parse(JSON.stringify(INITIAL_GROUPS));
        this.activeDraw = saved.activeDraw || null;
        this.history = saved.history || [];
        return;
      } catch (e) {
        console.error('Error reading state backup, initializing fresh:', e);
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
      console.error('Error saving state backup:', e);
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
      throw new Error('Bảng đấu không hợp lệ (chỉ chấp nhận A, B, C)');
    }
    if (slotIndex < 0 || slotIndex > 3) {
      throw new Error('Vị trí slot không hợp lệ (0-3)');
    }
    if (this.groups[group][slotIndex] !== null) {
      throw new Error(`Vị trí ${group}${slotIndex + 1} đã có đội bóng!`);
    }

    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Đội bóng không tồn tại');
    }

    // Save to history before modifying
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
    this.teams = JSON.parse(JSON.stringify(this.initialTeams));
    this.groups = JSON.parse(JSON.stringify(INITIAL_GROUPS));
    this.activeDraw = null;
    this.history = [];
    this.saveState();
    return this.getState();
  }
}

export const drawState = new DrawStateManager();

