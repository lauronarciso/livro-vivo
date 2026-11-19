// SisGAP-ES — protótipo (lógica)
const ANO = 2026;
const MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESL = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const HOJE = (()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const MES_ATUAL = HOJE.getFullYear()===ANO ? HOJE.getMonth() : 11;   // mês corrente (aberto)
const FECHADOS = HOJE.getFullYear()>ANO ? 12 : MES_ATUAL;            // meses encerrados
const IND_LIST = COMUNS.flatMap(p=>p[1]);
const PRESSAO = ["cac","fog","sup","air","dom"];
const ST = {conc:"Concluída",and:"Em andamento",venc:"Vence em até 15 dias",atr:"Atrasada",nao:"Não iniciada"};
const ST_COLOR = {conc:"var(--good)",and:"var(--prog)",venc:"var(--warning)",atr:"var(--critical)",nao:"var(--idle)"};
const ST_ORDER = ["conc","and","venc","atr","nao"];

// ---------- persistência ----------
const DATA_VER="2026-11-19e";
try{if(localStorage.getItem("sisgap:ver")!==JSON.stringify(DATA_VER)){Object.keys(localStorage).filter(k=>k.startsWith("sisgap:")).forEach(k=>localStorage.removeItem(k));localStorage.setItem("sisgap:ver",JSON.stringify(DATA_VER))}}catch(e){}
const LS = {
  get(k,d){try{const v=localStorage.getItem("sisgap:"+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem("sisgap:"+k,JSON.stringify(v))}catch(e){}}
};

// ---------- dados simulados (determinísticos) ----------
function rng(seed){let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function gerarLancamentos(){
  const out={};
  const faltando={PESA:[9],MONACP:[8,9],APAPM:[9],RDSCO:[7,8,9],APAGUA:[9],PECF:[9]};
  UCS.forEach(u=>{
    const r=rng(u.s), d={}, parque=u.cat==="Parque", apa=u.g==="US";
    const baseVis = {PEI:5200,PEPAZ:4200,PEPCV:3600,PEFG:2600,PECF:1800,MONAFF:900,PEMF:700,REBIODB:500,APAGO:420,MONAST:300,ARIEMV:180,PESA:900,MONACP:350}[u.s]||(apa?150:600);
    const fau=Math.round(180+r()*420), flo=Math.round(250+r()*700);
    IND_LIST.forEach(([id])=>d[id]=Array(12).fill(""));
    for(let m=0;m<FECHADOS;m++){
      if((faltando[u.s]||[]).includes(m)) continue;
      const verao=[0,1,6,11].includes(m)?1.6:1, seca=[6,7,8,9].includes(m)?2.2:1;
      const R=(a,b)=>Math.round(a+r()*(b-a));
      d.vis[m]= u.s==="APAPM"? "N/A" : Math.round(baseVis*verao*(.75+r()*.5));
      d.reu[m]= r()<.8?1:0; d.eve[m]=R(0,4); d.pev[m]=d.eve[m]*R(12,45); d.mid[m]=R(2,12);
      d.aci[m]= r()<.12?1:0;
      d.fau[m]=fau; d.faa[m]=Math.round(fau*.08); d.flo[m]=flo; d.fla[m]=Math.round(flo*.05);
      d.atr[m]=R(0,parque?3:2); d.exo[m]=R(0,2); d.mon[m]=R(0,4); d.mfa[m]=R(0,2);
      d.cac[m]=R(0,3); d.fog[m]=Math.round(r()*2.2*seca); d.sup[m]=R(0,apa?3:1); d.air[m]=R(0,3); d.dom[m]=R(0,3);
      d.aut[m]=R(0,3); d.fis[m]=R(3,15); d.inc[m]=Math.round(r()*1.4*seca); d.roi[m]=d.inc[m];
      if(u.s==="RDSCO"&&m===6){d.mon[m]="";d.exo[m]="";d.mfa[m]=""} // parcial
    }
    out[u.s]=d;
  });
  return out;
}
function acoesIniciais(){
  return ACOES_BASE.map((a,i)=>({id:"a"+(i+1),uc:a[0],prog:a[1],ativ:a[2],meta:a[3],ind:a[4],prazo:a[5],resp:a[6],st:a[7],pct:a[8],fonte:a[9],obs:"",hist:[]}));
}
function especIniciais(){const o={};for(const uc in ESPECIFICOS)ESPECIFICOS[uc].forEach(x=>o[x[0]]=x[4]);return o}
const REGRAS_PADRAO=[
  {id:"d15",on:true,t:"Prazo em 15 dias",d:"Avisa o responsável quando faltam 15 dias para o prazo da ação."},
  {id:"d7",on:true,t:"Prazo em 7 dias",d:"Segundo aviso ao responsável, com cópia para o(a) gestor(a) da UC."},
  {id:"d1",on:true,t:"Prazo amanhã",d:"Último aviso antes do vencimento."},
  {id:"atr",on:true,t:"Ação atrasada (semanal)",d:"Toda segunda-feira, enquanto a ação estiver atrasada; cópia para a GGUC."},
  {id:"lanc",on:true,t:"Lançamento mensal pendente",d:"No 6º dia útil, avisa as UCs que não enviaram o mês anterior."},
  {id:"res",on:true,t:"Resumo mensal para a GGUC",d:"No dia 10, consolidado de completude, pressões e ações de todas as UCs."},
  {id:"conc",on:false,t:"Ação concluída",d:"Avisa o(a) gestor(a) quando um responsável marca uma ação como concluída."}
];

let S;try{S = {
  user: LS.get("user",null),
  lanc: LS.get("lanc",null) || gerarLancamentos(),
  enviados: LS.get("enviados",null),
  acoes: LS.get("acoes",null) || acoesIniciais(),
  espec: LS.get("espec",null) || especIniciais(),
  regras: REGRAS_PADRAO.map(r=>Object.assign({},r,(LS.get("regras",[])||[]).find(x=>x.id===r.id)||{})),
  log: LS.get("log",[]),
  uc: LS.get("uc","")
};}catch(e){try{Object.keys(localStorage).filter(k=>k.startsWith("sisgap:")).forEach(k=>localStorage.removeItem(k))}catch(_){}location.reload()}
if(!S.enviados){S.enviados={};UCS.forEach(u=>{S.enviados[u.s]=[];for(let m=0;m<FECHADOS;m++) if(completude(u.s,m)===1) S.enviados[u.s].push(m)})}
function save(){["lanc","enviados","acoes","espec","regras","log","uc","user"].forEach(k=>LS.set(k,S[k]))}

// ---------- utilidades ----------
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=(n,d=0)=>Number(n).toLocaleString("pt-BR",{maximumFractionDigits:d});
const user=()=>USERS.find(u=>u.id===S.user);
const userById=id=>USERS.find(u=>u.id===id)||{nome:"—",email:""};
const ucObj=s=>UCS.find(u=>u.s===s);
const isAdmin=()=>user()&&user().papel==="admin";
const ucsVisiveis=()=>isAdmin()?UCS:UCS.filter(u=>u.s===user().uc);
function parseD(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function dias(prazo){return Math.round((parseD(prazo)-HOJE)/864e5)}
function fmtD(s){const d=parseD(s);return d.toLocaleDateString("pt-BR")}
function status(a){if(a.st==="conc")return"conc";const n=dias(a.prazo);if(n<0)return"atr";if(n<=15)return"venc";return a.st}
function pill(st){return `<span class="pill st-${st}"><i></i>${ST[st]}</span>`}
function num(v){const n=Number(String(v).replace(",","."));return v!==""&&v!=="N/A"&&isFinite(n)?n:null}
function completude(uc,m){const d=S.lanc[uc];let f=0;IND_LIST.forEach(([id])=>{if(d[id][m]!=="")f++});return f/IND_LIST.length}
function soma(uc,id,m0=0,m1=FECHADOS){let t=0;for(let m=m0;m<m1;m++){const n=num(S.lanc[uc][id][m]);if(n!==null)t+=n}return t}
function ultimo(uc,id){const a=S.lanc[uc][id];for(let m=11;m>=0;m--){const n=num(a[m]);if(n!==null)return n}return null}
function acoesDe(uc){return S.acoes.filter(a=>!uc||a.uc===uc)}
function contaSt(list){const c={conc:0,and:0,venc:0,atr:0,nao:0};list.forEach(a=>c[status(a)]++);return c}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2200)}
function ucAtual(){if(!isAdmin())return user().uc;return S.uc}

// ---------- tooltip ----------
const tip=$("#tip");
document.addEventListener("mousemove",e=>{
  const el=e.target.closest("[data-tip]");
  if(!el){tip.style.opacity=0;return}
  tip.innerHTML=el.getAttribute("data-tip");tip.style.opacity=1;
  const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY+14;
  if(x+w>innerWidth-8)x=e.clientX-w-14; if(y+h>innerHeight-8)y=e.clientY-h-14;
  tip.style.left=x+"px";tip.style.top=y+"px";
});

// ---------- gráficos (SVG) ----------
function lineChart(labels,vals,{unit="",h=220,closed=FECHADOS}={}){
  const W=640,H=h,L=48,R=14,T=14,B=28,iw=W-L-R,ih=H-T-B;
  const nums=vals.map(v=>v===null?null:v), max=Math.max(1,...nums.filter(v=>v!==null));
  const nice=niceMax(max), x=i=>L+iw*(i/(labels.length-1)), y=v=>T+ih-(v/nice)*ih;
  let g="";
  for(let k=0;k<=4;k++){const v=nice*k/4,yy=y(v);g+=`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#e8eae5"/><text x="${L-8}" y="${yy+4}" font-size="11" fill="#7c877f" text-anchor="end">${fmt(v)}</text>`}
  labels.forEach((l,i)=>g+=`<text x="${x(i)}" y="${H-8}" font-size="11" fill="${i<closed?"#4d5a51":"#b5bcb6"}" text-anchor="middle">${l}</text>`);
  let d="",started=false;nums.forEach((v,i)=>{if(v===null){started=false;return}d+=(started?"L":"M")+x(i)+","+y(v);started=true});
  let area="";const pts=nums.map((v,i)=>v===null?null:[x(i),y(v)]).filter(Boolean);
  if(pts.length>1)area=`<path d="M${pts[0][0]},${T+ih} ${pts.map(p=>"L"+p[0]+","+p[1]).join(" ")} L${pts[pts.length-1][0]},${T+ih}Z" fill="#2a78d6" opacity=".08"/>`;
  let dots="",hits="";
  nums.forEach((v,i)=>{
    const bw=iw/(labels.length-1);
    hits+=`<rect x="${x(i)-bw/2}" y="${T}" width="${bw}" height="${ih}" fill="transparent" data-tip="<b>${labels[i]} ${ANO}</b>${v===null?"sem dado":fmt(v,1)+" "+unit}" class="hit" data-i="${i}"/>`;
    if(v!==null)dots+=`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#2a78d6" stroke="#fff" stroke-width="2"/>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${g}${area}<path d="${d}" fill="none" stroke="#2a78d6" stroke-width="2" stroke-linejoin="round"/>${dots}${hits}</svg>`;
}
function niceMax(m){const p=Math.pow(10,Math.floor(Math.log10(m)));for(const k of [1,1.5,2,2.5,3,4,5,6,8,10])if(k*p>=m)return k*p;return 10*p}
function hbars(items,{unit="",color="var(--seq-3)"}={}){
  const max=Math.max(1,...items.map(i=>i.v));
  return `<div>${items.map(i=>`<div style="display:grid;grid-template-columns:180px 1fr 54px;gap:10px;align-items:center;margin:7px 0" data-tip="<b>${esc(i.l)}</b>${fmt(i.v)} ${unit}">
    <span class="small" style="color:var(--ink-2)">${esc(i.l)}</span>
    <div style="background:#f0f1ee;border-radius:4px;height:14px"><div style="width:${i.v/max*100}%;height:100%;background:${color};border-radius:0 4px 4px 0"></div></div>
    <span class="small" style="text-align:right;font-variant-numeric:tabular-nums;font-weight:600">${fmt(i.v)}</span></div>`).join("")}</div>`;
}
function stackRows(rows){
  return rows.map(r=>{
    const tot=ST_ORDER.reduce((t,k)=>t+r.c[k],0)||1;
    const segs=ST_ORDER.filter(k=>r.c[k]).map(k=>`<div style="width:${r.c[k]/tot*100}%;background:${ST_COLOR[k]};height:100%;border-right:2px solid #fff" data-tip="<b>${esc(r.l)} · ${ST[k]}</b>${r.c[k]} de ${tot} ações"></div>`).join("");
    return `<div style="display:grid;grid-template-columns:${r.w||170}px 1fr 64px;gap:10px;align-items:center;margin:8px 0">
      <span class="small" style="color:var(--ink-2)${r.link?";cursor:pointer;text-decoration:underline dotted":""}" ${r.link?`onclick="location.hash='${r.link}'"`:""}>${esc(r.l)}</span>
      <div style="display:flex;height:16px;border-radius:4px;overflow:hidden;background:#f0f1ee">${segs}</div>
      <span class="small" style="text-align:right;font-weight:600">${r.c.conc}/${tot}</span></div>`}).join("")
   + `<div class="legend">${ST_ORDER.map(k=>`<span><i style="background:${ST_COLOR[k]}"></i>${ST[k]}</span>`).join("")}</div>`;
}

// ---------- alertas ----------
function gerarAlertas(){
  const out=[], on=id=>{const r=S.regras.find(x=>x.id===id);return r?r.on!==false:true};
  S.acoes.forEach(a=>{
    const st=status(a),n=dias(a.prazo),r=userById(a.resp);
    if(st==="atr"&&on("atr"))out.push({tipo:"atr",sev:"critical",uc:a.uc,para:r,acao:a,txt:`Atrasada há ${-n} dia${-n===1?"":"s"}`});
    else if(st==="venc"){const rg=n<=1?"d1":n<=7?"d7":"d15";if(on(rg))out.push({tipo:rg,sev:"warning",uc:a.uc,para:r,acao:a,txt:n===0?"Vence hoje":`Vence em ${n} dia${n===1?"":"s"}`})}
  });
  if(on("lanc")&&FECHADOS>0){
    const m=FECHADOS-1;
    UCS.forEach(u=>{if(!S.enviados[u.s].includes(m)){const g=USERS.find(x=>x.uc===u.s&&x.papel==="gestor");out.push({tipo:"lanc",sev:"serious",uc:u.s,para:g||{nome:"Gestor(a) "+u.s,email:"gestor."+u.s.toLowerCase()+"@exemplo.org"},txt:`Lançamento de ${MESL[m]} não enviado (${Math.round(completude(u.s,m)*100)}% preenchido)`})}});
  }
  return out;
}
function alertasVisiveis(){const a=gerarAlertas();return isAdmin()?a:a.filter(x=>x.uc===user().uc)}

// ---------- shell ----------
const ROTAS=[
  ["painel","▦","Painel geral",true],["uc","◉","Painel da UC"],["lancar","✎","Lançamento mensal"],["acoes","⚑","Plano de ação"],
  ["fundiario","⌖","Fundiário (CAR)"],["biodiversidade","❦","Biodiversidade"],
  ["alertas","✉","Alertas e e-mails"],["indicadores","☰","Catálogo de indicadores"],["usuarios","👥","Usuários e papéis",true]
];
function renderNav(){
  const r=(location.hash.slice(1).split("/")[0])||"";
  const nAl=alertasVisiveis().length;
  $("#nav").innerHTML='<div class="sec">Gestão</div>'+ROTAS.filter(x=>!x[3]||isAdmin()).map(([id,ic,t])=>
    `<a href="#${id}" class="${r===id?"on":""}"><span class="ic">${ic}</span>${t}${id==="alertas"&&nAl?`<span class="badge">${nAl}</span>`:""}</a>`).join("");
}
function renderUcSel(){
  const sel=$("#ucSel");
  if(isAdmin()){
    sel.disabled=false;
    sel.innerHTML=`<option value="">Todas as UCs (19)</option>`+["PI","US"].map(g=>`<optgroup label="${g==="PI"?"Proteção Integral":"Uso Sustentável"}">${UCS.filter(u=>u.g===g).map(u=>`<option value="${u.s}" ${S.uc===u.s?"selected":""}>${u.s} — ${u.n}${u.piloto?" ★":""}</option>`).join("")}</optgroup>`).join("");
  }else{
    const u=ucObj(user().uc);sel.innerHTML=`<option>${u.s} — ${u.n}</option>`;sel.disabled=true;
  }
}
$("#ucSel").onchange=e=>{S.uc=e.target.value;save();const r=location.hash.slice(1).split("/")[0];if(r==="uc"&&S.uc)location.hash="uc/"+S.uc;else if(r==="painel"&&S.uc)location.hash="uc/"+S.uc;else route()};
function sair(){S.user=null;save();history.replaceState(null,"",location.pathname);showLogin()}
if($("#userBtn"))$("#userBtn").onclick=sair;
function irInicio(e){if(e)e.preventDefault();const h=isAdmin()?"painel":"uc/"+user().uc;if(isAdmin()){S.uc="";save()}if(location.hash==="#"+h)route();else location.hash=h}
if($("#btnHome"))$("#btnHome").onclick=e=>{e.preventDefault();sair()};if($("#logoHome"))$("#logoHome").onclick=()=>sair();

// ---------- cargos e contas (dinâmicos) ----------
const CARGOS={
  gguc:[["ger","Gerente / Coordenação da GGUC","admin"],["ana","Analista da GGUC","admin"]],
  uc:[["gestor","Gestor(a) da UC","gestor"],["tec","Analista / Técnico(a)","tecnico"],["gp","Guarda-parque / Fiscal","tecnico"],["est","Estagiário(a) / Voluntário(a)","tecnico"]]
};
function cargoDe(u){if(u.cargo)return u.cargo;return u.papel==="admin"?"Gerente / Coordenação da GGUC":u.papel==="gestor"?"Gestor(a) da UC":"Analista / Técnico(a)"}
// conta de demonstração para (tipo, uc, cargo) — reutiliza as pessoas fictícias das UCs piloto
function contaPara(tipo,uc,cg){
  if(tipo==="gguc"){const c=CARGOS.gguc.find(x=>x[0]===cg);if(cg==="ger")return Object.assign(USERS[0],{cargo:c[1]});return ensureUser("ana-GGUC",{nome:"Analista GGUC",email:"analista.gguc@exemplo.org",papel:"admin",uc:null,cargo:c[1]})}
  const c=CARGOS.uc.find(x=>x[0]===cg), low=uc.toLowerCase();
  if(cg==="gestor"){const g=USERS.find(x=>x.uc===uc&&x.papel==="gestor");if(g){g.cargo=c[1];return g}}
  if(cg==="tec"){const t=USERS.find(x=>x.uc===uc&&x.papel==="tecnico"&&!x.id.includes("-"));if(t){t.cargo=c[1];return t}}
  const pref={gestor:"gestor",tec:"tecnico",gp:"guardaparque",est:"estagiario"}[cg];
  return ensureUser(cg+"-"+uc,{nome:c[1].split(" /")[0].replace(/\(a\)/,"(a)")+" "+uc,email:pref+"."+low+"@exemplo.org",papel:c[2],uc,cargo:c[1]});
}
function ensureUser(id,dados){let u=USERS.find(x=>x.id===id);if(!u){u=Object.assign({id},dados);USERS.push(u)}return u}
// gestor de toda UC (usado nos alertas de lançamento)
UCS.forEach(u=>{if(!USERS.some(x=>x.uc===u.s&&x.papel==="gestor"))contaPara("uc",u.s,"gestor")});
// reabre sessão de conta gerada
(function(){if(S.user&&!USERS.find(x=>x.id===S.user)){const [cg,uc]=S.user.split("-");if(uc==="GGUC")contaPara("gguc",null,"ana");else if(ucObj(uc)&&CARGOS.uc.some(c=>c[0]===cg))contaPara("uc",uc,cg);else S.user=null}})();

let LG={tipo:"uc",uc:"APAGO",cargo:"gestor",q:""};
const semAcento=t=>t.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
function showLogin(){
  $("#app").classList.add("hidden");$("#login").classList.remove("hidden");
  $("#heroUcs").innerHTML=UCS.filter(u=>u.piloto).map(u=>`<div class="hu" data-hu="${u.s}" title="Entrar como gestor(a) desta UC"><b>${u.s}</b><span>${esc(u.n)}</span><em>Plano de manejo 2025 · ${S.acoes.filter(a=>a.uc===u.s).length} ações · ${ESPECIFICOS[u.s].length} indicadores específicos</em></div>`).join("");
  document.querySelectorAll("[data-hu]").forEach(d=>d.onclick=()=>{LG={tipo:"uc",uc:d.dataset.hu,cargo:"gestor",q:""};showLogin()});
  const cats=[...new Set(UCS.map(u=>u.cat))];
  const draw=()=>{
    if(!CARGOS[LG.tipo].some(c=>c[0]===LG.cargo))LG.cargo=CARGOS[LG.tipo][0][0];
    const pronto=LG.tipo==="gguc"||LG.uc;
    const c=pronto?contaPara(LG.tipo,LG.uc,LG.cargo):null;
    const passo=(n,t,on)=>`<label style="display:flex;align-items:center;gap:8px"><span style="width:20px;height:20px;border-radius:50%;background:${on?"var(--brand)":"#cfd5cf"};color:#fff;display:grid;place-items:center;font-size:11px">${n}</span>${t}</label>`;
    $("#loginList").innerHTML=`
    <div class="fld">${passo(1,"Tipo de acesso",true)}
      <div class="seg" style="width:100%;display:flex">${[["gguc","GGUC — gestão da rede"],["uc","Unidade de conservação"]].map(([k,t])=>`<button style="flex:1;padding:10px" class="${LG.tipo===k?"on":""}" data-t="${k}">${t}</button>`).join("")}</div></div>
    ${LG.tipo==="uc"?`<div class="fld">${passo(2,"Unidade de conservação",true)}
      <input id="lgBusca" value="${esc(LG.q)}" placeholder="Digite a sigla ou o nome (ex.: Itaúnas, Morro da Vargem)" autocomplete="off" style="margin-bottom:6px">
      <select id="lgUc" size="7" style="width:100%">${(()=>{const L=UCS.filter(u=>semAcento(u.s+" "+u.n).includes(semAcento(LG.q)));return L.length?cats.map(ct=>{const g=L.filter(u=>u.cat===ct);return g.length?`<optgroup label="${ct}">${g.map(u=>`<option value="${u.s}" ${LG.uc===u.s?"selected":""}>${u.s} — ${esc(u.n)}${u.piloto?"  ★":""}</option>`).join("")}</optgroup>`:""}).join(""):`<option disabled>Nenhuma UC encontrada</option>`})()}</select>
      <div class="small muted" style="margin-top:4px">★ UC piloto: plano de ação e indicadores específicos já cadastrados.</div></div>`:""}
    <div class="fld">${passo(LG.tipo==="uc"?3:2,"Cargo",!!pronto)}
      <select id="lgCargo" ${pronto?"":"disabled"}>${CARGOS[LG.tipo].map(([k,t])=>`<option value="${k}" ${LG.cargo===k?"selected":""}>${t}</option>`).join("")}</select>
      <div class="small muted" style="margin-top:4px">${{admin:"Vê e edita todas as UCs, regras de e-mail e usuários.",gestor:"Vê a própria UC, lança, envia à GGUC e atribui responsáveis e prazos.",tecnico:"Vê a própria UC, lança indicadores e atualiza as ações sob sua responsabilidade."}[CARGOS[LG.tipo].find(x=>x[0]===LG.cargo)[2]]}</div></div>
    ${c?`<div class="gbtn" style="cursor:default"><span class="av">${esc(c.nome[0])}</span><span class="t"><b>${esc(c.nome)}</b><span>${c.email}</span></span><span class="role">${c.uc||"todas as UCs"}</span></div>`:""}
    <button class="btn primary" id="lgEntrar" style="width:100%;padding:12px;font-size:15px" ${c?"":"disabled"}>${c?"Entrar com Google (simulado)":"Escolha a unidade de conservação"}</button>
    <p class="small muted" style="margin-top:14px">No sistema real, tipo de acesso, UC e cargo vêm do cadastro do e-mail feito pela GGUC: a pessoa só clica em “Entrar com Google”. Aqui os nomes e e-mails são fictícios e as alterações ficam salvas só neste navegador.</p>
    <button class="btn sm" onclick="resetDemo()">Restaurar dados de demonstração</button>`;
    document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{LG.tipo=b.dataset.t;draw()});
    $("#lgCargo").onchange=e=>{LG.cargo=e.target.value;draw()};
    const sel=$("#lgUc");
    if(sel){
      sel.onchange=()=>{LG.uc=sel.value;draw()};
      sel.ondblclick=()=>$("#lgEntrar").click();
      const busca=$("#lgBusca");
      busca.oninput=()=>{LG.q=busca.value;const m=UCS.find(u=>semAcento(u.s+" "+u.n).includes(semAcento(LG.q)));LG.uc=m?m.s:"";draw();const b2=$("#lgBusca");b2.focus();b2.setSelectionRange(b2.value.length,b2.value.length)};
      busca.onkeydown=e=>{if(e.key==="Enter"&&!$("#lgEntrar").disabled)$("#lgEntrar").click()};
    }
    $("#lgEntrar").onclick=()=>{if(!c)return;S.user=c.id;S.uc=isAdmin()?"":user().uc;save();startApp()};
  };
  draw();
}
function resetDemo(){["lanc","enviados","acoes","espec","regras","log","uc"].forEach(k=>{try{localStorage.removeItem("sisgap:"+k)}catch(e){}});location.reload()}
function startApp(){
  $("#login").classList.add("hidden");$("#app").classList.remove("hidden");
  const u=user();$("#uAv").textContent=u.nome[0];$("#uName").innerHTML=esc(u.nome)+`<span class="muted" style="display:block;font-size:11px">${esc(cargoDe(u))}${u.uc?" · "+u.uc:""}</span>`;
  renderUcSel();
  if(!location.hash||location.hash==="#")location.hash=isAdmin()?"painel":"uc/"+u.uc; else route();
}
function route(){
  if(!user())return showLogin();
  let [r,arg]=location.hash.slice(1).split("/");
  if(!isAdmin()&&(r==="painel"||r==="usuarios")){location.hash="uc/"+user().uc;return}
  if(r==="uc"&&!arg){arg=ucAtual()||"APAGO";location.hash="uc/"+arg;return}
  if(r==="uc"&&!isAdmin()&&arg!==user().uc){location.hash="uc/"+user().uc;return}
  if(r==="uc"&&isAdmin()&&S.uc!==arg){S.uc=arg;save()}
  renderNav();renderUcSel();
  const V={painel:vPainel,uc:()=>vUC(arg),lancar:vLancar,acoes:vAcoes,alertas:vAlertas,indicadores:vIndicadores,usuarios:vUsuarios,fundiario:vFundiario,biodiversidade:vBio}[r]||vPainel;
  V();window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
function title(t,s){$("#pgTitle").innerHTML=`${t}${s?`<small>${s}</small>`:""}`}

// ---------- VIEW: painel geral ----------
function vPainel(){
  title("Painel geral da rede",`19 unidades de conservação estaduais · ${ANO} · dados simulados`);
  const m=FECHADOS-1, enviadas=UCS.filter(u=>S.enviados[u.s].includes(m)).length;
  const vis=UCS.reduce((t,u)=>t+soma(u.s,"vis"),0), pres=UCS.reduce((t,u)=>t+PRESSAO.reduce((a,id)=>a+soma(u.s,id),0),0);
  const inc=UCS.reduce((t,u)=>t+soma(u.s,"inc"),0), c=contaSt(S.acoes);
  const al=gerarAlertas();
  $("#view").innerHTML=`
  <div class="note"><b>Protótipo para validação.</b> Os números de lançamento são simulados. As ações e os indicadores específicos das 4 UCs piloto (★ APAGO, ARIEMV, PE Forno Grande e PE Itaúnas) foram extraídos dos planos de manejo; responsáveis, status e valores são fictícios.</div>
  <div class="grid g4">
    <div class="card kpi"><div class="lbl">Lançamentos de ${MESL[m]} enviados</div><div class="val">${enviadas}<span style="font-size:18px;color:var(--muted)">/19</span></div><div class="foot"><b>${19-enviadas}</b> UCs pendentes</div></div>
    <div class="card kpi"><div class="lbl">Visitas registradas em ${ANO}</div><div class="val">${fmt(vis)}</div><div class="foot">Jan–${MES[m]} · todas as UCs</div></div>
    <div class="card kpi"><div class="lbl">Ocorrências de pressão em ${ANO}</div><div class="val">${fmt(pres)}</div><div class="foot">caça, fogo, supressão, irregularidades, animais domésticos · <b>${fmt(inc)}</b> incêndios combatidos</div></div>
    <div class="card kpi"><div class="lbl">Ações dos planos de manejo</div><div class="val">${c.conc}<span style="font-size:18px;color:var(--muted)">/${S.acoes.length}</span></div><div class="foot">concluídas · <b style="color:#9b2424">${c.atr} atrasadas</b> · ${c.venc} vencem em 15 dias</div></div>
  </div>
  <div class="grid g21" style="margin-top:16px">
    <div class="card"><div class="card-h"><div><h3>Completude dos lançamentos mensais</h3><p class="sub">Percentual dos 23 indicadores comuns preenchidos por UC e mês</p></div></div>${heatGrid()}</div>
    <div class="card"><div class="card-h"><div><h3>Alertas ativos</h3><p class="sub">${al.length} alertas gerados hoje pelas regras de e-mail</p></div><button class="btn sm" onclick="location.hash='alertas'">Ver todos</button></div>
      ${alertList(al.slice(0,9))}</div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="card-h"><div><h3 id="lcT"></h3><p class="sub">Soma de todas as UCs por mês</p></div>
      <select id="lcSel" class="btn sm">${IND_LIST.filter(i=>i[3]==="Soma").map(i=>`<option value="${i[0]}">${i[1]}</option>`).join("")}</select></div><div id="lc"></div></div>
    <div class="card"><div class="card-h"><div><h3>Execução dos planos de manejo</h3><p class="sub">Status das ações cadastradas nas UCs piloto · clique na sigla para abrir o painel da UC</p></div></div>
      ${stackRows(UCS.filter(u=>u.piloto).map(u=>({l:u.s+" — "+u.n.replace(/^(Parque Estadual|APA|ARIE)( do| de| da)? ?/,""),c:contaSt(acoesDe(u.s)),link:"uc/"+u.s,w:200})))}
      <div class="info" style="margin-top:14px">As outras 15 UCs entram no plano de ação à medida que seus planos de manejo forem cadastrados.</div></div>
  </div>
  ${geoCard(null)}
  <div class="grid g12" style="margin-top:16px">
    <div class="card"><h3>Pressões registradas por tipo</h3><p class="sub">Ocorrências em ${ANO}, todas as UCs</p>
      ${hbars(PRESSAO.map(id=>({l:IND_LIST.find(i=>i[0]===id)[1],v:UCS.reduce((t,u)=>t+soma(u.s,id),0)})),{unit:"ocorrências"})}</div>
    <div class="card"><h3>Situação por unidade</h3><p class="sub">Clique para abrir o painel da UC</p>
      <div class="tbl-wrap" style="max-height:420px"><table><thead><tr><th>UC</th><th>Categoria</th><th class="num">Completude ${ANO}</th><th class="num">Visitas</th><th class="num">Pressões</th><th class="num">Ações atrasadas</th><th>${MES[m]}</th></tr></thead><tbody>
      ${UCS.map(u=>{const cp=Array.from({length:FECHADOS},(_,i)=>completude(u.s,i)).reduce((a,b)=>a+b,0)/Math.max(1,FECHADOS);const at=contaSt(acoesDe(u.s)).atr;const env=S.enviados[u.s].includes(m);
        return `<tr style="cursor:pointer" onclick="location.hash='uc/${u.s}'"><td><b>${u.s}</b>${u.piloto?'<span class="tag-p">PILOTO</span>':""}<div class="small muted">${esc(u.n)}</div></td><td class="small">${u.cat}</td>
        <td class="num"><div style="display:flex;gap:8px;align-items:center;justify-content:flex-end"><div class="prog" style="width:70px"><i style="width:${cp*100}%"></i></div>${Math.round(cp*100)}%</div></td>
        <td class="num">${u.s==="APAPM"?'<span class="muted">N/A</span>':fmt(soma(u.s,"vis"))}</td><td class="num">${fmt(PRESSAO.reduce((a,id)=>a+soma(u.s,id),0))}</td>
        <td class="num">${u.piloto?(at?`<b style="color:#9b2424">${at}</b>`:"0"):'<span class="muted">—</span>'}</td>
        <td>${env?'<span class="pill st-conc"><i></i>Enviado</span>':'<span class="pill st-venc"><i></i>Pendente</span>'}</td></tr>`}).join("")}
      </tbody></table></div></div>
  </div>`;
  const drawLc=()=>{const id=$("#lcSel").value,ind=IND_LIST.find(i=>i[0]===id);$("#lcT").textContent=ind[1]+" — "+ANO;
    $("#lc").innerHTML=lineChart(MES,MES.map((_,i)=>i<FECHADOS?UCS.reduce((t,u)=>t+(num(S.lanc[u.s][id][i])||0),0):null),{unit:ind[2]})};
  $("#lcSel").onchange=drawLc;drawLc();
  geoMount(null);
}
function heatGrid(){
  const col=v=>v===1?"#1f6b45":v>=.7?"#6fae8a":v>0?"#c9e2d3":"#eef0eb";
  return `<div style="overflow:auto"><table class="heat"><thead><tr><th></th>${MES.map((m,i)=>`<th class="small" style="color:${i<FECHADOS?"#4d5a51":"#b5bcb6"}">${m}</th>`).join("")}</tr></thead><tbody>
  ${UCS.map(u=>`<tr><td class="lbl"><a href="#uc/${u.s}" style="color:inherit;text-decoration:none">${u.s}</a></td>${MES.map((_,m)=>{
    if(m>=FECHADOS)return `<td><div class="cell" style="background:repeating-linear-gradient(45deg,#f4f5f2,#f4f5f2 3px,#e9ebe6 3px,#e9ebe6 6px)" data-tip="<b>${u.s} · ${MES[m]}</b>Mês ainda não encerrado"></div></td>`;
    const v=completude(u.s,m);return `<td><div class="cell" style="background:${col(v)}" data-tip="<b>${u.s} · ${MES[m]}/${ANO}</b>${Math.round(v*100)}% preenchido${S.enviados[u.s].includes(m)?" · enviado":" · não enviado"}"></div></td>`}).join("")}</tr>`).join("")}
  </tbody></table></div>
  <div class="legend"><span><i style="background:#1f6b45"></i>100%</span><span><i style="background:#6fae8a"></i>70–99%</span><span><i style="background:#c9e2d3"></i>1–69%</span><span><i style="background:#eef0eb;border:1px solid #dcdfd8"></i>Vazio</span><span><i style="background:repeating-linear-gradient(45deg,#f4f5f2,#f4f5f2 2px,#e3e6df 2px,#e3e6df 4px)"></i>Mês aberto</span></div>`;
}
function alertList(al){
  if(!al.length)return `<p class="muted">Nenhum alerta ativo.</p>`;
  const ic={atr:"⚠",d15:"⏱",d7:"⏱",d1:"⏱",lanc:"✎"}, cl={critical:"st-atr",warning:"st-venc",serious:"st-venc"};
  return al.map(a=>`<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)">
    <span class="pill ${cl[a.sev]}" style="height:22px">${ic[a.tipo]} ${a.uc}</span>
    <div style="flex:1;min-width:0"><div style="font-weight:500;line-height:1.35">${a.acao?esc(a.acao.ativ):"Lançamento mensal"}</div>
    <div class="small muted">${a.txt} · ${esc(a.para.nome)}</div></div></div>`).join("");
}

// ---------- VIEW: painel da UC ----------
function vUC(s){
  const u=ucObj(s);if(!u){location.hash="painel";return}
  title(`${u.s} — ${u.n}`,`${u.cat} · ${u.g==="PI"?"Proteção Integral":"Uso Sustentável"}${u.piloto?" · UC piloto com plano de manejo cadastrado":""}`);
  const ac=acoesDe(s),c=contaSt(ac),cp=Array.from({length:FECHADOS},(_,i)=>completude(s,i)).reduce((a,b)=>a+b,0)/Math.max(1,FECHADOS);
  const pres=PRESSAO.reduce((a,id)=>a+soma(s,id),0);
  const prox=ac.filter(a=>status(a)!=="conc").sort((a,b)=>a.prazo.localeCompare(b.prazo)).slice(0,7);
  const progs=[...new Set(ac.map(a=>a.prog))];
  const pl=PLANOS[s];
  $("#view").innerHTML=`
  ${pl?`<div class="info" style="margin-bottom:16px"><b>Fonte:</b> ${esc(pl.doc)}. ${esc(pl.obs)}</div>`:`<div class="note"><b>Plano de manejo ainda não cadastrado.</b> Esta UC já lança os indicadores comuns. Para ativar o plano de ação e os indicadores específicos, a GGUC importa as ações do plano de manejo (atividade, meta, indicador, prazo e responsável).</div>`}
  <div class="grid g4">
    <div class="card kpi"><div class="lbl">Completude dos lançamentos ${ANO}</div><div class="val">${Math.round(cp*100)}%</div><div class="foot">${S.enviados[s].length} de ${FECHADOS} meses enviados</div></div>
    <div class="card kpi"><div class="lbl">Visitas em ${ANO}</div><div class="val">${s==="APAPM"?"N/A":fmt(soma(s,"vis"))}</div><div class="foot">Público total atingido: <b>${fmt(soma(s,"vis")+soma(s,"pev"))}</b></div></div>
    <div class="card kpi"><div class="lbl">Ocorrências de pressão</div><div class="val">${fmt(pres)}</div><div class="foot"><b>${fmt(soma(s,"aut"))}</b> autuações · <b>${fmt(soma(s,"fis"))}</b> ações de fiscalização</div></div>
    <div class="card kpi"><div class="lbl">Ações do plano de manejo</div><div class="val">${ac.length?c.conc+'<span style="font-size:18px;color:var(--muted)">/'+ac.length+"</span>":"—"}</div><div class="foot">${ac.length?`concluídas · <b style="color:#9b2424">${c.atr} atrasadas</b> · ${c.venc} a vencer`:"plano não cadastrado"}</div></div>
  </div>
  ${ESPECIFICOS[s]?`<div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="card-h"><div><h3>Indicadores específicos do plano de manejo</h3><p class="sub">Valor acumulado no ano em relação à meta</p></div><button class="btn sm" onclick="location.hash='lancar'">Atualizar</button></div>
      ${ESPECIFICOS[s].map(([id,nm,un,meta,_,tipo,src])=>{const v=S.espec[id];let pct=meta===null?null:tipo==="menor"?(v<=meta?1:Math.max(0,1-(v-meta)/Math.max(1,v))):Math.min(1,v/meta);
        const cor=pct===null?"var(--seq-3)":pct>=1?"var(--good)":pct>=.5?"var(--prog)":"var(--serious)";
        return `<div class="ind-row"><div><div class="nm">${esc(nm)}</div><div class="src">${esc(src)}</div></div>
        <div data-tip="<b>${esc(nm)}</b>Atual: ${fmt(v,1)} ${un}<br>Meta: ${meta===null?"sem meta numérica":(tipo==="menor"?"≤ ":"")+fmt(meta)+" "+un}"><div class="prog"><i style="width:${pct===null?100:Math.max(4,pct*100)}%;background:${cor}"></i></div><div class="small muted" style="margin-top:3px">meta ${meta===null?"—":(tipo==="menor"?"≤ ":"")+fmt(meta)+" "+un}</div></div>
        <div class="v">${fmt(v,1)}<div class="small muted" style="font-weight:400">${un}</div></div></div>`}).join("")}</div>
    <div class="card"><div class="card-h"><div><h3>Próximos prazos</h3><p class="sub">Ações em aberto, por data</p></div><button class="btn sm" onclick="location.hash='acoes'">Plano de ação</button></div>
      <table><tbody>${prox.map(a=>`<tr style="cursor:pointer" onclick="editarAcao('${a.id}')"><td><div style="font-weight:500">${esc(a.ativ)}</div><div class="small muted">${esc(a.prog)} · ${esc(userById(a.resp).nome)}</div></td><td class="num small" style="white-space:nowrap">${fmtD(a.prazo)}</td><td>${pill(status(a))}</td></tr>`).join("")}</tbody></table></div>
  </div>`:""}
  <div class="grid ${ac.length?"g2":""}" style="margin-top:16px">
    <div class="card"><div class="card-h"><div><h3 id="ucT"></h3><p class="sub">Lançamentos mensais da UC</p></div>
      <select id="ucInd" class="btn sm">${IND_LIST.map(i=>`<option value="${i[0]}">${i[1]}</option>`).join("")}</select></div><div id="ucLc"></div></div>
    ${ac.length?`<div class="card"><h3>Execução por programa</h3><p class="sub">Status das ações do plano de manejo</p>${stackRows(progs.map(p=>({l:p,c:contaSt(ac.filter(a=>a.prog===p)),w:220})))}</div>`:""}
  </div>${geoCard(s)}`;
  const draw=()=>{const id=$("#ucInd").value,ind=IND_LIST.find(i=>i[0]===id);$("#ucT").textContent=ind[1];
    $("#ucLc").innerHTML=lineChart(MES,MES.map((_,i)=>i<FECHADOS?num(S.lanc[s][id][i]):null),{unit:ind[2]})};
  $("#ucInd").onchange=draw;draw();
  geoMount(s);
}

// ---------- VIEW: lançamento ----------
let mesLanc=null;
function vLancar(){
  const s=ucAtual();
  if(!s){title("Lançamento mensal","Selecione uma UC no seletor acima");$("#view").innerHTML=`<div class="card"><h3>Escolha a unidade</h3><p class="sub">Como administrador(a), você pode lançar ou revisar os dados de qualquer UC.</p><div class="grid g4">${UCS.map(u=>`<div class="uc-tile" onclick="S.uc='${u.s}';save();route()"><b>${u.s}</b>${u.piloto?'<span class="tag-p">PILOTO</span>':""}<div class="meta">${esc(u.n)}</div><div class="prog"><i style="width:${completude(u.s,FECHADOS-1)*100}%"></i></div></div>`).join("")}</div></div>`;return}
  if(mesLanc===null)mesLanc=Math.max(0,FECHADOS-1);
  const u=ucObj(s),d=S.lanc[s],enviado=S.enviados[s].includes(mesLanc);
  title(`Lançamento mensal — ${u.s}`,`${esc(u.n)} · ${MESL[mesLanc]} de ${ANO}`);
  $("#view").innerHTML=`
  <div class="filters"><div class="seg">${MES.map((m,i)=>`<button class="${i===mesLanc?"on":""}" ${i>FECHADOS?"disabled style='opacity:.4'":""} data-m="${i}">${m}${S.enviados[s].includes(i)?" ✓":""}</button>`).join("")}</div>
    <span style="flex:1"></span>${enviado?'<span class="pill st-conc"><i></i>Enviado à GGUC</span>':'<span class="pill st-venc"><i></i>Não enviado</span>'}</div>
  <div class="grid g21">
    <div class="card"><div class="card-h"><div><h3>Indicadores comuns</h3><p class="sub">0 = verificado e sem ocorrência · vazio = não informado · N/A = não se aplica</p></div><span id="cpl" class="pill"></span></div>
      <div class="form-grid">${COMUNS.map(([p,inds])=>`<div class="f-sec">${p}</div>`+inds.map(([id,nm,un,rg])=>`<div class="f-row"><label>${nm}<small>${un}${rg==="Último"?" · estoque, não soma":""}</small></label>
        <input data-id="${id}" value="${esc(d[id][mesLanc])}" inputmode="decimal" placeholder="—"><div class="qb"><button class="btn sm" data-z="${id}">0</button><button class="btn sm" data-na="${id}">N/A</button></div></div>`).join("")).join("")}</div>
      <div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end"><button class="btn" id="bSalvar">Salvar rascunho</button><button class="btn primary" id="bEnviar">Enviar lançamento de ${MESL[mesLanc]}</button></div></div>
    <div>
      <div class="card"><h3>Calculados automaticamente</h3><p class="sub">Não precisam ser digitados</p><div id="autos"></div></div>
      ${ESPECIFICOS[s]?`<div class="card" style="margin-top:16px"><h3>Indicadores específicos do plano de manejo</h3><p class="sub">Valor acumulado no ano · atualize quando houver mudança</p>
        ${ESPECIFICOS[s].map(([id,nm,un,meta,_,tipo,src])=>`<div class="f-row" style="grid-template-columns:1fr 110px"><label>${esc(nm)}<small>${un} · meta ${meta===null?"—":(tipo==="menor"?"≤ ":"")+fmt(meta)} · ${esc(src)}</small></label><input data-esp="${id}" value="${String(S.espec[id]).replace('.',',')}" inputmode="decimal"></div>`).join("")}</div>`
      :`<div class="card" style="margin-top:16px"><h3>Indicadores específicos</h3><p class="sub" style="margin:0">Serão exibidos aqui quando o plano de manejo desta UC for cadastrado.</p></div>`}
    </div>
  </div>`;
  const upd=()=>{
    const f=IND_LIST.filter(([id])=>d[id][mesLanc]!=="").length;$("#cpl").textContent=`${f}/${IND_LIST.length} preenchidos`;
    const v=num(d.vis[mesLanc]),e=num(d.pev[mesLanc]),a=num(d.aci[mesLanc]);
    $("#autos").innerHTML=`<div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Público total atingido<div class="src">visitantes + público dos eventos</div></div><div class="v">${v===null&&e===null?"—":fmt((v||0)+(e||0))}</div></div>
     <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Acidentes por mil visitas</div><div class="v">${v&&a!==null?fmt(a/v*1000,2):"—"}</div></div>
     <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Ocorrências de pressão no mês</div><div class="v">${fmt(PRESSAO.reduce((t,id)=>t+(num(d[id][mesLanc])||0),0))}</div></div>`;
  };
  const set=(id,val)=>{const inp=document.querySelector(`[data-id="${id}"]`);const p=val.trim();const ok=p===""||/^n\/?a$/i.test(p)||(num(p)!==null&&num(p)>=0);
    inp.className=/^n\/?a$/i.test(p)?"na":ok?"":"bad";d[id][mesLanc]=/^n\/?a$/i.test(p)?"N/A":p===""?"":(num(p)??p);upd()};
  document.querySelectorAll("[data-id]").forEach(i=>{i.oninput=()=>set(i.dataset.id,i.value);if(i.value==="N/A")i.className="na"});
  document.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>{const i=document.querySelector(`[data-id="${b.dataset.z}"]`);i.value="0";set(b.dataset.z,"0")});
  document.querySelectorAll("[data-na]").forEach(b=>b.onclick=()=>{const i=document.querySelector(`[data-id="${b.dataset.na}"]`);i.value="N/A";set(b.dataset.na,"N/A")});
  document.querySelectorAll("[data-esp]").forEach(i=>i.oninput=()=>{const n=num(i.value);if(n!==null){S.espec[i.dataset.esp]=n;save()}});
  document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{mesLanc=+b.dataset.m;vLancar()});
  $("#bSalvar").onclick=()=>{save();toast("Rascunho salvo")};
  $("#bEnviar").onclick=()=>{
    if(document.querySelector(".f-row input.bad")){toast("Corrija os campos em vermelho");return}
    const f=IND_LIST.filter(([id])=>d[id][mesLanc]!=="").length;
    if(!S.enviados[s].includes(mesLanc))S.enviados[s].push(mesLanc);
    S.log.unshift({quando:new Date().toISOString(),para:"gguc@exemplo.org",assunto:`[SisGAP-ES] ${s} enviou o lançamento de ${MESL[mesLanc]} (${f}/${IND_LIST.length})`,tipo:"Confirmação"});
    save();toast(`Lançamento de ${MESL[mesLanc]} enviado · confirmação por e-mail para a GGUC`);vLancar();
  };
  upd();
}

// ---------- VIEW: plano de ação ----------
let FA={prog:"",st:"",resp:"",q:""};
function vAcoes(){
  const s=ucAtual();
  title("Plano de ação",s?`${s} — ${ucObj(s).n}`:"Ações dos planos de manejo das UCs piloto");
  let list=acoesDe(s);
  const progs=[...new Set(list.map(a=>a.prog))], resps=[...new Set(list.map(a=>a.resp))];
  const L=list.filter(a=>(!FA.prog||a.prog===FA.prog)&&(!FA.st||status(a)===FA.st)&&(!FA.resp||a.resp===FA.resp)&&(!FA.q||(a.ativ+a.meta+a.ind).toLowerCase().includes(FA.q.toLowerCase())))
    .sort((a,b)=>a.prazo.localeCompare(b.prazo));
  const c=contaSt(list);
  if(s&&!list.length){$("#view").innerHTML=`<div class="note"><b>${s} ainda não tem plano de ação cadastrado.</b> No sistema real, a GGUC importa as ações do plano de manejo desta UC. Use o seletor para ver uma das UCs piloto: APAGO, ARIEMV, PEFG ou PEI.</div>`;return}
  $("#view").innerHTML=`
  <div class="grid g4" style="grid-template-columns:repeat(5,1fr);margin-bottom:16px">${ST_ORDER.map(k=>`<div class="card kpi" style="cursor:pointer;${FA.st===k?"outline:2px solid "+ST_COLOR[k]:""}" onclick="FA.st=FA.st==='${k}'?'':'${k}';vAcoes()"><div class="lbl">${pill(k)}</div><div class="val">${c[k]}</div></div>`).join("")}</div>
  <div class="filters">
    <input id="fq" placeholder="Buscar ação, meta ou indicador" value="${esc(FA.q)}" style="width:280px">
    <select id="fp"><option value="">Todos os programas</option>${progs.map(p=>`<option ${FA.prog===p?"selected":""}>${esc(p)}</option>`).join("")}</select>
    <select id="fr"><option value="">Todos os responsáveis</option>${resps.map(r=>`<option value="${r}" ${FA.resp===r?"selected":""}>${esc(userById(r).nome)}</option>`).join("")}</select>
    ${FA.prog||FA.st||FA.resp||FA.q?`<button class="btn sm" onclick="FA={prog:'',st:'',resp:'',q:''};vAcoes()">Limpar filtros</button>`:""}
    <span style="flex:1"></span><span class="small muted">${L.length} ações</span>
    ${s&&(isAdmin()||user().papel==="gestor")?`<button class="btn primary" onclick="editarAcao(null)">+ Nova ação</button>`:""}
  </div>
  <div class="card" style="padding:0"><div class="tbl-wrap" style="border:0;max-height:calc(100vh - 330px)"><table><thead><tr>${s?"":"<th>UC</th>"}<th style="width:38%">Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th><th style="width:110px">Progresso</th><th>Fonte</th></tr></thead><tbody>
  ${L.map(a=>{const st=status(a),n=dias(a.prazo);return `<tr style="cursor:pointer" onclick="editarAcao('${a.id}')">${s?"":`<td><b>${a.uc}</b></td>`}
    <td><div style="font-weight:500">${esc(a.ativ)}</div><div class="small muted">${esc(a.prog)} · Meta: ${esc(a.meta)}</div></td>
    <td class="small">${esc(userById(a.resp).nome)}</td>
    <td class="small" style="white-space:nowrap">${fmtD(a.prazo)}<div class="muted">${st==="conc"?"":n<0?`${-n} dias de atraso`:n===0?"hoje":`em ${n} dias`}</div></td>
    <td>${pill(st)}</td><td><div class="prog"><i style="width:${a.pct}%;background:${ST_COLOR[st]}"></i></div><div class="small muted" style="margin-top:3px">${a.pct}%</div></td>
    <td class="small muted">${esc(a.fonte)}</td></tr>`}).join("")}
  </tbody></table></div></div>`;
  $("#fq").oninput=e=>{FA.q=e.target.value;clearTimeout(window._fq);window._fq=setTimeout(()=>{vAcoes();const i=$("#fq");i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $("#fp").onchange=e=>{FA.prog=e.target.value;vAcoes()};
  $("#fr").onchange=e=>{FA.resp=e.target.value;vAcoes()};
}
function editarAcao(id){
  const nova=!id, s=ucAtual();
  const a=nova?{id:"a"+Date.now(),uc:s,prog:"",ativ:"",meta:"",ind:"",prazo:new Date(HOJE.getTime()+90*864e5).toISOString().slice(0,10),resp:(USERS.find(u=>u.uc===s&&u.papel==="gestor")||USERS[0]).id,st:"nao",pct:0,fonte:"Incluída pela UC",obs:"",hist:[]}:S.acoes.find(x=>x.id===id);
  const pode=isAdmin()||user().uc===a.uc, podeAtrib=isAdmin()||user().papel==="gestor";
  const equipe=USERS.filter(u=>u.uc===a.uc||u.papel==="admin");
  const st=status(a);
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div class="small muted">${a.uc} · ${nova?"nova ação":esc(a.fonte)}</div><h2>${nova?"Nova ação":esc(a.ativ)}</h2></div><button class="btn sm" id="dX">✕</button></div>
    ${nova?"":`<div style="margin:8px 0">${pill(st)}</div>`}
    ${nova?`<div class="fld"><label>Ação</label><input id="eAtiv"></div><div class="fld"><label>Programa</label><input id="eProg" list="progs"><datalist id="progs">${[...new Set(acoesDe(a.uc).map(x=>x.prog))].map(p=>`<option>${esc(p)}</option>`).join("")}</datalist></div>
      <div class="fld"><label>Meta</label><input id="eMeta"></div><div class="fld"><label>Indicador</label><input id="eInd"></div>`
     :`<div class="fld"><label>Programa</label><div class="ro">${esc(a.prog)}</div></div><div class="fld"><label>Meta (plano de manejo)</label><div class="ro">${esc(a.meta)}</div></div><div class="fld"><label>Indicador de verificação</label><div class="ro">${esc(a.ind)}</div></div>`}
    <div class="grid g2" style="gap:12px">
      <div class="fld"><label>Responsável</label><select id="eResp" ${podeAtrib?"":"disabled"}>${equipe.map(u=>`<option value="${u.id}" ${u.id===a.resp?"selected":""}>${esc(u.nome)}</option>`).join("")}</select></div>
      <div class="fld"><label>Prazo</label><input type="date" id="ePrazo" value="${a.prazo}" ${podeAtrib?"":"disabled"}></div>
      <div class="fld"><label>Situação</label><select id="eSt" ${pode?"":"disabled"}>${["nao","and","conc"].map(k=>`<option value="${k}" ${a.st===k?"selected":""}>${ST[k]}</option>`).join("")}</select></div>
      <div class="fld"><label>Progresso: <span id="ePv">${a.pct}%</span></label><input type="range" id="ePct" min="0" max="100" step="5" value="${a.pct}" ${pode?"":"disabled"} style="padding:0"></div>
    </div>
    <div class="fld"><label>Evidência / comentário</label><textarea id="eObs" placeholder="Ex.: link da ata no E-Docs, nº do processo, fotos…">${esc(a.obs)}</textarea></div>
    ${a.hist.length?`<div class="fld"><label>Histórico</label>${a.hist.slice(0,6).map(h=>`<div class="small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">${new Date(h.q).toLocaleString("pt-BR")}</span> · ${esc(h.t)}</div>`).join("")}</div>`:""}
    <div id="evidBox"></div>
    <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
      ${pode?`<button class="btn primary" id="eSave">Salvar</button>`:""}
      ${!nova?`<button class="btn" id="eMail">✉ Lembrar responsável por e-mail</button>`:""}
    </div>
    <p class="small muted" style="margin-top:14px">Ao mudar o responsável ou o prazo, o sistema avisa o novo responsável por e-mail.</p>
  </div></div>`;
  const close=()=>{if(typeof _miniMap!=="undefined"&&_miniMap){_miniMap.remove();_miniMap=null}_pendente=null;$("#drawerRoot").innerHTML=""};
  $("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  $("#ePct").oninput=e=>$("#ePv").textContent=e.target.value+"%";
  geoEvid(a);
  if($("#eSave"))$("#eSave").onclick=()=>{
    if(nova){a.ativ=$("#eAtiv").value.trim();a.prog=$("#eProg").value.trim()||"Outras ações";a.meta=$("#eMeta").value;a.ind=$("#eInd").value;if(!a.ativ){toast("Descreva a ação");return}}
    const mud=[];const nr=$("#eResp").value,np=$("#ePrazo").value,ns=$("#eSt").value,npc=+$("#ePct").value;
    if(nr!==a.resp)mud.push("responsável → "+userById(nr).nome); if(np!==a.prazo)mud.push("prazo → "+fmtD(np));
    if(ns!==a.st)mud.push("situação → "+ST[ns]); if(npc!==a.pct)mud.push("progresso → "+npc+"%");
    const notificar=nova||nr!==a.resp||np!==a.prazo;
    Object.assign(a,{resp:nr,prazo:np,st:ns,pct:ns==="conc"?100:npc,obs:$("#eObs").value});
    a.hist.unshift({q:new Date().toISOString(),t:(nova?"Ação criada":mud.join("; ")||"Comentário atualizado")+" por "+user().nome});
    if(nova)S.acoes.push(a);
    if(notificar)S.log.unshift({quando:new Date().toISOString(),para:userById(nr).email,assunto:`[SisGAP-ES] ${a.uc}: você é responsável por “${a.ativ}” — prazo ${fmtD(np)}`,tipo:"Atribuição"});
    save();close();toast(notificar?"Salvo · responsável avisado por e-mail":"Salvo");route();
  };
  if($("#eMail"))$("#eMail").onclick=()=>{S.log.unshift({quando:new Date().toISOString(),para:userById(a.resp).email,assunto:`[SisGAP-ES] Lembrete: “${a.ativ}” — prazo ${fmtD(a.prazo)}`,tipo:"Lembrete manual"});save();toast("Lembrete enviado (simulado) para "+userById(a.resp).email)};
}

// ---------- VIEW: alertas ----------
let tabAl="saida", selAl=0;
function vAlertas(){
  title("Alertas e e-mails","Avisos automáticos de prazos, atrasos e lançamentos pendentes");
  const al=alertasVisiveis();
  // agrupa por destinatário
  const grupos={};al.forEach(a=>{const k=a.para.email;(grupos[k]=grupos[k]||{para:a.para,itens:[]}).itens.push(a)});
  const G=Object.values(grupos).sort((a,b)=>b.itens.length-a.itens.length);
  if(selAl>=G.length)selAl=0;
  $("#view").innerHTML=`
  <div class="tabs"><button data-t="saida" class="${tabAl==="saida"?"on":""}">Caixa de saída de hoje (${G.length})</button><button data-t="regras" class="${tabAl==="regras"?"on":""}">Regras de envio</button><button data-t="hist" class="${tabAl==="hist"?"on":""}">Histórico (${S.log.length})</button></div>
  <div id="tabc"></div>`;
  document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{tabAl=b.dataset.t;vAlertas()});
  const T=$("#tabc");
  if(tabAl==="saida"){
    if(!G.length){T.innerHTML=`<div class="card"><p class="muted">Nenhum alerta para hoje.</p></div>`;return}
    const g=G[selAl];
    T.innerHTML=`<div class="grid" style="grid-template-columns:340px 1fr">
      <div class="card" style="padding:8px">${G.map((x,i)=>`<div onclick="selAl=${i};vAlertas()" style="padding:10px;border-radius:8px;cursor:pointer;${i===selAl?"background:var(--brand-soft)":""}">
        <div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(x.para.nome)}</b><span class="pill">${x.itens.length}</span></div>
        <div class="small muted">${esc(x.para.email)}</div>
        <div class="small" style="margin-top:4px">${[...new Set(x.itens.map(i=>({atr:"atrasadas",d15:"prazo próximo",d7:"prazo próximo",d1:"prazo amanhã",lanc:"lançamento pendente"})[i.tipo]))].join(" · ")}</div></div>`).join("")}</div>
      <div><div class="mail">${emailHTML(g)}</div>
        <div style="display:flex;gap:10px;margin-top:12px;align-items:center"><button class="btn primary" id="envUm">Enviar este e-mail agora</button><button class="btn" id="envTodos">Enviar todos (${G.length})</button>
        <span class="small muted">Simulação: nada é enviado de verdade.</span></div></div></div>`;
    const reg=(x)=>S.log.unshift({quando:new Date().toISOString(),para:x.para.email,assunto:assunto(x),tipo:"Alerta automático"});
    $("#envUm").onclick=()=>{reg(g);save();toast("E-mail registrado para "+g.para.email);};
    $("#envTodos").onclick=()=>{G.forEach(reg);save();toast(G.length+" e-mails registrados no histórico")};
  }
  if(tabAl==="regras"){
    T.innerHTML=`<div class="grid g21"><div class="card"><h3>Quando enviar</h3><p class="sub">${isAdmin()?"Regras válidas para todas as UCs":"Somente a GGUC altera as regras"}</p>
      ${S.regras.map(r=>`<div class="switch"><div class="t"><b>${r.t}</b><span>${r.d}</span></div><button class="tg ${r.on?"on":""}" data-r="${r.id}" ${isAdmin()?"":"disabled"}></button></div>`).join("")}</div>
      <div class="card"><h3>Como funciona no sistema real</h3><div class="small" style="line-height:1.6;color:var(--ink-2)">
      <p>Todo dia às 7h, um gatilho automático verifica os prazos e os lançamentos e envia os e-mails pelo Gmail institucional.</p>
      <p><b>Destinatários:</b> o responsável pela ação; a partir de 7 dias, cópia para o(a) gestor(a) da UC; atrasos e resumo mensal, cópia para a GGUC.</p>
      <p><b>Um e-mail por pessoa por dia</b>, agrupando todos os avisos, para não lotar a caixa de entrada.</p>
      <p>Cada e-mail traz um link direto para a ação no SisGAP-ES.</p></div></div></div>`;
    document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{const r=S.regras.find(x=>x.id===b.dataset.r);r.on=!r.on;save();vAlertas();renderNav()});
  }
  if(tabAl==="hist"){
    T.innerHTML=`<div class="card" style="padding:0">${S.log.length?`<div class="tbl-wrap" style="border:0"><table><thead><tr><th>Quando</th><th>Tipo</th><th>Para</th><th>Assunto</th></tr></thead><tbody>
      ${S.log.map(l=>`<tr><td class="small" style="white-space:nowrap">${new Date(l.quando).toLocaleString("pt-BR")}</td><td><span class="pill">${esc(l.tipo)}</span></td><td class="small">${esc(l.para)}</td><td>${esc(l.assunto)}</td></tr>`).join("")}
      </tbody></table></div>`:`<p class="muted" style="padding:16px">Nenhum e-mail enviado ainda. Envie um alerta, mude o responsável de uma ação ou envie um lançamento.</p>`}</div>`;
  }
}
function assunto(g){const n=g.itens.length,at=g.itens.filter(i=>i.tipo==="atr").length;return `[SisGAP-ES] ${n} aviso${n>1?"s":""}${at?` · ${at} ação(ões) atrasada(s)`:""} — ${[...new Set(g.itens.map(i=>i.uc))].join(", ")}`}
function emailHTML(g){
  const gest=[...new Set(g.itens.map(i=>i.uc))].map(uc=>USERS.find(u=>u.uc===uc&&u.papel==="gestor")).filter(x=>x&&x.email!==g.para.email).map(x=>x.email);
  const cc=[...gest];if(g.itens.some(i=>i.tipo==="atr"))cc.push("gguc@exemplo.org");
  const acoes=g.itens.filter(i=>i.acao), lanc=g.itens.filter(i=>i.tipo==="lanc");
  return `<div class="hd"><b>De</b> SisGAP-ES &lt;sisgap@exemplo.org&gt;<br><b>Para</b> ${esc(g.para.nome)} &lt;${esc(g.para.email)}&gt;${cc.length?`<br><b>Cc</b> ${cc.join(", ")}`:""}<br><b>Assunto</b> <span style="font-weight:600">${esc(assunto(g))}</span></div>
  <div class="bd"><div class="banner">SisGAP-ES · Avisos do dia ${HOJE.toLocaleDateString("pt-BR")}</div>
  <p>Olá, ${esc(g.para.nome.split(" ")[0])}.</p>
  ${acoes.length?`<p>Você tem <b>${acoes.length}</b> ${acoes.length>1?"ações":"ação"} do plano de manejo que ${acoes.length>1?"precisam":"precisa"} de atenção:</p>
  <table style="border:1px solid var(--line);border-radius:8px"><thead><tr><th>UC</th><th>Ação</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>
  ${acoes.map(i=>`<tr><td><b>${i.uc}</b></td><td>${esc(i.acao.ativ)}</td><td style="white-space:nowrap">${fmtD(i.acao.prazo)}</td><td>${pill(status(i.acao))}<div class="small muted">${i.txt}</div></td></tr>`).join("")}</tbody></table>`:""}
  ${lanc.length?`<p>${lanc.map(l=>`<b>${l.uc}</b>: ${l.txt}.`).join("<br>")} O prazo era o 5º dia útil do mês.</p>`:""}
  <p><a href="#" onclick="return false" class="btn primary sm" style="text-decoration:none;display:inline-block">Abrir no SisGAP-ES</a></p>
  <p class="small muted">Você recebe este e-mail porque é responsável por ações ou lançamentos no SisGAP-ES. Os avisos são agrupados em um e-mail por dia.</p></div>`;
}

// ---------- VIEW: catálogo ----------
let tabInd="comuns";
function vIndicadores(){
  title("Catálogo de indicadores","Indicadores comuns às 19 UCs e específicos de cada plano de manejo");
  $("#view").innerHTML=`<div class="tabs"><button data-t="comuns" class="${tabInd==="comuns"?"on":""}">Comuns (${IND_LIST.length + 2})</button>${Object.keys(ESPECIFICOS).map(k=>`<button data-t="${k}" class="${tabInd===k?"on":""}">${k} (${ESPECIFICOS[k].length})</button>`).join("")}</div><div id="tc"></div>`;
  document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{tabInd=b.dataset.t;vIndicadores()});
  if(tabInd==="comuns"){
    $("#tc").innerHTML=`<div class="card" style="padding:0"><div class="tbl-wrap" style="border:0"><table><thead><tr><th>Programa</th><th>Indicador</th><th>Unidade</th><th>Regra anual</th><th>Entrada</th></tr></thead><tbody>
    ${COMUNS.map(([p,inds])=>inds.map(([id,nm,un,rg])=>`<tr><td class="small muted">${p}</td><td><b>${nm}</b></td><td class="small">${un}</td><td class="small">${rg==="Último"?"Último valor (estoque)":"Soma dos meses"}</td><td><span class="pill">Manual</span></td></tr>`).join("")).join("")}
    <tr><td class="small muted">Educação ambiental e relação com o entorno</td><td><b>Público total atingido</b></td><td class="small">registros de público</td><td class="small">Visitantes + público dos eventos</td><td><span class="pill st-conc"><i></i>Automático</span></td></tr>
    <tr><td class="small muted">Educação ambiental e relação com o entorno</td><td><b>Acidentes por mil visitas</b></td><td class="small">acidentes/1.000 visitas</td><td class="small">Razão</td><td><span class="pill st-conc"><i></i>Automático</span></td></tr>
    </tbody></table></div></div><p class="small muted" style="margin-top:10px">Base: planilha “Indicadores de Gestão GGUC 2027”. PVUC fica de fora até a GGUC definir a unidade de medida.</p>`;
  }else{
    const pl=PLANOS[tabInd];
    $("#tc").innerHTML=`<div class="info" style="margin-bottom:14px"><b>${esc(pl.doc)}</b><br>${esc(pl.obs)}</div>
    <div class="card" style="padding:0"><div class="tbl-wrap" style="border:0"><table><thead><tr><th>Indicador</th><th>Unidade</th><th class="num">Meta</th><th class="num">Atual (simulado)</th><th>Fonte no plano</th></tr></thead><tbody>
    ${ESPECIFICOS[tabInd].map(([id,nm,un,meta,_,tipo,src])=>`<tr><td><b>${esc(nm)}</b></td><td class="small">${un}</td><td class="num">${meta===null?"—":(tipo==="menor"?"≤ ":"")+fmt(meta)}</td><td class="num">${fmt(S.espec[id],1)}</td><td class="small muted">${esc(src)}</td></tr>`).join("")}
    </tbody></table></div></div>`;
  }
}

// ---------- VIEW: usuários ----------
function vUsuarios(){
  title("Usuários e papéis","Quem acessa o quê · login com conta Google");
  const pap={admin:"Administrador(a) GGUC",gestor:"Gestor(a) da UC",tecnico:"Técnico(a) / equipe"};
  $("#view").innerHTML=`<div class="grid g21">
  <div class="card" style="padding:0"><div class="tbl-wrap" style="border:0"><table><thead><tr><th>Nome</th><th>E-mail (conta Google)</th><th>Cargo</th><th>Permissão</th><th>UC</th><th class="num">Ações</th><th class="num">Atrasadas</th></tr></thead><tbody>
  ${USERS.map(u=>{const a=S.acoes.filter(x=>x.resp===u.id),at=a.filter(x=>status(x)==="atr").length;return `<tr><td><b>${esc(u.nome)}</b></td><td class="small">${u.email}</td><td class="small">${esc(cargoDe(u))}</td><td><span class="pill">${pap[u.papel]}</span></td><td>${u.uc||"Todas"}</td><td class="num">${a.length}</td><td class="num">${at?`<b style="color:#9b2424">${at}</b>`:"0"}</td></tr>`}).join("")}
  </tbody></table></div><div style="padding:12px 16px"><button class="btn" onclick="toast('No sistema real: cadastro por e-mail, com papel e UC')">+ Convidar usuário</button></div></div>
  <div class="card"><h3>Permissões por papel</h3><p class="sub">Proposta para validação</p><table><thead><tr><th></th><th>GGUC</th><th>Gestor</th><th>Técnico</th></tr></thead><tbody>
  ${[["Ver painel geral (19 UCs)",1,0,0],["Ver painel da própria UC",1,1,1],["Lançar indicadores mensais",1,1,1],["Enviar lançamento à GGUC",1,1,0],["Atribuir responsável e prazo",1,1,0],["Atualizar situação das próprias ações",1,1,1],["Cadastrar plano de manejo e ações",1,0,0],["Configurar regras de e-mail",1,0,0],["Gerenciar usuários",1,0,0]]
    .map(r=>`<tr><td class="small">${r[0]}</td>${r.slice(1).map(v=>`<td style="text-align:center">${v?'<span style="color:var(--good);font-weight:700">✓</span>':'<span class="muted">—</span>'}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
}

// ---------- start ----------
if(S.user&&user())startApp();else showLogin();
