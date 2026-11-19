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
const grupoUC = uc => ucObj(uc).g;            // "PI" | "US"
const curto = c => c.replace(/^ES-\d{7}-/,"").slice(0,8)+"…";

function seedFund(){
  const pick=(uc,n)=>CAR.imoveis.features.filter(f=>f.properties.uc===uc&&f.properties.relevante).sort((a,b)=>b.properties.a_dentro-a.properties.a_dentro).slice(0,n);
  const o={}, put=(f,d)=>o[f.properties.cod+"|"+f.properties.uc]=Object.assign({hist:[],simulado:true},d);
  const [p1,p2]=pick("PEI",2), [f1,f2]=pick("PEFG",2), [a1]=pick("APAGO",1), [m1]=pick("ARIEMV",1);
  if(p1)put(p1,{tipo:TIPOS.PI[0],etapa:2,edocs:"2026-XXXXX (exemplo)",resp:"u7",prazo:"2027-03-31",obs:"Exemplo para validação."});
  if(p2)put(p2,{tipo:TIPOS.PI[2],etapa:1,edocs:"",resp:"u8",prazo:"2026-12-10",obs:"Exemplo para validação."});
  if(f1)put(f1,{tipo:TIPOS.PI[0],etapa:0,edocs:"",resp:"u5",prazo:"2026-12-31",obs:"Ligado à ação “Enviar levantamento fundiário à instância superior” (PM, Tabela 6)."});
  if(f2)put(f2,{tipo:TIPOS.PI[1],etapa:3,edocs:"2025-YYYYY (exemplo)",resp:"u5",prazo:"2026-11-20",obs:"Exemplo para validação."});
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
  title("Fundiário — imóveis do CAR e processos", uc?`${uc} — ${ucObj(uc).n}`:"UCs da versão de teste");
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
    <div class="card kpi"><div class="lbl">Processos cadastrados</div><div class="val">${procs.length}<span style="font-size:18px;color:var(--muted)">/${r.n_relevante}</span></div><div class="foot"><b>${concl}</b> concluídos · ${atras?`<b style="color:#9b2424">${atras} com prazo vencido</b>`:"nenhum com prazo vencido"}</div></div>
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
    <div style="padding:14px 16px 0"><h3>Imóveis e processos</h3><p class="sub">${feats.length} recortes de imóveis do CAR · ${esc(CAR.fonte)}</p>
    <div class="filters"><input id="fq" placeholder="Código do imóvel ou município" value="${esc(FF.q)}" style="width:240px">
      <select id="fc"><option value="">Toda situação do CAR</option>${COND.map(c=>`<option value="${esc(c[0])}" ${FF.cond===c[0]?"selected":""}>${c[1]}</option>`).join("")}</select>
      <select id="fp"><option value="">Com ou sem processo</option><option value="com" ${FF.proc==="com"?"selected":""}>Com processo</option><option value="sem" ${FF.proc==="sem"?"selected":""}>Sem processo</option></select>
      <select id="fo"><option value="a_dentro">Ordenar: área dentro da UC</option><option value="pct" ${FF.ord==="pct"?"selected":""}>Ordenar: % do imóvel dentro</option><option value="prazo" ${FF.ord==="prazo"?"selected":""}>Ordenar: prazo do processo</option></select>
      <span style="flex:1"></span><button class="btn sm" id="fCsv">⬇ Planilha (CSV)</button></div></div>
    <div class="tbl-wrap" style="border:0;border-top:1px solid var(--line);max-height:520px" id="fTab"></div></div>`;
  // tabela
  const drawTab=()=>{
    let L=feats.filter(f=>{const p=f.properties,pr=procDe(uc,p.cod);return (!FF.cond||p.cond===FF.cond)&&(!FF.proc||(FF.proc==="com"?!!pr:!pr))&&(!FF.q||(p.cod+" "+p.mun).toLowerCase().includes(FF.q.toLowerCase()))});
    L.sort((a,b)=>FF.ord==="prazo"?((procDe(uc,a.properties.cod)||{}).prazo||"9").localeCompare((procDe(uc,b.properties.cod)||{}).prazo||"9"):(b.properties[FF.ord]||0)-(a.properties[FF.ord]||0));
    $("#fTab").innerHTML=`<table><thead><tr><th>Imóvel (código CAR)</th><th>Município</th><th>Situação CAR</th><th>Análise</th><th class="num">Área do imóvel (ha)</th><th class="num">Dentro da UC (ha)</th><th class="num">% dentro</th><th>Processo</th><th>Prazo</th></tr></thead><tbody>
    ${L.map(f=>{const p=f.properties,pr=procDe(uc,p.cod),ci=condInfo(p.cond);const venc=pr&&pr.prazo&&dias(pr.prazo)<0&&pr.etapa<ETAPAS[gp].length-1;
      return `<tr style="cursor:pointer" onclick="fichaImovel('${uc}','${p.cod}')"><td><span title="${p.cod}" style="font-family:ui-monospace,monospace;font-size:12px">${curto(p.cod)}</span>${p.relevante?"":' <span class="pill" style="font-size:10px">marginal</span>'}</td>
      <td class="small">${esc(p.mun)}</td><td class="small">${p.sit}</td><td><span class="pill"><i style="background:${ci[2]}"></i>${ci[1]}</span></td>
      <td class="num">${fmt(p.a_imovel,1)}</td><td class="num"><b>${fmt(p.a_dentro,1)}</b></td><td class="num">${p.pct===null?"—":fmt(p.pct,0)+"%"}</td>
      <td class="small">${pr?`<b>${ETAPAS[gp][pr.etapa]}</b><div class="muted">${esc(pr.tipo)}${pr.simulado?" · exemplo":""}</div>`:'<span class="muted">—</span>'}</td>
      <td class="small" style="white-space:nowrap">${pr&&pr.prazo?`${fmtD(pr.prazo)}${venc?'<div style="color:#9b2424;font-weight:600">vencido</div>':""}`:""}</td></tr>`}).join("")}</tbody></table>`;
  };
  drawTab();
  $("#fq").oninput=e=>{FF.q=e.target.value;drawTab()};
  $("#fc").onchange=e=>{FF.cond=e.target.value;drawTab()};
  $("#fp").onchange=e=>{FF.proc=e.target.value;drawTab()};
  $("#fo").onchange=e=>{FF.ord=e.target.value;drawTab()};
  $("#fCsv").onclick=()=>{
    const head=["uc","cod_imovel","municipio","situacao_car","analise_car","area_imovel_ha","area_dentro_uc_ha","pct_dentro","tipo_processo","etapa","num_edocs","responsavel","prazo","observacoes"];
    const rows=feats.map(f=>{const p=f.properties,pr=procDe(uc,p.cod)||{};return [uc,p.cod,p.mun,p.sit,p.cond,p.a_imovel,p.a_dentro,p.pct,pr.tipo||"",pr.etapa!=null?ETAPAS[gp][pr.etapa]:"",pr.edocs||"",pr.resp?userById(pr.resp).nome:"",pr.prazo||"",pr.obs||""]});
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
    <div class="grid g2" style="gap:8px;margin-top:12px">
      <div class="fld" style="margin:0"><label>Município</label><div class="ro">${esc(p.mun)}</div></div>
      <div class="fld" style="margin:0"><label>Situação no SICAR</label><div class="ro">${p.sit}</div></div>
      <div class="fld" style="margin:0"><label>Área do imóvel</label><div class="ro">${fmt(p.a_imovel,2)} ha</div></div>
      <div class="fld" style="margin:0"><label>Dentro da UC</label><div class="ro"><b>${fmt(p.a_dentro,2)} ha</b> (${p.pct===null?"—":fmt(p.pct,1)+"%"})</div></div>
    </div>
    <div class="fld"><label>Análise do CAR pelo órgão ambiental</label><div class="ro"><span class="pill"><i style="background:${condInfo(p.cond)[2]}"></i>${esc(p.cond)}</span></div></div>
    <p class="small"><a href="https://consultapublica.car.gov.br/publico/imoveis/index" target="_blank" rel="noopener">Consultar no SICAR (consulta pública) ↗</a> · copie o código acima</p>
    <h3 style="margin:20px 0 4px;font-size:15px">Processo ${gp==="PI"?"de regularização fundiária":"de regularização / acompanhamento"}</h3>
    ${pr.simulado?'<div class="note" style="margin:6px 0">Processo de exemplo, criado para a validação.</div>':""}
    <div class="fld"><label>Tipo de processo</label><select id="pTipo" ${pode?"":"disabled"}>${TIPOS[gp].map(t=>`<option ${pr.tipo===t?"selected":""}>${t}</option>`).join("")}</select></div>
    <div class="fld"><label>Etapa</label><div style="display:flex;flex-direction:column;gap:4px" id="pEt">${ETAPAS[gp].map((e,i)=>`<label style="display:flex;gap:10px;align-items:center;padding:7px 10px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-weight:${i===pr.etapa?700:400};background:${i===pr.etapa?"var(--brand-soft)":"#fff"};margin:0"><input type="radio" style="width:auto;flex:0 0 auto;margin:0" name="pEt" value="${i}" ${i===pr.etapa?"checked":""} ${pode?"":"disabled"}><span style="width:20px;height:20px;border-radius:50%;background:${i<=pr.etapa?etapaCor(gp,i):"#e3e6df"};color:#fff;font-size:11px;display:grid;place-items:center;flex:0 0 20px">${i+1}</span>${e}</label>`).join("")}</div></div>
    <div class="grid g2" style="gap:12px">
      <div class="fld"><label>Nº do processo (E-Docs)</label><input id="pEd" value="${esc(pr.edocs)}" placeholder="Ex.: 2026-ABC12" ${pode?"":"disabled"}></div>
      <div class="fld"><label>Prazo da etapa</label><input type="date" id="pPz" value="${pr.prazo||""}" ${pode?"":"disabled"}></div>
    </div>
    <div class="fld"><label>Responsável</label><select id="pRs" ${pode?"":"disabled"}>${equipe.map(u=>`<option value="${u.id}" ${u.id===pr.resp?"selected":""}>${esc(u.nome)}</option>`).join("")}</select></div>
    <div class="fld"><label>Próximos passos / observações</label><textarea id="pOb" placeholder="Ex.: aguardando certidão de inteiro teor; vistoria marcada…" ${pode?"":"disabled"}>${esc(pr.obs)}</textarea></div>
    ${pr.hist&&pr.hist.length?`<div class="fld"><label>Histórico</label>${pr.hist.slice(0,8).map(h=>`<div class="small" style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="muted">${new Date(h.q).toLocaleString("pt-BR")}</span> · ${esc(h.t)}</div>`).join("")}</div>`:""}
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">${pode?`<button class="btn primary" id="pSave">${S.fund[k]?"Salvar processo":"Abrir processo"}</button>`:""}${S.fund[k]&&pode?`<button class="btn" id="pDel">Excluir processo</button>`:""}</div>
  </div></div>`;
  const close=()=>$("#drawerRoot").innerHTML="";
  $("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  if($("#pSave"))$("#pSave").onclick=()=>{
    const novo={tipo:$("#pTipo").value,etapa:+document.querySelector('input[name="pEt"]:checked').value,edocs:$("#pEd").value.trim(),prazo:$("#pPz").value,resp:$("#pRs").value,obs:$("#pOb").value,hist:pr.hist||[],simulado:false};
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
// indicadores comuns de estoque passam a vir do painel de espécies
(function(){for(const uc in BIO){const sp=BIO[uc].especies, fa=sp.filter(x=>x.g!=="Flora"), fl=sp.filter(x=>x.g==="Flora");
  const v={fau:fa.length,faa:fa.filter(ehAmea).length,flo:fl.length,fla:fl.filter(ehAmea).length};
  if(S.lanc[uc])for(const id in v)S.lanc[uc][id]=S.lanc[uc][id].map(x=>x===""?"":v[id]);}})();

function vBio(){
  const uc=ucAtual();
  title("Biodiversidade — espécies com evidência robusta", uc?`${uc} — ${ucObj(uc).n}`:"UCs da versão de teste");
  if(!uc||!BIO[uc]){
    $("#view").innerHTML=`<div class="info" style="margin-bottom:16px">Os painéis de espécies já integrados são os da APAGO e da ARIEMV. Para o PE Forno Grande e o PE Itaúnas, a análise de espécies no mesmo padrão ainda não foi gerada.</div>
    <div class="grid g4">${GEO_UCS.map(s=>`<div class="uc-tile" ${BIO[s]?`onclick="S.uc='${s}';save();route()"`:'style="opacity:.6;cursor:default"'}><b>${s}</b><div class="meta">${esc(ucObj(s).n)}</div><div class="small">${BIO[s]?`<b>${BIO[s].especies.length}</b> espécies · <b>${BIO[s].especies.filter(ehAmea).length}</b> ameaçadas`:"análise de espécies pendente"}</div></div>`).join("")}</div>`;
    return;
  }
  const B=BIO[uc], sp=B.especies, am=sp.filter(ehAmea), exo=sp.filter(x=>x.exo), nEx=sp.reduce((t,x)=>t+x.n,0);
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
  <div class="card" style="margin-top:16px;padding:0">
    <div style="padding:14px 16px 0"><h3>Lista de espécies</h3>
    <div class="filters"><input id="bq" placeholder="Espécie, família ou nome popular" value="${esc(FB.q)}" style="width:250px">
      <select id="bg"><option value="">Todos os grupos</option>${grupos.map(g=>`<option ${FB.g===g?"selected":""}>${g}</option>`).join("")}</select>
      <select id="ba"><option value="">Com ou sem ameaça</option><option value="es" ${FB.am==="es"?"selected":""}>Ameaçadas no ES</option><option value="br" ${FB.am==="br"?"selected":""}>Ameaçadas no Brasil</option><option value="qq" ${FB.am==="qq"?"selected":""}>Ameaçadas (ES ou Brasil)</option>${exo.length?`<option value="exo" ${FB.am==="exo"?"selected":""}>Exóticas invasoras</option>`:""}</select>
      <select id="be"><option value="">Toda evidência</option>${["Exemplar","Plano de Manejo","Literatura","Obs. pessoal"].map(e=>`<option ${FB.ev===e?"selected":""}>${e}</option>`).join("")}</select>
      <span style="flex:1"></span><span class="small muted" id="bN"></span><button class="btn sm" id="bCsv">⬇ Planilha (CSV)</button></div></div>
    <div class="tbl-wrap" style="border:0;border-top:1px solid var(--line);max-height:560px" id="bTab"></div></div>`;
  const filtrar=()=>sp.filter(x=>(!FB.g||x.g===FB.g)&&(!FB.am||(FB.am==="es"?AMEA.includes(x.es):FB.am==="br"?AMEA.includes(x.br):FB.am==="exo"?!!x.exo:ehAmea(x)))&&(!FB.ev||x.ev.includes(FB.ev))&&(!FB.q||(x.s+" "+x.f+" "+x.p).toLowerCase().includes(FB.q.toLowerCase())));
  const catPill=c=>c?`<span class="pill ${c==="CR"?"st-atr":c==="EN"?"st-atr":c==="VU"?"st-venc":""}" style="font-size:10.5px">${c}</span>`:'<span class="muted">—</span>';
  const drawTab=()=>{const L=filtrar().sort((a,b)=>(ehAmea(b)-ehAmea(a))||a.g.localeCompare(b.g)||a.s.localeCompare(b.s));
    $("#bN").textContent=`${L.length} espécies`;
    $("#bTab").innerHTML=`<table><thead><tr><th>Grupo</th><th>Família</th><th>Espécie</th><th>Nome popular</th><th>ES</th><th>Brasil</th><th>IUCN</th><th>Evidência</th><th class="num">Exempl.</th><th class="num">Último</th></tr></thead><tbody>
    ${L.map(x=>`<tr><td class="small">${x.g}</td><td class="small muted">${esc(x.f)}</td><td><i>${esc(x.s)}</i>${x.exo?` <span class="pill st-venc" style="font-size:10px">${esc(x.exo)}</span>`:""}</td><td class="small">${esc(x.p)}</td>
      <td>${catPill(x.es)}</td><td>${catPill(x.br)}</td><td class="small">${esc(x.iucn||"")}</td><td class="small" title="${esc(x.lit.join("; "))}">${x.ev.join(", ")}</td><td class="num">${x.n||""}</td><td class="num small">${x.ult||""}</td></tr>`).join("")}</tbody></table>`};
  drawTab();
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
