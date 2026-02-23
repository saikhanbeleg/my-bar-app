import { useState, useEffect, useRef } from "react";

const NUM_ROWS = 10;

// ─── STORAGE (localStorage version for VS Code / GitHub) ─────────────────────
const store = {
  async get(key) {
    try {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
};

const MONTHS = ["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"];
const WEEKDAYS = ["Ня","Да","Мя","Лх","Пү","Ба","Бя"];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function prevDayStr(ds) {
  const [y,m,d] = ds.split("-").map(Number);
  const prev = new Date(y,m-1,d-1);
  return `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,"0")}-${String(prev.getDate()).padStart(2,"0")}`;
}

const blankNames   = () => Array.from({length:NUM_ROWS}, () => "");
const blankNumbers = () => Array.from({length:NUM_ROWS}, () => "");

export default function App() {
  const [view,         setView]        = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(null);
  const [calMonth,     setCalMonth]    = useState(() => { const d=new Date(); return {year:d.getFullYear(), month:d.getMonth()}; });
  const [names,        setNames]       = useState(blankNames);
  const [allDays,      setAllDays]     = useState({});
  const [messages,     setMessages]    = useState([]);
  const [loaded,       setLoaded]      = useState(false);

  useEffect(() => {
    (async () => {
      const sn = await store.get("mg-names");
      const sd = await store.get("mg-days");
      const sm = await store.get("mg-messages");
      if (Array.isArray(sn) && sn.length > 0) {
        const padded = Array.from({length:NUM_ROWS}, (_,i) => sn[i] !== undefined ? sn[i] : "");
        setNames(padded);
      }
      if (sd) setAllDays(sd);
      if (sm) setMessages(sm);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) store.set("mg-names",    names);    }, [names,    loaded]);
  useEffect(() => { if (loaded) store.set("mg-days",     allDays);  }, [allDays,  loaded]);
  useEffect(() => { if (loaded) store.set("mg-messages", messages); }, [messages, loaded]);

  const getDay = (ds) => {
    if (allDays[ds]) return allDays[ds];
    const prev    = prevDayStr(ds);
    const prevDay = allDays[prev];
    if (prevDay && prevDay.savedEvening && prevDay.evening) {
      return { morning:[...prevDay.evening], evening:blankNumbers(), expense:blankNumbers(), savedMorning:false, savedEvening:false, autoFilledFrom:prev };
    }
    return { morning:blankNumbers(), evening:blankNumbers(), expense:blankNumbers(), savedMorning:false, savedEvening:false };
  };

  const setDay  = (ds, data) => setAllDays(prev => ({...prev, [ds]:data}));
  const hasData = (ds) => { const r = allDays[ds]; return r && (r.savedMorning || r.savedEvening); };
  const openDay = (ds) => { setSelectedDate(ds); setView("day"); };

  if (!loaded) return (
    <div style={{minHeight:"100vh",background:"#eef1f4",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",fontSize:16,color:"#025864"}}>
      Уншиж байна…
    </div>
  );

  const nav = [
    { id:"calendar", label:"Хуанли",          emoji:"📅" },
    { id:"chat",     label:"Харилцах дэвтэр", emoji:"📒" },
  ];

  return (
    <div style={{display:"flex", minHeight:"100vh", fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>

      {/* Sidebar */}
      {view !== "day" && (
        <aside style={{width:220, background:"#025864", display:"flex", flexDirection:"column", flexShrink:0, boxShadow:"4px 0 20px rgba(2,88,100,0.3)"}}>
          <div style={{padding:"26px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{width:32,height:32,background:"#00D47E",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🍸</div>
              <span style={{color:"#fff",fontWeight:700,fontSize:17,letterSpacing:"-0.3px"}}>BarBook</span>
            </div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:4,marginLeft:42}}>Бараа бүртгэлийн систем</div>
          </div>

          <nav style={{padding:"16px 12px", flex:1}}>
            {nav.map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"11px 12px", marginBottom:4, borderRadius:10,
                border:"none", cursor:"pointer", textAlign:"left",
                background: view===n.id ? "rgba(0,212,126,0.15)" : "transparent",
                color:      view===n.id ? "#00D47E" : "rgba(255,255,255,0.65)",
                fontFamily:"inherit", fontSize:13.5,
                fontWeight: view===n.id ? 700 : 400,
                transition:"all 0.15s",
              }}>
                <span style={{fontSize:16}}>{n.emoji}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div style={{padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.3)", fontSize:11}}>
            © 2026 BarBook
          </div>
        </aside>
      )}

      {/* Main */}
      <div style={{flex:1, background:"#eef1f4", overflow:"auto"}}>
        {view === "calendar" && (
          <CalendarView calMonth={calMonth} setCalMonth={setCalMonth} hasData={hasData} onDayClick={openDay} />
        )}
        {view === "day" && (
          <DayView
            dateStr={selectedDate}
            names={names} setNames={setNames}
            dayData={getDay(selectedDate)}
            setDayData={(data) => setDay(selectedDate, data)}
            onBack={() => setView("calendar")}
          />
        )}
        {view === "chat" && (
          <ChatView messages={messages} setMessages={setMessages} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CALENDAR VIEW
═══════════════════════════════════════════ */
function CalendarView({ calMonth, setCalMonth, hasData, onDayClick }) {
  const { year, month } = calMonth;
  const ts    = todayStr();
  const today = new Date();

  const prev    = () => setCalMonth(c => c.month===0  ? {year:c.year-1,month:11} : {year:c.year,month:c.month-1});
  const next    = () => setCalMonth(c => c.month===11 ? {year:c.year+1,month:0}  : {year:c.year,month:c.month+1});
  const goToday = () => setCalMonth({year:today.getFullYear(), month:today.getMonth()});

  const ds = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const prevMonLast = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay-1; i >= 0; i--) cells.push({day:prevMonLast-i, cur:false});
  for (let d = 1; d <= daysInMonth; d++) cells.push({day:d, cur:true});
  while (cells.length < 42) cells.push({day: cells.length-firstDay-daysInMonth+1, cur:false});

  return (
    <div style={{padding:"32px", maxWidth:"900px", margin:"0 auto", width:"100%"}}>
      <style>{`
        *{box-sizing:border-box;}
        .cal-cell{min-height:82px;padding:8px;border-radius:10px;border:1px solid #f1f5f9;background:#fafafa;cursor:pointer;transition:all 0.12s;position:relative;}
        .cal-cell:hover{border-color:#00D47E;background:#f0fdf8;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,212,126,0.12);}
        .cal-cell.istoday{border:2px solid #00D47E!important;background:#f0fdf8!important;}
        .cal-cell.faded{background:transparent;border-color:transparent;cursor:default;}
        .cal-cell.faded:hover{transform:none;box-shadow:none;background:transparent;border-color:transparent;}
        .nbtn{background:#f1f5f9;border:none;border-radius:8px;padding:8px 10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}
        .nbtn:hover{background:#e2e8f0;}
        .tbtn{background:#025864;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;transition:background 0.15s;}
        .tbtn:hover{background:#037a8a;}
      `}</style>

      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:700,color:"#025864",marginBottom:6}}>Хуанли</h1>
        <p style={{color:"#64748b",fontSize:14}}>Өдрийг сонгоод тухайн өдрийн бараа бүртгэлийг нээнэ үү.</p>
      </div>

      <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",padding:28,maxWidth:"100%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <button className="nbtn" onClick={prev}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#025864" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20,fontWeight:700,color:"#025864"}}>{MONTHS[month]} {year}</div>
            <button className="tbtn" onClick={goToday}>Өнөөдөр</button>
          </div>
          <button className="nbtn" onClick={next}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#025864" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
          {WEEKDAYS.map(d => <div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#94a3b8",padding:"4px 0"}}>{d}</div>)}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {cells.map((cell,i) => {
            const dateKey = cell.cur ? ds(cell.day) : null;
            const isToday = dateKey===ts;
            const active  = dateKey && hasData(dateKey);
            return (
              <div key={i} className={`cal-cell${isToday?" istoday":""}${!cell.cur?" faded":""}`}
                onClick={() => cell.cur && onDayClick(dateKey)}>
                {cell.cur ? (
                  <>
                    <div style={{fontSize:13,fontWeight:isToday?700:500,color:isToday?"#00D47E":"#1e293b",marginBottom:3}}>{cell.day}</div>
                    {active && <div style={{fontSize:10,background:"#00D47E22",color:"#025864",padding:"2px 6px",borderRadius:4,display:"inline-block",fontWeight:600}}>✓ бүртгэлтэй</div>}
                  </>
                ) : (
                  <div style={{fontSize:13,color:"#cbd5e1"}}>{cell.day}</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{marginTop:16,display:"flex",justifyContent:"space-between",color:"#94a3b8",fontSize:12}}>
          <span>✓ бүртгэлтэй = тухайн өдөрт мэдээлэл оруулсан</span>
          <span>Оройн үлдэгдэл → маргааш өглөөний тоо болно</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DAY VIEW
═══════════════════════════════════════════ */
function DayView({ dateStr, names, setNames, dayData, setDayData, onBack }) {
  const namesRef = useRef(names);
  useEffect(() => { namesRef.current = names; }, [names]);

  const [localNames,   setLocalNames]   = useState(() => [...names]);
  const [localMorning, setLocalMorning] = useState(() => [...(dayData.morning || Array(NUM_ROWS).fill(""))]);
  const [localEvening, setLocalEvening] = useState(() => [...(dayData.evening || Array(NUM_ROWS).fill(""))]);
  const [expense,      setExpense]      = useState(() => [...(dayData.expense || Array(NUM_ROWS).fill(""))]);
  const [savedMorning, setSavedMorning] = useState(dayData.savedMorning || false);
  const [savedEvening, setSavedEvening] = useState(dayData.savedEvening || false);
  const [saveFlash,    setSaveFlash]    = useState(false);
  const [editingName,  setEditingName]  = useState(null);

  useEffect(() => {
    setLocalNames([...namesRef.current]);
    setLocalMorning([...(dayData.morning || Array(NUM_ROWS).fill(""))]);
    setLocalEvening([...(dayData.evening || Array(NUM_ROWS).fill(""))]);
    setExpense([...(dayData.expense || Array(NUM_ROWS).fill(""))]);
    setSavedMorning(dayData.savedMorning || false);
    setSavedEvening(dayData.savedEvening || false);
    setEditingName(null);
  }, [dateStr]); // eslint-disable-line

  const [y,mo,d] = dateStr.split("-").map(Number);
  const label = new Date(y,mo-1,d).toLocaleDateString("mn-MN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const autoFilled = dayData.autoFilledFrom;

  const handleSave = () => {
    const newExpense = localMorning.map((m,i) => {
      const mv = parseFloat(m)||0, ev = parseFloat(localEvening[i])||0;
      if (mv===0 && ev===0) return "";
      return String(Math.max(0, mv-ev));
    });
    setExpense(newExpense);

    const namesToSave = [...localNames];
    setNames(namesToSave);
    store.set("mg-names", namesToSave); // write directly to localStorage immediately

    const isMorningSaved = localMorning.some(v=>v!=="");
    const isEveningSaved = localEvening.some(v=>v!=="");
    setDayData({
      morning:[...localMorning], evening:[...localEvening], expense:newExpense,
      savedMorning:isMorningSaved||savedMorning, savedEvening:isEveningSaved||savedEvening,
      autoFilledFrom:dayData.autoFilledFrom
    });
    setSavedMorning(isMorningSaved||savedMorning);
    setSavedEvening(isEveningSaved||savedEvening);
    setSaveFlash(true);
    setTimeout(()=>setSaveFlash(false),1800);
  };

  const totalMorning = localMorning.reduce((s,v)=>s+(parseFloat(v)||0),0);
  const totalEvening = localEvening.reduce((s,v)=>s+(parseFloat(v)||0),0);
  const totalExpense = expense.reduce((s,v)=>s+(parseFloat(v)||0),0);

  const thS = (align="center", bg="#334155") => ({
    padding:"13px 14px", textAlign:align, fontWeight:700, color:"#fff",
    fontSize:12, letterSpacing:"0.3px", whiteSpace:"nowrap", background:bg,
  });

  return (
    <div style={{minHeight:"100vh",background:"#eef1f4",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",paddingBottom:100}}>
      <style>{`
        *{box-sizing:border-box;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
        input[type=number]{-moz-appearance:textfield;}
        .ci{background:transparent;border:none;outline:none;font-family:inherit;font-size:14px;width:100%;text-align:center;color:#1e293b;padding:2px 0;}
        .ci::placeholder{color:#cbd5e1;}
        .ci:focus{background:rgba(0,212,126,0.07);border-radius:4px;outline:1px solid #00D47E44;}
        .ni{text-align:left!important;font-weight:600;font-size:13px;color:#1e293b;}
        .ni::placeholder{color:#cbd5e1;font-weight:400;}
        .name-wrap{display:flex;align-items:center;gap:6px;}
        .edit-ic{opacity:0;pointer-events:none;transition:opacity 0.15s;background:none;border:1px solid #025864;border-radius:6px;padding:2px 7px;font-size:10px;color:#025864;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;}
        .ntd:hover .edit-ic,.ntd:focus-within .edit-ic{opacity:1;pointer-events:auto;}
        .edit-ic:hover{background:#025864;color:#fff;}
        .back-btn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 14px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:#fff;transition:background 0.15s;}
        .back-btn:hover{background:rgba(255,255,255,0.25);}
        tbody tr:hover td{filter:brightness(0.97);}
        .save-btn{position:fixed;bottom:28px;right:28px;background:#025864;color:#fff;border:none;border-radius:14px;padding:16px 36px;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(2,88,100,0.35);transition:all 0.2s;z-index:100;letter-spacing:0.3px;display:flex;align-items:center;gap:10px;}
        .save-btn:hover{background:#037a8a;transform:translateY(-2px);}
        .save-btn.flash{background:#00D47E!important;transform:scale(1.04);}
      `}</style>

      {/* Top bar */}
      <div style={{background:"#025864",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(2,88,100,0.3)"}}>
        <button className="back-btn" onClick={onBack}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Хуанли
        </button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:3}}>Өдрийн бараа бүртгэл</div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{label}</div>
          {autoFilled && <div style={{fontSize:11,color:"#86efac",marginTop:2}}>↑ Өчигдрийн оройн тоо өглөөнд автоматаар орлоо</div>}
        </div>
        <div style={{display:"flex",gap:20}}>
          {[{l:"Өглөө",v:totalMorning||"—",c:"#7dd3e8"},{l:"Орой",v:totalEvening||"—",c:"#86efac"},{l:"Зарлага",v:totalExpense||"—",c:"#fde68a"}].map(s=>(
            <div key={s.l} style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>{s.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"24px 28px"}}>
        {autoFilled && (
          <div style={{background:"#dbeafe",border:"1px solid #93c5fd",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:13,color:"#1d4ed8",display:"flex",alignItems:"center",gap:8}}>
            <span>🔄</span>
            <span>Өчигдрийн <strong>оройн үлдэгдэл</strong> өнөөдрийн <strong>өглөөний тоо</strong>-нд автоматаар орлоо.</span>
          </div>
        )}

        <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr>
                <th style={{...thS("center","#334155"), width:"5%"}}>#</th>
                <th style={{...thS("left","#334155"),   width:"24%"}}>Барааны нэр</th>
                <th style={{...thS("center","#1d4ed8"), width:"17%"}}>Өглөөний барааны тоо</th>
                <th style={{...thS("center","#15803d"), width:"17%"}}>Оройн барааны тоо</th>
                <th style={{...thS("center","#a16207"), width:"17%"}}>Зарлага</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length:NUM_ROWS},(_,i)=>{
                const hasName = localNames[i].trim().length>0;
                const inEdit  = editingName===i;
                const expVal  = expense[i];
                return (
                  <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                    <td style={{padding:"10px 12px",textAlign:"center",background:"#f8fafc",color:"#94a3b8",fontWeight:600,fontSize:12}}>{i+1}</td>
                    <td className="ntd" style={{padding:"8px 12px",background:"#fff",borderRight:"1px solid #f1f5f9"}}>
                      <div className="name-wrap">
                        {inEdit ? (
                          <input className="ci ni" autoFocus value={localNames[i]}
                            onChange={e=>setLocalNames(p=>p.map((v,idx)=>idx===i?e.target.value:v))}
                            onBlur={()=>setEditingName(null)}
                            onKeyDown={e=>{if(e.key==="Enter")setEditingName(null);}}
                            placeholder={`${i+1}-р бараа…`}/>
                        ) : (
                          <>
                            <input className="ci ni" value={localNames[i]}
                              onChange={e=>setLocalNames(p=>p.map((v,idx)=>idx===i?e.target.value:v))}
                              placeholder={`${i+1}-р бараа…`}/>
                            {hasName && <button className="edit-ic" onClick={()=>setEditingName(i)}>✎</button>}
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{padding:"8px 12px",background:"#eff6ff"}}>
                      <input className="ci" type="number" value={localMorning[i]}
                        onChange={e=>setLocalMorning(p=>p.map((v,idx)=>idx===i?e.target.value:v))}
                        placeholder="—" style={{color:"#1d4ed8",fontWeight:600}}/>
                    </td>
                    <td style={{padding:"8px 12px",background:"#f0fdf4"}}>
                      <input className="ci" type="number" value={localEvening[i]}
                        onChange={e=>setLocalEvening(p=>p.map((v,idx)=>idx===i?e.target.value:v))}
                        placeholder="—" style={{color:"#15803d",fontWeight:600}}/>
                    </td>
                    <td style={{padding:"8px 12px",background:"#fefce8",textAlign:"center"}}>
                      <span style={{fontSize:14,fontWeight:700,color:expVal&&expVal!=="0"?"#a16207":"#d1d5db"}}>
                        {expVal&&expVal!=="0"&&expVal!==""?expVal:"—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr style={{borderTop:"2px solid #e2e8f0",background:"#f8fafc"}}>
                <td style={{padding:"12px"}}/>
                <td style={{padding:"12px 14px",color:"#475569",fontSize:12,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:700}}>Нийт дүн</td>
                <td style={{padding:"12px",textAlign:"center",color:"#1d4ed8",fontSize:15,fontWeight:700}}>{totalMorning>0?totalMorning:"—"}</td>
                <td style={{padding:"12px",textAlign:"center",color:"#15803d",fontSize:15,fontWeight:700}}>{totalEvening>0?totalEvening:"—"}</td>
                <td style={{padding:"12px",textAlign:"center",color:"#a16207",fontSize:15,fontWeight:700}}>{totalExpense>0?totalExpense:"—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{marginTop:14,display:"flex",gap:12,flexWrap:"wrap"}}>
          {savedMorning && <div style={{background:"#dbeafe",border:"1px solid #93c5fd",borderRadius:8,padding:"6px 14px",fontSize:12,color:"#1d4ed8",fontWeight:600}}>✓ Өглөөний тоо хадгалагдсан</div>}
          {savedEvening && <div style={{background:"#dcfce7",border:"1px solid #86efac",borderRadius:8,padding:"6px 14px",fontSize:12,color:"#15803d",fontWeight:600}}>✓ Оройн тоо хадгалагдсан · Зарлага тооцоологдсон</div>}
          {!savedMorning && !savedEvening && <div style={{fontSize:12,color:"#94a3b8"}}>Мэдээлэл оруулаад доорх <strong>Хадгалах</strong> товчийг дарна уу.</div>}
        </div>
      </div>

      <button className={`save-btn${saveFlash?" flash":""}`} onClick={handleSave}>
        {saveFlash ? <>✓ Хадгалагдлаа!</> : (
          <><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>Хадгалах</>
        )}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHAT VIEW — Харилцах дэвтэр
═══════════════════════════════════════════ */
function ChatView({ messages, setMessages }) {
  const [text,      setText]      = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText,  setEditText]  = useState("");
  const [now,       setNow]       = useState(Date.now());
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id:Date.now(), text:trimmed, timestamp:Date.now() }]);
    setText("");
    inputRef.current?.focus();
  };

  const deleteMsg  = (id) => setMessages(prev => prev.filter(m => m.id !== id));
  const startEdit  = (msg) => { setEditingId(msg.id); setEditText(msg.text); };
  const saveEdit   = () => {
    if (!editText.trim()) return;
    setMessages(prev => prev.map(m => m.id===editingId ? {...m, text:editText.trim()} : m));
    setEditingId(null); setEditText("");
  };
  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  const canEdit   = (ts) => (now - ts) < 60_000;
  const canDelete = (ts) => (now - ts) < 300_000;

  const fmtDate = (ts) => {
    const d  = new Date(ts);
    const yy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    const hh = String(d.getHours()).padStart(2,"0");
    const mi = String(d.getMinutes()).padStart(2,"0");
    return { date:`${yy}-${mm}-${dd}`, time:`${hh}:${mi}` };
  };

  const timeAgo = (ts) => {
    const sec = Math.floor((now - ts) / 1000);
    if (sec < 60)    return `${sec}с өмнө`;
    if (sec < 3600)  return `${Math.floor(sec/60)}м өмнө`;
    if (sec < 86400) return `${Math.floor(sec/3600)}ц өмнө`;
    return `${Math.floor(sec/86400)}өдөр өмнө`;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;}
        .msg-bubble{background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border:1px solid #f1f5f9;transition:border-color 0.15s;}
        .msg-bubble:hover{border-color:#e2e8f0;}
        .act-btn{background:none;border:1px solid;border-radius:6px;padding:3px 10px;font-size:11px;font-family:inherit;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
        .edit-act{color:#025864;border-color:#025864;}
        .edit-act:hover{background:#025864;color:#fff;}
        .del-act{color:#ef4444;border-color:#ef4444;}
        .del-act:hover{background:#ef4444;color:#fff;}
        .send-btn{background:#025864;color:#fff;border:none;border-radius:10px;padding:12px 24px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background 0.15s;white-space:nowrap;flex-shrink:0;}
        .send-btn:hover{background:#037a8a;}
        .send-btn:disabled{background:#94a3b8;cursor:default;}
        .save-edit-btn{background:#00D47E;color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-family:inherit;font-weight:700;cursor:pointer;}
        .cancel-edit-btn{background:none;border:1px solid #e2e8f0;border-radius:8px;padding:6px 14px;font-size:12px;font-family:inherit;color:#64748b;cursor:pointer;}
        .edit-textarea{width:100%;border:1.5px solid #00D47E;border-radius:8px;padding:8px 12px;font-family:inherit;font-size:14px;color:#1e293b;resize:none;outline:none;min-height:60px;}
        .msg-input{flex:1;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 16px;font-family:inherit;font-size:14px;color:#1e293b;resize:none;outline:none;min-height:48px;max-height:120px;transition:border-color 0.15s;}
        .msg-input:focus{border-color:#025864;}
        .msg-input::placeholder{color:#94a3b8;}
      `}</style>

      {/* Header */}
      <div style={{background:"#025864",padding:"18px 28px",boxShadow:"0 2px 12px rgba(2,88,100,0.3)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:"rgba(0,212,126,0.2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📒</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>Харилцах дэвтэр</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.55)"}}>Мессеж 1 минутын дотор засна · 5 минутын дотор устгана</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"24px 28px",display:"flex",flexDirection:"column",gap:12}}>
        {messages.length === 0 && (
          <div style={{textAlign:"center",marginTop:80,color:"#94a3b8"}}>
            <div style={{fontSize:48,marginBottom:16}}>📒</div>
            <div style={{fontSize:16,fontWeight:600,color:"#64748b",marginBottom:6}}>Харилцах дэвтэр хоосон байна</div>
            <div style={{fontSize:13}}>Доорх хэсэгт мессеж бичиж эхлээрэй.</div>
          </div>
        )}

        {messages.map((msg) => {
          const { date, time } = fmtDate(msg.timestamp);
          const editable  = canEdit(msg.timestamp);
          const deletable = canDelete(msg.timestamp);
          const isEditing = editingId === msg.id;

          return (
            <div key={msg.id} className="msg-bubble">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#025864",fontWeight:700,background:"#f0fdf8",padding:"2px 8px",borderRadius:4}}>{date}</span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#64748b",background:"#f8fafc",padding:"2px 8px",borderRadius:4}}>{time}</span>
                  <span style={{fontSize:11,color:"#94a3b8"}}>{timeAgo(msg.timestamp)}</span>
                </div>
                {!isEditing && (
                  <div style={{display:"flex",gap:6}}>
                    {editable  && <button className="act-btn edit-act" onClick={()=>startEdit(msg)}>✎ засах</button>}
                    {deletable && <button className="act-btn del-act"  onClick={()=>deleteMsg(msg.id)}>✕ устгах</button>}
                    {!editable && !deletable && <span style={{fontSize:10,color:"#cbd5e1",fontStyle:"italic"}}>бүртгэлд орсон</span>}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div>
                  <textarea className="edit-textarea" autoFocus value={editText}
                    onChange={e=>setEditText(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveEdit();}if(e.key==="Escape")cancelEdit();}}/>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button className="save-edit-btn" onClick={saveEdit}>Хадгалах</button>
                    <button className="cancel-edit-btn" onClick={cancelEdit}>Болих</button>
                    <span style={{fontSize:11,color:"#94a3b8",alignSelf:"center"}}>Enter — хадгалах · Esc — болих</span>
                  </div>
                </div>
              ) : (
                <div style={{fontSize:14,color:"#1e293b",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{msg.text}</div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"16px 28px 24px",background:"#fff",borderTop:"1px solid #e2e8f0",flexShrink:0}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
          <textarea ref={inputRef} className="msg-input" value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Мессеж бичих… (Enter — илгээх, Shift+Enter — мөр шилжих)"
            rows={2}/>
          <button className="send-btn" onClick={send} disabled={!text.trim()}>Илгээх →</button>
        </div>
        <div style={{marginTop:8,fontSize:11,color:"#94a3b8"}}>
          📌 Мессеж илгээснээс хойш: <strong style={{color:"#025864"}}>1 минут</strong> дотор засна · <strong style={{color:"#ef4444"}}>5 минут</strong> дотор устгана · Дараа нь бүртгэлд байнга үлдэнэ
        </div>
      </div>
    </div>
  );
}
