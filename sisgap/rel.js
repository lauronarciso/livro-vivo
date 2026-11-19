// SisGAP-ES — relatório da UC: DASHBOARD colorido + ANEXO com dados brutos (impressão → "Salvar como PDF")
const CAT=["#2a78d6","#eb6834","#1baf7a","#eda100","#e87ba4","#6250d6","#008300","#e34948"];
const SC={conc:"#0ca30c",and:"#2a78d6",venc:"#eda100",atr:"#d03b3b",nao:"#b8b6ae"};
const fmtN=(n,d=0)=>n===null||n===undefined||n===""?"—":Number(n).toLocaleString("pt-BR",{maximumFractionDigits:d});

// ---------- gráficos SVG para impressão ----------
function gLine(labels,vals,{w=460,h=190,cor="#2a78d6",unit=""}={}){
  const L=40,R=10,T=14,B=24,iw=w-L-R,ih=h-T-B,mx=niceMax(Math.max(1,...vals.filter(v=>v!==null))),x=i=>L+iw*i/(labels.length-1||1),y=v=>T+ih-v/mx*ih;
  let s=`<svg viewBox="0 0 ${w} ${h}" width="100%">`;
  for(let k=0;k<=4;k++){const v=mx*k/4;s+=`<line x1="${L}" x2="${w-R}" y1="${y(v)}" y2="${y(v)}" stroke="#e6e8e3"/><text x="${L-6}" y="${y(v)+3}" font-size="9" fill="#7c877f" text-anchor="end">${fmtN(v)}</text>`}
  labels.forEach((l,i)=>s+=`<text x="${x(i)}" y="${h-8}" font-size="9" fill="#4d5a51" text-anchor="middle">${l}</text>`);
  const pts=vals.map((v,i)=>v===null?null:[x(i),y(v)]).filter(Boolean);
  if(pts.length>1)s+=`<path d="M${pts[0][0]},${T+ih} ${pts.map(p=>"L"+p[0]+","+p[1]).join(" ")} L${pts[pts.length-1][0]},${T+ih}Z" fill="${cor}" opacity=".15"/><path d="${pts.map((p,i)=>(i?"L":"M")+p[0]+","+p[1]).join(" ")}" fill="none" stroke="${cor}" stroke-width="2.2"/>`;
  pts.forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="${cor}" stroke="#fff" stroke-width="1.5"/>`);
  const imx=vals.indexOf(Math.max(...vals.filter(v=>v!==null)));if(imx>=0)s+=`<text x="${x(imx)}" y="${y(vals[imx])-7}" font-size="9.5" font-weight="700" fill="${cor}" text-anchor="middle">${fmtN(vals[imx])}</text>`;
  return s+"</svg>";
}
function gStack(labels,series,{w=460,h=190}={}){ // series: [{n,cor,v:[...]}]
  const L=34,R=8,T=12,B=24,iw=w-L-R,ih=h-T-B,tot=labels.map((_,i)=>series.reduce((t,s)=>t+(s.v[i]||0),0)),mx=niceMax(Math.max(1,...tot)),bw=iw/labels.length*.64;
  let s=`<svg viewBox="0 0 ${w} ${h}" width="100%">`;
  for(let k=0;k<=4;k++){const v=mx*k/4,yy=T+ih-v/mx*ih;s+=`<line x1="${L}" x2="${w-R}" y1="${yy}" y2="${yy}" stroke="#e6e8e3"/><text x="${L-5}" y="${yy+3}" font-size="9" fill="#7c877f" text-anchor="end">${fmtN(v)}</text>`}
  labels.forEach((l,i)=>{const cx=L+iw*(i+.5)/labels.length;let y0=T+ih;
    series.forEach(sr=>{const v=sr.v[i]||0;if(!v)return;const hh=v/mx*ih;s+=`<rect x="${cx-bw/2}" y="${y0-hh}" width="${bw}" height="${Math.max(0,hh-1)}" fill="${sr.cor}" rx="1.5"/>`;y0-=hh});
    if(tot[i])s+=`<text x="${cx}" y="${y0-3}" font-size="8.5" fill="#4d5a51" text-anchor="middle">${fmtN(tot[i])}</text>`;
    s+=`<text x="${cx}" y="${h-8}" font-size="9" fill="#4d5a51" text-anchor="middle">${l}</text>`});
  return s+"</svg>"+legenda(series.map(x=>[x.n,x.cor]));
}
function gH(items,{w=460,cor=null,lw=150,unit=""}={}){ // items [{l,v,c}]
  const rh=19,h=items.length*rh+6,mx=Math.max(1,...items.map(i=>i.v)),iw=w-lw-46;
  let s=`<svg viewBox="0 0 ${w} ${h}" width="100%">`;
  items.forEach((it,k)=>{const y=k*rh+3;s+=`<text x="${lw-6}" y="${y+12}" font-size="9.5" fill="#4d5a51" text-anchor="end">${esc(it.l)}</text><rect x="${lw}" y="${y+2}" width="${iw}" height="13" fill="#f0f2ee" rx="3"/><rect x="${lw}" y="${y+2}" width="${Math.max(it.v?2:0,it.v/mx*iw)}" height="13" fill="${it.c||cor||CAT[k%CAT.length]}" rx="3"/><text x="${lw+iw+6}" y="${y+12}" font-size="10" font-weight="700" fill="#16211a">${fmtN(it.v)}</text>`});
  return s+"</svg>";
}
function gDonut(parts,{size=170,centro="",sub=""}={}){ // parts [{n,v,cor}]
  const tot=parts.reduce((t,p)=>t+p.v,0)||1,r=size/2-8,cx=size/2,cy=size/2,rw=24;let a0=-Math.PI/2,s=`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  parts.filter(p=>p.v).forEach(p=>{const a1=a0+p.v/tot*2*Math.PI,lg=a1-a0>Math.PI?1:0,ri=r-rw;
    const P=(a,rr)=>[cx+rr*Math.cos(a),cy+rr*Math.sin(a)];const [x0,y0]=P(a0,r),[x1,y1]=P(a1-0.0001,r),[x2,y2]=P(a1-0.0001,ri),[x3,y3]=P(a0,ri);
    s+=`<path d="M${x0},${y0} A${r},${r} 0 ${lg} 1 ${x1},${y1} L${x2},${y2} A${ri},${ri} 0 ${lg} 0 ${x3},${y3}Z" fill="${p.cor}" stroke="#fff" stroke-width="2"/>`;a0=a1});
  s+=`<text x="${cx}" y="${cy+4}" font-size="22" font-weight="800" fill="#16211a" text-anchor="middle">${centro}</text><text x="${cx}" y="${cy+20}" font-size="9" fill="#7c877f" text-anchor="middle">${sub}</text>`;
  return s+"</svg>";
}
function legenda(it){return `<div class="rp-leg">${it.map(([n,c])=>`<span><i style="background:${c}"></i>${esc(n)}</span>`).join("")}</div>`}
function gBullet(nm,v,meta,tipo,un){
  const mx=Math.max(meta||0,v||0)*1.15||1,ok=meta===null?null:tipo==="menor"?v<=meta:v>=meta,cor=ok===null?"#2a78d6":ok?"#0ca30c":(tipo==="menor"?"#d03b3b":(v/meta>=.5?"#eda100":"#d03b3b"));
  return `<div class="rp-bul"><div class="rp-bul-n">${esc(nm)}</div><svg viewBox="0 0 300 16" width="100%" style="max-height:15px"><rect x="0" y="3" width="300" height="10" rx="5" fill="#eef0ec"/><rect x="0" y="3" width="${Math.max(3,(v||0)/mx*300)}" height="10" rx="5" fill="${cor}"/>${meta!==null?`<line x1="${meta/mx*300}" x2="${meta/mx*300}" y1="0" y2="16" stroke="#16211a" stroke-width="2"/>`:""}</svg>
    <div class="rp-bul-v"><b style="color:${cor}">${fmtN(v,1)}</b> ${un} <span>${meta===null?"sem meta":"meta "+(tipo==="menor"?"≤ ":"")+fmtN(meta)}</span></div></div>`;
}
function gMapa(uc,{w=520,h=380}={}){
  const f=limiteDe(uc);if(!f)return "";const b=bbox(f.geometry),k=Math.cos((b[1]+b[3])/2*Math.PI/180),sx=(b[2]-b[0])*k,sy=b[3]-b[1],sc=Math.min((w-20)/sx,(h-20)/sy),ox=(w-sx*sc)/2,oy=(h-sy*sc)/2;
  const P=([lon,lat])=>[(ox+(lon-b[0])*k*sc).toFixed(1),(oy+(b[3]-lat)*sc).toFixed(1)];
  const path=g=>(g.type==="Polygon"?[g.coordinates]:g.coordinates).map(pl=>pl.map(r=>"M"+r.map(c=>P(c).join(",")).join("L")+"Z").join("")).join("");
  let s=`<svg viewBox="0 0 ${w} ${h}" width="100%"><rect width="${w}" height="${h}" fill="#f3f6f1" rx="8"/>`;
  if(typeof CAR!=="undefined")CAR.imoveis.features.filter(x=>x.properties.uc===uc).forEach(x=>s+=`<path d="${path(x.geometry)}" fill="${condInfo(x.properties.cond)[2]}" fill-opacity=".55" stroke="#fff" stroke-width=".6"/>`);
  s+=`<path d="${path(f.geometry)}" fill="none" stroke="#1f5c3f" stroke-width="2.4"/>`;
  (S.evid||[]).filter(e=>e.uc===uc&&e.lat!==null).forEach(e=>{const a=S.acoes.find(x=>x.id===e.acao);if(!a)return;const [x,y]=P([e.lon,e.lat]);s+=`<circle cx="${x}" cy="${y}" r="4.5" fill="${SC[status(a)]}" stroke="#fff" stroke-width="1.5"/>`});
  (S.reg||[]).filter(r=>r.uc===uc&&r.lat!==null).forEach(r=>{const [x,y]=P([r.lon,r.lat]);const c=PRESSAO.includes(r.ind)||r.ind==="inc"?"#e34948":"#6250d6";s+=`<rect x="${x-4}" y="${y-4}" width="8" height="8" transform="rotate(45 ${x} ${y})" fill="${c}" stroke="#fff" stroke-width="1.2"/>`});
  // escala aproximada
  const km=niceMax(sx*111/4)/1, px=km/111*sc;s+=`<line x1="14" x2="${14+px}" y1="${h-14}" y2="${h-14}" stroke="#16211a" stroke-width="2"/><text x="14" y="${h-19}" font-size="9" fill="#16211a">${fmtN(km,1)} km</text><text x="${w-14}" y="22" font-size="13" font-weight="700" text-anchor="end" fill="#16211a">N ↑</text>`;
  return s+"</svg>";
}

// ---------- relatório ----------
function relatorioUC(uc){
  const u=ucObj(uc), m=Math.max(1,FECHADOS), MS=MES.slice(0,m), hoje=new Date().toLocaleDateString("pt-BR");
  const L=S.lanc[uc], nv=(id,i)=>num(L[id][i]), serie=id=>MS.map((_,i)=>nv(id,i)||0);
  const ac=acoesDe(uc), c=contaSt(ac), progs=[...new Set(ac.map(a=>a.prog))];
  const r=(typeof CAR!=="undefined")&&CAR.resumo[uc], sp=(typeof especiesUC==="function")?especiesUC(uc):[];
  const regs=(S.reg||[]).filter(x=>x.uc===uc&&anoDe(x.data)===ANO).sort((a,b)=>a.data.localeCompare(b.data));
  const nAnex=regs.reduce((t,x)=>t+x.anexos.length,0)+(S.evid||[]).filter(e=>e.uc===uc&&e.thumb).length;
  const cp=Math.round(Array.from({length:m},(_,i)=>completude(uc,i)).reduce((a,b)=>a+b,0)/m*100);
  const evidPct=(()=>{let tot=0,ev=0;IND_LIST.forEach(([id])=>{for(let i=0;i<m;i++){if(L[id][i]!==""){tot++;const sr=typeof srcOf==="function"?srcOf(uc,id,i):"";if(sr==="reg"||sr==="flag")ev++}}});return tot?Math.round(ev/tot*100):0})();
  const pres=PRESSAO.reduce((a,id)=>a+soma(uc,id,0,m),0), vis=soma(uc,"vis",0,m), pub=vis+soma(uc,"pev",0,m);
  const procs=r?CAR.imoveis.features.filter(f=>f.properties.uc===uc).map(f=>({f,p:procDe(uc,f.properties.cod)})).filter(x=>x.p):[];
  const kpi=(cor,val,lb,sub="")=>`<div class="rp-k" style="background:${cor}"><b>${val}</b><span>${lb}</span>${sub?`<em>${sub}</em>`:""}</div>`;
  const card=(cor,t,body,cls="")=>`<div class="rp-c ${cls}"><div class="rp-ch" style="border-color:${cor}"><span style="background:${cor}"></span>${t}</div>${body}</div>`;
  const nomeInd=id=>IND_LIST.find(x=>x[0]===id)[1];
  const pg1=`
  <section class="rp-page">
   <div class="rp-banner"><img src="iema-branco.png" alt="IEMA"><div><div class="rp-sis">SisGAP-ES · Painel de gestão da unidade de conservação</div><h1>${esc(u.n)}</h1>
     <div class="rp-sub">${u.s} · ${u.cat} · ${u.g==="PI"?"Proteção Integral":"Uso Sustentável"} · Período: jan–${MS[m-1].toLowerCase()} ${ANO} · Emitido em ${hoje} por ${esc(user().nome)}</div></div>
     <div class="rp-tag">VERSÃO DE TESTE<br><small>dados simulados</small></div></div>
   <div class="rp-kpis">
     ${kpi("#1f5c3f",cp+"%","completude dos lançamentos",`${evidPct}% dos valores com evidência`)}
     ${kpi("#2a78d6",uc==="APAPM"?"N/A":fmtN(vis),"visitas no ano",`público total ${fmtN(pub)}`)}
     ${kpi("#e34948",fmtN(pres),"ocorrências de pressão",`${fmtN(soma(uc,"inc",0,m))} incêndios combatidos`)}
     ${kpi("#6250d6",fmtN(soma(uc,"fis",0,m)),"ações de fiscalização",`${fmtN(soma(uc,"aut",0,m))} autuações`)}
     ${kpi("#0ca30c",ac.length?`${c.conc}/${ac.length}`:"—","ações do PM concluídas",ac.length?`${c.atr} atrasadas · ${c.and} em andamento`:"plano não cadastrado")}
     ${kpi("#eda100",fmtN(regs.length),"registros com evidência",`${fmtN(nAnex)} fotos e documentos`)}
     ${r?kpi("#eb6834",fmtN(r.pct_uc,1)+"%","da UC declarada no CAR",`${r.n_relevante} imóveis · ${procs.length} processos`):""}
     ${sp.length?kpi("#008300",fmtN(sp.length),"espécies registradas",`${sp.filter(ehAmea).length} ameaçadas`):""}
   </div>
   <div class="rp-g3">
     ${card("#2a78d6","Visitação mensal",gLine(MS,MS.map((_,i)=>nv("vis",i)),{cor:"#2a78d6"}))}
     ${card("#6250d6","Atividades de gestão por mês",gStack(MS,[{n:"Fiscalização",cor:"#6250d6",v:serie("fis")},{n:"Monitoramento",cor:"#1baf7a",v:serie("mon")},{n:"Eventos",cor:"#eda100",v:serie("eve")},{n:"Reuniões do conselho",cor:"#2a78d6",v:serie("reu")},{n:"Mídias",cor:"#e87ba4",v:serie("mid")}]))}
     ${card("#e34948","Pressões registradas por mês",gStack(MS,PRESSAO.map((id,k)=>({n:nomeInd(id).replace(/ \(.*/,""),cor:["#e34948","#eb6834","#eda100","#6250d6","#7c877f"][k],v:serie(id)}))))}
   </div>
   <div class="rp-g3">
     ${card("#eb6834","Pressões no ano, por tipo",gH(PRESSAO.map((id,k)=>({l:["Caça / pesca / captura","Uso irregular do fogo","Supressão de vegetação","Atividade irregular","Animal doméstico"][k],v:soma(uc,id,0,m),c:["#e34948","#eb6834","#eda100","#6250d6","#7c877f"][k]})),{lw:140}))}
     ${card("#1baf7a","Biodiversidade e manejo no ano",gH(["mon","mfa","exo","atr"].map((id,k)=>({l:["Ações de monitoramento","Manejo de fauna","Controle de exóticas","Fauna atropelada"][k],v:soma(uc,id,0,m),c:["#1baf7a","#2a78d6","#eda100","#e34948"][k]})),{lw:140}))}
     ${card("#1f5c3f","Completude e evidência por mês",gStack(MS,[{n:"com evidência",cor:"#1f5c3f",v:MS.map((_,i)=>IND_LIST.filter(([id])=>L[id][i]!==""&&["reg","flag"].includes(typeof srcOf==="function"?srcOf(uc,id,i):"")).length)},{n:"sem evidência",cor:"#eda100",v:MS.map((_,i)=>IND_LIST.filter(([id])=>L[id][i]!==""&&!["reg","flag"].includes(typeof srcOf==="function"?srcOf(uc,id,i):"")).length)},{n:"não informado",cor:"#d9dcd6",v:MS.map((_,i)=>IND_LIST.filter(([id])=>L[id][i]==="").length)}]))}
   </div>
  </section>`;
  const pg2=ac.length||ESPECIFICOS[uc]?`
  <section class="rp-page">
   <div class="rp-mini"><b>${u.s}</b> · Plano de manejo e metas</div>
   <div class="rp-g2">
    ${ac.length?card("#0ca30c","Execução do plano de ação",`<div style="display:flex;gap:18px;align-items:center">${gDonut(["conc","and","venc","atr","nao"].map(k=>({v:c[k],cor:SC[k]})),{centro:Math.round(c.conc/ac.length*100)+"%",sub:"concluídas"})}
      <div style="flex:1">${["conc","and","venc","atr","nao"].map(k=>`<div class="rp-row"><i style="background:${SC[k]}"></i>${ST[k]}<b>${c[k]}</b></div>`).join("")}<div class="rp-row" style="border:0;margin-top:4px"><i style="background:transparent"></i>Total de ações<b>${ac.length}</b></div></div></div>`):""}
    ${ac.length?card("#2a78d6","Situação por programa",progs.map(p=>{const k=contaSt(ac.filter(a=>a.prog===p)),t=Object.values(k).reduce((a,b)=>a+b,0);
      return `<div class="rp-pr"><span>${esc(p)}</span><div>${["conc","and","venc","atr","nao"].filter(s=>k[s]).map(s=>`<i style="width:${k[s]/t*100}%;background:${SC[s]}"></i>`).join("")}</div><b>${k.conc}/${t}</b></div>`}).join("")+legenda(["conc","and","venc","atr","nao"].map(k=>[ST[k],SC[k]]))):""}
   </div>
   <div class="rp-g2">
   ${ESPECIFICOS[uc]?card("#eb6834","Indicadores específicos — atual × meta",`<div class="rp-buls1">${ESPECIFICOS[uc].map(([id,nm,un,meta,_,tipo])=>gBullet(nm,S.espec[id],meta,tipo,un)).join("")}</div><div class="rp-note">Barra = acumulado no ano; traço = meta do plano. Verde: atingida · amarelo: ≥ 50% · vermelho: < 50% ou acima do limite.</div>`):"<div></div>"}
   ${ac.length?card("#d03b3b","Próximos prazos e atrasos",`<table class="rp-t"><thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>${ac.filter(a=>status(a)!=="conc").sort((a,b)=>a.prazo.localeCompare(b.prazo)).slice(0,9).map(a=>`<tr><td>${esc(a.ativ)}<div class="rp-un">${esc(a.prog)}</div></td><td>${esc(userById(a.resp).nome)}</td><td>${fmtD(a.prazo)}</td><td><span class="rp-st" style="background:${SC[status(a)]}">${ST[status(a)]}</span></td></tr>`).join("")}</tbody></table><div class="rp-note">Lista completa no anexo A3.</div>`):""}
   </div>
  </section>`:"";
  const pg3=(temGeo(uc)||r||sp.length)?`
  <section class="rp-page">
   <div class="rp-mini"><b>${u.s}</b> · Território e biodiversidade</div>
   <div class="rp-g2">
    ${temGeo(uc)?card("#1f5c3f","Mapa da UC — imóveis do CAR, evidências e registros",gMapa(uc)+legenda([...(r?COND.map(x=>[x[1],x[2]]):[]),["Evidência de ação (cor = status)","#2a78d6"],["Ocorrência de pressão","#e34948"],["Outros registros","#6250d6"]])+`<div class="rp-note">Limite: IEMA 2026${r?" · CAR: SICAR (consulta pública, nov/2026)":""}. Espécies não são mapeadas no relatório.</div>`):""}
    <div>
     ${r?card("#eb6834","Situação fundiária (CAR)",`<div style="display:flex;gap:14px;align-items:center">${gDonut(COND.map((x,i)=>({v:[r.cond_aguardando,r.cond_em_analise,r.cond_analisado_pendente,r.cond_conforme][i],cor:x[2]})),{size:150,centro:r.n_relevante,sub:"imóveis"})}
       <div style="flex:1">${COND.map((x,i)=>`<div class="rp-row"><i style="background:${x[2]}"></i>${x[1]}<b>${[r.cond_aguardando,r.cond_em_analise,r.cond_analisado_pendente,r.cond_conforme][i]}</b></div>`).join("")}
       <div class="rp-note" style="margin-top:6px"><b>${fmtN(r.area_car_ha)} ha</b> declarados (${fmtN(r.pct_uc,1)}% da UC) · população 2022: ${esc(r.pop_total)} · ${esc(r.moradores)}</div></div></div>
       ${gH([["Minifúndio",r.porte_mini],["Pequeno",r.porte_pequeno],["Médio",r.porte_medio],["Grande",r.porte_grande]].map((x,k)=>({l:x[0],v:x[1],c:["#cde2fb","#86b6ef","#3987e5","#1c5cab"][k]})),{lw:90})}`):""}
     ${sp.length?card("#008300","Biodiversidade",(()=>{const gr=[...new Set(sp.map(x=>x.g))].sort((a,b)=>sp.filter(x=>x.g===b).length-sp.filter(x=>x.g===a).length);
       return `<div class="rp-g2s">${gH(gr.map((g,k)=>({l:g,v:sp.filter(x=>x.g===g).length,c:CAT[k%CAT.length]})),{lw:90,w:300})}
       <div>${gDonut(["CR","EN","VU"].map((k,i)=>({v:sp.filter(x=>x.es===k||x.br===k).length,cor:["#d03b3b","#eb6834","#eda100"][i]})),{size:140,centro:sp.filter(ehAmea).length,sub:"ameaçadas"})}${legenda([["CR","#d03b3b"],["EN","#eb6834"],["VU","#eda100"]])}</div></div>
       <div class="rp-note">${sp.filter(x=>x.nova).length} espécies novas registradas pela equipe · ${(S.bioReg||[]).filter(b=>b.uc===uc&&b.st==="pend").length} registros aguardando validação.</div>`})()):""}
    </div>
   </div>
  </section>`:"";
  // ---------- ANEXO: dados brutos ----------
  const val=(id,i)=>{const v=L[id][i];return v===""?"—":v==="N/A"?"N/A":fmtN(v,1)};
  const ano=(id,rg)=>{if(rg==="Último"){const n=ultimo(uc,id);return n===null?"—":fmtN(n)}return fmtN(soma(uc,id,0,m))};
  const anexo=`
  <section class="rp-page rp-anexo">
   <div class="rp-anx-h">ANEXO — DADOS BRUTOS · ${esc(u.n)} (${u.s}) · ${ANO}</div>
   <h2>A1. Indicadores comuns — valores mensais</h2>
   <table class="rp-t"><thead><tr><th>Indicador</th>${MS.map(x=>`<th>${x}</th>`).join("")}<th>Ano</th></tr></thead><tbody>
   ${COMUNS.map(([p,inds])=>`<tr class="rp-sec"><td colspan="${m+2}">${p}</td></tr>`+inds.map(([id,nm,un,rg])=>`<tr><td>${nm} <span class="rp-un">(${un})</span></td>${MS.map((_,i)=>`<td>${val(id,i)}</td>`).join("")}<td><b>${ano(id,rg)}</b></td></tr>`).join("")).join("")}</tbody></table>
   ${ESPECIFICOS[uc]?`<h2>A2. Indicadores específicos do plano de manejo</h2><table class="rp-t"><thead><tr><th>Indicador</th><th>Unidade</th><th>Meta</th><th>Atual</th><th>Fonte no plano</th></tr></thead><tbody>
   ${ESPECIFICOS[uc].map(([id,nm,un,meta,_,tipo,src])=>`<tr><td>${esc(nm)}</td><td>${un}</td><td>${meta===null?"—":(tipo==="menor"?"≤ ":"")+fmtN(meta)}</td><td>${fmtN(S.espec[id],1)}</td><td>${esc(src)}</td></tr>`).join("")}</tbody></table>`:""}
   ${ac.length?`<h2>A3. Ações do plano de manejo</h2><table class="rp-t"><thead><tr><th>Programa</th><th>Ação</th><th>Meta</th><th>Responsável</th><th>Prazo</th><th>Situação</th><th>%</th><th>Evid.</th><th>Fonte</th></tr></thead><tbody>
   ${ac.slice().sort((a,b)=>a.prog.localeCompare(b.prog)||a.prazo.localeCompare(b.prazo)).map(a=>`<tr><td>${esc(a.prog)}</td><td>${esc(a.ativ)}</td><td>${esc(a.meta)}</td><td>${esc(userById(a.resp).nome)}</td><td>${fmtD(a.prazo)}</td><td>${ST[status(a)]}</td><td>${a.pct}</td><td>${(S.evid||[]).filter(e=>e.acao===a.id).length}</td><td>${esc(a.fonte)}</td></tr>`).join("")}</tbody></table>`:""}
   ${regs.length?`<h2>A4. Registros de evidência dos indicadores</h2><table class="rp-t"><thead><tr><th>Data</th><th>Indicador</th><th>Registro</th><th>Anexos</th><th>Local</th><th>Responsável</th></tr></thead><tbody>
   ${regs.map(x=>`<tr><td>${fmtD(x.data)}</td><td>${esc(nomeInd(x.ind))}</td><td>${esc(resumoReg(x.ind,x))}</td><td>${x.anexos.length}</td><td>${x.lat!==null?x.lat.toFixed(4)+", "+x.lon.toFixed(4):"—"}</td><td>${esc(userById(x.autor).nome)}</td></tr>`).join("")}</tbody></table>`:""}
   ${r?`<h2>A5. Imóveis do CAR na UC</h2><table class="rp-t"><thead><tr><th>Código do imóvel</th><th>Proprietário(a)</th><th>Município</th><th>Análise do CAR</th><th>Área (ha)</th><th>Na UC (ha)</th><th>Processo / etapa</th></tr></thead><tbody>
   ${CAR.imoveis.features.filter(f=>f.properties.uc===uc).sort((a,b)=>b.properties.a_dentro-a.properties.a_dentro).map(f=>{const p=f.properties,pr=procDe(uc,p.cod);return `<tr><td style="font-size:6.8pt">${p.cod}</td><td>${veProprietario()?esc(proprietario(p.cod))+" (fictício)":"restrito"}</td><td>${esc(p.mun)}</td><td>${condInfo(p.cond)[1]}</td><td>${fmtN(p.a_imovel,1)}</td><td>${fmtN(p.a_dentro,1)}</td><td>${pr?esc(pr.tipo)+" — "+ETAPAS[grupoUC(uc)][pr.etapa]:"—"}</td></tr>`}).join("")}</tbody></table>`:""}
   ${sp.length?`<h2>A6. Espécies ameaçadas</h2><table class="rp-t"><thead><tr><th>Grupo</th><th>Família</th><th>Espécie</th><th>Nome popular</th><th>ES</th><th>Brasil</th><th>Evidência</th></tr></thead><tbody>
   ${sp.filter(ehAmea).sort((a,b)=>a.g.localeCompare(b.g)||a.s.localeCompare(b.s)).map(x=>`<tr><td>${x.g}</td><td>${esc(x.f)}</td><td><i>${esc(x.s)}</i></td><td>${esc(x.p)}</td><td>${x.es||"—"}</td><td>${x.br||"—"}</td><td>${x.ev.join(", ")}</td></tr>`).join("")}</tbody></table>
   <p class="rp-note">A lista completa de espécies (${sp.length}) pode ser baixada em planilha no módulo Biodiversidade. Coordenadas de ocorrência não constam neste relatório.</p>`:""}
   <div class="rp-foot">SisGAP-ES · IEMA/GGUC · ${PLANOS[uc]?esc(PLANOS[uc].doc)+" · ":""}Limites: IEMA 2026 · Gerado em ${new Date().toLocaleString("pt-BR")} · Versão de teste: valores de lançamento, responsáveis, processos e proprietários são simulados ou fictícios.</div>
  </section>`;
  let el=document.getElementById("printArea");if(!el){el=document.createElement("div");el.id="printArea";document.body.appendChild(el)}
  el.innerHTML=pg1+pg2+pg3+anexo;
  const t=document.title;document.title=`SisGAP-ES_painel_${uc}_${new Date().toISOString().slice(0,10)}`;
  setTimeout(()=>{try{window.print()}catch(e){toast("Use Ctrl+P / Cmd+P e escolha “Salvar como PDF”")}document.title=t},350);
}
// botão no painel da UC
{const _v=vUC; vUC=function(s){_v(s);if(!ucObj(s))return;
  const bar=document.createElement("div");bar.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px;align-items:center";
  bar.innerHTML=`<span class="small muted">Dashboard colorido + anexo com dados brutos (A4 deitado)</span><button class="btn primary" id="btnPdf">⬇ Exportar PDF do painel</button>`;
  $("#view").prepend(bar);$("#btnPdf").onclick=()=>{toast("Na janela de impressão, escolha “Salvar como PDF”");relatorioUC(s)}};}

// ======================= RELATÓRIO DA REDE (Painel geral) =======================
function gHeat(){ // UC × mês
  const m=Math.max(1,FECHADOS),cw=34,rh=17,lw=70,w=lw+cw*12+10,h=rh*UCS.length+24;
  const col=v=>v===1?"#1f6b45":v>=.7?"#6fae8a":v>0?"#c9e2d3":"#eef0eb";
  let s=`<svg viewBox="0 0 ${w} ${h}" width="100%">`;
  MES.forEach((x,i)=>s+=`<text x="${lw+i*cw+cw/2}" y="11" font-size="9" fill="${i<m?"#4d5a51":"#b5bcb6"}" text-anchor="middle">${x}</text>`);
  UCS.forEach((u,k)=>{const y=16+k*rh;s+=`<text x="${lw-6}" y="${y+12}" font-size="9" font-weight="600" fill="#16211a" text-anchor="end">${u.s}${u.piloto?" ★":""}</text>`;
    MES.forEach((_,i)=>{const v=i<m?completude(u.s,i):null;s+=`<rect x="${lw+i*cw+1}" y="${y+1}" width="${cw-2}" height="${rh-2}" rx="3" fill="${v===null?"#f6f7f4":col(v)}"/>`;
      if(v!==null&&S.enviados[u.s].includes(i))s+=`<text x="${lw+i*cw+cw/2}" y="${y+12}" font-size="8" fill="${v>=.7?"#fff":"#1f5c3f"}" text-anchor="middle">✓</text>`})});
  return s+"</svg>"+legenda([["100%","#1f6b45"],["70–99%","#6fae8a"],["1–69%","#c9e2d3"],["vazio","#eef0eb"],["✓ = enviado à GGUC","#ffffff"]]);
}
function relatorioRede(){
  const m=Math.max(1,FECHADOS), MS=MES.slice(0,m), hoje=new Date().toLocaleDateString("pt-BR"), ult=m-1;
  const tot=(id,i)=>UCS.reduce((t,u)=>t+(num(S.lanc[u.s][id][i])||0),0), serie=id=>MS.map((_,i)=>tot(id,i));
  const somaR=id=>UCS.reduce((t,u)=>t+soma(u.s,id,0,m),0);
  const env=UCS.filter(u=>S.enviados[u.s].includes(ult)).length;
  const cpU=u=>Array.from({length:m},(_,i)=>completude(u.s,i)).reduce((a,b)=>a+b,0)/m;
  const cpM=Math.round(UCS.reduce((t,u)=>t+cpU(u),0)/UCS.length*100);
  const c=contaSt(S.acoes), pil=UCS.filter(u=>u.piloto), al=gerarAlertas();
  const pres=PRESSAO.reduce((a,id)=>a+somaR(id),0), vis=somaR("vis");
  const carUCs=(typeof CAR!=="undefined")?Object.keys(CAR.resumo):[], spUCs=(typeof BIO!=="undefined")?Object.keys(BIO):[];
  const nomeInd=id=>IND_LIST.find(x=>x[0]===id)[1];
  const kpi=(cor,val,lb,sub="")=>`<div class="rp-k" style="background:${cor}"><b>${val}</b><span>${lb}</span>${sub?`<em>${sub}</em>`:""}</div>`;
  const card=(cor,t,body)=>`<div class="rp-c"><div class="rp-ch" style="border-color:${cor}"><span style="background:${cor}"></span>${t}</div>${body}</div>`;
  const PC=["#e34948","#eb6834","#eda100","#6250d6","#7c877f"], PN=["Caça / pesca / captura","Uso irregular do fogo","Supressão de vegetação","Atividade irregular","Animal doméstico"];
  const nomeCurto=u=>u.n.replace(/^(Parque Estadual|Monumento Natural|Reserva Biológica|APA|ARIE|RDS)( do| de| da| dos)? ?/,"");
  const pg1=`<section class="rp-page">
   <div class="rp-banner"><img src="iema-branco.png" alt="IEMA"><div><div class="rp-sis">SisGAP-ES · Painel geral da rede de unidades de conservação estaduais</div><h1>Rede de UCs estaduais do Espírito Santo</h1>
     <div class="rp-sub">${UCS.length} unidades · ${UCS.filter(u=>u.g==="PI").length} de proteção integral e ${UCS.filter(u=>u.g==="US").length} de uso sustentável · Período: jan–${MS[ult].toLowerCase()} ${ANO} · Emitido em ${hoje} por ${esc(user().nome)}</div></div>
     <div class="rp-tag">VERSÃO DE TESTE<br><small>dados simulados</small></div></div>
   <div class="rp-kpis">
     ${kpi("#1f5c3f",`${env}/${UCS.length}`,`lançamentos de ${MESL[ult]} enviados`,`completude média ${cpM}%`)}
     ${kpi("#2a78d6",fmtN(vis),"visitas na rede",`público total ${fmtN(vis+somaR("pev"))}`)}
     ${kpi("#e34948",fmtN(pres),"ocorrências de pressão",`${fmtN(somaR("inc"))} incêndios combatidos`)}
     ${kpi("#6250d6",fmtN(somaR("fis")),"ações de fiscalização",`${fmtN(somaR("aut"))} autuações`)}
     ${kpi("#0ca30c",`${c.conc}/${S.acoes.length}`,"ações dos PMs concluídas",`${c.atr} atrasadas · ${pil.length} UCs com plano`)}
     ${kpi("#eda100",fmtN(al.length),"alertas ativos",`${al.filter(a=>a.tipo==="atr").length} ações atrasadas · ${al.filter(a=>a.tipo==="lanc").length} lançamentos pendentes`)}
     ${carUCs.length?kpi("#eb6834",fmtN(carUCs.reduce((t,s)=>t+CAR.resumo[s].n_relevante,0)),"imóveis do CAR nas UCs de teste",`${fmtN(carUCs.reduce((t,s)=>t+CAR.resumo[s].area_car_ha,0))} ha declarados`):""}
     ${spUCs.length?kpi("#008300",fmtN(spUCs.reduce((t,s)=>t+especiesUC(s).length,0)),"espécies listadas (APAGO + ARIEMV)",`${fmtN(spUCs.reduce((t,s)=>t+especiesUC(s).filter(ehAmea).length,0))} ameaçadas, somando as duas UCs`):""}
   </div>
   <div class="rp-g3">
     ${card("#2a78d6","Visitação mensal na rede",gLine(MS,serie("vis"),{cor:"#2a78d6"}))}
     ${card("#6250d6","Atividades de gestão por mês (rede)",gStack(MS,[{n:"Fiscalização",cor:"#6250d6",v:serie("fis")},{n:"Monitoramento",cor:"#1baf7a",v:serie("mon")},{n:"Eventos",cor:"#eda100",v:serie("eve")},{n:"Reuniões do conselho",cor:"#2a78d6",v:serie("reu")},{n:"Mídias",cor:"#e87ba4",v:serie("mid")}]))}
     ${card("#e34948","Pressões registradas por mês (rede)",gStack(MS,PRESSAO.map((id,k)=>({n:PN[k],cor:PC[k],v:serie(id)}))))}
   </div>
   <div class="rp-g3">
     ${card("#2a78d6","Visitas no ano, por UC (10 maiores)",gH(UCS.map(u=>({l:u.s,v:soma(u.s,"vis",0,m)})).sort((a,b)=>b.v-a.v).slice(0,10).map(x=>Object.assign(x,{c:"#2a78d6"})),{lw:70}))}
     ${card("#e34948","Pressões no ano, por UC (10 maiores)",gH(UCS.map(u=>({l:u.s,v:PRESSAO.reduce((a,id)=>a+soma(u.s,id,0,m),0)})).sort((a,b)=>b.v-a.v).slice(0,10).map(x=>Object.assign(x,{c:"#e34948"})),{lw:70}))}
     ${card("#eb6834","Pressões no ano, por tipo (rede)",gH(PRESSAO.map((id,k)=>({l:PN[k],v:somaR(id),c:PC[k]})),{lw:140})+`<div style="margin-top:6px">${gH([{l:"Incêndios combatidos",v:somaR("inc"),c:"#d03b3b"},{l:"Autuações",v:somaR("aut"),c:"#6250d6"}],{lw:140})}</div>`)}
   </div></section>`;
  const pg2=`<section class="rp-page"><div class="rp-mini"><b>Rede</b> · Lançamentos e planos de manejo</div>
   <div class="rp-g2">
    ${card("#1f5c3f","Completude dos lançamentos por UC e mês",gHeat())}
    <div>
     ${card("#0ca30c","Execução dos planos de manejo (UCs com plano cadastrado)",pil.map(u=>{const k=contaSt(acoesDe(u.s)),t=Object.values(k).reduce((a,b)=>a+b,0);
       return `<div class="rp-pr" style="grid-template-columns:150px 1fr 40px"><span><b>${u.s}</b> ${esc(nomeCurto(u))}</span><div>${["conc","and","venc","atr","nao"].filter(s=>k[s]).map(s=>`<i style="width:${k[s]/t*100}%;background:${SC[s]}"></i>`).join("")}</div><b>${k.conc}/${t}</b></div>`}).join("")+legenda(["conc","and","venc","atr","nao"].map(k=>[ST[k],SC[k]]))+
       `<div style="display:flex;gap:16px;align-items:center;margin-top:8px">${gDonut(["conc","and","venc","atr","nao"].map(k=>({v:c[k],cor:SC[k]})),{size:130,centro:S.acoes.length,sub:"ações"})}<div style="flex:1">${["conc","and","venc","atr","nao"].map(k=>`<div class="rp-row"><i style="background:${SC[k]}"></i>${ST[k]}<b>${c[k]}</b></div>`).join("")}</div></div>`)}
     ${card("#eda100","Alertas ativos por UC",gH(Object.entries(al.reduce((o,a)=>(o[a.uc]=(o[a.uc]||0)+1,o),{})).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([s,v])=>({l:s,v,c:"#eda100"})),{lw:70}))}
    </div></div></section>`;
  const pg3=(carUCs.length||spUCs.length)?`<section class="rp-page"><div class="rp-mini"><b>Rede</b> · Território e biodiversidade (UCs de teste)</div>
   <div class="rp-g2">
    ${carUCs.length?card("#eb6834","Situação fundiária — imóveis do CAR por UC",gStack(carUCs,COND.map((x,i)=>({n:x[1],cor:x[2],v:carUCs.map(s=>[CAR.resumo[s].cond_aguardando,CAR.resumo[s].cond_em_analise,CAR.resumo[s].cond_analisado_pendente,CAR.resumo[s].cond_conforme][i])})),{h:220})+
      `<table class="rp-t" style="margin-top:8px"><thead><tr><th>UC</th><th>Regra de moradores</th><th>Imóveis</th><th>Área no CAR (ha)</th><th>% da UC</th><th>População 2022</th><th>Processos</th></tr></thead><tbody>${carUCs.map(s=>{const r=CAR.resumo[s];return `<tr><td><b>${s}</b></td><td>${esc(r.moradores)}</td><td>${r.n_relevante}</td><td>${fmtN(r.area_car_ha)}</td><td>${fmtN(r.pct_uc,1)}%</td><td>${esc(r.pop_total)}</td><td>${Object.keys(S.fund).filter(k=>k.endsWith("|"+s)).length}</td></tr>`}).join("")}</tbody></table>`):"<div></div>"}
    ${spUCs.length?card("#008300","Biodiversidade por UC",gStack(spUCs,["Aves","Mamíferos","Anfíbios","Répteis","Peixes","Invertebrados","Flora"].map((g,k)=>({n:g,cor:CAT[k%CAT.length],v:spUCs.map(s=>especiesUC(s).filter(x=>x.g===g).length)})),{h:220})+
      `<table class="rp-t" style="margin-top:8px"><thead><tr><th>UC</th><th>Espécies</th><th>Fauna</th><th>Flora</th><th>Ameaçadas</th><th>Novas (equipe)</th><th>Pendentes de validação</th></tr></thead><tbody>${spUCs.map(s=>{const sp=especiesUC(s);return `<tr><td><b>${s}</b></td><td>${sp.length}</td><td>${sp.filter(x=>x.g!=="Flora").length}</td><td>${sp.filter(x=>x.g==="Flora").length}</td><td>${sp.filter(ehAmea).length}</td><td>${sp.filter(x=>x.nova).length}</td><td>${(S.bioReg||[]).filter(b=>b.uc===s&&b.st==="pend").length}</td></tr>`}).join("")}</tbody></table>
      <div class="rp-note">PE Forno Grande e PE Itaúnas ainda sem painel de espécies.</div>`):""}
   </div></section>`:"";
  const anexo=`<section class="rp-page rp-anexo"><div class="rp-anx-h">ANEXO — DADOS BRUTOS · REDE DE UCs ESTADUAIS · ${ANO}</div>
   <h2>A1. Situação por unidade</h2><table class="rp-t"><thead><tr><th>UC</th><th>Nome</th><th>Categoria</th><th>Completude</th><th>${MES[ult]} enviado</th><th>Visitas</th><th>Público eventos</th><th>Pressões</th><th>Fiscalização</th><th>Autuações</th><th>Incêndios</th><th>Ações PM (concl./total)</th><th>Atrasadas</th></tr></thead><tbody>
   ${UCS.map(u=>{const k=contaSt(acoesDe(u.s)),t=acoesDe(u.s).length;return `<tr><td><b>${u.s}</b></td><td>${esc(u.n)}</td><td>${u.cat}</td><td>${Math.round(cpU(u)*100)}%</td><td>${S.enviados[u.s].includes(ult)?"sim":"não"}</td><td>${u.s==="APAPM"?"N/A":fmtN(soma(u.s,"vis",0,m))}</td><td>${fmtN(soma(u.s,"pev",0,m))}</td><td>${fmtN(PRESSAO.reduce((a,id)=>a+soma(u.s,id,0,m),0))}</td><td>${fmtN(soma(u.s,"fis",0,m))}</td><td>${fmtN(soma(u.s,"aut",0,m))}</td><td>${fmtN(soma(u.s,"inc",0,m))}</td><td>${t?k.conc+"/"+t:"—"}</td><td>${t?k.atr:"—"}</td></tr>`}).join("")}</tbody></table>
   <h2>A2. Indicadores comuns — totais mensais da rede</h2><table class="rp-t"><thead><tr><th>Indicador</th>${MS.map(x=>`<th>${x}</th>`).join("")}<th>Ano</th></tr></thead><tbody>
   ${COMUNS.map(([p,inds])=>`<tr class="rp-sec"><td colspan="${m+2}">${p}</td></tr>`+inds.map(([id,nm,un,rg])=>`<tr><td>${nm} <span class="rp-un">(${un}${rg==="Último"?", soma dos estoques das UCs":""})</span></td>${MS.map((_,i)=>`<td>${fmtN(tot(id,i))}</td>`).join("")}<td><b>${rg==="Último"?fmtN(UCS.reduce((t,u)=>t+(ultimo(u.s,id)||0),0)):fmtN(somaR(id))}</b></td></tr>`).join("")).join("")}</tbody></table>
   <h2>A3. Ações atrasadas e a vencer (15 dias)</h2><table class="rp-t"><thead><tr><th>UC</th><th>Ação</th><th>Programa</th><th>Responsável</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>
   ${S.acoes.filter(a=>["atr","venc"].includes(status(a))).sort((a,b)=>a.prazo.localeCompare(b.prazo)).map(a=>`<tr><td><b>${a.uc}</b></td><td>${esc(a.ativ)}</td><td>${esc(a.prog)}</td><td>${esc(userById(a.resp).nome)}</td><td>${fmtD(a.prazo)}</td><td>${ST[status(a)]}</td></tr>`).join("")}</tbody></table>
   <h2>A4. Alertas do dia</h2><table class="rp-t"><thead><tr><th>UC</th><th>Tipo</th><th>Assunto</th><th>Destinatário</th></tr></thead><tbody>
   ${al.map(a=>`<tr><td><b>${a.uc}</b></td><td>${{atr:"Ação atrasada",d15:"Prazo em 15 dias",d7:"Prazo em 7 dias",d1:"Prazo amanhã",lanc:"Lançamento pendente"}[a.tipo]}</td><td>${a.acao?esc(a.acao.ativ)+" — ":""}${esc(a.txt)}</td><td>${esc(a.para.nome)}</td></tr>`).join("")}</tbody></table>
   <div class="rp-foot">SisGAP-ES · IEMA/GGUC · Limites: IEMA 2026 · Gerado em ${new Date().toLocaleString("pt-BR")} · Versão de teste: valores de lançamento, responsáveis e processos são simulados ou fictícios.</div></section>`;
  let el=document.getElementById("printArea");if(!el){el=document.createElement("div");el.id="printArea";document.body.appendChild(el)}
  el.innerHTML=pg1+pg2+pg3+anexo;
  const t=document.title;document.title=`SisGAP-ES_painel_rede_${new Date().toISOString().slice(0,10)}`;
  setTimeout(()=>{try{window.print()}catch(e){toast("Use Ctrl+P / Cmd+P e escolha “Salvar como PDF”")}document.title=t},350);
}
{const _p=vPainel; vPainel=function(){_p();
  const bar=document.createElement("div");bar.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px;align-items:center";
  bar.innerHTML=`<span class="small muted">Dashboard colorido da rede + anexo com dados brutos (A4 deitado)</span><button class="btn primary" id="btnPdfRede">⬇ Exportar PDF do painel geral</button>`;
  $("#view").prepend(bar);$("#btnPdfRede").onclick=()=>{toast("Na janela de impressão, escolha “Salvar como PDF”");relatorioRede()}};}
