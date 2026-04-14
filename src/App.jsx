import { useState, useEffect, useCallback } from "react";

// ─── FONTS ──────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap";
document.head.appendChild(fontLink);

// ─── NOTION CONFIG ───────────────────────────────────────────────────────────────
const API = "/.netlify/functions/notion";

// ─── NOTION DATA LAYER ───────────────────────────────────────────────────────────
const notionApi = {
  async list(db)   { const r = await fetch(`${API}?action=list&db=${db}`);    if(!r.ok) throw new Error(); return r.json(); },
  async get(id)    { const r = await fetch(`${API}?action=get&id=${id}`);     if(!r.ok) throw new Error(); return r.json(); },
  async about()    { const r = await fetch(`${API}?action=about`);            if(!r.ok) throw new Error(); return r.json(); },
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────────
const MOCK = {
  reviews: [
    { id:"r1", postType:"review", game:"Dyson Sphere Program", title:"A Blueprint for Wonder — Factory Building at Galactic Scale", score:9.2, content:`## First Impressions\n\nDyson Sphere Program drops you onto a lonely planet with nothing but a mech suit and a staggering goal: harness the energy of an entire star.\n\n## Verdict\n\nAn essential entry in the factory genre. The Dark Fog expansion adds a meaningful combat threat without compromising the builder's soul.`, tags:{ progress:"Completed", genre:["Builder","Strategy","Space"], priority:"Critical" }, status:"published", updatedAt:"2024-03-01", archives:[] },
    { id:"r2", postType:"review", game:"Factorio", title:"The Infinite Factory — Still the Gold Standard", score:10.0, content:`## Preamble\n\nFactorio needs no introduction to the genre.\n\n## Verdict\n\nA 10/10. The benchmark against which all automation games are measured.`, tags:{ progress:"Completed", genre:["Strategy","Builder","4X"], priority:"Critical" }, status:"published", updatedAt:"2024-01-15", archives:[] },
  ],
  articles: [
    { id:"a1", postType:"article", game:"Satisfactory", title:"First Hours on Massage-2(A-B)b — Notes from the Factory Floor", content:`## What Is This?\n\nRaw field notes from the first dozen hours with Satisfactory.\n\n## The First-Person Difference\n\nEvery other factory game I play, I'm a god looking down. In Satisfactory, I'm a contractor with a hard hat.`, tags:{ genre:["Builder","Survival"], artType:"Impressions" }, status:"published", updatedAt:"2024-04-10" },
  ],
  tutorials: [
    { id:"t1", postType:"tutorial", game:"Workers & Resources: Soviet Republic", title:"Workers, Housing & Resource Flow — A Beginner's Field Manual", content:`## Preamble\n\nWorkers & Resources: Soviet Republic is one of the most demanding city builders ever made.\n\n## Common Mistakes\n\n- Building factories before housing.\n- Ignoring transport. A factory with no bus stop is a sculpture.`, tags:{ genre:["City Builder","Strategy","Management"], difficulty:"Beginner" }, status:"published", updatedAt:"2024-04-05" },
  ],
  about: { content:`## Who is Audwn?\n\nA strategy and builder game enthusiast documenting the games worth playing, the mechanics worth understanding, and the ones that changed how I think about systems.\n\n## What gets covered\n\n- Factory and automation games\n- City builders and logistics sims\n- Grand strategy and 4X\n- Management and economic builders\n\n## Notice\n\nThis notebook contains no personal identifying information. Just the games and the notes.` },
};

// ─── TAG COLORS ──────────────────────────────────────────────────────────────────
const TAG_COLORS = {
  Playing:{bg:"#0d2b1a",text:"#3ddc84",border:"#1a4a2a"},Completed:{bg:"#0d1e2b",text:"#5ba4cf",border:"#1a3a4a"},"On Hold":{bg:"#2b2710",text:"#e6c84a",border:"#4a4218"},Abandoned:{bg:"#2b0f0f",text:"#e05555",border:"#4a1a1a"},Backlog:{bg:"#1a1a1a",text:"#7a8899",border:"#2a2e33"},Wishlist:{bg:"#1e0d2b",text:"#b06ee8",border:"#3a1a4a"},Critical:{bg:"#2b0d0d",text:"#ff4444",border:"#500f0f"},High:{bg:"#2b1a0d",text:"#f0850a",border:"#50300f"},Medium:{bg:"#2b2710",text:"#e6c84a",border:"#4a4218"},Low:{bg:"#0d2b2a",text:"#22d3c8",border:"#1a4a48"},Strategy:{bg:"#0d1e2b",text:"#5ba4cf",border:"#1a3050"},Builder:{bg:"#1a2b0d",text:"#7ec845",border:"#2a4a18"},"4X":{bg:"#2b1e0d",text:"#d4a04a",border:"#4a3010"},Survival:{bg:"#2b1a0d",text:"#f0850a",border:"#50300f"},Sandbox:{bg:"#1a0d2b",text:"#a06ee8",border:"#30184a"},"City Builder":{bg:"#0d2b2a",text:"#22d3c8",border:"#1a4840"},RTS:{bg:"#2b0d0d",text:"#e05555",border:"#4a1010"},Space:{bg:"#0a0a2b",text:"#6699ff",border:"#10103a"},Puzzle:{bg:"#2b0d1e",text:"#f06ea8",border:"#4a1030"},Management:{bg:"#0d2010",text:"#4dcc88",border:"#1a3a28"},Transport:{bg:"#0d1a2b",text:"#5ba4ff",border:"#1a3050"},Economic:{bg:"#2b250d",text:"#f0c84a",border:"#4a4010"},Impressions:{bg:"#0d1e2b",text:"#5ba4cf",border:"#1a3050"},"Deep Dive":{bg:"#0a0a2b",text:"#7799ff",border:"#15153a"},Opinion:{bg:"#2b1e0d",text:"#d4a04a",border:"#4a3010"},"Update Notes":{bg:"#1a2b0d",text:"#7ec845",border:"#2a4a18"},Retrospective:{bg:"#1e0d2b",text:"#b06ee8",border:"#3a1a4a"},Beginner:{bg:"#0d2b1a",text:"#3ddc84",border:"#1a4a2a"},Intermediate:{bg:"#2b2710",text:"#e6c84a",border:"#4a4218"},Advanced:{bg:"#2b1a0d",text:"#f0850a",border:"#50300f"},Expert:{bg:"#2b0d0d",text:"#ff4444",border:"#500f0f"},
};
const DEFAULT_TAG_COLOR = { bg:"#1a1e22", text:"#7a8899", border:"#2a3035" };
const SECTION_ACCENT    = { home:"#f0a500", reviews:"#f0a500", articles:"#5ba4cf", tutorials:"#3ddc84", about:"#a06ee8" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────────
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); } catch(e) { return ""; } };
const excerpt = (t="",n=110) => { const p=t.replace(/##+ /g,"").replace(/\n/g," "); return p.length>n?p.slice(0,n)+"…":p; };

// ─── PANEL ───────────────────────────────────────────────────────────────────────
function Panel({ children, style, accent="#f0a500", label }) {
  const bw=1, cs=12;
  return (
    <div style={{ position:"relative", ...style }}>
      {[[true,false,false,true],[true,true,false,false],[false,false,true,true],[false,true,true,false]].map(([t,r,b,l],i)=>(
        <span key={i} style={{ position:"absolute", width:cs, height:cs, top:t?0:"auto", bottom:b?0:"auto", left:l?0:"auto", right:r?0:"auto", borderColor:accent, borderStyle:"solid", borderWidth:0, borderTopWidth:t?bw:0, borderBottomWidth:b?bw:0, borderLeftWidth:l?bw:0, borderRightWidth:r?bw:0, pointerEvents:"none", zIndex:1 }}/>
      ))}
      {label && <div style={{ position:"absolute", top:-10, left:16, background:"#080b0d", padding:"0 6px", fontSize:9, color:accent, letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'Rajdhani',sans-serif", fontWeight:600, zIndex:2 }}>{label}</div>}
      {children}
    </div>
  );
}

// ─── TAG BADGE ───────────────────────────────────────────────────────────────────
function TagBadge({ label, small }) {
  const c = TAG_COLORS[label] || DEFAULT_TAG_COLOR;
  return <span style={{ display:"inline-flex", alignItems:"center", background:c.bg, color:c.text, border:`1px solid ${c.border}`, borderRadius:2, padding:small?"1px 6px":"2px 8px", fontSize:small?9:10, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap", lineHeight:1.6 }}>{label}</span>;
}

// ─── SCORE ───────────────────────────────────────────────────────────────────────
function Score({ value }) {
  const color = value>=9?"#f0a500":value>=7?"#3ddc84":value>=5?"#5ba4cf":"#e05555";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:56 }}>
      <span style={{ fontFamily:"'Orbitron',monospace", fontSize:28, fontWeight:900, color, lineHeight:1, textShadow:`0 0 20px ${color}55` }}>{value.toFixed(1)}</span>
      <span style={{ fontSize:8, color:"#445", letterSpacing:"0.15em" }}>/ 10.0</span>
    </div>
  );
}

// ─── MARKDOWN ────────────────────────────────────────────────────────────────────
function MD({ content }) {
  return (
    <div style={{ lineHeight:1.8 }}>
      {(content||"").split("\n").map((line,i) => {
        if(line.startsWith("## ")) return <h3 key={i} style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, color:"#f0a500", borderBottom:"1px solid #1e2428", paddingBottom:4, marginTop:20, marginBottom:8 }}>{line.slice(3)}</h3>;
        if(line.startsWith("# "))  return <h2 key={i} style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:20, fontWeight:700, color:"#f0a500", marginTop:24, marginBottom:10 }}>{line.slice(2)}</h2>;
        if(line.startsWith("- "))  return <div key={i} style={{ paddingLeft:16, marginBottom:4, color:"#8a9eaa" }}><span style={{ color:"#f0a500", marginRight:8 }}>›</span>{line.slice(2)}</div>;
        if(line==="")              return <div key={i} style={{ height:10 }} />;
        return <p key={i} style={{ color:"#8a9eaa", marginBottom:0, fontSize:13 }}>{line}</p>;
      })}
    </div>
  );
}

// ─── LOADING ─────────────────────────────────────────────────────────────────────
function Loading({ accent="#f0a500" }) {
  return (
    <div style={{ padding:"60px 0", textAlign:"center" }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:accent+"66", letterSpacing:"0.2em", marginBottom:8 }}>LOADING FROM NOTION</div>
      <div style={{ fontSize:9, color:"#2a3035", letterSpacing:"0.1em" }}>Fetching data…</div>
    </div>
  );
}

// ─── POST CARD ───────────────────────────────────────────────────────────────────
function PostCard({ post, onClick, accent }) {
  const [hov, setHov] = useState(false);
  const isReview=post.postType==="review", isArticle=post.postType==="article";
  const extraTag = isReview?post.tags?.progress:isArticle?post.tags?.artType:post.tags?.difficulty;
  return (
    <Panel accent={hov?accent:"#1e2428"} style={{ background:"#0d1015", border:`1px solid ${hov?accent:"#1e2428"}`, borderRadius:2, cursor:"pointer", transition:"border-color 0.2s" }}>
      <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ display:"flex", overflow:"hidden", borderRadius:2 }}>
        <div style={{ width:80, minHeight:120, background:"#060809", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", borderRight:"1px solid #1e2428", overflow:"hidden", position:"relative" }}>
          {post.coverUrl
            ? <img src={post.coverUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }} />
            : <div style={{ textAlign:"center", color:"#1e2428", padding:"0 8px" }}><div style={{ fontFamily:"'Orbitron',monospace", fontSize:7, letterSpacing:"0.1em", lineHeight:1.8, wordBreak:"break-word" }}>{post.game.toUpperCase()}</div></div>
          }
          <div style={{ position:"absolute", top:0, left:0, right:0, background:isReview?"#1a0d0d":isArticle?"#0d1a2b":"#0d2b1a", borderBottom:`1px solid ${accent}33`, fontSize:7, textAlign:"center", color:accent, padding:"2px 0", letterSpacing:"0.15em" }}>{post.postType.toUpperCase()}</div>
        </div>
        <div style={{ padding:"12px 16px", flex:1, minWidth:0 }}>
          <div style={{ fontSize:9, color:"#445", letterSpacing:"0.15em", marginBottom:3 }}>{post.game.toUpperCase()} · {fmtDate(post.updatedAt)}</div>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:15, fontWeight:700, color:hov?accent:"#c8d0d8", lineHeight:1.3, marginBottom:7, transition:"color 0.15s" }}>{post.title}</div>
          <div style={{ fontSize:11, color:"#4a5a66", marginBottom:8, lineHeight:1.5 }}>{excerpt(post.content)}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {extraTag && <TagBadge label={extraTag} small />}
              {(post.tags?.genre||[]).slice(0,2).map(g=><TagBadge key={g} label={g} small />)}
              {isReview && post.tags?.priority && <TagBadge label={post.tags.priority} small />}
            </div>
            {isReview && post.score!=null && <Score value={post.score} />}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ─── POST DETAIL ─────────────────────────────────────────────────────────────────
function PostDetail({ post, onBack, accent }) {
  const [showArc, setShowArc] = useState(null);
  const isReview = post.postType==="review";
  return (
    <div style={{ maxWidth:820, margin:"0 auto", paddingBottom:60 }}>
      <button onClick={onBack} style={{ background:"transparent", border:"none", color:"#445", cursor:"pointer", fontSize:11, letterSpacing:"0.12em", padding:"12px 0", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:accent }}>◂</span> BACK TO INDEX
      </button>
      <Panel accent={accent} label={`${post.postType.toUpperCase()} // ${post.status?.toUpperCase()||"PUBLISHED"}`} style={{ marginBottom:20 }}>
        <div style={{ background:"#0d1015", border:"1px solid #1e2428", borderRadius:2, overflow:"hidden" }}>
          <div style={{ position:"relative", height:post.screenshotUrl?220:72, background:"#060809", borderBottom:"1px solid #1e2428" }}>
            {post.screenshotUrl
              ? <img src={post.screenshotUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.8 }} />
              : <div style={{ height:"100%", backgroundImage:"repeating-linear-gradient(45deg, #0d1015 0, #0d1015 10px, #0a0c0f 10px, #0a0c0f 20px)" }} />
            }
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,#0d1015ee)", padding:"30px 20px 14px", display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:9, color:accent, letterSpacing:"0.2em", marginBottom:3 }}>{post.game.toUpperCase()}</div>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:20, fontWeight:700, color:"#e8eef2", lineHeight:1.2, maxWidth:560 }}>{post.title}</div>
              </div>
              {isReview && post.score!=null && <Score value={post.score} />}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:8, padding:"8px 20px", borderBottom:"1px solid #1e2428", background:"#0a0c0f" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, flex:1 }}>
              {isReview && post.tags?.progress && <TagBadge label={post.tags.progress} />}
              {(post.tags?.genre||[]).map(g=><TagBadge key={g} label={g} />)}
              {post.tags?.artType    && <TagBadge label={post.tags.artType} />}
              {post.tags?.difficulty && <TagBadge label={post.tags.difficulty} />}
              {isReview && post.tags?.priority && <TagBadge label={post.tags.priority} />}
            </div>
            <div style={{ fontSize:9, color:"#445", letterSpacing:"0.1em" }}>UPDATED {fmtDate(post.updatedAt)}</div>
          </div>
          <div style={{ display:"flex" }}>
            <div style={{ flex:1, padding:24, borderRight:post.coverUrl?"1px solid #1e2428":"none" }}><MD content={post.content} /></div>
            {post.coverUrl && <div style={{ width:160, padding:16, flexShrink:0 }}><div style={{ fontSize:8, color:"#445", letterSpacing:"0.15em", marginBottom:8 }}>COVER ART</div><img src={post.coverUrl} alt="" style={{ width:"100%", borderRadius:2, border:"1px solid #1e2428" }} /></div>}
          </div>
        </div>
      </Panel>

      {/* Archive log */}
      {isReview && (post.archives||[]).length>0 && (
        <Panel accent="#444" label="ARCHIVE // PREVIOUS REVISIONS" style={{ marginBottom:20 }}>
          <div style={{ border:"1px solid #1e2428", borderRadius:2, overflow:"hidden" }}>
            <div style={{ padding:"8px 16px", background:"#0a0c0f", borderBottom:"1px solid #1e2428", fontSize:9, color:"#445", letterSpacing:"0.12em" }}>{post.archives.length} REVISION{post.archives.length>1?"S":""} ON FILE</div>
            {post.archives.map(arc=>(
              <div key={arc.id} style={{ borderBottom:"1px solid #1e2428" }}>
                <div onClick={()=>setShowArc(showArc===arc.id?null:arc.id)} style={{ padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, background:"#0d1015" }} onMouseEnter={e=>e.currentTarget.style.background="#111620"} onMouseLeave={e=>e.currentTarget.style.background="#0d1015"}>
                  <span style={{ color:"#f0a50066", fontSize:14 }}>{showArc===arc.id?"▾":"▸"}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:"#e6c84a", letterSpacing:"0.12em" }}>ARCHIVED {fmtDate(arc.archivedAt)} · SCORE {arc.score?.toFixed(1)}</div>
                    <div style={{ fontSize:11, color:"#5a6a78", marginTop:2 }}>{arc.reason}</div>
                  </div>
                  {arc.tags?.progress && <TagBadge label={arc.tags.progress} small />}
                </div>
                {showArc===arc.id && <div style={{ padding:"16px 20px 20px", background:"#080b0d", borderTop:"1px dashed #1e2428" }}><div style={{ fontSize:8, color:"#445", letterSpacing:"0.15em", padding:"4px 8px", background:"#0d1015", display:"inline-block", border:"1px solid #2b1a0d", marginBottom:12 }}>⚠ ARCHIVED — FOR REFERENCE ONLY</div><MD content={arc.content} /></div>}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─── SECTION LIST ────────────────────────────────────────────────────────────────
function SectionList({ posts, postType, accent, loading, onSelect }) {
  const [filter, setFilter] = useState("");
  const allTags = [...new Set(posts.flatMap(p => {
    if(postType==="review")   return [p.tags?.progress].filter(Boolean);
    if(postType==="article")  return [p.tags?.artType].filter(Boolean);
    return [p.tags?.difficulty].filter(Boolean);
  }))];
  const visible = filter ? posts.filter(p =>
    postType==="review" ? p.tags?.progress===filter :
    postType==="article" ? p.tags?.artType===filter :
    p.tags?.difficulty===filter
  ) : posts;

  return (
    <div>
      {allTags.length>0 && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:9, color:"#445", letterSpacing:"0.15em", marginRight:4 }}>FILTER</span>
          {["All",...allTags].map(t=>{
            const active=filter===t||(t==="All"&&!filter);
            return <button key={t} onClick={()=>setFilter(t==="All"?"":t)} style={{ background:active?"#1a150d":"#0d1015", border:`1px solid ${active?accent+"66":"#1e2428"}`, color:active?accent:"#445", borderRadius:2, padding:"3px 10px", cursor:"pointer", fontSize:9, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.08em" }}>{t.toUpperCase()}</button>;
          })}
        </div>
      )}
      {loading ? <Loading accent={accent} /> : (
        <>
          <div style={{ fontSize:8, color:"#2a3035", letterSpacing:"0.1em", marginBottom:12 }}>{visible.length} ENTR{visible.length===1?"Y":"IES"} ON FILE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {visible.map(p=><PostCard key={p.id} post={p} accent={accent} onClick={()=>onSelect(p.id)} />)}
            {visible.length===0 && <div style={{ padding:"40px", textAlign:"center", color:"#2a3035", fontSize:11, letterSpacing:"0.12em", border:"1px dashed #1a1e22", borderRadius:2 }}>NO ENTRIES MATCH THIS FILTER</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────────
function HomePage({ data, isDemo, navigate }) {
  const reviews=data.reviews||[], articles=data.articles||[], tutorials=data.tutorials||[];
  const completed=reviews.filter(r=>r.tags?.progress==="Completed").length;
  const playing=reviews.filter(r=>r.tags?.progress==="Playing").length;
  const recent=[...reviews,...articles,...tutorials].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,4);

  const Stat=({val,label,color})=>(
    <div style={{ textAlign:"center", padding:"12px 16px", background:"#0a0c0f", border:"1px solid #1e2428", borderRadius:2, flex:1, minWidth:0 }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:22, fontWeight:900, color, lineHeight:1, textShadow:`0 0 16px ${color}44` }}>{val}</div>
      <div style={{ fontSize:8, color:"#445", letterSpacing:"0.12em", marginTop:4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:820, margin:"0 auto", paddingBottom:60 }}>
      {isDemo && (
        <div style={{ background:"#0d1015", border:"1px solid #1e2428", borderRadius:2, padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#e05555", fontSize:10 }}>◈</span>
          <span style={{ fontSize:9, color:"#3a4a56", letterSpacing:"0.15em" }}>SIGNAL LOST — RUNNING ON CACHED DATA</span>
        </div>
      )}
      <Panel accent="#f0a500" style={{ marginBottom:24 }}>
        <div style={{ background:"#0d1015", border:"1px solid #1e2428", borderRadius:2, padding:"28px 28px 24px" }}>
          <div style={{ fontSize:8, color:"#f0a50088", letterSpacing:"0.3em", marginBottom:8 }}>PERSONAL LOG // STRATEGY & BUILDER GAMES</div>
          <h1 style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, margin:"0 0 14px", lineHeight:1.1 }}>
            <span style={{ fontSize:32, color:"#f0a500", textShadow:"0 0 40px #f0a50044", display:"block" }}>AUDWN'S</span>
            <span style={{ fontSize:17, color:"#c8d0d8", letterSpacing:"0.25em" }}>NOTEBOOK</span>
          </h1>
          <p style={{ fontSize:13, color:"#6a8090", lineHeight:1.8, maxWidth:560, margin:"0 0 18px" }}>Field notes on strategy and builder games. Reviews written as opinions, not verdicts — subject to revision whenever a patch, expansion, or a hundred more hours changes the picture.</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>navigate("reviews")}   style={{ background:"#1a0d0d", border:"1px solid #f0a500", color:"#f0a500", borderRadius:2, padding:"8px 18px", cursor:"pointer", fontSize:10, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.12em" }}>REVIEWS →</button>
            <button onClick={()=>navigate("articles")}  style={{ background:"#0d1a2b", border:"1px solid #5ba4cf", color:"#5ba4cf", borderRadius:2, padding:"8px 18px", cursor:"pointer", fontSize:10, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.12em" }}>ARTICLES →</button>
            <button onClick={()=>navigate("tutorials")} style={{ background:"#0d2b1a", border:"1px solid #3ddc84", color:"#3ddc84", borderRadius:2, padding:"8px 18px", cursor:"pointer", fontSize:10, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.12em" }}>TUTORIALS →</button>
          </div>
        </div>
      </Panel>
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        <Stat val={reviews.length}   label="REVIEWS"   color="#f0a500" />
        <Stat val={articles.length}  label="ARTICLES"  color="#5ba4cf" />
        <Stat val={tutorials.length} label="TUTORIALS" color="#3ddc84" />
        <Stat val={playing}          label="PLAYING"   color="#e6c84a" />
        <Stat val={completed}        label="COMPLETED" color="#7ec845" />
      </div>
      <div style={{ fontSize:9, color:"#445", letterSpacing:"0.2em", marginBottom:14 }}>RECENT ENTRIES</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {recent.map(p=>{
          const sec=p.postType==="review"?"reviews":p.postType==="article"?"articles":"tutorials";
          return <PostCard key={p.id} post={p} accent={SECTION_ACCENT[sec]} onClick={()=>navigate(sec,p.id)} />;
        })}
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────────
function AboutPage({ content, loading }) {
  return (
    <div style={{ maxWidth:820, margin:"0 auto", paddingBottom:60 }}>
      <Panel accent="#a06ee8" label="ABOUT // FIELD OPERATOR PROFILE" style={{ marginBottom:24 }}>
        <div style={{ background:"#0d1015", border:"1px solid #1e2428", borderRadius:2, overflow:"hidden" }}>
          <div style={{ background:"#0a0c0f", borderBottom:"1px solid #1e2428", padding:"20px 24px", display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:64, height:64, background:"#1e0d2b", border:"2px solid #a06ee8", borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:22, color:"#a06ee8", fontWeight:900 }}>A</span>
            </div>
            <div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:900, color:"#a06ee8" }}>AUDWN</div>
              <div style={{ fontSize:9, color:"#445", letterSpacing:"0.2em", marginTop:4 }}>FIELD OPERATOR // CLASSIFICATION: ANONYMOUS</div>
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                <TagBadge label="Strategy" small /><TagBadge label="Builder" small /><TagBadge label="4X" small /><TagBadge label="Management" small />
              </div>
            </div>
          </div>
          <div style={{ padding:"24px 28px" }}>
            {loading ? <Loading accent="#a06ee8" /> : <MD content={content} />}

          </div>
        </div>
      </Panel>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────────
export default function App() {
  const [data,    setData]    = useState({ reviews:MOCK.reviews, articles:MOCK.articles, tutorials:MOCK.tutorials });
  const [about,   setAbout]   = useState(MOCK.about);
  const [loading, setLoading] = useState({});
  const [isDemo,  setIsDemo]  = useState(true);
  const [section, setSection] = useState("home");
  const [view,    setView]    = useState("list");
  const [selId,   setSelId]   = useState(null);

  const navigate = useCallback((sec, id=null) => { setSection(sec); setSelId(id); setView(id?"detail":"list"); }, []);

  // Load section data from Notion
  useEffect(() => {
    if(!["reviews","articles","tutorials"].includes(section)) return;
    if(data[section] !== MOCK[section] && data[section]?.length) return; // already loaded real data
    setLoading(l=>({...l,[section]:true}));
    notionApi.list(section)
      .then(posts => { setData(d=>({...d,[section]:posts})); setIsDemo(false); })
      .catch(() => {})
      .finally(() => setLoading(l=>({...l,[section]:false})));
  }, [section]);

  // Load full post on detail view
  useEffect(() => {
    if(view!=="detail"||!selId||isDemo) return;
    const existing = (data[section]||[]).find(p=>p.id===selId);
    if(existing?.content) return;
    notionApi.get(selId).then(post => setData(d=>({...d,[section]:d[section].map(p=>p.id===post.id?{...p,...post}:p)}))).catch(()=>{});
  }, [view, selId]);

  // Load about page
  useEffect(() => {
    if(section!=="about") return;
    setLoading(l=>({...l,about:true}));
    notionApi.about()
      .then(page => { setAbout(page); setIsDemo(false); })
      .catch(() => {})
      .finally(() => setLoading(l=>({...l,about:false})));
  }, [section]);

  const accent   = SECTION_ACCENT[section]||"#f0a500";
  const store    = data[section]||[];
  const selected = store.find(p=>p.id===selId);
  const navItems = [{key:"home",label:"HOME"},{key:"reviews",label:"REVIEWS"},{key:"articles",label:"ARTICLES"},{key:"tutorials",label:"TUTORIALS"},{key:"about",label:"ABOUT"}];

  return (
    <div style={{ fontFamily:"'Share Tech Mono',monospace", background:"#080b0d", minHeight:"100vh", color:"#b8c4cc", position:"relative", backgroundImage:`linear-gradient(rgba(0,180,160,0.035) 1px, transparent 1px),linear-gradient(90deg, rgba(0,180,160,0.035) 1px, transparent 1px)`, backgroundSize:"32px 32px" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)" }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto", padding:"0 20px" }}>

        {/* HEADER */}
        <header style={{ borderBottom:"1px solid #1a1e22", paddingBottom:0, marginBottom:28, paddingTop:20 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:10 }}>
            <button onClick={()=>navigate("home")} style={{ background:"transparent", border:"none", cursor:"pointer", padding:0, textAlign:"left" }}>
              <div style={{ fontSize:8, color:"#f0a50088", letterSpacing:"0.3em", marginBottom:3 }}>FIELD NOTES // STRATEGY & BUILDER GAMES</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, lineHeight:1 }}>
                <span style={{ fontSize:22, color:"#f0a500", textShadow:"0 0 30px #f0a50044" }}>AUDWN'S </span>
                <span style={{ fontSize:13, color:"#c8d0d8", letterSpacing:"0.2em" }}>NOTEBOOK</span>
              </div>
            </button>
            <div style={{ fontSize:8, color:isDemo?"#e05555":"#3ddc84", letterSpacing:"0.12em", border:`1px solid ${isDemo?"#4a1010":"#1a4a2a"}`, padding:"3px 8px", borderRadius:2 }}>
              {isDemo ? "◈ SIGNAL LOST" : "⊙ STEADY ORBIT"}
            </div>
          </div>
          <div style={{ display:"flex", gap:0, borderTop:"1px solid #1a1e22" }}>
            {navItems.map(({key,label})=>{
              const active=section===key;
              const col=SECTION_ACCENT[key]||"#f0a500";
              return <button key={key} onClick={()=>navigate(key)} style={{ padding:"8px 16px", fontSize:10, letterSpacing:"0.15em", color:active?col:"#2a3035", background:"transparent", border:"none", cursor:"pointer", borderRight:"1px solid #1a1e22", borderBottom:active?`2px solid ${col}`:"2px solid transparent", fontFamily:"'Share Tech Mono',monospace", transition:"color 0.15s" }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.color="#7a8899"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.color="#2a3035"; }}
              >{label}</button>;
            })}
          </div>
        </header>

        {/* BREADCRUMB */}
        {section!=="home" && (
          <div style={{ fontSize:8, color:"#2a3035", letterSpacing:"0.15em", marginBottom:20, display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ color:"#1e2428", cursor:"pointer" }} onClick={()=>navigate("home")}>HOME</span>
            <span>›</span><span style={{ color:accent }}>{section.toUpperCase()}</span>
            {view!=="list"&&<><span>›</span><span style={{ color:"#5a6a78" }}>DETAIL</span></>}
          </div>
        )}

        {/* PAGES */}
        {section==="home"  && <HomePage data={data} isDemo={isDemo} navigate={navigate} />}
        {section==="about" && <AboutPage content={about?.content||""} loading={!!loading.about} />}

        {["reviews","articles","tutorials"].includes(section) && view==="list" && (
          <SectionList posts={store} postType={section==="reviews"?"review":section==="articles"?"article":"tutorial"} accent={accent} loading={!!loading[section]} onSelect={id=>{setSelId(id);setView("detail");}} />
        )}

        {["reviews","articles","tutorials"].includes(section) && view==="detail" && selected && (
          <PostDetail post={selected} accent={accent} onBack={()=>setView("list")} />
        )}

        {(section==="home"||(["reviews","articles","tutorials"].includes(section)&&view==="list")) && (
          <footer style={{ borderTop:"1px solid #1a1e22", marginTop:40, padding:"16px 0", display:"flex", justifyContent:"space-between", fontSize:8, color:"#1e2428", letterSpacing:"0.12em" }}>
            <span>AUDWN'S NOTEBOOK // PERSONAL LOG</span>
            <span>ALL OPINIONS PROVISIONAL — SUBJECT TO REVISION</span>
          </footer>
        )}
      </div>
    </div>
  );
}
