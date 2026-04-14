import { useState } from "react";
import { marked } from "marked";
import { TAG_COLORS, DEFAULT_TAG_COLOR, SECTION_ACCENT } from "./constants/tagColors.js";
import { reviews, articles, tutorials, about } from "./data/loader.js";

// ─── FONTS ──────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap";
document.head.appendChild(fontLink);



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
const MD_STYLES = `
.md-body { line-height: 1.8; color: #8a9eaa; font-size: 13px; }
.md-body h1 { font-family: 'Rajdhani',sans-serif; font-size: 20px; font-weight: 700; color: #f0a500; margin: 24px 0 10px; }
.md-body h2 { font-family: 'Rajdhani',sans-serif; font-size: 16px; font-weight: 700; color: #f0a500; border-bottom: 1px solid #1e2428; padding-bottom: 4px; margin: 20px 0 8px; }
.md-body h3 { font-family: 'Rajdhani',sans-serif; font-size: 14px; font-weight: 700; color: #c07800; margin: 16px 0 6px; }
.md-body p { margin: 0 0 8px; }
.md-body ul { list-style: none; padding-left: 16px; margin: 0 0 8px; }
.md-body ul li::before { content: '›'; color: #f0a500; margin-right: 8px; }
.md-body ol { padding-left: 20px; margin: 0 0 8px; }
.md-body a { color: #5ba4cf; text-decoration: none; }
.md-body a:hover { text-decoration: underline; }
.md-body strong { color: #c8d8e0; font-weight: 700; }
.md-body em { color: #a0b8c4; font-style: italic; }
.md-body code { font-family: 'Share Tech Mono',monospace; background: #0d1418; color: #3ddc84; padding: 1px 5px; border-radius: 2px; font-size: 12px; }
.md-body pre { background: #0d1418; border: 1px solid #1e2428; border-radius: 2px; padding: 12px; overflow-x: auto; margin: 0 0 12px; }
.md-body pre code { background: none; padding: 0; }
`;

function MD({ content }) {
  return (
    <>
      <style>{MD_STYLES}</style>
      <div
        className="md-body"
        dangerouslySetInnerHTML={{ __html: marked.parse(content || "", { breaks: true }) }}
      />
    </>
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
          <div style={{ fontSize:9, color:"#445", letterSpacing:"0.15em", marginBottom:3 }}>{post.game.toUpperCase()} · {fmtDate(post.updatedAt)}{post.readTime ? ` · ${post.readTime} MIN` : ""}</div>
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
            <div style={{ fontSize:9, color:"#445", letterSpacing:"0.1em", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
              <span>PUBLISHED {fmtDate(post.publishedAt||post.updatedAt)}</span>
              {post.updatedAt && post.updatedAt !== post.publishedAt && <span style={{ color:"#e6c84a88" }}>UPDATED {fmtDate(post.updatedAt)}</span>}
              {post.readTime && <span>{post.readTime} MIN READ</span>}
            </div>
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

// ─── SEARCH ──────────────────────────────────────────────────────────────────────
function SearchPage({ navigate }) {
  const [query, setQuery] = useState("");
  const all = [...reviews, ...articles, ...tutorials];
  const q = query.trim().toLowerCase();
  const results = q.length > 1
    ? all.filter(p => p.title.toLowerCase().includes(q) || p.game.toLowerCase().includes(q))
    : [];

  return (
    <div style={{ maxWidth:820, margin:"0 auto", paddingBottom:60 }}>
      <Panel accent="#e6c84a" label="SEARCH // ALL ENTRIES" style={{ marginBottom:20 }}>
        <div style={{ background:"#0d1015", border:"1px solid #1e2428", borderRadius:2 }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or game name…"
            style={{ width:"100%", boxSizing:"border-box", background:"transparent", border:"none", padding:"14px 20px", fontSize:13, color:"#c8d0d8", fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.04em", outline:"none" }}
          />
        </div>
      </Panel>
      {q.length > 1 && (
        <>
          <div style={{ fontSize:9, color:"#445", letterSpacing:"0.2em", marginBottom:14 }}>
            {results.length} RESULT{results.length !== 1 ? "S" : ""} FOR "{query.toUpperCase()}"
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {results.length === 0
              ? <div style={{ padding:"40px", textAlign:"center", color:"#2a3035", fontSize:11, letterSpacing:"0.12em", border:"1px dashed #1a1e22", borderRadius:2 }}>NO MATCHES FOUND</div>
              : results.map(p => {
                  const sec = p.postType==="review"?"reviews":p.postType==="article"?"articles":"tutorials";
                  return <PostCard key={p.id} post={p} accent={SECTION_ACCENT[sec]} onClick={() => navigate(sec, p.id)} />;
                })
            }
          </div>
        </>
      )}
    </div>
  );
}

// ─── GAME INDEX ───────────────────────────────────────────────────────────────────
function GameIndex({ navigate }) {
  const all = [...reviews, ...articles, ...tutorials];
  const byGame = {};
  for (const post of all) {
    if (!byGame[post.game]) byGame[post.game] = [];
    byGame[post.game].push(post);
  }
  const games = Object.entries(byGame).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <div style={{ maxWidth:820, margin:"0 auto", paddingBottom:60 }}>
      {games.map(([game, posts]) => (
        <div key={game} style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:12, borderBottom:"1px solid #1e2428", paddingBottom:8, marginBottom:12 }}>
            <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:18, fontWeight:700, color:"#c8d0d8" }}>{game}</span>
            <span style={{ fontSize:9, color:"#445", letterSpacing:"0.12em" }}>{posts.length} ENTR{posts.length !== 1 ? "IES" : "Y"}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {posts.map(p => {
              const sec = p.postType==="review"?"reviews":p.postType==="article"?"articles":"tutorials";
              return <PostCard key={p.id} post={p} accent={SECTION_ACCENT[sec]} onClick={() => navigate(sec, p.id)} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
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
function AboutPage({ content }) {
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
            <MD content={content} />

          </div>
        </div>
      </Panel>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────────
const DATA = { reviews, articles, tutorials };

export default function App() {
  const [section, setSection] = useState("home");
  const [view,    setView]    = useState("list");
  const [selId,   setSelId]   = useState(null);

  const navigate = (sec, id=null) => { setSection(sec); setSelId(id); setView(id?"detail":"list"); };

  const accent   = SECTION_ACCENT[section]||"#f0a500";
  const store    = DATA[section]||[];
  const selected = store.find(p=>p.id===selId);
  const navItems = [{key:"home",label:"HOME"},{key:"reviews",label:"REVIEWS"},{key:"articles",label:"ARTICLES"},{key:"tutorials",label:"TUTORIALS"},{key:"games",label:"GAMES"},{key:"search",label:"SEARCH"},{key:"about",label:"ABOUT"}];

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
        {section==="home"   && <HomePage navigate={navigate} />}
        {section==="about"  && <AboutPage content={about.content} />}
        {section==="search" && <SearchPage navigate={navigate} />}
        {section==="games"  && <GameIndex navigate={navigate} />}

        {["reviews","articles","tutorials"].includes(section) && view==="list" && (
          <SectionList posts={store} postType={section==="reviews"?"review":section==="articles"?"article":"tutorial"} accent={accent} loading={false} onSelect={id=>{setSelId(id);setView("detail");}} />
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
