// SisGAP-ES — módulos Fundiário (CAR) e Biodiversidade (UCs da versão de teste)

// ======================= FUNDIÁRIO =======================
const COND = [
  ["Aguardando análise","Aguardando análise","#b8b6ae"],
  ["Em análise","Em análise","#86b6ef"],
  ["Analisado, aguardando regularização ambiental (Lei nº 12.651/2012)","Analisado, aguardando regularização","#eda100"],
  ["Analisado, em conformidade com a Lei nº 12.651/2012","Analisado, em conformidade","#0ca30c"]
];
const condInfo = c => COND.find(x=>x[0]===c) || [c,c,"#8f8d86"];
const ETAPAS = {
  PI:["Levantamento dominial","Notificação do ocupante","Laudo de avaliação","Negociação / indenização","Escritura / imissão na posse","Regularizado"],
  US:["Acompanhamento do CAR","Análise / vistoria","Termo de compromisso / PRA","Recuperação em execução","Em conformidade"]
};
const TIPOS = {
  PI:["Regularização fundiária (desapropriação/indenização)","Compensação de reserva legal (doação de área)","Termo de compromisso com ocupante","Acompanhamento"],
  US:["Regularização ambiental (PRA)","Termo de compromisso","Licenciamento / anuência da UC","Acompanhamento"]
};
const grupoUC = uc => ucObj(uc).g;
const TIPOS_AND=["Abertura do processo","Despacho","Ofício enviado","Ofício recebido","Notificação do ocupante","Vistoria / levantamento de campo","Certidão de matrícula (cartório)","Laudo de avaliação","Parecer jurídico (PGE)","Proposta de indenização","Acordo / termo assinado","Publicação no Diário Oficial","Pagamento / depósito judicial","Escritura / registro em cartório","Imissão na posse","Ação judicial (desapropriação)","Arquivamento","Outro"];
const ultAnd = pr => pr&&pr.and&&pr.and.length?pr.and.slice().sort((a,b)=>b.data.localeCompare(a.data))[0]:null;            // "PI" | "US"
const curto = c => c.replace(/^ES-\d{7}-/,"").slice(0,8)+"…";
// Proprietário — NOMES FICTÍCIOS para a versão de teste (na versão real vêm do SICAR, com acesso restrito)
const _NOMES=["Ana","Antônio","Benedita","Carlos","Cláudia","Davi","Elza","Fábio","Geralda","Hélio","Irene","Jorge","Joana","Lúcia","Marcos","Neuza","Osmar","Paula","Raimundo","Rosa","Sebastião","Sônia","Valter","Zilda"];
const _SOBR=["Almeida","Barcellos","Coutinho","Demoner","Endlich","Fiorot","Gava","Huber","Ines","Kuster","Loss","Merlo","Nascimento","Oliveira","Pagotto","Rasseli","Scheffer","Tononi","Uliana","Vervloet","Zanotti"];
function proprietario(cod){let h=0;for(const ch of cod)h=(h*33+ch.charCodeAt(0))>>>0;
  const tipo=h%9===0?"pj":h%5===0?"esp":"pf";
  if(tipo==="pj")return `${["Agropecuária","Fazenda","Sítio"][h%3]} ${_SOBR[(h>>>4)%_SOBR.length]} Ltda.`;
  const n=`${_NOMES[(h>>>3)%_NOMES.length]} ${_SOBR[(h>>>8)%_SOBR.length]}`;
  return tipo==="esp"?`Espólio de ${n}`:n;}
const veProprietario=()=>isAdmin()||user().papel==="gestor"||cargoDe(user())==="Analista / Técnico(a)";
const propCel=cod=>veProprietario()?`${esc(proprietario(cod))} <span class="muted" style="font-size:10.5px">(fictício)</span>`:'<span class="muted">🔒 restrito</span>';

function seedFund(){
  const pick=(uc,n)=>CAR.imoveis.features.filter(f=>f.properties.uc===uc&&f.properties.relevante).sort((a,b)=>b.properties.a_dentro-a.properties.a_dentro).slice(0,n);
  const o={}, put=(f,d)=>o[f.properties.cod+"|"+f.properties.uc]=Object.assign({hist:[],simulado:true},d);
  const [p1,p2]=pick("PEI",2), [f1,f2]=pick("PEFG",2), [a1]=pick("APAGO",1), [m1]=pick("ARIEMV",1);
  const A=(d,t,doc,desc)=>({id:"an"+d+t.length,data:d,tipo:t,doc,desc,anexos:[],autor:"u7",exemplo:true});
  if(p1)put(p1,{tipo:TIPOS.PI[0],etapa:2,edocs:"2026-XXXXX (exemplo)",resp:"u7",prazo:"2027-03-31",obs:"Exemplo para validação.",
    and:[A("2026-02-10","Abertura do processo","Memorando 012/2026","Abertura do processo de regularização fundiária do imóvel."),A("2026-04-03","Certidão de matrícula (cartório)","Matrícula nº 0000 (exemplo)","Certidão de inteiro teor anexada; domínio confirmado."),A("2026-07-22","Notificação do ocupante","Notificação 045/2026","Ocupante notificado sobre a regularização e a vistoria."),A("2026-10-15","Vistoria / levantamento de campo","Relatório de vistoria 18/2026","Vistoria para o laudo de avaliação; benfeitorias levantadas.")]});
  if(p2)put(p2,{tipo:TIPOS.PI[2],etapa:1,edocs:"",resp:"u8",prazo:"2026-12-10",obs:"Exemplo para validação."});
  if(f1)put(f1,{tipo:TIPOS.PI[0],etapa:0,edocs:"",resp:"u5",prazo:"2026-12-31",obs:"Ligado à ação “Enviar levantamento fundiário à instância superior” (PM, Tabela 6)."});
  if(f2)put(f2,{tipo:TIPOS.PI[1],etapa:3,edocs:"2025-YYYYY (exemplo)",resp:"u5",prazo:"2026-11-20",obs:"Exemplo para validação.",
    and:[A("2025-09-01","Abertura do processo","Memorando 101/2025","Proposta de compensação de reserva legal por doação de área."),A("2026-03-18","Laudo de avaliação","Laudo 07/2026","Área avaliada."),A("2026-09-30","Proposta de indenização","Ofício 233/2026","Proposta enviada ao proprietário; prazo de resposta 60 dias.")]});
  if(a1)put(a1,{tipo:TIPOS.US[1],etapa:1,edocs:"",resp:"u2",prazo:"2027-02-28",obs:"Exemplo para validação."});
  if(m1)put(m1,{tipo:TIPOS.US[0],etapa:2,edocs:"",resp:"u4",prazo:"2027-06-30",obs:"Exemplo para validação."});
  return o;
}
S.fund = LS.get("fund",null) || seedFund();
const saveFund = ()=>LS.set("fund",S.fund);
const procDe = (uc,cod) => S.fund[cod+"|"+uc];
{const _r=resetDemo; resetDemo=function(){try{localStorage.removeItem("sisgap:fund")}catch(e){};_r()};}

let FF={cond:"",proc:"",q:"",ord:"a_dentro"}, _fmap=null;
function vFundiario(){
  const uc=ucAtual();
  const PIu=uc&&ucObj(uc)&&ucObj(uc).g==="PI";
  title(PIu?"Regularização fundiária — imóveis do CAR e processos administrativos":"Fundiário — imóveis do CAR e processos", uc?`${uc} — ${ucObj(uc).n}`:"UCs da versão de teste");
  if(!uc||!CAR.resumo[uc]){
    $("#view").innerHTML=`<div class="info" style="margin-bottom:16px">Módulo ativo nas UCs da versão de teste. Escolha uma UC:</div>
    <div class="grid g4">${GEO_UCS.map(s=>{const r=CAR.resumo[s];return `<div class="uc-tile" onclick="S.uc='${s}';save();route()"><b>${s}</b><div class="meta">${esc(ucObj(s).n)}</div>
      <div class="small"><b>${r.n_relevante}</b> imóveis no CAR · <b>${fmt(r.pct_uc,1)}%</b> da UC<br>${esc(r.moradores)}</div></div>`}).join("")}</div>
    ${uc&&!CAR.resumo[uc]?`<p class="small muted" style="margin-top:12px">${uc} ainda não está na versão de teste deste módulo.</p>`:""}`;
    return;
  }
  const r=CAR.resumo[uc], gp=grupoUC(uc), feats=CAR.imoveis.features.filter(f=>f.properties.uc===uc);
  const procs=feats.map(f=>procDe(uc,f.properties.cod)).filter(Boolean);
  const concl=procs.filter(p=>p.etapa===ETAPAS[gp].length-1).length;
  const atras=procs.filter(p=>p.prazo&&dias(p.prazo)<0&&p.etapa<ETAPAS[gp].length-1).length;
  const condC=COND.map(c=>[c[1],c[2],[r.cond_aguardando,r.cond_em_analise,r.cond_analisado_pendente,r.cond_conforme][COND.indexOf(c)]]);
  const totC=condC.reduce((t,c)=>t+c[2],0)||1;
  $("#view").innerHTML=`
  <div class="${gp==="PI"?"note":"info"}" style="margin-bottom:16px"><b>${esc(r.moradores)}.</b> ${esc(r.moradores_base)}.
   ${gp==="PI"?" Imóvel no CAR dentro de parque indica <b>pendência de regularização fundiária</b>, não ocupação permitida.":" Em UC de uso sustentável, o foco é a <b>regularização ambiental</b> dos imóveis (CAR/PRA) e a compatibilidade com o plano de manejo."}</div>
  <div class="grid g4">
    <div class="card kpi"><div class="lbl">Imóveis do CAR na UC</div><div class="val">${r.n_relevante}</div><div class="foot"><b>${r.n_inteiro_dentro}</b> inteiros dentro · ${r.n_at} ativos, ${r.n_pe} pendentes</div></div>
    <div class="card kpi"><div class="lbl">Área declarada dentro da UC</div><div class="val">${fmt(r.area_car_ha)} <span style="font-size:16px;color:var(--muted)">ha</span></div><div class="foot"><b>${fmt(r.pct_uc,1)}%</b> da UC (${fmt(r.area_uc_ha)} ha) · sobreposição entre cadastros ${fmt(r.sobreposicao_cad_ha)} ha</div></div>
    <div class="card kpi"><div class="lbl">População residente (Censo 2022)</div><div class="val">${esc(r.pop_total)}</div><div class="foot">indígenas: <b>${esc(r.pop_indigena)}</b> · quilombolas: <b>${esc(r.pop_quilombola)}</b> · ${fmt(r.dens_hab_km2,1)} hab/km²</div></div>
    <div class="card kpi"><div class="lbl">${gp==="PI"?"Processos de regularização fundiária":"Processos cadastrados"}</div><div class="val">${procs.length}<span style="font-size:18px;color:var(--muted)">/${r.n_relevante}</span></div><div class="foot"><b>${concl}</b> concluídos · <b>${procs.reduce((t,p)=>t+((p.and||[]).length),0)}</b> andamentos · ${atras?`<b style="color:#9b2424">${atras} com prazo vencido</b>`:"nenhum vencido"}</div></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>Situação da análise do CAR</h3><p class="sub">Pelo órgão ambiental, imóveis com área relevante na UC</p>
      <div style="display:flex;height:22px;border-radius:5px;overflow:hidden;margin:8px 0 10px">${condC.filter(c=>c[2]).map(c=>`<div style="width:${c[2]/totC*100}%;background:${c[1]};border-right:2px solid #fff" data-tip="<b>${c[0]}</b>${c[2]} imóveis (${fmt(c[2]/totC*100,0)}%)"></div>`).join("")}</div>
      ${condC.map(c=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--line)" class="small"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${c[1]};margin-right:8px"></i>${c[0]}</span><b>${c[2]}</b></div>`).join("")}</div>
    <div class="card"><h3>Porte dos imóveis</h3><p class="sub">Módulos fiscais (MF) do município · área média do imóvel ${fmt(r.area_media_imovel_ha,1)} ha</p>
      ${hbars([["Minifúndio (< 1 MF)",r.porte_mini],["Pequeno (1–4 MF)",r.porte_pequeno],["Médio (4–15 MF)",r.porte_medio],["Grande (> 15 MF)",r.porte_grande]].map(x=>({l:x[0],v:x[1]})),{unit:"imóveis"})}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Mapa dos imóveis do CAR</h3><p class="sub">Parte de cada imóvel dentro da UC · clique para abrir a ficha e o processo</p></div>
    <select id="fCor" class="btn sm"><option value="cond">Cor pela análise do CAR</option><option value="proc">Cor pela etapa do processo</option></select></div>
    <div style="display:grid;grid-template-columns:1fr 260px;gap:14px"><div id="fMap" style="height:460px;border-radius:10px;border:1px solid var(--line)"></div>
    <div class="small"><div style="font-weight:700;margin-bottom:6px">Legenda</div><div id="fLeg"></div>
      <label style="display:flex;gap:8px;align-items:center;padding:10px 0 4px"><input type="checkbox" id="fSat"> Imagem de satélite</label>
      <p class="muted" style="line-height:1.45;margin-top:10px">Imóveis com menos de 1 ha e menos de 10% da área dentro da UC aparecem tracejados (sobreposição marginal).</p></div></div></div>
  <div class="card" style="margin-top:16px;padding:0">
    <div style="padding:14px 16px 0">${gp==="PI"?`<div style="display:inline-block;background:#9b2424;color:#fff;font-weight:800;letter-spacing:.06em;padding:4px 10px;border-radius:6px;font-size:12px;margin-bottom:6px">REGULARIZAÇÃO FUNDIÁRIA</div><h3>Imóveis do CAR dentro dos limites da UC e processos administrativos</h3>`:`<h3>Imóveis e processos</h3>`}<p class="sub">${feats.length} recortes de imóveis do CAR · ${esc(CAR.fonte)}</p>
    <div class="note" style="margin:8px 0 10px"><b>Proprietários com nomes fictícios</b> nesta versão de teste. No sistema real, o nome vem do SICAR (acesso governamental) e só aparece para GGUC, gestor(a) e analista; guarda-parques e estagiários veem “restrito”, conforme a LGPD.${veProprietario()?"":" <b>Seu cargo não tem acesso a este dado.</b>"}</div>
    <div class="filters"><input id="fq" placeholder="Código, proprietário(a) ou município" value="${esc(FF.q)}" style="width:240px">
      <select id="fc"><option value="">Toda situação do CAR</option>${COND.map(c=>`<option value="${esc(c[0])}" ${FF.cond===c[0]?"selected":""}>${c[1]}</option>`).join("")}</select>
      <select id="fp"><option value="">Com ou sem processo</option><option value="com" ${FF.proc==="com"?"selected":""}>Com processo</option><option value="sem" ${FF.proc==="sem"?"selected":""}>Sem processo</option></select>
      <select id="fo"><option value="a_dentro">Ordenar: área dentro da UC</option><option value="pct" ${FF.ord==="pct"?"selected":""}>Ordenar: % do imóvel dentro</option><option value="prazo" ${FF.ord==="prazo"?"selected":""}>Ordenar: prazo do processo</option></select>
      <span style="flex:1"></span><button class="btn sm" id="fCsv">⬇ Planilha (CSV)</button></div></div>
    <div class="tbl-wrap" style="border:0;border-top:1px solid var(--line);max-height:520px" id="fTab"></div></div>`;
  // tabela
  const drawTab=()=>{
    let L=feats.filter(f=>{const p=f.properties,pr=procDe(uc,p.cod);return (!FF.cond||p.cond===FF.cond)&&(!FF.proc||(FF.proc==="com"?!!pr:!pr))&&(!FF.q||(p.cod+" "+p.mun+" "+(veProprietario()?proprietario(p.cod):"")).toLowerCase().includes(FF.q.toLowerCase()))});
    L.sort((a,b)=>FF.ord==="prazo"?((procDe(uc,a.properties.cod)||{}).prazo||"9").localeCompare((procDe(uc,b.properties.cod)||{}).prazo||"9"):(b.properties[FF.ord]||0)-(a.properties[FF.ord]||0));
    $("#fTab").innerHTML=`<table><thead><tr><th>Imóvel (código CAR)</th><th>Proprietário(a)</th><th>Município</th><th>Análise do CAR</th><th class="num">Área do imóvel (ha)</th><th class="num">Dentro da UC (ha)</th><th class="num">% dentro</th><th>Nº do processo adm.</th><th>Etapa</th><th>Último andamento</th><th>Prazo</th><th></th></tr></thead><tbody>
    ${L.map(f=>{const p=f.properties,pr=procDe(uc,p.cod),ci=condInfo(p.cond);const venc=pr&&pr.prazo&&dias(pr.prazo)<0&&pr.etapa<ETAPAS[gp].length-1;
      return `<tr style="cursor:pointer" onclick="fichaImovel('${uc}','${p.cod}')"><td><span title="${p.cod}" style="font-family:ui-monospace,monospace;font-size:12px">${curto(p.cod)}</span>${p.relevante?"":' <span class="pill" style="font-size:10px">marginal</span>'}</td>
      <td class="small">${propCel(p.cod)}</td><td class="small">${esc(p.mun)}</td><td><span class="pill"><i style="background:${ci[2]}"></i>${ci[1]}</span><div class="small muted">${p.sit}</div></td>
      <td class="num">${fmt(p.a_imovel,1)}</td><td class="num"><b>${fmt(p.a_dentro,1)}</b></td><td class="num">${p.pct===null?"—":fmt(p.pct,0)+"%"}</td>
      <td class="small" style="font-family:ui-monospace,monospace">${pr&&pr.edocs?esc(pr.edocs):'<span class="muted" style="font-family:inherit">—</span>'}</td>
      <td class="small">${pr?`<b>${ETAPAS[gp][pr.etapa]}</b><div class="muted">${esc(pr.tipo)}${pr.simulado?" · exemplo":""}</div>`:'<span class="muted">sem processo</span>'}</td>
      <td class="small">${(()=>{const u=ultAnd(pr);return u?`<b>${fmtD(u.data)}</b> · ${esc(u.tipo)}<div class="muted">${(pr.and||[]).length} andamento(s)</div>`:'<span class="muted">—</span>'})()}</td>
      <td class="small" style="white-space:nowrap">${pr&&pr.prazo?`${fmtD(pr.prazo)}${venc?'<div style="color:#9b2424;font-weight:600">vencido</div>':""}`:""}</td>
      <td><span class="btn sm" style="white-space:nowrap">${pr?"Andamentos ›":(gp==="PI"?"Abrir processo ›":"Abrir ›")}</span></td></tr>`}).join("")}</tbody></table>`;
  };
  drawTab();
  $("#fq").oninput=e=>{FF.q=e.target.value;drawTab()};
  $("#fc").onchange=e=>{FF.cond=e.target.value;drawTab()};
  $("#fp").onchange=e=>{FF.proc=e.target.value;drawTab()};
  $("#fo").onchange=e=>{FF.ord=e.target.value;drawTab()};
  $("#fCsv").onclick=()=>{
    const head=["uc","cod_imovel","proprietario_ficticio","municipio","situacao_car","analise_car","area_imovel_ha","area_dentro_uc_ha","pct_dentro","num_processo_adm","tipo_processo","etapa","n_andamentos","ultimo_andamento_data","ultimo_andamento","responsavel","prazo","observacoes"];
    const rows=feats.map(f=>{const p=f.properties,pr=procDe(uc,p.cod)||{};const u=ultAnd(pr);return [uc,p.cod,veProprietario()?proprietario(p.cod):"restrito",p.mun,p.sit,p.cond,p.a_imovel,p.a_dentro,p.pct,pr.edocs||"",pr.tipo||"",pr.etapa!=null?ETAPAS[gp][pr.etapa]:"",(pr.and||[]).length,u?u.data:"",u?u.tipo+" — "+(u.desc||""):"",pr.resp?userById(pr.resp).nome:"",pr.prazo||"",pr.obs||""]});
    const csv="﻿"+[head,...rows].map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`sisgap_fundiario_${uc}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);toast("Planilha baixada");
  };
  // mapa
  if(_fmap){_fmap.remove();_fmap=null}
  _fmap=L_map("fMap",uc);
  const lay=window.L.geoJSON({type:"FeatureCollection",features:feats},{
    style:f=>fStyle(uc,f),
    onEachFeature:(f,l)=>{const p=f.properties;l.bindTooltip(`<b>${curto(p.cod)}</b> · ${esc(p.mun)}<br>${fmt(p.a_dentro,1)} ha dentro da UC (${p.pct===null?"—":fmt(p.pct,0)+"%"} do imóvel)<br>${condInfo(p.cond)[1]}`,{sticky:true});l.on("click",()=>fichaImovel(uc,p.cod))}
  }).addTo(_fmap);
  _fmap._lim.bringToFront();
  const leg=()=>{$("#fLeg").innerHTML=$("#fCor").value==="cond"
    ?COND.map(c=>`<div style="display:flex;gap:8px;align-items:center;padding:3px 0"><span style="width:14px;height:12px;border-radius:3px;background:${c[2]};flex:0 0 14px"></span>${c[1]}</div>`).join("")
    :`<div style="display:flex;gap:8px;align-items:center;padding:3px 0"><span style="width:14px;height:12px;border-radius:3px;background:#e3e6df;flex:0 0 14px"></span>Sem processo</div>`+ETAPAS[gp].map((e,i)=>`<div style="display:flex;gap:8px;align-items:center;padding:3px 0"><span style="width:14px;height:12px;border-radius:3px;background:${etapaCor(gp,i)};flex:0 0 14px"></span>${e}</div>`).join("")};
  $("#fCor").onchange=()=>{lay.setStyle(f=>fStyle(uc,f));leg()};leg();
  $("#fSat").onchange=e=>{if(e.target.checked){_fmap.removeLayer(_fmap._bases["Mapa"]);_fmap._bases["Satélite"].addTo(_fmap)}else{_fmap.removeLayer(_fmap._bases["Satélite"]);_fmap._bases["Mapa"].addTo(_fmap)}};
  setTimeout(()=>_fmap.invalidateSize(),80);
}
function etapaCor(gp,i){const n=ETAPAS[gp].length-1;if(i===n)return "#0ca30c";const ramp=["#cde2fb","#86b6ef","#3987e5","#1c5cab","#0d3a73"];return ramp[Math.min(ramp.length-1,Math.round(i/(n-1||1)*(ramp.length-1)))]}
function fStyle(uc,f){
  const p=f.properties, modo=($("#fCor")||{}).value||"cond";
  let cor; if(modo==="cond")cor=condInfo(p.cond)[2]; else {const pr=procDe(uc,p.cod);cor=pr?etapaCor(grupoUC(uc),pr.etapa):"#e3e6df"}
  return {color:"#ffffff",weight:1,fillColor:cor,fillOpacity:.75,dashArray:p.relevante?null:"3 3"};
}
function fichaImovel(uc,cod){
  const f=CAR.imoveis.features.find(x=>x.properties.uc===uc&&x.properties.cod===cod), p=f.properties, gp=grupoUC(uc);
  const k=cod+"|"+uc, pr=S.fund[k]||{tipo:TIPOS[gp][0],etapa:0,edocs:"",resp:(USERS.find(u=>u.uc===uc&&u.papel==="gestor")||USERS[0]).id,prazo:"",obs:"",hist:[]};
  const pode=isAdmin()||(user().uc===uc&&user().papel!=="tecnico")||user().uc===uc;
  const equipe=USERS.filter(u=>u.uc===uc||u.papel==="admin");
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
    <div style="display:flex;justify-content:space-between;gap:10px"><div><div class="small muted">${uc} · Imóvel do CAR</div><h2 style="font-family:ui-monospace,monospace;font-size:15px;word-break:break-all">${cod}</h2></div><button class="btn sm" id="dX">✕</button></div>
    <div class="fld" style="margin:10px 0 0"><label>Proprietário(a) / possuidor(a)</label><div class="ro">${propCel(cod)}</div></div>
    <div class="grid g2" style="gap:8px;margin-top:12px">
      <div class="fld" style="margin:0"><label>Município</label><div class="ro">${esc(p.mun)}</div></div>
      <div class="fld" style="margin:0"><label>Situação no SICAR</label><div class="ro">${p.sit}</div></div>
      <div class="fld" style="margin:0"><label>Área do imóvel</label><div class="ro">${fmt(p.a_imovel,2)} ha</div></div>
      <div class="fld" style="margin:0"><label>Dentro da UC</label><div class="ro"><b>${fmt(p.a_dentro,2)} ha</b> (${p.pct===null?"—":fmt(p.pct,1)+"%"})</div></div>
    </div>
    <div class="fld"><label>Análise do CAR pelo órgão ambiental</label><div class="ro"><span class="pill"><i style="background:${condInfo(p.cond)[2]}"></i>${esc(p.cond)}</span></div></div>
    <p class="small"><a href="https://consultapublica.car.gov.br/publico/imoveis/index" target="_blank" rel="noopener">Consultar no SICAR (consulta pública) ↗</a> · copie o código acima</p>
    ${gp==="PI"?'<div style="display:inline-block;background:#9b2424;color:#fff;font-weight:800;letter-spacing:.06em;padding:3px 9px;border-radius:6px;font-size:11px;margin-top:18px">REGULARIZAÇÃO FUNDIÁRIA</div>':""}
    <h3 style="margin:${gp==="PI"?"6px":"20px"} 0 4px;font-size:15px">Processo administrativo ${gp==="PI"?"de regularização fundiária":"de regularização / acompanhamento"}</h3>
    ${pr.simulado?'<div class="note" style="margin:6px 0">Processo de exemplo, criado para a validação.</div>':""}
    <div class="fld"><label>Tipo de processo</label><select id="pTipo" ${pode?"":"disabled"}>${TIPOS[gp].map(t=>`<option ${pr.tipo===t?"selected":""}>${t}</option>`).join("")}</select></div>
    <div class="fld"><label>Etapa</label><div style="display:flex;flex-direction:column;gap:4px" id="pEt">${ETAPAS[gp].map((e,i)=>`<label style="display:flex;gap:10px;align-items:center;padding:7px 10px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-weight:${i===pr.etapa?700:400};background:${i===pr.etapa?"var(--brand-soft)":"#fff"};margin:0"><input type="radio" style="width:auto;flex:0 0 auto;margin:0" name="pEt" value="${i}" ${i===pr.etapa?"checked":""} ${pode?"":"disabled"}><span style="width:20px;height:20px;border-radius:50%;background:${i<=pr.etapa?etapaCor(gp,i):"#e3e6df"};color:#fff;font-size:11px;display:grid;place-items:center;flex:0 0 20px">${i+1}</span>${e}</label>`).join("")}</div></div>
    <div class="grid g2" style="gap:12px">
      <div class="fld"><label>Nº do processo administrativo (E-Docs)</label><input id="pEd" value="${esc(pr.edocs)}" placeholder="Ex.: 2026-ABC12" ${pode?"":"disabled"}></div>
      <div class="fld"><label>Prazo da etapa</label><input type="date" id="pPz" value="${pr.prazo||""}" ${pode?"":"disabled"}></div>
    </div>
    <div class="fld"><label>Responsável</label><select id="pRs" ${pode?"":"disabled"}>${equipe.map(u=>`<option value="${u.id}" ${u.id===pr.resp?"selected":""}>${esc(u.nome)}</option>`).join("")}</select></div>
    <div class="fld"><label>Próximos passos / observações</label><textarea id="pOb" placeholder="Ex.: aguardando certidão de inteiro teor; vistoria marcada…" ${pode?"":"disabled"}>${esc(pr.obs)}</textarea></div>
    <div class="fld"><label style="display:flex;justify-content:space-between;align-items:center">Andamentos do processo (${(pr.and||[]).length})${pode?'<button class="btn primary sm" id="aNovo" type="button">+ Incluir andamento</button>':""}</label>
      <div id="aForm"></div>
      <div style="border-left:3px solid var(--brand-soft);margin-left:6px;padding-left:12px">${(pr.and||[]).slice().sort((a,b)=>b.data.localeCompare(a.data)).map(a=>`<div style="position:relative;padding:6px 0 10px">
        <span style="position:absolute;left:-19px;top:9px;width:11px;height:11px;border-radius:50%;background:var(--brand);border:2px solid #fff"></span>
        <div class="small"><b>${fmtD(a.data)}</b> · <b style="color:var(--brand)">${esc(a.tipo)}</b>${a.doc?` · <span style="font-family:ui-monospace,monospace">${esc(a.doc)}</span>`:""}${a.exemplo?' <span class="muted">· exemplo</span>':""}</div>
        ${a.desc?`<div class="small" style="margin-top:2px">${esc(a.desc)}</div>`:""}
        <div class="small muted">${esc(userById(a.autor).nome)}${a.anexos&&a.anexos.length?` · 📎 ${a.anexos.map(x=>esc(x.nome)).join(", ")}`:""}${a.etapa!=null?` · etapa → ${ETAPAS[gp][a.etapa]}`:""}${pode?` · <a href="#" data-adel="${a.id}" style="color:#9b2424">excluir</a>`:""}</div></div>`).join("")||'<div class="small muted" style="padding:6px 0">Nenhum andamento registrado.</div>'}</div></div>
    ${pr.hist&&pr.hist.length?`<div class="fld"><label>Histórico de alterações</label>${pr.hist.slice(0,8).map(h=>`<div class="small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">${new Date(h.q).toLocaleString("pt-BR")}</span> · ${esc(h.t)}</div>`).join("")}</div>`:""}
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">${pode?`<button class="btn primary" id="pSave">${S.fund[k]?"Salvar processo":"Abrir processo"}</button>`:""}${S.fund[k]&&pode?`<button class="btn" id="pDel">Excluir processo</button>`:""}</div>
  </div></div>`;
  const close=()=>$("#drawerRoot").innerHTML="";
  $("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  const procAtual=()=>({tipo:$("#pTipo").value,etapa:+document.querySelector('input[name="pEt"]:checked').value,edocs:$("#pEd").value.trim(),prazo:$("#pPz").value,resp:$("#pRs").value,obs:$("#pOb").value,hist:pr.hist||[],and:pr.and||[],simulado:false});
  let anexosAnd=[];
  if($("#aNovo"))$("#aNovo").onclick=()=>{
    $("#aForm").innerHTML=`<div class="card" style="background:var(--surface-2);margin:8px 0 12px;padding:12px">
      <div class="grid g2" style="gap:10px"><div class="fld" style="margin:0"><label>Data</label><input type="date" id="aDt" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="fld" style="margin:0"><label>Tipo de andamento</label><select id="aTp">${TIPOS_AND.map(t=>`<option>${t}</option>`).join("")}</select></div></div>
      <div class="fld" style="margin:10px 0 0"><label>Nº do documento (ofício, despacho, memorando…)</label><input id="aDoc" placeholder="Ex.: Ofício 123/2026"></div>
      <div class="fld" style="margin:10px 0 0"><label>Descrição</label><textarea id="aDs" placeholder="O que aconteceu e o próximo passo"></textarea></div>
      <div class="fld" style="margin:10px 0 0"><label>Atualizar a etapa do processo para (opcional)</label><select id="aEt"><option value="">— manter a etapa atual —</option>${ETAPAS[gp].map((e,i)=>`<option value="${i}">${i+1}. ${e}</option>`).join("")}</select></div>
      <div class="fld" style="margin:10px 0 0"><label>Anexos</label><div id="aAnx" class="small muted">Nenhum anexo.</div>
        <label class="btn sm" style="display:inline-flex;gap:6px;margin-top:6px;cursor:pointer">📎 Anexar<input type="file" id="aUp" multiple accept="image/*,application/pdf,.doc,.docx,.odt" style="display:none"></label></div>
      <div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" id="aSave" type="button">Salvar andamento</button><button class="btn" id="aCanc" type="button">Cancelar</button></div></div>`;
    $("#aCanc").onclick=()=>{$("#aForm").innerHTML="";anexosAnd=[]};
    $("#aUp").onchange=async e=>{for(const f of e.target.files){const a=await lerArquivo(f);anexosAnd.push({nome:a.nome,tipo:a.tipo,thumb:a.thumb})}$("#aAnx").innerHTML=anexosAnd.map(a=>`📎 ${esc(a.nome)}`).join("<br>")};
    $("#aSave").onclick=()=>{
      const dt=$("#aDt").value;if(!dt){toast("Informe a data");return}
      const novo=procAtual();const et=$("#aEt").value;
      const an={id:"an"+Date.now(),data:dt,tipo:$("#aTp").value,doc:$("#aDoc").value.trim(),desc:$("#aDs").value.trim(),anexos:anexosAnd,autor:S.user,etapa:et===""?null:+et};
      novo.and=[...(novo.and||[]),an]; if(et!=="")novo.etapa=+et;
      novo.hist=[{q:new Date().toISOString(),t:`Andamento: ${an.tipo}${an.doc?" ("+an.doc+")":""}${et!==""?"; etapa → "+ETAPAS[gp][+et]:""} por ${user().nome}`},...(novo.hist||[])];
      if(!S.fund[k])novo.hist.push({q:new Date().toISOString(),t:"Processo aberto por "+user().nome});
      S.fund[k]=novo;
      try{saveFund()}catch(e){toast("Armazenamento cheio");return}
      if(novo.resp!==S.user)S.log.unshift({quando:new Date().toISOString(),para:userById(novo.resp).email,assunto:`[SisGAP-ES] ${uc}: novo andamento no processo ${novo.edocs||curto(cod)} — ${an.tipo}`,tipo:"Fundiário"});
      save();toast("Andamento incluído");vFundiario();fichaImovel(uc,cod);
    };
  };
  document.querySelectorAll("[data-adel]").forEach(a=>a.onclick=e=>{e.preventDefault();const x=S.fund[k];if(!x)return;x.and=(x.and||[]).filter(y=>y.id!==a.dataset.adel);saveFund();vFundiario();fichaImovel(uc,cod)});
  if($("#pSave"))$("#pSave").onclick=()=>{
    const novo=procAtual();
    const mud=[];if(!S.fund[k])mud.push("processo aberto");else{if(novo.etapa!==pr.etapa)mud.push("etapa → "+ETAPAS[gp][novo.etapa]);if(novo.resp!==pr.resp)mud.push("responsável → "+userById(novo.resp).nome);if(novo.prazo!==pr.prazo)mud.push("prazo → "+(novo.prazo?fmtD(novo.prazo):"sem prazo"));if(novo.edocs!==pr.edocs)mud.push("E-Docs → "+novo.edocs)}
    novo.hist.unshift({q:new Date().toISOString(),t:(mud.join("; ")||"Atualizado")+" por "+user().nome});
    if(!S.fund[k]||novo.resp!==pr.resp||novo.prazo!==pr.prazo)S.log.unshift({quando:new Date().toISOString(),para:userById(novo.resp).email,assunto:`[SisGAP-ES] ${uc}: processo fundiário do imóvel ${curto(cod)} — ${ETAPAS[gp][novo.etapa]}${novo.prazo?", prazo "+fmtD(novo.prazo):""}`,tipo:"Fundiário"});
    S.fund[k]=novo;saveFund();save();close();toast("Processo salvo");vFundiario();
  };
  if($("#pDel"))$("#pDel").onclick=()=>{delete S.fund[k];saveFund();close();toast("Processo excluído");vFundiario()};
}

// ======================= BIODIVERSIDADE =======================
const AMEA=["CR","EN","VU"];
const ehAmea = x => AMEA.includes(x.es)||AMEA.includes(x.br);
let FB={g:"",am:"",q:"",ev:""}, _bmap=null;
// ---------- registros de espécies pela equipe ----------
S.bioReg = LS.get("bioReg",[]);
const saveBioReg=()=>{try{localStorage.setItem("sisgap:bioReg",JSON.stringify(S.bioReg));return true}catch(e){toast("Armazenamento do navegador cheio");return false}};
{const _r=resetDemo; resetDemo=function(){try{localStorage.removeItem("sisgap:bioReg")}catch(e){};_r()};}
const GRUPOS_BIO=["Aves","Mamíferos","Répteis","Anfíbios","Peixes","Invertebrados","Flora"];
const podeValidar=uc=>isAdmin()||(user().uc===uc&&user().papel==="gestor");
// lista combinada: painel robusto + espécies novas validadas pela equipe
function especiesUC(uc){
  const base=(BIO[uc]?BIO[uc].especies:[]).map(x=>Object.assign({},x));
  S.bioReg.filter(r=>r.uc===uc&&r.st==="val").forEach(r=>{
    const e=base.find(x=>x.s.toLowerCase()===r.sp.toLowerCase());
    if(e){if(!e.ev.includes("Registro da equipe"))e.ev=[...e.ev,"Registro da equipe"];e.eq=(e.eq||0)+1}
    else base.push({g:r.g,f:r.fam||"",s:r.sp,p:r.pop||"",es:r.es||"",br:r.br||"",iucn:"",ev:["Registro da equipe"],n:0,ult:+r.data.slice(0,4),lit:[],exo:"",eq:1,nova:true});
  });
  return base;
}
function atualizaEstoques(uc){
  const sp=especiesUC(uc);if(!sp.length||!S.lanc[uc])return;
  const fa=sp.filter(x=>x.g!=="Flora"),fl=sp.filter(x=>x.g==="Flora");
  const v={fau:fa.length,faa:fa.filter(ehAmea).length,flo:fl.length,fla:fl.filter(ehAmea).length};
  for(const id in v)S.lanc[uc][id]=S.lanc[uc][id].map(x=>x===""?"":v[id]);
}
for(const uc in BIO)atualizaEstoques(uc);

function vBio(){
  const uc=ucAtual();
  title("Biodiversidade — espécies com evidência robusta", uc?`${uc} — ${ucObj(uc).n}`:"UCs da versão de teste");
  if(uc&&!BIO[uc]&&temGeo(uc))return vBioSemPainel(uc);
  if(!uc||!BIO[uc]){
    $("#view").innerHTML=`<div class="info" style="margin-bottom:16px">Os painéis de espécies já integrados são os da APAGO e da ARIEMV. Para o PE Forno Grande e o PE Itaúnas, a análise de espécies no mesmo padrão ainda não foi gerada.</div>
    <div class="grid g4">${GEO_UCS.map(s=>`<div class="uc-tile" onclick="S.uc='${s}';save();route()"><b>${s}</b><div class="meta">${esc(ucObj(s).n)}</div><div class="small">${BIO[s]?`<b>${especiesUC(s).length}</b> espécies · <b>${especiesUC(s).filter(ehAmea).length}</b> ameaçadas`:"painel pendente · registros da equipe: <b>"+S.bioReg.filter(r=>r.uc===s).length+"</b>"}</div></div>`).join("")}</div>`;
    return;
  }
  const B=BIO[uc], sp=especiesUC(uc), am=sp.filter(ehAmea), exo=sp.filter(x=>x.exo), nEx=sp.reduce((t,x)=>t+x.n,0);
  const grupos=[...new Set(sp.map(x=>x.g))].sort((a,b)=>sp.filter(x=>x.g===b).length-sp.filter(x=>x.g===a).length);
  const fa=sp.filter(x=>x.g!=="Flora"), fl=sp.filter(x=>x.g==="Flora");
  $("#view").innerHTML=`
  <div class="info" style="margin-bottom:16px"><b>Fonte:</b> ${esc(B.fonte)} Entram exemplares de coleção com localidade na UC, espécies citadas no plano de manejo e na literatura e observações pessoais do autor; ficam de fora observações sem exemplar e coordenadas fora da UC.
   <br><b>Coordenadas exatas não são exibidas</b> (há espécies ameaçadas): o mapa mostra só quadrículas de cerca de 2 km.</div>
  <div class="grid g4">
    <div class="card kpi"><div class="lbl">Espécies registradas</div><div class="val">${sp.length}</div><div class="foot">fauna <b>${fa.length}</b> · flora <b>${fl.length}</b></div></div>
    <div class="card kpi"><div class="lbl">Espécies ameaçadas (ES ou Brasil)</div><div class="val" style="color:#9b2424">${am.length}</div><div class="foot">CR <b>${am.filter(x=>x.es==="CR"||x.br==="CR").length}</b> · EN <b>${am.filter(x=>x.es==="EN"||x.br==="EN").length}</b> · VU <b>${am.filter(x=>x.es==="VU"||x.br==="VU").length}</b></div></div>
    <div class="card kpi"><div class="lbl">Exemplares em coleções</div><div class="val">${fmt(nEx)}</div><div class="foot">registros de ${B.periodo?B.periodo[0]+" a "+B.periodo[1]:"—"}</div></div>
    <div class="card kpi"><div class="lbl">Exóticas invasoras</div><div class="val">${exo.length}</div><div class="foot">${exo.length?esc(exo.slice(0,2).map(x=>x.p||x.s).join(", "))+(exo.length>2?"…":""):"nenhuma marcada no painel"}</div></div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>Espécies por grupo</h3><p class="sub">Evidência robusta</p>${hbars(grupos.map(g=>({l:g,v:sp.filter(x=>x.g===g).length})),{unit:"espécies"})}</div>
    <div class="card"><h3>Ameaçadas por grupo</h3><p class="sub">Lista estadual (ES) ou nacional, conforme o painel de espécies</p>${hbars(grupos.map(g=>({l:g,v:am.filter(x=>x.g===g).length})).filter(x=>x.v),{unit:"espécies ameaçadas",color:"#d03b3b"})}</div>
    <div class="card"><h3>Alimenta os indicadores comuns</h3><p class="sub">Valores de estoque usados no lançamento mensal</p>
      <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Fauna total da UC</div><div class="v">${fa.length}</div></div>
      <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Espécies da fauna ameaçadas</div><div class="v">${fa.filter(ehAmea).length}</div></div>
      <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Flora total da UC</div><div class="v">${fl.length}</div></div>
      <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Espécies da flora ameaçadas</div><div class="v">${fl.filter(ehAmea).length}</div></div></div>
  </div>
  <div class="grid g21" style="margin-top:16px">
    <div class="card"><h3>Onde há registros</h3><p class="sub">Exemplares com coordenada confiável (classes C1, C1b e C2), agregados em quadrículas de ~2 km · sem identificação das espécies</p>
      <div id="bMap" style="height:380px;border-radius:10px;border:1px solid var(--line)"></div>
      <div class="legend" id="bLeg"></div></div>
    <div class="card"><h3>Lacunas e usos na gestão</h3><div class="small" style="line-height:1.6;color:var(--ink-2)">
      <p>• <b>${am.filter(x=>!x.n).length}</b> ameaçadas só aparecem no plano de manejo ou na literatura, sem exemplar em coleção: prioridade para pesquisa e coleta.</p>
      <p>• <b>${sp.filter(x=>x.ult&&x.ult<2000).length}</b> espécies têm o último exemplar antes de 2000: confirmar se ainda ocorrem.</p>
      ${exo.length?`<p>• As <b>${exo.length}</b> exóticas invasoras orientam a ação de <b>manejo e controle de exóticas</b>.</p>`:""}
      <p>• A lista sustenta pareceres de licenciamento na zona de amortecimento e a revisão do plano de manejo.</p></div></div>
  </div>
  ${cardEquipe(uc)}
  <div class="card" style="margin-top:16px;padding:0">
    <div style="padding:14px 16px 0"><h3>Lista de espécies</h3>
    <div class="filters"><input id="bq" placeholder="Espécie, família ou nome popular" value="${esc(FB.q)}" style="width:250px">
      <select id="bg"><option value="">Todos os grupos</option>${grupos.map(g=>`<option ${FB.g===g?"selected":""}>${g}</option>`).join("")}</select>
      <select id="ba"><option value="">Com ou sem ameaça</option><option value="es" ${FB.am==="es"?"selected":""}>Ameaçadas no ES</option><option value="br" ${FB.am==="br"?"selected":""}>Ameaçadas no Brasil</option><option value="qq" ${FB.am==="qq"?"selected":""}>Ameaçadas (ES ou Brasil)</option>${exo.length?`<option value="exo" ${FB.am==="exo"?"selected":""}>Exóticas invasoras</option>`:""}</select>
      <select id="be"><option value="">Toda evidência</option>${["Exemplar","Plano de Manejo","Literatura","Obs. pessoal","Registro da equipe"].map(e=>`<option ${FB.ev===e?"selected":""}>${e}</option>`).join("")}</select>
      <span style="flex:1"></span><span class="small muted" id="bN"></span><button class="btn sm" id="bCsv">⬇ Planilha (CSV)</button></div></div>
    <div class="tbl-wrap" style="border:0;border-top:1px solid var(--line);max-height:560px" id="bTab"></div></div>`;
  const filtrar=()=>sp.filter(x=>(!FB.g||x.g===FB.g)&&(!FB.am||(FB.am==="es"?AMEA.includes(x.es):FB.am==="br"?AMEA.includes(x.br):FB.am==="exo"?!!x.exo:ehAmea(x)))&&(!FB.ev||x.ev.includes(FB.ev))&&(!FB.q||(x.s+" "+x.f+" "+x.p).toLowerCase().includes(FB.q.toLowerCase())));
  const catPill=c=>c?`<span class="pill ${c==="CR"?"st-atr":c==="EN"?"st-atr":c==="VU"?"st-venc":""}" style="font-size:10.5px">${c}</span>`:'<span class="muted">—</span>';
  const drawTab=()=>{const L=filtrar().sort((a,b)=>(ehAmea(b)-ehAmea(a))||a.g.localeCompare(b.g)||a.s.localeCompare(b.s));
    $("#bN").textContent=`${L.length} espécies`;
    $("#bTab").innerHTML=`<table><thead><tr><th>Grupo</th><th>Família</th><th>Espécie</th><th>Nome popular</th><th>ES</th><th>Brasil</th><th>IUCN</th><th>Evidência</th><th class="num">Exempl.</th><th class="num">Último</th></tr></thead><tbody>
    ${L.map(x=>`<tr><td class="small">${x.g}</td><td class="small muted">${esc(x.f)}</td><td><i>${esc(x.s)}</i>${x.nova?' <span class="pill st-conc" style="font-size:10px"><i></i>nova para a UC</span>':""}${x.exo?` <span class="pill st-venc" style="font-size:10px">${esc(x.exo)}</span>`:""}</td><td class="small">${esc(x.p)}</td>
      <td>${catPill(x.es)}</td><td>${catPill(x.br)}</td><td class="small">${esc(x.iucn||"")}</td><td class="small" title="${esc(x.lit.join("; "))}">${x.ev.join(", ")}</td><td class="num">${x.n||""}</td><td class="num small">${x.ult||""}</td></tr>`).join("")}</tbody></table>`};
  drawTab();ligaEquipe(uc);
  $("#bq").oninput=e=>{FB.q=e.target.value;drawTab()};$("#bg").onchange=e=>{FB.g=e.target.value;drawTab()};$("#ba").onchange=e=>{FB.am=e.target.value;drawTab()};$("#be").onchange=e=>{FB.ev=e.target.value;drawTab()};
  $("#bCsv").onclick=()=>{const head=["grupo","familia","especie","nome_popular","ameaca_ES","ameaca_BR","IUCN","evidencia","exemplares","ultimo_registro","exotica","fontes"];
    const rows=filtrar().map(x=>[x.g,x.f,x.s,x.p,x.es,x.br,x.iucn,x.ev.join(", "),x.n,x.ult||"",x.exo,x.lit.join("; ")]);
    const csv="﻿"+[head,...rows].map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`sisgap_especies_${uc}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);toast("Planilha baixada")};
  // mapa em grade
  if(_bmap){_bmap.remove();_bmap=null}
  _bmap=L_map("bMap",uc);
  const mx=Math.max(1,...B.grade.map(c=>c.n)), ramp=["#cde2fb","#86b6ef","#3987e5","#1c5cab"];
  const cor=n=>ramp[Math.min(3,Math.floor(n/mx*4-1e-9))];
  B.grade.forEach(c=>window.L.rectangle([[c.lat0,c.lon0],[c.lat0+B.cell,c.lon0+B.cell]],{color:"#fff",weight:2,fillColor:cor(c.n),fillOpacity:.72})
    .bindTooltip(`<b>${c.n} exemplares</b><br>${c.ns} espécies nesta quadrícula`,{sticky:true}).addTo(_bmap));
  _bmap._lim.bringToFront();
  const q=[0,.25,.5,.75,1].map(k=>Math.round(k*mx));
  $("#bLeg").innerHTML=ramp.map((c,i)=>`<span><i style="background:${c}"></i>${q[i]+(i?1:0)}–${q[i+1]} exemplares</span>`).join("");
  setTimeout(()=>_bmap.invalidateSize(),80);
}

// ---------- registros de espécies da equipe ----------
const ST_BIO={pend:["Pendente de validação","st-venc"],val:["Validado","st-conc"],rej:["Não validado","st-atr"]};
function cardEquipe(uc){
  const R=S.bioReg.filter(r=>r.uc===uc).sort((a,b)=>b.data.localeCompare(a.data)), pend=R.filter(r=>r.st==="pend").length;
  const lista=BIO[uc]?BIO[uc].especies:[];
  return `<div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Registros da equipe</h3><p class="sub">Espécies registradas por guarda-parques, analistas e gestores · ${R.length} registro(s)${pend?` · <b style="color:#7a5a00">${pend} aguardando validação</b>`:""}</p></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="btn primary" id="bNovo">+ Registrar espécie</button><button class="btn" id="bImp">⬆ Importar planilha</button>${pend&&podeValidar(uc)?`<button class="btn" id="bLote">✓ Validar todos (${pend})</button>`:""}</div></div>
    ${R.length?`<div class="tbl-wrap"><table><thead><tr><th>Data</th><th>Espécie</th><th>Grupo</th><th>Tipo de registro</th><th>Quem registrou</th><th>Situação</th><th></th></tr></thead><tbody>
    ${R.slice(0,300).map(r=>{const nova=!lista.some(x=>x.s.toLowerCase()===r.sp.toLowerCase());return `<tr style="cursor:pointer" data-br="${r.id}"><td class="small">${fmtD(r.data)}</td><td><i>${esc(r.sp)}</i>${r.pop?`<div class="small muted">${esc(r.pop)}</div>`:""}${nova?' <span class="pill" style="font-size:10px">nova para a UC</span>':""}</td>
      <td class="small">${r.g}</td><td class="small">${esc(r.tipo)}${r.anexos.length?` · 📎${r.anexos.length}`:""}</td><td class="small">${esc(userById(r.autor).nome)}</td>
      <td><span class="pill ${ST_BIO[r.st][1]}"><i></i>${ST_BIO[r.st][0]}</span></td><td>${r.st==="pend"&&podeValidar(uc)?'<span class="small" style="color:var(--brand);font-weight:600">Validar ›</span>':""}</td></tr>`}).join("")}</tbody></table></div>`
    :`<p class="small muted" style="margin:0">Nenhum registro ainda. Viu, fotografou ou ouviu uma espécie na UC? Registre com foto e local: depois da validação, ela entra na lista e nos indicadores.</p>`}</div>`;
}
function ligaEquipe(uc){
  if($("#bNovo"))$("#bNovo").onclick=()=>formEspecie(uc,null);
  if($("#bImp"))$("#bImp").onclick=()=>abrirImportacao(uc);
  if($("#bLote"))$("#bLote").onclick=()=>validarLote(uc,true);
  document.querySelectorAll("[data-br]").forEach(tr=>tr.onclick=()=>formEspecie(uc,S.bioReg.find(r=>r.id===tr.dataset.br)));
}
function vBioSemPainel(uc){
  title("Biodiversidade — registros da equipe",`${uc} — ${ucObj(uc).n}`);
  $("#view").innerHTML=`<div class="info">O painel de espécies com evidência robusta desta UC ainda não foi gerado. Enquanto isso, a equipe já pode registrar espécies, que entram na lista depois de validadas.</div>${cardEquipe(uc)}`;
  ligaEquipe(uc);
}
let _bioMap=null;
function formEspecie(uc,r){
  const nova=!r, lista=BIO[uc]?BIO[uc].especies:[];
  const R=r?JSON.parse(JSON.stringify(r)):{id:"b"+Date.now(),uc,sp:"",pop:"",g:"",fam:"",tipo:"Avistamento",n:"1",data:new Date().toISOString().slice(0,10),obs:"",anexos:[],lat:null,lon:null,autor:S.user,st:"pend",val:null};
  const dono=R.autor===S.user||isAdmin()||user().uc===uc, validador=podeValidar(uc)&&!nova, editavel=(dono||validador)&&R.st==="pend";
  const draw=()=>{
    const conhecida=lista.find(x=>x.s.toLowerCase()===R.sp.trim().toLowerCase());
    $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
    <div style="display:flex;justify-content:space-between;gap:10px"><div><div class="small muted">${uc} · Biodiversidade</div><h2>${nova?"Registrar espécie":"Registro de espécie"}</h2></div><button class="btn sm" id="dX">✕</button></div>
    ${nova?"":`<div style="margin:6px 0"><span class="pill ${ST_BIO[R.st][1]}"><i></i>${ST_BIO[R.st][0]}</span>${R.val?` <span class="small muted">por ${esc(userById(R.val.por).nome)} em ${new Date(R.val.q).toLocaleDateString("pt-BR")}</span>`:""}</div>`}
    <div class="fld"><label>Espécie (nome científico)</label><input id="eSp" list="spList" value="${esc(R.sp)}" placeholder="Comece a digitar: a lista da UC aparece" ${editavel?"":"disabled"}>
      <datalist id="spList">${lista.slice(0,1500).map(x=>`<option value="${esc(x.s)}">${esc(x.p||x.g)}</option>`).join("")}</datalist>
      <div class="small" id="eSpInfo" style="margin-top:5px">${R.sp?(conhecida?`✓ Já consta na lista da UC (${esc(conhecida.g)}${ehAmea(conhecida)?", <b style='color:#9b2424'>ameaçada</b>":""}). O registro reforça a evidência.`:'<b style="color:#1e4b34">Espécie nova para a UC</b> — será conferida na validação.'):'<span class="muted">Se não souber o nome científico, escreva o que conseguir (ex.: “Tangara sp.”) e explique nas observações.</span>'}</div></div>
    <div class="grid g2" style="gap:12px">
      <div class="fld"><label>Nome popular</label><input id="ePop" value="${esc(R.pop||(conhecida?conhecida.p:""))}" ${editavel?"":"disabled"}></div>
      <div class="fld"><label>Grupo</label><select id="eG" ${editavel?"":"disabled"}><option value="">—</option>${GRUPOS_BIO.map(g=>`<option ${(R.g||(conhecida?conhecida.g:""))===g?"selected":""}>${g}</option>`).join("")}</select></div>
      <div class="fld"><label>Tipo de registro</label><select id="eTp" ${editavel?"":"disabled"}>${["Avistamento","Fotografia","Vestígio (pegada, fezes, ninho)","Vocalização / áudio","Armadilha fotográfica","Coleta autorizada","Encontrado morto"].map(t=>`<option ${R.tipo===t?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="fld"><label>Nº de indivíduos</label><input id="eN" value="${esc(R.n)}" inputmode="numeric" ${editavel?"":"disabled"}></div>
    </div>
    <div class="fld"><label>Data</label><input type="date" id="eDt" value="${R.data}" ${editavel?"":"disabled"}></div>
    <div class="fld"><label>Fotos, áudio ou documentos</label>
      <div style="display:grid;gap:6px">${R.anexos.map((a,i)=>`<div style="display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:5px">${a.thumb?`<img src="${a.thumb}" style="width:52px;height:40px;object-fit:cover;border-radius:5px">`:`<div style="width:52px;height:40px;display:grid;place-items:center;background:var(--surface-2);border-radius:5px">📎</div>`}
        <div class="small" style="min-width:0"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600">${esc(a.nome)}</div><div class="muted">${a.lat!==null?"📍 GPS da foto":"sem GPS"}</div></div>${editavel?`<button class="btn sm" data-rx="${i}">✕</button>`:""}</div>`).join("")||'<div class="ro small muted">Uma boa foto é a melhor evidência para a validação.</div>'}</div>
      ${editavel?`<label class="btn" style="display:inline-flex;gap:8px;align-items:center;margin-top:8px;cursor:pointer">📷 Anexar<input type="file" id="eUp" multiple accept="image/*,audio/*,application/pdf" style="display:none"></label>`:""}</div>
    ${temGeo(uc)?`<div class="fld"><label>Local <span class="muted" style="font-weight:400">(do GPS da foto ou clique no mapa)</span></label><div class="small" style="margin-bottom:6px">${R.lat!==null?`📍 ${R.lat.toFixed(5)}, ${R.lon.toFixed(5)}${dentroUC(uc,R.lat,R.lon)===false?' <b style="color:#9b2424">· fora do limite da UC</b>':""}`:"Sem local."}</div>
      <div id="eMap" style="height:200px;border-radius:10px;border:1px solid var(--line)"></div>
      <div class="small muted" style="margin-top:4px">O local fica visível só para a equipe e não aparece em mapas públicos.</div></div>`:""}
    ${R.origem?`<div class="fld"><label>Origem</label><div class="ro small">Registro do indicador “${esc(R.origem)}” no lançamento mensal</div></div>`:""}
    <div class="fld"><label>Observações</label><textarea id="eOb" placeholder="Comportamento, habitat, quem identificou…" ${editavel?"":"disabled"}>${esc(R.obs)}</textarea></div>
    ${validador&&R.st==="pend"?`<div class="card" style="background:var(--surface-2);margin-top:8px"><h3>Validação</h3><p class="sub">Confira a identificação pela foto e pelo local.</p>
      <div class="fld" style="margin:8px 0"><label>Comentário</label><textarea id="vCom" placeholder="Ex.: identificação confirmada pela foto"></textarea></div>
      <div style="display:flex;gap:8px"><button class="btn primary" id="vOk">✓ Validar</button><button class="btn" id="vNo">Não validar</button></div></div>`:""}
    ${R.val&&R.val.com?`<div class="fld"><label>Comentário da validação</label><div class="ro">${esc(R.val.com)}</div></div>`:""}
    <div style="display:flex;gap:8px;margin-top:14px">${editavel?`<button class="btn primary" id="eSave">${nova?"Enviar para validação":"Salvar"}</button>`:""}${!nova&&editavel?`<button class="btn" id="eDel">Excluir</button>`:""}</div>
    </div></div>`;
    const pull=()=>{if(!editavel)return;R.sp=$("#eSp").value.trim();R.pop=$("#ePop").value.trim();R.g=$("#eG").value;R.tipo=$("#eTp").value;R.n=$("#eN").value.trim();R.data=$("#eDt").value;R.obs=$("#eOb").value;
      const c=lista.find(x=>x.s.toLowerCase()===R.sp.toLowerCase());if(c){R.fam=c.f;R.es=c.es;R.br=c.br}};
    const close=()=>{if(_bioMap){_bioMap.remove();_bioMap=null}$("#drawerRoot").innerHTML=""};
    $("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
    if($("#eSp"))$("#eSp").onchange=()=>{pull();const c=lista.find(x=>x.s.toLowerCase()===R.sp.toLowerCase());if(c){R.g=c.g;if(!R.pop)R.pop=c.p}setTimeout(draw,0)};
    document.querySelectorAll("[data-rx]").forEach(b=>b.onclick=()=>{pull();R.anexos.splice(+b.dataset.rx,1);setTimeout(draw,0)});
    if($("#eUp"))$("#eUp").onchange=async e=>{pull();for(const f of e.target.files){const a=await lerArquivo(f);R.anexos.push({nome:a.nome,tipo:a.tipo,thumb:a.thumb,lat:a.lat,lon:a.lon});if(R.lat===null&&a.lat!==null){R.lat=a.lat;R.lon=a.lon}if(a.origem==="exif"&&a.data)R.data=a.data}draw()};
    if(temGeo(uc)){if(_bioMap){_bioMap.remove();_bioMap=null}_bioMap=L_map("eMap",uc,{small:true});
      if(R.lat!==null)window.L.circleMarker([R.lat,R.lon],{radius:8,color:"#fff",weight:2,fillColor:"#1baf7a",fillOpacity:1}).addTo(_bioMap);
      if(editavel){_bioMap.getContainer().style.cursor="crosshair";_bioMap.on("click",e=>{pull();R.lat=+e.latlng.lat.toFixed(6);R.lon=+e.latlng.lng.toFixed(6);setTimeout(draw,0)})}
      setTimeout(()=>_bioMap&&_bioMap.invalidateSize(),60)}
    const gestor=USERS.find(u=>u.uc===uc&&u.papel==="gestor");
    if($("#eSave"))$("#eSave").onclick=()=>{pull();
      if(!R.sp){toast("Informe a espécie");return} if(!R.g){toast("Escolha o grupo");return} if(!R.data){toast("Informe a data");return}
      S.bioReg=S.bioReg.filter(x=>x.id!==R.id);S.bioReg.push(R);
      if(nova&&gestor)S.log.unshift({quando:new Date().toISOString(),para:gestor.email,assunto:`[SisGAP-ES] ${uc}: novo registro de espécie para validar — ${R.sp}`,tipo:"Biodiversidade"});
      saveBioReg();save();close();toast(nova?"Registro enviado para validação":"Registro salvo");route()};
    if($("#eDel"))$("#eDel").onclick=()=>{S.bioReg=S.bioReg.filter(x=>x.id!==R.id);saveBioReg();close();toast("Registro excluído");route()};
    const validar=ok=>{const x=S.bioReg.find(y=>y.id===R.id);x.st=ok?"val":"rej";x.val={por:S.user,q:new Date().toISOString(),com:$("#vCom").value.trim()};
      S.log.unshift({quando:new Date().toISOString(),para:userById(x.autor).email,assunto:`[SisGAP-ES] ${uc}: seu registro de ${x.sp} foi ${ok?"validado":"não validado"}`,tipo:"Biodiversidade"});
      atualizaEstoques(uc);saveBioReg();save();close();toast(ok?"Registro validado: espécie conta na lista da UC":"Registro marcado como não validado");route()};
    if($("#vOk"))$("#vOk").onclick=()=>{pull();const x=S.bioReg.find(y=>y.id===R.id);Object.assign(x,{sp:R.sp,pop:R.pop,g:R.g,fam:R.fam,es:R.es,br:R.br});if(!x.g){toast("Defina o grupo antes de validar");return}validar(true)};
    if($("#vNo"))$("#vNo").onclick=()=>validar(false);
  };
  draw();
}

// ---------- importação de planilhas (Excel, XML, CSV, ODS) ----------
const CAMPOS_IMP=[
  ["sp","Espécie (nome científico)",["especie","espécie","scientificname","nome cientifico","nome científico","taxon","species","táxon","nome_cientifico"],true],
  ["pop","Nome popular",["nome popular","vernacularname","nome comum","nome_popular","popular"]],
  ["g","Grupo",["grupo","group","class","classe","reino","kingdom"]],
  ["data","Data",["data","date","eventdate","data do registro","data_registro","dia"]],
  ["lat","Latitude",["latitude","lat","decimallatitude","y"]],
  ["lon","Longitude",["longitude","lon","long","decimallongitude","x"]],
  ["n","Nº de indivíduos",["n","individuos","indivíduos","quantidade","abundancia","abundância","individualcount","contagem"]],
  ["tipo","Tipo de registro",["tipo","tipo de registro","basisofrecord","metodo","método"]],
  ["obs","Observações",["obs","observacoes","observações","notas","remarks","occurrenceremarks","comentario","comentário"]],
  ["autor","Observador",["observador","coletor","recordedby","autor","responsavel","responsável"]]
];
const norm=t=>String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
function grupoDe(v){const t=norm(v);if(!t)return "";
  const m=[["Aves",["ave","bird"]],["Mamíferos",["mamif","mammal"]],["Répteis",["reptil","reptile","squamata","serpente","lagart"]],["Anfíbios",["anfib","amphib","anura"]],["Peixes",["peix","fish","actinopter"]],["Invertebrados",["invert","insect","inseto","arachn","molus"]],["Flora",["flora","planta","plantae","angiosperm","pterid","briof","fung"]]];
  for(const [g,ks] of m)if(ks.some(k=>t.includes(k)))return g;return ""}
function dataDe(v){if(v instanceof Date&&!isNaN(v))return v.toISOString().slice(0,10);const t=String(v||"").trim();if(!t)return "";
  let m=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  m=t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);if(m){const y=m[3].length===2?"20"+m[3]:m[3];return `${y}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`}
  if(/^\d{5}$/.test(t)){const d=new Date(Math.round((+t-25569)*864e5));return d.toISOString().slice(0,10)}
  m=t.match(/^(\d{4})$/);if(m)return `${m[1]}-01-01`;return ""}
function xmlGenerico(txt){
  const doc=new DOMParser().parseFromString(txt,"application/xml");if(doc.querySelector("parsererror"))throw new Error("XML inválido");
  // acha o elemento que mais se repete com filhos-folha: cada ocorrência vira uma linha
  const cont={};doc.querySelectorAll("*").forEach(el=>{if(el.children.length&&[...el.children].every(c=>!c.children.length))cont[el.tagName]=(cont[el.tagName]||0)+1});
  const tag=Object.entries(cont).sort((a,b)=>b[1]-a[1])[0];if(!tag)throw new Error("Não encontrei registros no XML");
  return [...doc.getElementsByTagName(tag[0])].map(el=>{const o={};[...el.attributes].forEach(a=>o[a.name]=a.value);[...el.children].forEach(c=>o[c.tagName.replace(/^.*:/,"")]=c.textContent.trim());return o});
}
async function lerPlanilha(file){
  const nome=file.name.toLowerCase();
  if(nome.endsWith(".xml")){const txt=await file.text();
    if(/urn:schemas-microsoft-com:office:spreadsheet/.test(txt)){const wb=XLSX.read(txt,{type:"string",cellDates:true});return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:"",raw:false})}
    return xmlGenerico(txt);}
  const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:"array",cellDates:true});
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:"",raw:true});
}
function abrirImportacao(uc){
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer" style="width:760px">
    <div style="display:flex;justify-content:space-between"><div><div class="small muted">${uc} · Biodiversidade</div><h2>Importar registros de espécies</h2></div><button class="btn sm" id="dX">✕</button></div>
    <p class="small" style="line-height:1.5">Aceita <b>Excel (.xlsx, .xls)</b>, <b>planilha XML</b> (XML Spreadsheet do Excel ou XML de registros, como Darwin Core), <b>CSV</b> e <b>ODS</b>. A primeira linha deve ter os nomes das colunas. Os registros entram como <b>pendentes de validação</b>.</p>
    <label class="btn primary" style="display:inline-flex;gap:8px;align-items:center;cursor:pointer">📂 Escolher arquivo<input type="file" id="impF" accept=".xlsx,.xls,.xml,.csv,.ods,.txt" style="display:none"></label>
    <button class="btn" id="impMod" style="margin-left:6px">⬇ Baixar modelo (Excel)</button>
    <div id="impArea" style="margin-top:16px"></div></div></div>`;
  const close=()=>$("#drawerRoot").innerHTML="";
  $("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  $("#impMod").onclick=()=>{const ws=XLSX.utils.aoa_to_sheet([["especie","nome_popular","grupo","data","latitude","longitude","individuos","tipo","observacoes","observador"],["Tangara seledon","saíra-sete-cores","Aves","15/10/2026","-19.9001","-40.4620","2","Avistamento","bando misto na borda da trilha","Guarda-parque"]]);
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"registros");XLSX.writeFile(wb,"modelo_registros_especies_SisGAP.xlsx")};
  $("#impF").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    let rows;try{rows=await lerPlanilha(f)}catch(err){$("#impArea").innerHTML=`<div class="note">Não consegui ler o arquivo: ${esc(err.message||err)}</div>`;return}
    rows=rows.filter(r=>Object.values(r).some(v=>String(v).trim()!==""));
    if(!rows.length){$("#impArea").innerHTML=`<div class="note">A planilha está vazia.</div>`;return}
    const cols=[...new Set(rows.flatMap(r=>Object.keys(r)))];
    const map={};CAMPOS_IMP.forEach(([k,,al])=>{const c=cols.find(c=>al.includes(norm(c)));map[k]=c||""});
    previa(uc,f.name,rows,cols,map);
  };
}
function previa(uc,arq,rows,cols,map){
  const lista=BIO[uc]?BIO[uc].especies:[];
  const conv=r=>{const g=k=>map[k]?r[map[k]]:"";const lat=num(String(g("lat")).replace(",",".")),lon=num(String(g("lon")).replace(",","."));
    const sp=String(g("sp")||"").trim(), c=lista.find(x=>x.s.toLowerCase()===sp.toLowerCase());
    return {sp,pop:String(g("pop")||(c?c.p:"")).trim(),g:grupoDe(g("g"))||(c?c.g:""),data:dataDe(g("data")),lat:lat!==null&&Math.abs(lat)<=90?lat:null,lon:lon!==null&&Math.abs(lon)<=180?lon:null,
      n:String(g("n")||"1"),tipo:String(g("tipo")||"Importado de planilha"),obs:[g("obs"),g("autor")?"Observador: "+g("autor"):""].filter(Boolean).join(" · "),conhecida:!!c,fam:c?c.f:"",es:c?c.es:"",br:c?c.br:""}};
  const R=rows.map(conv), ok=R.filter(r=>r.sp&&r.g&&r.data), fora=ok.filter(r=>r.lat!==null&&temGeo(uc)&&dentroUC(uc,r.lat,r.lon)===false).length;
  const prob=R.length-ok.length;
  $("#impArea").innerHTML=`<div class="card" style="background:var(--surface-2)"><h3>${esc(arq)} · ${R.length} linha(s)</h3><p class="sub">Confira a ligação das colunas</p>
    <div class="grid g2" style="gap:6px 16px">${CAMPOS_IMP.map(([k,lb,,obr])=>`<div style="display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:center"><span class="small"><b>${lb}</b>${obr?" *":""}</span><select data-map="${k}" class="btn sm"><option value="">— não importar —</option>${cols.map(c=>`<option ${map[k]===c?"selected":""}>${esc(c)}</option>`).join("")}</select></div>`).join("")}</div></div>
    <div class="grid g4" style="margin:14px 0">
      <div class="card kpi"><div class="lbl">Prontos para importar</div><div class="val">${ok.length}</div></div>
      <div class="card kpi"><div class="lbl">Espécies já na lista</div><div class="val">${ok.filter(r=>r.conhecida).length}</div></div>
      <div class="card kpi"><div class="lbl">Espécies novas para a UC</div><div class="val" style="color:#1e4b34">${new Set(ok.filter(r=>!r.conhecida).map(r=>r.sp.toLowerCase())).size}</div></div>
      <div class="card kpi"><div class="lbl">Com problema</div><div class="val" style="color:${prob?"#9b2424":"inherit"}">${prob}</div><div class="foot">${prob?"faltam espécie, grupo ou data":"nenhum"}${fora?` · ${fora} fora do limite`:""}</div></div></div>
    <div class="tbl-wrap" style="max-height:300px"><table><thead><tr><th></th><th>Espécie</th><th>Grupo</th><th>Data</th><th>Local</th><th>Nº</th><th>Obs.</th></tr></thead><tbody>
    ${R.slice(0,200).map(r=>{const bad=!(r.sp&&r.g&&r.data);return `<tr style="${bad?"background:#fdf0ee":""}"><td>${bad?"⚠":r.conhecida?"✓":'<span class="pill st-conc" style="font-size:10px">nova</span>'}</td><td><i>${esc(r.sp)||'<span style="color:#9b2424">falta</span>'}</i><div class="small muted">${esc(r.pop)}</div></td><td class="small">${r.g||'<span style="color:#9b2424">falta</span>'}</td><td class="small">${r.data?fmtD(r.data):'<span style="color:#9b2424">falta</span>'}</td><td class="small">${r.lat!==null?r.lat.toFixed(4)+", "+r.lon.toFixed(4):"—"}</td><td class="small">${esc(r.n)}</td><td class="small muted">${esc(r.obs).slice(0,50)}</td></tr>`}).join("")}</tbody></table></div>
    ${R.length>200?`<p class="small muted">Mostrando 200 de ${R.length} linhas.</p>`:""}
    <div style="display:flex;gap:8px;margin-top:14px;align-items:center"><button class="btn primary" id="impGo" ${ok.length?"":"disabled"}>Importar ${ok.length} registro(s) para validação</button><span class="small muted">Linhas com problema são ignoradas.</span></div>`;
  document.querySelectorAll("[data-map]").forEach(s=>s.onchange=()=>{map[s.dataset.map]=s.value;previa(uc,arq,rows,cols,map)});
  $("#impGo").onclick=()=>{
    const lote="imp"+Date.now();
    ok.forEach((r,i)=>S.bioReg.push({id:lote+"_"+i,uc,sp:r.sp,pop:r.pop,g:r.g,fam:r.fam,es:r.es,br:r.br,tipo:r.tipo,n:r.n,data:r.data,obs:r.obs+(r.obs?" · ":"")+"Importado de "+arq,anexos:[],lat:r.lat,lon:r.lon,autor:S.user,st:"pend",val:null,lote}));
    if(!saveBioReg())return;
    const g=USERS.find(u=>u.uc===uc&&u.papel==="gestor");if(g)S.log.unshift({quando:new Date().toISOString(),para:g.email,assunto:`[SisGAP-ES] ${uc}: ${ok.length} registros de espécies importados de “${arq}” aguardam validação`,tipo:"Biodiversidade"});
    save();$("#drawerRoot").innerHTML="";toast(`${ok.length} registros importados · aguardando validação`);route();
  };
}
// validação em lote para importações grandes
function validarLote(uc,ok){
  const P=S.bioReg.filter(r=>r.uc===uc&&r.st==="pend");P.forEach(r=>{r.st=ok?"val":"rej";r.val={por:S.user,q:new Date().toISOString(),com:"Validação em lote"}});
  atualizaEstoques(uc);saveBioReg();save();toast(`${P.length} registros ${ok?"validados":"não validados"}`);route();
}

{const _rn=renderNav; renderNav=function(){_rn();const a=document.querySelector('#nav a[href="#fundiario"]');const uc=ucAtual();
  if(a&&uc&&ucObj(uc)&&ucObj(uc).g==="PI")a.innerHTML=a.innerHTML.replace("Fundiário (CAR)","Regularização fundiária")}}
