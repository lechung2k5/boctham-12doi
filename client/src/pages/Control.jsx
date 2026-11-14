import React, { useState } from 'react';
import { useDrawSocket } from '../hooks/useDrawSocket';
import { 
  Play, 
  RotateCcw, 
  Undo2, 
  Shuffle, 
  CheckCircle2, 
  ExternalLink, 
  Radio, 
  Layers, 
  AlertTriangle,
  Trophy,
  Users,
  Settings
} from 'lucide-react';

export default function Control() {
  const { state, connected, pickTeam, assignSlot, clearActiveDraw, undo, reset } = useDrawSocket();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverInput, setServerInput] = useState(
    localStorage.getItem('boctham_socket_url') || import.meta.env.VITE_SOCKET_URL || ''
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const { teams = [], groups = { A: [], B: [], C: [] }, activeDraw, historyLength = 0 } = state;

  const undrawnTeams = teams.filter((t) => !t.drawn);
  const drawnCount = teams.filter((t) => t.drawn).length;

  // Handle Random Draw
  const handleRandomDraw = () => {
    if (undrawnTeams.length === 0 || isSpinning) return;
    setIsSpinning(true);

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const randomIndex = Math.floor(Math.random() * undrawnTeams.length);
        const selected = undrawnTeams[randomIndex];
        pickTeam(selected.id);
        setIsSpinning(false);
      }
    }, 80);
  };

  // Find next empty slot automatically
  const handleAutoAssign = () => {
    if (!activeDraw || !activeDraw.team) return;
    const groupOrder = ['A', 'B', 'C'];
    for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
      for (const grp of groupOrder) {
        if (!groups[grp][slotIdx]) {
          assignSlot(activeDraw.team.id, grp, slotIdx);
          return;
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-12">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-amber-400 tracking-wide uppercase flex items-center gap-2">
              BÀN ĐIỀU KHIỂN BỐC THĂM
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                12 ĐỘI
              </span>
            </h1>
            <p className="text-xs text-slate-400">Hệ thống Broadcast Realtime OBS / vMix</p>
          </div>
        </div>

        {/* Server status & Quick Links */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowServerModal(true)}
            title="Cấu hình URL Backend Cloud (Render / Railway)"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-xs transition-colors cursor-pointer"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-ping'
              }`}
            />
            <span className="font-medium">{connected ? 'Socket: Kết Nối' : 'Mất Kết Nối'}</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400 ml-1" />
          </button>

          <a
            href="/overlay-draw"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Mở Overlay Draw</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <a
            href="/overlay-bg"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mở Overlay BG</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Pick Panel + 12 Teams (8 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Active Picked Team Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/50 rounded-xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="font-display font-black text-amber-400 text-sm tracking-wider uppercase">
                  ĐỘI ĐANG BỐC THĂM HIỆN TẠI
                </h2>
              </div>
              {activeDraw && (
                <button
                  onClick={clearActiveDraw}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors underline"
                >
                  Hủy lượt bốc này
                </button>
              )}
            </div>

            {activeDraw && activeDraw.team ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-white flex-shrink-0">
                    <img
                      src={activeDraw.team.logo}
                      alt={activeDraw.team.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black text-xs">
                      MÃ: {activeDraw.team.code}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{activeDraw.team.name}</h3>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={handleAutoAssign}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs tracking-wider uppercase shadow-md flex items-center space-x-1.5 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Xếp Vào Ô Trống Kế Tiếp</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <p className="text-slate-400 text-sm">Chưa chọn đội bóng nào để bốc.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn 1 đội ở danh sách bên dưới hoặc bấm nút <strong>Bốc Ngẫu Nhiên</strong>.
                </p>
              </div>
            )}

            {/* Quick Slot Selector when team is picked */}
            {activeDraw && activeDraw.team && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Hoặc chọn vị trí cụ thể muốn xếp vào:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {['A', 'B', 'C'].map((grp) => (
                    <div key={grp} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-xs font-black text-amber-400 block mb-1.5">
                        BẢNG {grp}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[0, 1, 2, 3].map((slotIdx) => {
                          const isOccupied = !!groups[grp][slotIdx];
                          return (
                            <button
                              key={slotIdx}
                              disabled={isOccupied}
                              onClick={() => assignSlot(activeDraw.team.id, grp, slotIdx)}
                              className={`py-1.5 px-2 rounded text-xs font-bold transition-all ${
                                isOccupied
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed line-through'
                                  : 'bg-slate-700/80 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border border-slate-600'
                              }`}
                            >
                              {grp}
                              {slotIdx + 1} {isOccupied && `(${groups[grp][slotIdx].code})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                disabled={undrawnTeams.length === 0 || isSpinning}
                onClick={handleRandomDraw}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all shadow-md ${
                  undrawnTeams.length === 0 || isSpinning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                }`}
              >
                <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>BỐC NGẪU NHIÊN ({undrawnTeams.length})</span>
              </button>

              <button
                disabled={historyLength === 0}
                onClick={undo}
                className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors border ${
                  historyLength === 0
                    ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Undo2 className="w-4 h-4" />
                <span>Hoàn tác ({historyLength})</span>
              </button>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Giải Đấu</span>
            </button>
          </div>

          {/* 12 Teams Grid */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-slate-200 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>DANH SÁCH 12 ĐỘI BÓNG</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">
                Đã bốc: <strong className="text-amber-400">{drawnCount}</strong> / 12
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {teams.map((team) => {
                const isSelected = activeDraw && activeDraw.team && activeDraw.team.id === team.id;
                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      if (!team.drawn) pickTeam(team.id);
                    }}
                    className={`relative p-3 rounded-lg border transition-all flex items-center space-x-3 cursor-pointer ${
                      team.drawn
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-40 cursor-default'
                        : isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-700 flex-shrink-0">
                      <img
                        src={team.logo}
                        alt={team.code}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-display font-bold text-xs text-slate-100 flex items-center justify-between gap-1">
                        <span className="truncate">{team.name}</span>
                        {team.drawn && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold flex-shrink-0">
                            {team.group}
                            {team.slot + 1}
                          </span>
                        )}
                      </div>
                    </div>

                    {team.drawn && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute top-2 right-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Tables Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="font-display font-black text-slate-200 text-base mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>KẾT QUẢ 3 BẢNG ĐẤU HIỆN TẠI</span>
            </h3>

            <div className="space-y-4">
              {['A', 'B', 'C'].map((grp) => (
                <div key={grp} className="bg-slate-950 rounded-lg border border-slate-800 p-3.5">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-display font-black text-amber-400 text-sm tracking-wider">
                      BẢNG {grp}
                    </span>
                    <span className="text-xs text-slate-400">
                      {groups[grp].filter(Boolean).length}/4 Đội
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const team = groups[grp][slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          className={`flex items-center px-3 py-1.5 rounded text-xs ${
                            team
                              ? 'bg-slate-900 border border-amber-500/30 text-slate-200'
                              : 'bg-slate-900/40 border border-dashed border-slate-800/80 text-slate-600'
                          }`}
                        >
                          <span className="font-display font-black text-amber-400 w-8">
                            {grp}
                            {slotIdx + 1}
                          </span>
                          {team ? (
                            <>
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-white mr-2 border border-slate-700">
                                <img
                                  src={team.logo}
                                  alt={team.code}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-bold text-amber-300 text-xs truncate">
                                {team.name}
                              </span>
                            </>
                          ) : (
                            <span className="italic">Chưa xếp</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Server Backend Configuration Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400 mb-3">
              <Settings className="w-6 h-6" />
              <h4 className="font-display font-bold text-lg text-white">CẤU HÌNH BACKEND CLOUD (RENDER / REALTIME)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Nhập địa chỉ URL backend Render của bạn (ví dụ: <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">https://boctham-backend.onrender.com</code>). 
              Giao diện sẽ tự động kết nối realtime với backend này để bạn điều khiển từ xa.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Địa chỉ Backend Server URL:
              </label>
              <input
                type="text"
                placeholder="https://boctham-backend.onrender.com hoặc để trống"
                value={serverInput}
                onChange={(e) => setServerInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  localStorage.removeItem('boctham_socket_url');
                  window.location.reload();
                }}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Về Mặc Định (Localhost)
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowServerModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    if (serverInput.trim()) {
                      localStorage.setItem('boctham_socket_url', serverInput.trim());
                    } else {
                      localStorage.removeItem('boctham_socket_url');
                    }
                    setShowServerModal(false);
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Lưu & Kết Nối Lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/80 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400 mb-3">
              <AlertTriangle className="w-7 h-7" />
              <h4 className="font-display font-bold text-lg text-white">XÁC NHẬN RESET GIẢI ĐẤU?</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Toàn bộ kết quả bốc thăm của cả 3 bảng đấu sẽ bị xóa và đưa về trạng thái ban đầu. Thao
              tác này sẽ lập tức cập nhật lên Overlay Livestream!
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  reset();
                  setShowResetModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Đồng Ý Xóa & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

