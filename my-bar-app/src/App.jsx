import { useState, useEffect, useRef, useCallback } from "react";

// ─── STORAGE (per-user) ─────────────────────────────────────────────────────
const store = {
  get: (key) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  del: (key) => { try { localStorage.removeItem(key); } catch {} },
};

const uKey = (uid, k) => `bb_${uid}_${k}`;

// ─── DATE UTILS ─────────────────────────────────────────────────────────────
const MONTHS = ["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"];
const WEEKDAYS = ["Ня","Да","Мя","Лх","Пү","Ба","Бя"];
const todayStr = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const prevDayStr = (ds) => { const [y,m,d]=ds.split("-").map(Number); const p=new Date(y,m-1,d-1); return `${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,"0")}-${String(p.getDate()).padStart(2,"0")}`; };

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{width:100%;height:100%;overflow:hidden;font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#025864;border-radius:99px;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
button{font-family:'DM Sans',sans-serif;}

/* LOGIN */
.login-wrap{min-height:100vh;background:linear-gradient(135deg,#012f35 0%,#025864 50%,#01404a 100%);display:flex;align-items:center;justify-content:center;padding:20px;}
.login-card{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:48px 44px;width:100%;max-width:420px;box-shadow:0 24px 80px rgba(0,0,0,0.4);}
.login-logo{display:flex;align-items:center;gap:12px;margin-bottom:36px;justify-content:center;}
.login-logo-icon{width:44px;height:44px;background:#00D47E;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;}
.login-title{color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;}
.login-subtitle{color:rgba(255,255,255,0.45);font-size:13px;text-align:center;margin-bottom:32px;}
.login-field{margin-bottom:16px;}
.login-label{color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;display:block;}
.login-input{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:13px 16px;color:#fff;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.2s;}
.login-input::placeholder{color:rgba(255,255,255,0.3);}
.login-input:focus{border-color:#00D47E;background:rgba(0,212,126,0.08);}
.login-btn{width:100%;background:#00D47E;color:#012f35;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;transition:all 0.2s;margin-top:8px;letter-spacing:-0.2px;}
.login-btn:hover{background:#00f090;transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,212,126,0.3);}
.login-err{background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px 14px;color:#fca5a5;font-size:13px;margin-bottom:14px;}
.login-divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:rgba(255,255,255,0.25);font-size:12px;}
.login-divider::before,.login-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.1);}
.login-alt-btn{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:13px;color:rgba(255,255,255,0.7);font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;}
.login-alt-btn:hover{border-color:rgba(255,255,255,0.3);color:#fff;background:rgba(255,255,255,0.05);}

/* LAYOUT */
.app-wrap{display:flex;height:100vh;width:100vw;overflow:hidden;}
.sidebar{width:240px;min-width:240px;background:#012f35;display:flex;flex-direction:column;height:100vh;}
.sidebar-header{padding:24px 20px 18px;border-bottom:1px solid rgba(255,255,255,0.07);}
.sidebar-user{background:rgba(0,212,126,0.1);border:1px solid rgba(0,212,126,0.2);border-radius:12px;padding:10px 14px;margin-top:14px;display:flex;align-items:center;gap:10px;}
.sidebar-avatar{width:30px;height:30px;background:#00D47E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#012f35;flex-shrink:0;}
.sidebar-username{color:#00D47E;font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sidebar-nav{padding:12px 10px;flex:1;overflow-y:auto;}
.nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;margin-bottom:2px;border-radius:10px;border:none;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;font-size:13.5px;transition:all 0.15s;}
.nav-btn.active{background:rgba(0,212,126,0.15);color:#00D47E;font-weight:700;}
.nav-btn:not(.active){background:transparent;color:rgba(255,255,255,0.55);font-weight:400;}
.nav-btn:not(.active):hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);}
.sidebar-footer{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;}
.logout-btn{background:none;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 12px;color:rgba(255,255,255,0.45);font-size:12px;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.logout-btn:hover{border-color:rgba(239,68,68,0.4);color:#fca5a5;}
.main{flex:1;background:#eef1f4;overflow:auto;height:100vh;}

/* CALENDAR */
.cal-cell{padding:10px;border-radius:10px;border:1px solid #f1f5f9;background:#fafafa;cursor:pointer;transition:all 0.12s;position:relative;min-height:80px;}
.cal-cell:hover{border-color:#00D47E;background:#f0fdf8;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,212,126,0.12);}
.cal-cell.istoday{border:2px solid #00D47E!important;background:#f0fdf8!important;}
.cal-cell.faded{background:transparent;border-color:transparent;cursor:default;pointer-events:none;}
.nbtn{background:#f1f5f9;border:none;border-radius:8px;padding:8px 10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}
.nbtn:hover{background:#e2e8f0;}

/* EXCEL TABLE */
.xl-wrap{overflow:auto;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.08);max-width:100%;}
.xl-table{border-collapse:collapse;font-size:13px;font-family:'DM Mono',monospace;background:#fff;min-width:100%;}
.xl-table th{background:#334155;color:#fff;padding:9px 14px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.3px;white-space:nowrap;position:sticky;top:0;z-index:2;}
.xl-table th.row-num{width:48px;min-width:48px;background:#1e293b;}
.xl-table td{border:1px solid #e8eef4;padding:0;min-width:100px;height:36px;}
.xl-table td.row-num-td{background:#f8fafc;text-align:center;color:#94a3b8;font-size:11px;font-weight:600;padding:0 8px;border:1px solid #e8eef4;}
.xl-cell-input{width:100%;height:100%;border:none;outline:none;padding:6px 10px;font-family:'DM Mono',monospace;font-size:13px;color:#1e293b;background:transparent;transition:background 0.1s;}
.xl-cell-input:focus{background:#f0fdf8;outline:2px solid #00D47E;outline-offset:-2px;}
.xl-table tr:hover td:not(.row-num-td){background:#fafcff;}
.xl-total-row td{background:#f1f5f9;font-weight:700;color:#025864;font-size:12px;padding:8px 10px;text-align:center;}
.add-row-btn,.add-col-btn{background:transparent;border:1.5px dashed #c8d6de;color:#94a3b8;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;}
.add-row-btn{width:100%;padding:8px;margin-top:4px;}
.add-row-btn:hover,.add-col-btn:hover{border-color:#00D47E;color:#00D47E;background:rgba(0,212,126,0.04);}
.del-col-btn{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:11px;padding:2px 4px;border-radius:4px;transition:all 0.15s;line-height:1;}
.del-col-btn:hover{color:#ef4444;background:rgba(239,68,68,0.08);}
.del-row-btn{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;display:block;margin:auto;transition:all 0.15s;}
.del-row-btn:hover{color:#ef4444;}

/* DAY VIEW */
.back-btn-dv{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#fff;transition:background 0.15s;}
.back-btn-dv:hover{background:rgba(255,255,255,0.22);}
.save-fab{position:fixed;bottom:28px;right:28px;background:#025864;color:#fff;border:none;border-radius:14px;padding:16px 32px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 4px 20px rgba(2,88,100,0.35);transition:all 0.2s;z-index:100;display:flex;align-items:center;gap:10px;}
.save-fab:hover{background:#037a8a;transform:translateY(-2px);}
.save-fab.flash{background:#00D47E!important;transform:scale(1.04);}

/* CHAT */
.msg-bubble{background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border:1px solid #f1f5f9;transition:border-color 0.15s;}
.msg-bubble:hover{border-color:#e2e8f0;}
.act-btn{background:none;border:1px solid;border-radius:6px;padding:3px 10px;font-size:11px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
.edit-act{color:#025864;border-color:#025864;}
.edit-act:hover{background:#025864;color:#fff;}
.del-act{color:#ef4444;border-color:#ef4444;}
.del-act:hover{background:#ef4444;color:#fff;}
.send-btn-ch{background:#025864;color:#fff;border:none;border-radius:10px;padding:12px 22px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:background 0.15s;flex-shrink:0;}
.send-btn-ch:hover{background:#037a8a;}
.send-btn-ch:disabled{background:#94a3b8;cursor:default;}

/* DEBT */
.debt-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;font-family:'DM Mono',monospace;}
.debt-tag.owed{background:#fee2e2;color:#dc2626;}
.debt-tag.paid{background:#dcfce7;color:#16a34a;}
.month-summary-card{background:#fff;border-radius:14px;padding:20px;border:1px solid #e2e8f0;margin-bottom:16px;}
.debt-table-section{background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:16px;}
.debt-section-header{background:#334155;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;}
.primary-btn{background:#025864;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:6px;}
.primary-btn:hover{background:#037a8a;}
.danger-btn{background:transparent;border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:8px;padding:5px 12px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all 0.15s;}
.danger-btn:hover{background:rgba(239,68,68,0.08);}
.page-header{padding:28px 32px 0;}
.page-title{font-size:24px;font-weight:800;color:#025864;margin-bottom:4px;letter-spacing:-0.5px;}
.page-sub{color:#64748b;font-size:13.5px;}
`;

// ═══════════════════════════════════════════════════════════════════════════
// EXCEL TABLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function ExcelTable({ tableData, onUpdate, readOnly=false }) {
  const defaultData = { cols: ["А","Б","В"], rows: [["","",""],["","",""],["",""," "]] };
  const data = tableData || defaultData;

  const addRow = () => {
    const newRow = Array(data.cols.length).fill("");
    onUpdate({ ...data, rows: [...data.rows, newRow] });
  };

  const addCol = () => {
    const newCols = [...data.cols, String.fromCharCode(65 + data.cols.length)];
    const newRows = data.rows.map(r => [...r, ""]);
    onUpdate({ ...data, cols: newCols, rows: newRows });
  };

  const delCol = (ci) => {
    if (data.cols.length <= 1) return;
    const newCols = data.cols.filter((_,i)=>i!==ci);
    const newRows = data.rows.map(r => r.filter((_,i)=>i!==ci));
    onUpdate({ ...data, cols: newCols, rows: newRows });
  };

  const delRow = (ri) => {
    if (data.rows.length <= 1) return;
    onUpdate({ ...data, rows: data.rows.filter((_,i)=>i!==ri) });
  };

  const updateCell = (ri, ci, val) => {
    const newRows = data.rows.map((r,rr) => r.map((c,cc) => rr===ri&&cc===ci ? val : c));
    onUpdate({ ...data, rows: newRows });
  };

  const updateColName = (ci, val) => {
    const newCols = data.cols.map((c,i)=>i===ci?val:c);
    onUpdate({ ...data, cols: newCols });
  };

  return (
    <div>
      <div className="xl-wrap">
        <table className="xl-table">
          <thead>
            <tr>
              <th className="row-num">#</th>
              {data.cols.map((col, ci) => (
                <th key={ci} style={{minWidth:120}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    {readOnly ? col : (
                      <input value={col} onChange={e=>updateColName(ci,e.target.value)}
                        style={{background:"transparent",border:"none",outline:"none",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,textAlign:"center",width:"80px"}}/>
                    )}
                    {!readOnly && <button className="del-col-btn" onClick={()=>delCol(ci)} title="Устгах">✕</button>}
                  </div>
                </th>
              ))}
              {!readOnly && (
                <th style={{background:"#1e293b",width:50}}>
                  <button className="add-col-btn" onClick={addCol} style={{width:36,height:28,padding:0}}>+</button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                <td className="row-num-td">{ri+1}</td>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    {readOnly ? (
                      <div style={{padding:"6px 10px",fontSize:13,fontFamily:"'DM Mono',monospace",color:"#1e293b"}}>{cell}</div>
                    ) : (
                      <input className="xl-cell-input" value={cell} onChange={e=>updateCell(ri,ci,e.target.value)}/>
                    )}
                  </td>
                ))}
                {!readOnly && <td className="row-num-td"><button className="del-row-btn" onClick={()=>delRow(ri)}>✕</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <button className="add-row-btn" onClick={addRow}>
          <span>+</span> Мөр нэмэх
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN / REGISTER
// ═══════════════════════════════════════════════════════════════════════════
function LoginView({ onLogin, onCancel }) {
  const [mode, setMode] = useState("login");
  const [cid, setCid]   = useState("");
  const [name, setName] = useState("");
  const [err, setErr]   = useState("");

  const handleLogin = () => {
    const users = store.get("bb_users") || {};
    if (!cid.trim()) { setErr("ID оруулна уу."); return; }
    if (!users[cid.trim()]) { setErr("Энэ ID бүртгэлгүй байна."); return; }
    setErr("");
    onLogin({ id: cid.trim(), name: users[cid.trim()].name });
  };

  const handleCreate = () => {
    if (!cid.trim() || !name.trim()) { setErr("Нэр болон ID оруулна уу."); return; }
    const users = store.get("bb_users") || {};
    if (users[cid.trim()]) { setErr("Энэ ID аль хэдийн бүртгэлтэй."); return; }
    users[cid.trim()] = { name: name.trim() };
    store.set("bb_users", users);
    setErr("");
    onLogin({ id: cid.trim(), name: name.trim() });
  };

  const card = (
    <div className="login-card">
      {/* Logo */}
      <div className="login-logo">
        <div className="login-logo-icon">🍸</div>
        <div>
          <div className="login-title">BarBook</div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="login-subtitle">
        {mode==="login" ? "Өрийн дэвтэрт нэвтрэх" : "Шинэ бүртгэл үүсгэх"}
      </div>

      {/* Error */}
      {err && <div className="login-err">{err}</div>}

      {/* Name field (create only) */}
      {mode === "create" && (
        <div className="login-field">
          <label className="login-label">Таны нэр</label>
          <input
            className="login-input"
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Жишээ: Бат"
            autoFocus
            onKeyDown={e=>e.key==="Enter"&&handleCreate()}
          />
        </div>
      )}

      {/* ID field */}
      <div className="login-field">
        <label className="login-label">Нэвтрэх ID</label>
        <input
          className="login-input"
          value={cid}
          onChange={e=>setCid(e.target.value)}
          placeholder="Жишээ: bat2024"
          autoFocus={mode==="login"}
          onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleCreate())}
        />
      </div>

      {/* Actions */}
      {mode === "login" ? (
        <>
          <button className="login-btn" onClick={handleLogin}>Нэвтрэх →</button>
          <div className="login-divider">эсвэл</div>
          <button className="login-alt-btn" onClick={()=>{setMode("create");setErr("");}}>
            Шинэ бүртгэл үүсгэх
          </button>
        </>
      ) : (
        <>
          <button className="login-btn" onClick={handleCreate}>Бүртгэл үүсгэх →</button>
          <div className="login-divider">эсвэл</div>
          <button className="login-alt-btn" onClick={()=>{setMode("login");setErr("");}}>
            ← Нэвтрэхийн буцах
          </button>
        </>
      )}

      {/* Cancel — only shown when triggered from inside the app */}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            width:"100%", marginTop:16, background:"transparent", border:"none",
            color:"rgba(255,255,255,0.35)", fontSize:13, fontWeight:500,
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            padding:"10px", borderRadius:10, transition:"color 0.15s",
            letterSpacing:"0.2px",
          }}
          onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.65)"}
          onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}
        >
          ← Буцах (нэвтрэлгүйгээр үргэлжлүүлэх)
        </button>
      )}
    </div>
  );

  // Full-screen gradient overlay — same look whether triggered inline or standalone
  return (
    <div style={{
      position: onCancel ? "fixed" : "relative",
      inset: onCancel ? 0 : "auto",
      zIndex: onCancel ? 200 : "auto",
      minHeight: onCancel ? "auto" : "100vh",
      width: "100%",
      height: onCancel ? "100%" : "auto",
      background: "linear-gradient(135deg,#012f35 0%,#025864 50%,#01404a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      {card}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════════════════
function CalendarView({ uid, onDayClick, hasData }) {
  const today = new Date();
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const { year, month } = calMonth;
  const ts = todayStr();

  const prev    = () => setCalMonth(c => c.month===0  ? {year:c.year-1,month:11} : {year:c.year,month:c.month-1});
  const next    = () => setCalMonth(c => c.month===11 ? {year:c.year+1,month:0}  : {year:c.year,month:c.month+1});
  const goToday = () => setCalMonth({year:today.getFullYear(),month:today.getMonth()});

  const ds = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const prevMonLast = new Date(year,month,0).getDate();
  const cells = [];
  for (let i=firstDay-1;i>=0;i--) cells.push({day:prevMonLast-i,cur:false});
  for (let d=1;d<=daysInMonth;d++) cells.push({day:d,cur:true});
  while (cells.length<42) cells.push({day:cells.length-firstDay-daysInMonth+1,cur:false});

  return (
    <div style={{display:"flex",flexDirection:"column",padding:"28px 32px",height:"100%",boxSizing:"border-box"}}>
      <div className="page-header" style={{padding:0,marginBottom:20}}>
        <div className="page-title">Хуанли</div>
        <div className="page-sub">Өдрийг сонгоод бараа бүртгэлийг нээнэ үү.</div>
      </div>
      <div style={{background:"#fff",borderRadius:16,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",padding:24,flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <button className="nbtn" onClick={prev}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#025864" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20,fontWeight:800,color:"#025864",letterSpacing:"-0.5px"}}>{MONTHS[month]} {year}</span>
            <button onClick={goToday} style={{background:"#025864",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Өнөөдөр</button>
          </div>
          <button className="nbtn" onClick={next}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#025864" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:6}}>
          {WEEKDAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#94a3b8",padding:"4px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gridTemplateRows:"repeat(6,1fr)",gap:6,flex:1}}>
          {cells.map((cell,i)=>{
            const dk = cell.cur ? ds(cell.day) : null;
            const isToday = dk===ts;
            const active = dk && hasData(dk);
            return (
              <div key={i} className={`cal-cell${isToday?" istoday":""}${!cell.cur?" faded":""}`} onClick={()=>cell.cur&&onDayClick(dk)}>
                {cell.cur ? (
                  <>
                    <div style={{fontSize:13,fontWeight:isToday?800:500,color:isToday?"#00D47E":"#1e293b",marginBottom:4}}>{cell.day}</div>
                    {active && <div style={{fontSize:10,background:"#00D47E22",color:"#025864",padding:"2px 6px",borderRadius:4,fontWeight:700}}>✓</div>}
                  </>
                ) : <div style={{fontSize:12,color:"#e2e8f0"}}>{cell.day}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY VIEW — original fixed-column design, unlimited rows
// ═══════════════════════════════════════════════════════════════════════════
const BLANK_ROW = () => ({ name:"", price:"", morning:"", evening:"", expense:"", totalSales:"" });

function DayView({ uid, dateStr, onBack, allDays, setAllDays }) {
  const [flash, setFlash] = useState(false);

  const getDay = (ds) => {
    if (allDays[ds]) return allDays[ds];
    const prev = prevDayStr(ds);
    const prevDay = allDays[prev];
    if (prevDay && prevDay.savedEvening && prevDay.rows) {
      // auto-fill: copy evening → morning, keep price, clear evening & calculated fields
      return {
        rows: prevDay.rows.map(r=>({ name:r.name, price:r.price||"", morning:r.evening, evening:"", expense:"", totalSales:"" })),
        savedMorning:false, savedEvening:false, autoFilledFrom:prev
      };
    }
    return { rows:[BLANK_ROW(),BLANK_ROW(),BLANK_ROW()], savedMorning:false, savedEvening:false };
  };

  const dayData = getDay(dateStr);
  const [rows, setRows]           = useState(dayData.rows || [BLANK_ROW()]);
  const [savedMorning, setSavedMorning] = useState(dayData.savedMorning||false);
  const [savedEvening, setSavedEvening] = useState(dayData.savedEvening||false);

  useEffect(()=>{
    const d = getDay(dateStr);
    setRows(d.rows||[BLANK_ROW()]);
    setSavedMorning(d.savedMorning||false);
    setSavedEvening(d.savedEvening||false);
  },[dateStr]); // eslint-disable-line

  const updateRow = (i, field, val) =>
    setRows(p => p.map((r,ri) => ri===i ? {...r,[field]:val} : r));

  const addRow = () => setRows(p=>[...p, BLANK_ROW()]);
  const delRow = (i) => { if(rows.length>1) setRows(p=>p.filter((_,ri)=>ri!==i)); };

  const handleSave = () => {
    const saved = rows.map(r => {
      const mv = parseFloat(r.morning)||0;
      const ev = parseFloat(r.evening)||0;
      const pv = parseFloat(r.price)||0;
      const expense = (mv===0&&ev===0) ? "" : String(Math.max(0,mv-ev));
      const soldQty = Math.max(0, mv - ev);
      const totalSales = (pv > 0 && soldQty > 0) ? String(soldQty * pv) : "";
      return {...r, expense, totalSales};
    });
    setRows(saved);
    const hasMorning = saved.some(r=>r.morning!=="");
    const hasEvening = saved.some(r=>r.evening!=="");
    setAllDays(prev=>({...prev,[dateStr]:{
      rows:saved, savedMorning:hasMorning||savedMorning, savedEvening:hasEvening||savedEvening,
      autoFilledFrom:dayData.autoFilledFrom
    }}));
    setSavedMorning(hasMorning||savedMorning);
    setSavedEvening(hasEvening||savedEvening);
    setFlash(true);
    setTimeout(()=>setFlash(false),1800);
  };

  const totalMorning  = rows.reduce((s,r)=>s+(parseFloat(r.morning)||0),0);
  const totalEvening  = rows.reduce((s,r)=>s+(parseFloat(r.evening)||0),0);
  const totalExpense  = rows.reduce((s,r)=>s+(parseFloat(r.expense)||0),0);
  const totalSalesSum = rows.reduce((s,r)=>s+(parseFloat(r.totalSales)||0),0);

  const [y,mo,d] = dateStr.split("-").map(Number);
  const label = new Date(y,mo-1,d).toLocaleDateString("mn-MN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  const thS = (align="center", bg="#334155") => ({
    padding:"11px 12px", textAlign:align, fontWeight:700, color:"#fff",
    fontSize:12, letterSpacing:"0.3px", whiteSpace:"nowrap", background:bg,
  });

  const cellStyle = (bg) => ({ padding:"6px 10px", background:bg });

  const inStyle = (color, align="center") => ({
    width:"100%", border:"none", outline:"none",
    fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:700,
    color, background:"transparent", textAlign:align, padding:"4px 0",
  });

  return (
    <div style={{minHeight:"100vh",background:"#eef1f4",paddingBottom:100}}>
      {/* Top bar */}
      <div style={{background:"#025864",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(2,88,100,0.3)"}}>
        <button className="back-btn-dv" onClick={onBack}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          Хуанли
        </button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:2}}>Өдрийн бараа бүртгэл</div>
          <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{label}</div>
          {dayData.autoFilledFrom && <div style={{fontSize:11,color:"#86efac",marginTop:2}}>↑ Өчигдрийн оройн тоо автоматаар орлоо</div>}
        </div>
        <div style={{display:"flex",gap:16}}>
          {[
            {l:"Өглөө",  v:totalMorning||"—",  c:"#7dd3e8"},
            {l:"Орой",   v:totalEvening||"—",   c:"#86efac"},
            {l:"Зарлага",v:totalExpense||"—",   c:"#fde68a"},
            {l:"Борлуулалт",v:totalSalesSum>0?(totalSalesSum.toLocaleString()+"₮"):"—",c:"#f9a8d4"},
          ].map(s=>(
            <div key={s.l} style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>{s.l}</div>
              <div style={{fontSize:15,fontWeight:800,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"24px"}}>
        {dayData.autoFilledFrom && (
          <div style={{background:"#dbeafe",border:"1px solid #93c5fd",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:"#1d4ed8",display:"flex",alignItems:"center",gap:8}}>
            <span>🔄</span>
            <span>Өчигдрийн <strong>оройн үлдэгдэл</strong> өнөөдрийн <strong>өглөөний тоо</strong>-нд автоматаар орлоо. Нэгж үнэ хадгалагдсан.</span>
          </div>
        )}

        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr>
                <th style={{...thS("center","#334155"),width:"3%"}}>#</th>
                <th style={{...thS("left","#334155"),  width:"22%"}}>Барааны нэр</th>
                <th style={{...thS("center","#7c3aed"),width:"12%"}}>Нэгж үнэ ₮</th>
                <th style={{...thS("center","#1d4ed8"),width:"13%"}}>Өглөөний тоо</th>
                <th style={{...thS("center","#15803d"),width:"13%"}}>Оройн тоо</th>
                <th style={{...thS("center","#a16207"),width:"12%"}}>Зарлага</th>
                <th style={{...thS("center","#be185d"),width:"18%"}}>Нийт борлуулалт ₮</th>
                <th style={{...thS("center","#334155"),width:"4%"}}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <td style={{...cellStyle("#f8fafc"),textAlign:"center",color:"#94a3b8",fontWeight:600,fontSize:11}}>{i+1}</td>
                  <td style={{...cellStyle("#fff"),borderRight:"1px solid #f1f5f9"}}>
                    <input value={row.name} onChange={e=>updateRow(i,"name",e.target.value)}
                      placeholder={`${i+1}-р бараа…`}
                      style={{width:"100%",border:"none",outline:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"#1e293b",background:"transparent",padding:"4px 2px"}}/>
                  </td>
                  <td style={cellStyle("#f5f3ff")}>
                    <input value={row.price} onChange={e=>updateRow(i,"price",e.target.value)}
                      placeholder="—"
                      style={{...inStyle("#7c3aed")}}/>
                  </td>
                  <td style={cellStyle("#eff6ff")}>
                    <input value={row.morning} onChange={e=>updateRow(i,"morning",e.target.value)}
                      placeholder="—"
                      style={{...inStyle("#1d4ed8")}}/>
                  </td>
                  <td style={cellStyle("#f0fdf4")}>
                    <input value={row.evening} onChange={e=>updateRow(i,"evening",e.target.value)}
                      placeholder="—"
                      style={{...inStyle("#15803d")}}/>
                  </td>
                  <td style={{...cellStyle("#fefce8"),textAlign:"center"}}>
                    <span style={{fontSize:13,fontWeight:700,color:row.expense&&row.expense!=="0"?"#a16207":"#d1d5db"}}>
                      {row.expense&&row.expense!=="0"&&row.expense!==""?row.expense:"—"}
                    </span>
                  </td>
                  <td style={{...cellStyle("#fdf2f8"),textAlign:"center"}}>
                    <span style={{fontSize:13,fontWeight:800,color:row.totalSales&&row.totalSales!=="0"?"#be185d":"#d1d5db"}}>
                      {row.totalSales&&row.totalSales!=="0"&&row.totalSales!==""
                        ? (parseFloat(row.totalSales)).toLocaleString()+"₮"
                        : (row.price&&row.expense ? "⏳" : "—")}
                    </span>
                  </td>
                  <td style={{...cellStyle("#f8fafc"),textAlign:"center"}}>
                    <button onClick={()=>delRow(i)}
                      style={{background:"none",border:"none",color:"#cbd5e1",cursor:"pointer",fontSize:13,padding:"2px 6px",borderRadius:4,transition:"color 0.15s"}}
                      onMouseEnter={e=>e.target.style.color="#ef4444"} onMouseLeave={e=>e.target.style.color="#cbd5e1"}>✕</button>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{borderTop:"2px solid #e2e8f0",background:"#f8fafc"}}>
                <td style={{padding:"10px"}} colSpan={2}>
                  <span style={{padding:"10px 0px",color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:700}}>Нийт дүн</span>
                </td>
                <td style={{padding:"10px",textAlign:"center",color:"#7c3aed",fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>—</td>
                <td style={{padding:"10px",textAlign:"center",color:"#1d4ed8",fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{totalMorning>0?totalMorning:"—"}</td>
                <td style={{padding:"10px",textAlign:"center",color:"#15803d",fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{totalEvening>0?totalEvening:"—"}</td>
                <td style={{padding:"10px",textAlign:"center",color:"#a16207",fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{totalExpense>0?totalExpense:"—"}</td>
                <td style={{padding:"10px",textAlign:"center",color:"#be185d",fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>
                  {totalSalesSum>0?totalSalesSum.toLocaleString()+"₮":"—"}
                </td>
                <td/>
              </tr>
            </tbody>
          </table>
          <div style={{padding:"8px 12px",borderTop:"1px dashed #e2e8f0"}}>
            <button onClick={addRow}
              style={{width:"100%",padding:"8px",background:"transparent",border:"1.5px dashed #c8d6de",borderRadius:8,color:"#94a3b8",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#00D47E";e.currentTarget.style.color="#00D47E";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#c8d6de";e.currentTarget.style.color="#94a3b8";}}>
              + Мөр нэмэх
            </button>
          </div>
        </div>

        <div style={{marginTop:12,display:"flex",gap:10,flexWrap:"wrap"}}>
          {savedMorning && <div style={{background:"#dbeafe",border:"1px solid #93c5fd",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#1d4ed8",fontWeight:600}}>✓ Өглөөний тоо хадгалагдсан</div>}
          {savedEvening && <div style={{background:"#dcfce7",border:"1px solid #86efac",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#15803d",fontWeight:600}}>✓ Оройн тоо · Зарлага · Борлуулалт тооцоологдсон</div>}
          {!savedMorning&&!savedEvening&&<div style={{fontSize:12,color:"#94a3b8"}}>Нэгж үнэ болон тоо оруулаад <strong>Хадгалах</strong> дарна уу. Борлуулалт автоматаар тооцоологдоно.</div>}
        </div>
      </div>

      <button className={`save-fab${flash?" flash":""}`} onClick={handleSave}>
        {flash ? <>✓ Хадгалагдлаа!</> : <><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>Хадгалах</>}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAT VIEW
// ═══════════════════════════════════════════════════════════════════════════
function ChatView({ uid }) {
  const [messages, setMessages] = useState(() => store.get(uKey(uid,"chat")) || []);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [now, setNow] = useState(Date.now());
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{ store.set(uKey(uid,"chat"),messages); },[messages]);
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),10000); return()=>clearInterval(t); },[]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const send = () => {
    const t = text.trim(); if (!t) return;
    setMessages(prev=>[...prev,{id:Date.now(),text:t,timestamp:Date.now()}]);
    setText(""); inputRef.current?.focus();
  };
  const deleteMsg = id => setMessages(p=>p.filter(m=>m.id!==id));
  const startEdit = msg => { setEditingId(msg.id); setEditText(msg.text); };
  const saveEdit = () => {
    if (!editText.trim()) return;
    setMessages(p=>p.map(m=>m.id===editingId?{...m,text:editText.trim()}:m));
    setEditingId(null); setEditText("");
  };

  const canEdit   = ts => now-ts<60000;
  const canDelete = ts => now-ts<300000;
  const fmtTs = ts => {
    const d=new Date(ts);
    return { date:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`, time:`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}` };
  };
  const timeAgo = ts => {
    const s=Math.floor((now-ts)/1000);
    if(s<60) return`${s}с өмнө`; if(s<3600) return`${Math.floor(s/60)}м өмнө`; if(s<86400) return`${Math.floor(s/3600)}ц өмнө`; return`${Math.floor(s/86400)}өдөр өмнө`;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:"#025864",padding:"16px 24px",flexShrink:0}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>Харилцах дэвтэр 📒</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>1 мин дотор засна · 5 мин дотор устгана</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:10}}>
        {messages.length===0 && <div style={{textAlign:"center",marginTop:60,color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>📒</div><div style={{fontSize:15,fontWeight:600,color:"#64748b"}}>Хоосон байна</div><div style={{fontSize:13,marginTop:4}}>Доор мессеж бичиж эхлээрэй.</div></div>}
        {messages.map(msg=>{
          const {date,time}=fmtTs(msg.timestamp); const isEditing=editingId===msg.id;
          return (
            <div key={msg.id} className="msg-bubble">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#025864",fontWeight:700,background:"#f0fdf8",padding:"2px 8px",borderRadius:4}}>{date}</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#64748b",background:"#f8fafc",padding:"2px 8px",borderRadius:4}}>{time}</span>
                  <span style={{fontSize:11,color:"#94a3b8"}}>{timeAgo(msg.timestamp)}</span>
                </div>
                {!isEditing&&<div style={{display:"flex",gap:6}}>
                  {canEdit(msg.timestamp)&&<button className="act-btn edit-act" onClick={()=>startEdit(msg)}>✎ засах</button>}
                  {canDelete(msg.timestamp)&&<button className="act-btn del-act" onClick={()=>deleteMsg(msg.id)}>✕ устгах</button>}
                  {!canEdit(msg.timestamp)&&!canDelete(msg.timestamp)&&<span style={{fontSize:10,color:"#cbd5e1",fontStyle:"italic"}}>бүртгэлд орсон</span>}
                </div>}
              </div>
              {isEditing ? (
                <div>
                  <textarea style={{width:"100%",border:"1.5px solid #00D47E",borderRadius:8,padding:"8px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#1e293b",resize:"none",outline:"none",minHeight:60}} autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveEdit();}if(e.key==="Escape"){setEditingId(null);setEditText("");}}}/>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button style={{background:"#00D47E",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:"pointer"}} onClick={saveEdit}>Хадгалах</button>
                    <button style={{background:"none",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:"#64748b",cursor:"pointer"}} onClick={()=>{setEditingId(null);setEditText("");}}>Болих</button>
                  </div>
                </div>
              ) : <div style={{fontSize:14,color:"#1e293b",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{msg.text}</div>}
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"14px 24px 20px",background:"#fff",borderTop:"1px solid #e2e8f0",flexShrink:0}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <textarea ref={inputRef} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Мессеж бичих… (Enter — илгээх)" rows={2}
            style={{flex:1,border:"1.5px solid #e2e8f0",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#1e293b",resize:"none",outline:"none",maxHeight:120,transition:"border-color 0.15s"}}
            onFocus={e=>e.target.style.borderColor="#025864"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
          <button className="send-btn-ch" onClick={send} disabled={!text.trim()}>Илгээх →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBT NOTEBOOK VIEW
// ═══════════════════════════════════════════════════════════════════════════
function DebtView({ uid, userName }) {
  const storageKey = uKey(uid, "debts");
  const [debts, setDebts]         = useState(() => store.get(storageKey) || []);
  const [viewMode, setViewMode]   = useState("list"); // list | summary
  const [filterMonth, setFilterMonth] = useState(() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [formErr, setFormErr]     = useState("");

  // form state
  const emptyForm = () => ({ debtor:userName || "", amount:"", note:"", date:todayStr(), type:"" });
  const [form, setForm] = useState(()=>emptyForm());

  useEffect(()=>{ store.set(storageKey, debts); },[debts]);

  const saveDebt = () => {
    const amt = String(form.amount).trim();
    if (!amt) {
      setFormErr("Дүн оруулна уу.");
      return;
    }
    setFormErr("");
    const entry = {
      debtor: userName || form.debtor,
      amount: amt,
      note: form.note || "",
      date: form.date || todayStr(),
      type: form.type || "",
      id: editId !== null ? editId : Date.now(),
    };
    if (editId !== null) {
      setDebts(p => p.map(d => d.id === editId ? entry : d));
      setEditId(null);
    } else {
      setDebts(p => [...p, entry]);
    }
    setForm(emptyForm());
    setShowAddForm(false);
  };

  const startEdit = (debt) => {
    setForm({ debtor:userName, amount:debt.amount, note:debt.note, date:debt.date, type:debt.type });
    setEditId(debt.id);
    setFormErr("");
    setShowAddForm(true);
  };

  const deleteDebt = (id) => setDebts(p => p.filter(d => d.id!==id));


  // Month filtering
  const monthsSet = new Set(debts.map(d => d.date.slice(0,7)));
  const months = Array.from(monthsSet).sort().reverse();

  const filteredDebts = debts.filter(d => d.date.startsWith(filterMonth));
  const totalAmount = filteredDebts.reduce((s,d)=>s+(parseFloat(d.amount)||0),0);
  // group by type for summary
  const byType = filteredDebts.reduce((acc,d)=>{
    const t = d.type||"(Төрөл байхгүй)";
    if(!acc[t]) acc[t]={count:0,total:0};
    acc[t].count++; acc[t].total+=parseFloat(d.amount)||0;
    return acc;
  },{});

  const fmtDate = ds => {
    const [y,m,d2] = ds.split("-");
    return `${y}/${m}/${d2}`;
  };

  return (
    <div style={{padding:"24px 28px",minHeight:"100%"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div className="page-title">Өрийн дэвтэр 💳</div>
          <div className="page-sub">Хэнд хэдийг өглөө, авлагын бүртгэл хөтлөх.</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setViewMode(v=>v==="list"?"summary":"list")} style={{background:viewMode==="summary"?"#025864":"#f1f5f9",color:viewMode==="summary"?"#fff":"#025864",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {viewMode==="list" ? "📊 Сарын тайлан" : "📋 Жагсаалт"}
          </button>
          <button className="primary-btn" onClick={()=>{ setForm(emptyForm()); setEditId(null); setFormErr(""); setShowAddForm(true); }}>
            + Өр нэмэх
          </button>
        </div>
      </div>

      {/* Month filter */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <span style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px"}}>Сар:</span>
        {[...new Set([filterMonth,...months])].map(m=>(
          <button key={m} onClick={()=>setFilterMonth(m)} style={{background:filterMonth===m?"#025864":"#f1f5f9",color:filterMonth===m?"#fff":"#475569",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {m}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{background:"#fff",borderRadius:14,padding:20,marginBottom:16,border:"1px solid #e2e8f0",boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
          <div style={{fontWeight:800,fontSize:14,color:"#025864",marginBottom:16}}>{editId!==null?"Засах":"Шинэ өр бүртгэл"}</div>
          {formErr && <div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#dc2626",marginBottom:12,fontWeight:600}}>⚠ {formErr}</div>}
          {/* Row 1: name (locked) + amount + date + type */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.5px",textTransform:"uppercase",display:"block",marginBottom:4}}>Нэр (Та)</label>
              <div style={{width:"100%",background:"#f1f5f9",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:"#475569",display:"flex",alignItems:"center",gap:6,height:42}}>
                <span style={{width:20,height:20,background:"#00D47E",borderRadius:6,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#012f35",flexShrink:0}}>{userName.charAt(0).toUpperCase()}</span>
                <span style={{fontWeight:700,color:"#025864"}}>{userName}</span>
                <span style={{fontSize:10,color:"#94a3b8",marginLeft:"auto"}}>🔒</span>
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.5px",textTransform:"uppercase",display:"block",marginBottom:4}}>Дүн (₮)</label>
              <input value={form.amount}
                onChange={e=>{setFormErr("");setForm(p=>({...p,amount:e.target.value}));}}
                onKeyDown={e=>e.key==="Enter"&&saveDebt()}
                placeholder="0" style={{width:"100%",border:formErr?"1.5px solid #fca5a5":"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none",height:42}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.5px",textTransform:"uppercase",display:"block",marginBottom:4}}>Огноо</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",height:42}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.5px",textTransform:"uppercase",display:"block",marginBottom:4}}>Төрөл</label>
              <input value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&saveDebt()}
                placeholder="Жишэ: Аяга, Мөнгө…" style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",height:42}}/>
            </div>
          </div>
          {/* Row 2: note + action buttons */}
          <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <label style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.5px",textTransform:"uppercase",display:"block",marginBottom:4}}>Тэмдэглэл</label>
              <input value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&saveDebt()}
                placeholder="Нэмэлт тэмдэглэл…" style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",height:42}}/>
            </div>
            <button className="primary-btn" onClick={saveDebt} style={{height:42,whiteSpace:"nowrap",paddingLeft:20,paddingRight:20}}>
              {editId!==null?"✓ Хадгалах":"+ Нэмэх"}
            </button>
            <button onClick={()=>{setShowAddForm(false);setForm(emptyForm());setEditId(null);setFormErr("");}}
              style={{height:42,background:"transparent",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"0 16px",fontSize:13,fontWeight:600,color:"#64748b",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
              Болих
            </button>
          </div>
        </div>
      )}

      {/* MONTHLY SUMMARY */}
      {viewMode === "summary" && (
        <div className="month-summary-card">
          <div style={{fontWeight:800,fontSize:16,color:"#025864",marginBottom:16}}>📊 {filterMonth} — Сарын тайлан</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <div style={{background:"#e0f2fe",borderRadius:12,padding:"16px 20px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#0c4a6e",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:6}}>Нийт дүн</div>
              <div style={{fontSize:24,fontWeight:800,color:"#0369a1",fontFamily:"'DM Mono',monospace"}}>{totalAmount.toLocaleString()}₮</div>
              <div style={{fontSize:12,color:"#0ea5e9",marginTop:4}}>{filteredDebts.length} нийт бүртгэл</div>
            </div>
            <div style={{background:"#f1f5f9",borderRadius:12,padding:"16px 20px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:8}}>Төрлөөр</div>
              {Object.keys(byType).length===0 ? <div style={{fontSize:12,color:"#94a3b8"}}>Бүртгэл алга</div> :
                Object.entries(byType).map(([t,v])=>(
                  <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:12,color:"#334155",fontWeight:600}}>{t}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#025864",fontWeight:700}}>{v.total.toLocaleString()}₮ <span style={{color:"#94a3b8",fontWeight:400}}>({v.count})</span></span>
                  </div>
                ))
              }
            </div>
          </div>
          {filteredDebts.length>0&&(
            <div style={{marginTop:20}}>
              <div style={{fontWeight:700,fontSize:13,color:"#475569",marginBottom:10}}>{filterMonth}-д бүртгэгдсэн өрүүд:</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#f8fafc"}}>
                  {["Нэр","Дүн","Огноо","Төрөл","Тэмдэглэл"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredDebts.map(d=>(
                    <tr key={d.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"9px 12px",fontWeight:700,color:"#1e293b"}}>{d.debtor}</td>
                      <td style={{padding:"9px 12px",fontFamily:"'DM Mono',monospace",color:"#025864",fontWeight:700}}>{parseFloat(d.amount).toLocaleString()}₮</td>
                      <td style={{padding:"9px 12px",fontFamily:"'DM Mono',monospace",color:"#64748b",fontSize:12}}>{fmtDate(d.date)}</td>
                      <td style={{padding:"9px 12px"}}><span style={{background:"#f1f5f9",color:"#334155",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{d.type||"—"}</span></td>
                      <td style={{padding:"9px 12px",color:"#64748b",fontSize:12}}>{d.note||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DEBT LIST with expandable tables */}
      {viewMode === "list" && (
        <div>
          {filteredDebts.length === 0 && (
            <div style={{textAlign:"center",padding:"60px 20px",color:"#94a3b8"}}>
              <div style={{fontSize:36,marginBottom:12}}>💳</div>
              <div style={{fontSize:15,fontWeight:600,color:"#64748b",marginBottom:4}}>{filterMonth}-д өрийн бүртгэл алга</div>
              <div style={{fontSize:13}}>Дээрх "+ Өр нэмэх" дарж бүртгэлийг эхлүүлнэ үү.</div>
            </div>
          )}
          {filteredDebts.map(debt=>(
            <DebtCard key={debt.id} debt={debt} onEdit={startEdit} onDelete={deleteDebt} fmtDate={fmtDate}/>
          ))}
        </div>
      )}
    </div>
  );
}

function DebtCard({ debt, onEdit, onDelete, fmtDate }) {
  return (
    <div className="debt-table-section" style={{marginBottom:10}}>
      <div className="debt-section-header">
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          {debt.type && <span style={{background:"rgba(0,212,126,0.2)",color:"#00D47E",padding:"2px 10px",borderRadius:6,fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{debt.type}</span>}
          <span style={{color:"#fff",fontWeight:800,fontSize:15}}>{debt.debtor}</span>
          <span style={{fontFamily:"'DM Mono',monospace",color:"#fde68a",fontWeight:800,fontSize:15}}>{parseFloat(debt.amount).toLocaleString()}₮</span>
          <span style={{fontFamily:"'DM Mono',monospace",color:"rgba(255,255,255,0.4)",fontSize:11}}>{fmtDate(debt.date)}</span>
          {debt.note && <span style={{color:"rgba(255,255,255,0.5)",fontSize:12,fontStyle:"italic"}}>"{debt.note}"</span>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>onEdit(debt)} style={{background:"rgba(0,212,126,0.15)",border:"1px solid rgba(0,212,126,0.3)",borderRadius:8,padding:"5px 12px",color:"#00D47E",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>✎ Засах</button>
          <button onClick={()=>onDelete(debt.id)} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"5px 10px",color:"#fca5a5",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  // user is only needed for debt notebook
  const [user, setUser]         = useState(() => store.get("bb_current_user"));
  const [view, setView]         = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDebtLogin, setShowDebtLogin] = useState(false);

  // Calendar day data saved without login, under a shared "guest" key
  const GUEST = "guest";
  const [allDays, setAllDays] = useState(() => store.get(uKey(GUEST,"days")) || {});
  useEffect(()=>{ store.set(uKey(GUEST,"days"), allDays); },[allDays]);

  const handleLogin = (u) => {
    store.set("bb_current_user", u);
    setUser(u);
    setShowDebtLogin(false);
    setView("debt");
  };

  const handleLogout = () => {
    store.del("bb_current_user");
    setUser(null);
    setView("calendar");
  };

  const hasData = (ds) => { const r=allDays[ds]; return r&&(r.savedMorning||r.savedEvening); };

  const goToDebt = () => {
    if (user) { setView("debt"); }
    else { setShowDebtLogin(true); }
  };

  const NAV = [
    { id:"calendar", label:"Хуанли",           emoji:"📅", action: ()=>{ setShowDebtLogin(false); setView("calendar"); } },
    { id:"chat",     label:"Харилцах дэвтэр",  emoji:"📒", action: ()=>{ setShowDebtLogin(false); setView("chat"); } },
    { id:"debt",     label:"Өрийн дэвтэр",     emoji:"💳", action: goToDebt },
  ];

  const activeNav = showDebtLogin ? "debt" : view;

  // If showing debt login overlay — LoginView renders its own full-screen gradient
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {/* Login overlay — shown on top of everything when accessing Өрийн дэвтэр without login */}
      {showDebtLogin && <LoginView onLogin={handleLogin} onCancel={()=>setShowDebtLogin(false)}/>}
      <div className="app-wrap">
        {/* SIDEBAR — hidden in day view */}
        {view !== "day" && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,background:"#00D47E",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🍸</div>
                <div>
                  <div style={{color:"#fff",fontWeight:800,fontSize:17,letterSpacing:"-0.3px"}}>BarBook</div>
                  <div style={{color:"rgba(255,255,255,0.35)",fontSize:10}}>Бараа бүртгэлийн систем</div>
                </div>
              </div>
              {user && (
                <div className="sidebar-user">
                  <div className="sidebar-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="sidebar-username">{user.name}</div>
                </div>
              )}
            </div>
            <nav className="sidebar-nav">
              {NAV.map(n=>(
                <button key={n.id} className={`nav-btn${activeNav===n.id?" active":""}`} onClick={n.action}>
                  <span style={{fontSize:16}}>{n.emoji}</span>{n.label}
                  {n.id==="debt" && !user && <span style={{marginLeft:"auto",fontSize:10,opacity:0.4}}>🔒</span>}
                </button>
              ))}
            </nav>
            <div className="sidebar-footer">
              <span style={{color:"rgba(255,255,255,0.25)",fontSize:11}}>© 2026 BarBook</span>
              {user && <button className="logout-btn" onClick={handleLogout}>Гарах</button>}
            </div>
          </aside>
        )}

        <div className="main">
          {view === "calendar" && (
            <CalendarView uid={GUEST} hasData={hasData} onDayClick={ds=>{setSelectedDate(ds);setView("day");}}/>
          )}
          {view === "day" && (
            <DayView uid={GUEST} dateStr={selectedDate} allDays={allDays} setAllDays={setAllDays} onBack={()=>setView("calendar")}/>
          )}
          {view === "chat" && <ChatView uid={GUEST}/>}
          {view === "debt" && user && <DebtView uid={user.id} userName={user.name}/>}
        </div>
      </div>
    </>
  );
}