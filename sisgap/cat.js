// SisGAP-ES — Catálogo de indicadores (ficha técnica de cada indicador)
const EIXOS=[
  ["part","Participação social","#2a78d6"],
  ["vis","Uso público e visitação","#eb6834"],
  ["bio","Biodiversidade e monitoramento","#1baf7a"],
  ["prot","Proteção e fiscalização","#e34948"],
  ["inc","Prevenção e combate a incêndios","#d03b3b"],
  ["plan","Planejamento e gestão","#6250d6"],
  ["fund","Regularização fundiária","#8a4b1f"]
];
const EIXO_DE={reu:"part",eve:"part",pev:"part",mid:"part",vis:"vis",aci:"vis",fau:"bio",faa:"bio",flo:"bio",fla:"bio",atr:"bio",exo:"bio",mon:"bio",mfa:"bio",cac:"prot",fog:"prot",sup:"prot",air:"prot",dom:"prot",aut:"prot",fis:"prot",inc:"inc",roi:"inc"};
const DEF_COMUM={
  vis:"Pessoas que visitaram a UC no mês, pelo método de contagem informado.",reu:"Reuniões do conselho gestor realizadas (ordinárias, extraordinárias e câmaras técnicas).",
  eve:"Eventos de educação ambiental e comunicação promovidos pela UC, dentro ou fora dela.",pev:"Soma dos participantes dos eventos registrados no mês.",
  mid:"Publicações próprias e matérias na imprensa sobre a UC.",aci:"Acidentes com visitantes durante o uso público.",
  fau:"Espécies da fauna com registro confirmado na UC (lista de espécies).",faa:"Espécies da fauna da UC em listas oficiais de ameaça (ES ou Brasil).",
  flo:"Espécies da flora com registro confirmado na UC (lista de espécies).",fla:"Espécies da flora da UC em listas oficiais de ameaça (ES ou Brasil).",
  atr:"Animais silvestres encontrados atropelados nas vias da UC ou do entorno.",exo:"Ações de manejo ou controle de espécies exóticas invasoras.",
  mon:"Campanhas ou ações de monitoramento da biodiversidade.",mfa:"Resgates, solturas, afugentamentos e outras ações de manejo de fauna.",
  cac:"Ocorrências de caça, pesca ou captura irregular de animais.",fog:"Ocorrências de uso irregular do fogo.",sup:"Ocorrências de supressão irregular de vegetação.",
  air:"Outras atividades irregulares (obras, ocupação, extração, etc.).",dom:"Presença de animais domésticos (cães, gatos, gado) dentro da UC.",
  aut:"Autos de infração lavrados pela equipe ou em operação conjunta.",fis:"Rondas, operações e vistorias de fiscalização e monitoramento.",
  inc:"Incêndios florestais combatidos na UC ou no entorno imediato.",roi:"Relatórios de Ocorrência de Incêndio Florestal (ROIF) preenchidos."
};
const POL_COMUM={vis:"↑",reu:"↑",eve:"↑",pev:"↑",mid:"↑",aci:"↓",fau:"↑",faa:"—",flo:"↑",fla:"—",atr:"↓",exo:"↑",mon:"↑",mfa:"—",cac:"↓",fog:"↓",sup:"↓",air:"↓",dom:"↓",aut:"—",fis:"↑",inc:"↓",roi:"↑"};
const POL_TXT={"↑":"quanto maior, melhor","↓":"quanto menor, melhor","—":"acompanhamento (sem sentido de melhora)"};
const g_=(uc,f)=>{try{return f(gesInd(uc))}catch(e){return null}};
// indicadores de gestão institucional e calculados
const IND_EXTRA=[
  {id:"ptot",nome:"Público total atingido",eixo:"vis",tipo:"calc",un:"pessoas",regra:"Visitantes + público dos eventos",pol:"↑",def:"Soma das pessoas alcançadas pela UC: visitantes e participantes de eventos.",val:uc=>vSoma(uc,"vis")+vSoma(uc,"pev")},
  {id:"acim",nome:"Acidentes por mil visitas",eixo:"vis",tipo:"calc",un:"acidentes / 1.000 visitas",regra:"Acidentes ÷ visitantes × 1.000",pol:"↓",def:"Taxa de acidentes no uso público, comparável entre UCs de tamanhos diferentes.",val:uc=>{const v=vSoma(uc,"vis");return v?Math.round(vSoma(uc,"aci")/v*1000*100)/100:null}},
  {id:"g_cons",nome:"Conselho gestor ativo",eixo:"part",tipo:"ges",un:"UCs / situação",regra:"Situação atual",pol:"↑",def:GES_DEF.cons,val:uc=>uc?S.ges.uc[uc].cons:g_(null,g=>g.consAt+"/"+g.n),tab:"plano"},
  {id:"g_quor",nome:"Quórum médio do conselho",eixo:"part",tipo:"ges",un:"%",regra:"Média das reuniões do ano",pol:"↑",def:"Percentual médio de conselheiros presentes nas reuniões.",val:uc=>g_(uc,g=>g.quorum),tab:"plano"},
  {id:"g_parc",nome:"Parcerias vigentes",eixo:"part",tipo:"ges",un:"instrumentos",regra:"Vigentes na data",pol:"↑",def:GES_DEF.parc,val:uc=>g_(uc,g=>g.parcVig.length),tab:"parcerias"},
  {id:"g_pesq",nome:"Pesquisas autorizadas",eixo:"bio",tipo:"ges",un:"autorizações",regra:"Soma no ano",pol:"↑",def:GES_DEF.pesq,val:uc=>g_(uc,g=>g.pesqAut.length),tab:"processos"},
  {id:"g_multa",nome:"Multas aplicadas",eixo:"prot",tipo:"ges",un:"R$",regra:"Soma no ano",pol:"—",def:"Valor total das multas dos autos de infração lavrados no ano.",val:uc=>g_(uc,g=>brl(g.muV)),tab:"multas"},
  {id:"g_multp",nome:"Multas recolhidas ou convertidas",eixo:"prot",tipo:"ges",un:"R$ e %",regra:"Pago + convertido ÷ aplicado",pol:"↑",def:"Valor efetivamente pago ou convertido em serviços ambientais.",val:uc=>g_(uc,g=>brl(g.muP)+(g.muV?` (${Math.round(g.muP/g.muV*100)}%)`:"")),tab:"multas"},
  {id:"g_pm",nome:"Plano de manejo aprovado",eixo:"plan",tipo:"ges",un:"UCs / situação",regra:"Situação atual",pol:"↑",def:GES_DEF.pm,val:uc=>uc?S.ges.uc[uc].pm:g_(null,g=>g.pmAprov+"/"+g.n),tab:"plano"},
  {id:"g_pmrev",nome:"Revisão do plano de manejo",eixo:"plan",tipo:"ges",un:"data / UCs vencidas",regra:"Data prevista de revisão",pol:"↓",def:GES_DEF.pm2,val:uc=>uc?(S.ges.uc[uc].pmVence?fmtD(S.ges.uc[uc].pmVence):"—"):g_(null,g=>g.pmVelho+" vencidas"),tab:"plano"},
  {id:"g_cap",nome:"Horas de capacitação da equipe",eixo:"plan",tipo:"ges",un:"horas",regra:"Carga horária × participantes, no ano",pol:"↑",def:GES_DEF.cap,val:uc=>g_(uc,g=>fmt(g.capH)),tab:"capacitacao"},
  {id:"g_eq",nome:"Equipe da UC",eixo:"plan",tipo:"ges",un:"pessoas",regra:"Situação atual",pol:"↑",def:"Servidores efetivos, comissionados e terceirizados; brigadistas e voluntários à parte.",val:uc=>g_(uc,g=>g.eqT),tab:"plano"},
  {id:"g_proc",nome:"Processos: entrada × respondidos",eixo:"plan",tipo:"ges",un:"processos",regra:"Entraram no ano / respondidos no ano",pol:"↑",def:GES_DEF.proc,val:uc=>g_(uc,g=>g.prAno.length+" / "+g.respAno.length),tab:"processos"},
  {id:"g_temp",nome:"Tempo médio de resposta",eixo:"plan",tipo:"ges",un:"dias",regra:"Média (resposta − entrada)",pol:"↓",def:"Dias entre a entrada do processo e a resposta; inclui % respondidos no prazo.",val:uc=>g_(uc,g=>g.tMed!==null?g.tMed+" d ("+g.pctPrazo+"% no prazo)":null),tab:"processos"},
  {id:"g_anu",nome:"Anuências emitidas",eixo:"plan",tipo:"ges",un:"anuências",regra:"Soma no ano",pol:"—",def:GES_DEF.anu,val:uc=>g_(uc,g=>g.anuEmit.length),tab:"processos"},
  {id:"g_inst",nome:"Instrumentos legais publicados",eixo:"plan",tipo:"ges",un:"atos",regra:"Publicados no ano",pol:"↑",def:GES_DEF.inst,val:uc=>g_(uc,g=>g.instPub),tab:"instrumentos"},
  {id:"g_cria",nome:"Criação ou ampliação de UCs",eixo:"plan",tipo:"ges",un:"processos / ha",regra:"Em andamento",pol:"↑",def:GES_DEF.cria,val:uc=>uc?"só SISEUC":g_(null,g=>g.criaAnd.length+" · "+fmt(g.criaHa)+" ha"),tab:"criacao"},
  {id:"g_freg",nome:"Imóveis regularizados",eixo:"fund",tipo:"ges",un:"%",regra:"Regularizados ÷ a regularizar",pol:"↑",def:GES_DEF.fund,val:uc=>g_(uc,g=>g.fTot?Math.round(g.fReg/g.fTot*100)+"%":"não se aplica"),tab:"fundiaria"},
  {id:"g_fha",nome:"Área regularizada",eixo:"fund",tipo:"ges",un:"ha",regra:"Soma da área indenizada ou desapropriada",pol:"↑",def:"Área já incorporada ao patrimônio público nas UCs de proteção integral.",val:uc=>g_(uc,g=>g.fTot?fmt(g.haReg)+" de "+fmt(g.haTot)+" ha":"não se aplica"),tab:"fundiaria"},
  {id:"g_fproc",nome:"Processos fundiários em andamento",eixo:"fund",tipo:"ges",un:"processos",regra:"Abertos no módulo Fundiário",pol:"—",def:"Processos administrativos de regularização com nº, etapa e andamentos.",val:uc=>g_(uc,g=>g.procF),tab:"fundiaria"}
];
const vSoma=(uc,id)=>uc?soma(uc,id):UCS.reduce((t,u)=>t+soma(u.s,id),0);
const vUlt=(uc,id)=>uc?ultimo(uc,id):UCS.reduce((t,u)=>t+(ultimo(u.s,id)||0),0);
function catLista(){
  const L=COMUNS.flatMap(([p,inds])=>inds.map(([id,nm,un,rg])=>({id,nome:nm,eixo:EIXO_DE[id],tipo:"lanc",un,regra:rg==="Último"?"Último valor informado (estoque)":"Soma dos meses",freq:"Mensal",pol:POL_COMUM[id],def:DEF_COMUM[id],prog:p,
    val:uc=>rg==="Último"?vUlt(uc,id):vSoma(uc,id)})));
  return L.concat(IND_EXTRA.map(x=>Object.assign({freq:x.tipo==="calc"?"Mensal (automático)":"Contínuo"},x)));
}
const TIPO_LBL={lanc:["Lançamento mensal","st-and"],calc:["Calculado","st-conc"],ges:["Gestão institucional","st-venc"]};
let CF={q:"",eixo:"",tipo:"",vista:"comuns"};
vIndicadores=function(){
  const uc=ucAtual()||null, L=catLista(), nEsp=Object.values(ESPECIFICOS).reduce((t,a)=>t+a.length,0);
  title("Catálogo de indicadores",`Ficha técnica de cada indicador · valores de ${ANO} ${uc?"da "+uc:"de todo o SISEUC"}`);
  const chip=(n,l,cor)=>`<div class="card kpi" style="border-top:4px solid ${cor}"><div class="lbl">${l}</div><div class="val" style="font-size:26px">${n}</div></div>`;
  $("#view").innerHTML=`
  <div class="grid g4" style="margin-bottom:14px">
    ${chip(L.filter(x=>x.tipo==="lanc").length,"Comuns — lançamento mensal com evidência","#2a78d6")}
    ${chip(L.filter(x=>x.tipo==="calc").length,"Calculados automaticamente","#0ca30c")}
    ${chip(L.filter(x=>x.tipo==="ges").length,"Gestão institucional","#eda100")}
    ${chip(nEsp,`Específicos dos planos de manejo (${Object.keys(ESPECIFICOS).length} UCs)`,"#6250d6")}
  </div>
  <div class="tabs"><button data-v="comuns" class="${CF.vista==="comuns"?"on":""}">Indicadores do SISEUC (${L.length})</button><button data-v="acoes" class="${CF.vista==="acoes"?"on":""}">Indicadores das ações do plano (${S.acoes.filter(a=>a.kpi).length})</button><button data-v="esp" class="${CF.vista==="esp"?"on":""}">Específicos dos planos de manejo (${nEsp})</button></div>
  <div class="info" style="margin-bottom:14px">Cada indicador tem <b>definição</b>, <b>linha de base</b> (2025), <b>meta</b> (${ANO}), <b>valor atual</b> e <b>situação</b> — no ritmo, atenção ou fora da meta — comparando o realizado com o esperado até ${MESL[Math.max(0,FECHADOS-1)]}. Clique em um indicador para ver a ficha completa e ajustar a meta.</div>
  <div id="catBody"></div>`;
  document.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{CF.vista=b.dataset.v;vIndicadores()});
  CF.vista==="comuns"?catComuns(L,uc):CF.vista==="acoes"?catAcoes(uc):catEsp();
};
function catComuns(L,uc){
  const B=$("#catBody");
  B.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
    <input id="cQ" placeholder="Buscar indicador…" value="${esc(CF.q)}" style="flex:1;min-width:220px;padding:9px 12px;border:1px solid var(--line);border-radius:9px;font:inherit">
    <select id="cT" class="btn"><option value="">Todas as fontes</option>${Object.entries(TIPO_LBL).map(([k,v])=>`<option value="${k}" ${CF.tipo===k?"selected":""}>${v[0]}</option>`).join("")}</select>
    <button class="btn" id="cCsv">⬇ Ficha técnica (CSV)</button></div>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"><button class="btn sm ${CF.eixo?"":"primary"}" data-e="">Todos os eixos</button>${EIXOS.map(([k,n,c])=>`<button class="btn sm ${CF.eixo===k?"primary":""}" data-e="${k}" style="${CF.eixo===k?"":`border-left:4px solid ${c}`}">${n}</button>`).join("")}</div>
   <div id="cList"></div>`;
  const draw=()=>{
    const q=semAcento(CF.q);
    const F=L.filter(x=>(!CF.eixo||x.eixo===CF.eixo)&&(!CF.tipo||x.tipo===CF.tipo)&&(!q||semAcento(x.nome+" "+x.def).includes(q)));
    $("#cList").innerHTML=EIXOS.filter(([k])=>F.some(x=>x.eixo===k)).map(([k,n,c])=>{const I=F.filter(x=>x.eixo===k);
      return `<div class="card" style="margin-bottom:14px;padding:0;overflow:hidden"><div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--line);background:linear-gradient(90deg,${c}14,transparent)"><span style="width:10px;height:10px;border-radius:3px;background:${c}"></span><h3 style="margin:0">${n}</h3><span class="small muted">${I.length} indicador${I.length>1?"es":""}</span></div>
      <table><thead><tr><th style="width:38%">Indicador</th><th>Unidade</th><th>Regra</th><th>Fonte</th><th style="text-align:center">Sentido</th><th class="num">Base 2025</th><th class="num">Meta ${ANO}</th><th class="num">Atual</th><th>Situação</th></tr></thead><tbody>
      ${I.map(x=>{let v;try{v=x.val(uc)}catch(e){v=null}
        return `<tr style="cursor:pointer" onclick="fichaInd('${x.id}')"><td><b>${esc(x.nome)}</b><div class="small muted" style="margin-top:2px">${esc(x.def||"")}</div></td><td class="small">${esc(x.un)}</td><td class="small">${esc(x.regra)}</td>
        <td><span class="pill ${TIPO_LBL[x.tipo][1]}"><i></i>${TIPO_LBL[x.tipo][0]}</span></td><td style="text-align:center;font-size:16px" data-tip="${POL_TXT[x.pol]}">${x.pol==="↑"?'<span style="color:#0ca30c">▲</span>':x.pol==="↓"?'<span style="color:#d03b3b">▼</span>':'<span class="muted">●</span>'}</td>
        ${(()=>{const m=x.tipo==="lanc"?metaC(uc,x.id):null,sc=x.tipo==="lanc"?situC(uc,x.id):null;
          return `<td class="num small">${m?fmt(m.base):"—"}</td><td class="num small">${m&&m.meta!==null?(x.pol==="↓"?"≤ ":"")+fmt(m.meta):"—"}</td><td class="num"><b>${v===null||v===undefined?"—":typeof v==="number"?fmt(v,2):esc(v)}</b></td>
          <td>${sc?`<span class="pill ${sc.cl}" data-tip="Esperado até ${MES[Math.max(0,FECHADOS-1)]}: ${fmt(sc.esp,1)}"><i></i>${sc.lbl}</span>`:'<span class="small muted">acompanhamento</span>'}</td>`})()}</tr>`}).join("")}</tbody></table></div>`}).join("")||`<p class="muted">Nenhum indicador encontrado.</p>`;
    document.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{CF.eixo=b.dataset.e;catComuns(L,uc)});
  };
  $("#cQ").oninput=e=>{CF.q=e.target.value;draw()};$("#cT").onchange=e=>{CF.tipo=e.target.value;draw()};
  $("#cCsv").onclick=()=>{const rows=[["Eixo","Indicador","Definição","Unidade","Regra","Periodicidade","Sentido","Fonte","Evidência exigida",`Valor ${ANO} (${uc||"SISEUC"})`]].concat(L.map(x=>{let v;try{v=x.val(uc)}catch(e){v=""}
      return [EIXOS.find(e=>e[0]===x.eixo)[1],x.nome,x.def,x.un,x.regra,x.freq,POL_TXT[x.pol],TIPO_LBL[x.tipo][0],evidTxt(x),v??""]}));
    const csv=rows.map(r=>r.map(c=>`"${String(c??"").replace(/"/g,'""')}"`).join(";")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv"}));a.download=`SisGAP-ES_catalogo_indicadores.csv`;a.click()};
  draw();
}
function evidTxt(x){
  if(x.tipo==="lanc"){const r=REG[x.id];if(!r)return AUTO_IND[x.id]||"";return `Formulário “${r.t}”: ${r.fields.map(f=>f[1]).join(", ")}${r.docs?" · Anexos: "+r.docs:""}`}
  if(x.tipo==="calc")return "Calculado a partir dos registros; não precisa de lançamento.";
  return "Registro no módulo Gestão institucional, com documento comprobatório (termo, certificado, ofício, auto, publicação no DIO-ES).";
}
function fichaInd(id){
  const x=catLista().find(i=>i.id===id);if(!x)return;const uc=ucAtual()||null,E=EIXOS.find(e=>e[0]===x.eixo);
  const lin=(l,v)=>`<div style="display:grid;grid-template-columns:150px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)"><span class="small muted">${l}</span><span class="small">${v}</span></div>`;
  let extra="";
  if(x.tipo==="lanc"){
    extra=uc?`<h3 style="margin-top:16px">Lançamentos de ${uc} em ${ANO}</h3>${lineChart(MES,MES.map((_,i)=>i<FECHADOS?num(S.lanc[uc][id][i]):null),{unit:x.un,h:180})}`
      :`<h3 style="margin-top:16px">Por UC em ${ANO}</h3>${hbars(UCS.map(u=>({l:u.s,v:x.regra.startsWith("Último")?(ultimo(u.s,id)||0):soma(u.s,id)})).sort((a,b)=>b.v-a.v).slice(0,10),{unit:x.un,color:E[2]})}`;
  }else if(x.tipo==="ges"&&!uc){
    extra=`<h3 style="margin-top:16px">Por UC</h3><div class="tbl-wrap" style="max-height:300px"><table><tbody>${UCS.map(u=>{let v;try{v=x.val(u.s)}catch(e){v="—"}return `<tr><td><b>${u.s}</b></td><td class="num">${v??"—"}</td></tr>`}).join("")}</tbody></table></div>`;
  }
  let v;try{v=x.val(uc)}catch(e){v=null}
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
   <div style="display:flex;justify-content:space-between;gap:10px"><div><div class="small" style="color:${E[2]};font-weight:700">${E[1]}</div><h2>${esc(x.nome)}</h2></div><button class="btn sm" id="dX">✕</button></div>
   <div class="card kpi" style="margin:10px 0;border-top:4px solid ${E[2]}"><div class="lbl">${uc||"SISEUC"} · ${ANO}</div><div class="val" style="font-size:28px">${v===null||v===undefined?"—":typeof v==="number"?fmt(v,2):esc(v)}</div><div class="foot">${esc(x.un)}</div></div>
   ${lin("Definição",esc(x.def||""))}${lin("Unidade",esc(x.un))}${lin("Regra de cálculo",esc(x.regra))}${lin("Periodicidade",esc(x.freq))}${lin("Sentido",POL_TXT[x.pol])}
   ${lin("Fonte",TIPO_LBL[x.tipo][0])}${lin("Evidência exigida",esc(evidTxt(x)))}${lin("Onde aparece","Painel da UC, painel geral do SISEUC e relatórios em PDF")}
   ${x.prog?lin("Programa (planilha GGUC)",esc(x.prog)):""}
   ${x.tipo==="lanc"?(()=>{const m=metaC(uc,x.id),sc=situC(uc,x.id);return `<div class="card" style="background:var(--surface-2);margin-top:12px"><h3 style="margin:0 0 8px">Meta ${uc?"de "+uc:"do SISEUC (soma das UCs)"}</h3>
     <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:8px"><div class="fld"><label>Linha de base 2025</label><input id="mB" type="number" value="${m.base}" ${uc&&podeGes(uc)?"":"disabled"}></div>
     <div class="fld"><label>Meta ${ANO} ${x.pol==="↓"?"(≤)":""}</label><input id="mM" type="number" value="${m.meta??""}" placeholder="sem meta" ${uc&&podeGes(uc)?"":"disabled"}></div>
     <div class="fld"><label>Esperado até ${MES[Math.max(0,FECHADOS-1)]}</label><div class="ro">${sc?fmt(sc.esp,1):"—"}</div></div></div>
     ${sc?`<span class="pill ${sc.cl}"><i></i>${sc.lbl}</span> <span class="small muted">realizado ${fmt(sc.at,1)} de ${fmt(sc.esp,1)} esperados</span>`:""}
     ${uc&&podeGes(uc)?`<div style="margin-top:10px"><button class="btn sm primary" id="mS">Salvar meta</button></div>`:uc?"":`<div class="small muted" style="margin-top:6px">Selecione uma UC no topo para definir a meta dela.</div>`}</div>`})():""}
   ${extra}
   <div style="display:flex;gap:8px;margin-top:16px">${x.tipo==="lanc"?`<button class="btn primary" onclick="$('#drawerRoot').innerHTML='';location.hash='lancar'">Ir para o lançamento</button>`:x.tab?`<button class="btn primary" onclick="$('#drawerRoot').innerHTML='';location.hash='gestao/${x.tab}'">Abrir na Gestão institucional</button>`:""}</div></div></div>`;
  const close=()=>$("#drawerRoot").innerHTML="";$("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  if($("#mS"))$("#mS").onclick=()=>{const m=S.metasC[uc][id];m.base=+$("#mB").value||0;m.meta=$("#mM").value===""?null:+$("#mM").value;saveMetas();close();toast("Meta salva");vIndicadores()};
}
function catAcoes(uc){
  const ucs=[...new Set(S.acoes.filter(a=>a.kpi&&(!uc||a.uc===uc)).map(a=>a.uc))];
  const tot=S.acoes.filter(a=>a.kpi&&(!uc||a.uc===uc)),cnt={};tot.forEach(a=>{const r=kpiRitmo(a)[0];cnt[r]=(cnt[r]||0)+1});
  $("#catBody").innerHTML=`<div class="note" style="margin-bottom:14px"><b>Cada ação do plano de manejo virou um indicador</b> com fórmula, meio de verificação, linha de base, meta do ano e meta final. <b>Plano</b> = meta escrita no plano de manejo; <b>Proposta</b> = meta numérica sugerida para validação pela UC (o plano não fixa número ou prazo). Ações com número têm valor atual e série de medições. Ações de entrega (planos, termos, normas, obras) têm etapas: o progresso é a fração de etapas concluídas. O ritmo compara o progresso com o tempo já decorrido até o prazo.</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${["Meta atingida","No ritmo","Atenção","Abaixo do esperado","Prazo vencido"].map(k=>`<span class="pill ${{"Meta atingida":"st-conc","No ritmo":"st-and","Atenção":"st-venc","Abaixo do esperado":"st-atr","Prazo vencido":"st-atr"}[k]}"><i></i>${k}: ${cnt[k]||0}</span>`).join("")}</div>`+
  ucs.map(s=>`<div class="card" style="margin-bottom:14px;padding:0;overflow:hidden"><div style="padding:12px 16px;border-bottom:1px solid var(--line)"><h3 style="margin:0">${s} — ${esc(ucObj(s).n)}</h3></div>
   <table><thead><tr><th style="width:30%">Ação → indicador</th><th class="num">Base</th><th class="num">Meta ${ANO}</th><th class="num">Meta final</th><th class="num">Atual</th><th style="width:14%">Progresso</th><th>Ritmo</th><th>Origem da meta</th></tr></thead><tbody>
   ${S.acoes.filter(a=>a.uc===s&&a.kpi).sort((a,b)=>a.prazo.localeCompare(b.prazo)).map(a=>{const k=a.kpi,p=kpiPct(k)||0,[rt,cl]=kpiRitmo(a);
     return `<tr style="cursor:pointer" onclick="editarAcao('${a.id}')"><td><b>${esc(k.nome)}</b><div class="small muted">${esc(a.ativ)} · ${esc(a.prog)}</div></td><td class="num small">${k.tipo==="marco"?"—":k.base===null||k.base===undefined?'<span class="muted">a levantar</span>':fmt(k.base,1)}</td>
     <td class="num small">${multiAno(a)?(k.m26!=null?(k.tipo==="marco"?k.m26+" etapa"+(k.m26>1?"s":""):(k.sentido==="menor"?"≤ ":"")+fmt(k.m26,1)):"—"):(k.tipo==="marco"?"entrega":(k.sentido==="menor"?"≤ ":"")+fmt(k.meta,1))}</td>
     <td class="num small">${k.tipo==="marco"?k.etapas.length+" etapas":(k.sentido==="menor"?"≤ ":"")+fmt(k.meta,1)+" "+esc(k.un)}<div class="muted">${fmtD(a.prazo)}</div></td><td class="num"><b>${k.tipo==="marco"?k.feitas+"/"+k.etapas.length:fmt(k.atual,1)}</b></td>
     <td><div style="display:flex;gap:6px;align-items:center"><div class="prog" style="flex:1"><i style="width:${Math.max(3,p*100)}%;background:${p>=1?"var(--good)":"var(--prog)"}"></i></div><span class="small">${Math.round(p*100)}%</span></div></td>
     <td><span class="pill ${cl}"><i></i>${rt}</span></td><td><span class="pill ${ORIG[k.orig||"proposta"][1]}" style="white-space:nowrap"><i></i>${k.orig==="plano"?"Plano":"Proposta"}</span></td></tr>`}).join("")}</tbody></table></div>`).join("");
}
function catEsp(){
  const B=$("#catBody"),sem=UCS.filter(u=>!ESPECIFICOS[u.s]);
  B.innerHTML=Object.keys(ESPECIFICOS).map(s=>{const u=ucObj(s),pl=PLANOS[s];
    return `<div class="card" style="margin-bottom:14px"><div class="card-h"><div><h3>${s} — ${esc(u.n)}</h3><p class="sub">${esc(pl.doc)}</p></div><button class="btn sm" onclick="S.uc='${s}';save();location.hash='uc/${s}'">Painel da UC</button></div>
     <table><thead><tr><th style="width:36%">Indicador</th><th>Meta do plano</th><th style="width:24%">Atual × meta</th><th>Fonte no plano</th></tr></thead><tbody>
     ${ESPECIFICOS[s].map(([id,nm,un,meta,_,tipo,src])=>{const v=S.espec[id];const pct=meta===null?null:tipo==="menor"?(v<=meta?1:Math.max(0,1-(v-meta)/Math.max(1,v))):Math.min(1,v/meta);
       const cor=pct===null?"var(--seq-3)":pct>=1?"var(--good)":pct>=.5?"var(--prog)":"var(--serious)";
       return `<tr><td><b>${esc(nm)}</b><div class="small muted">${un}</div></td><td class="small">${meta===null?"sem meta numérica":(tipo==="menor"?"≤ ":"")+fmt(meta)+" "+un}</td>
       <td><div style="display:flex;gap:8px;align-items:center"><div class="prog" style="flex:1"><i style="width:${pct===null?100:Math.max(4,pct*100)}%;background:${cor}"></i></div><b class="small">${fmt(v,1)}</b></div></td><td class="small muted">${esc(src)}</td></tr>`}).join("")}</tbody></table></div>`}).join("")+
   `<div class="note"><b>${sem.length} UCs ainda sem indicadores específicos:</b> ${sem.map(u=>u.s).join(", ")}. Eles entram quando o plano de manejo de cada UC for cadastrado (meta, indicador e fonte de cada atividade).</div>`;
}

// ======================= AÇÃO → INDICADOR (linha de base, meta, valor atual, ritmo) =======================
const ET={DOC:["Termo de referência","Diagnóstico","Minuta","Consulta e validação","Aprovação / publicação"],TERMO:["Contato com o parceiro","Minuta","Análise jurídica","Assinatura"],
  NORMA:["Minuta","Consulta pública","Análise jurídica","Publicação"],SIS:["Modelo de dados","Carga dos registros","Validação","Em uso"],CRON:["Elaborado","Aprovado","Em uso"],
  PROG:["Diagnóstico","Desenho do programa","Edital / chamamento","Primeira turma","Programa em execução"],ESTUDO:["Levantamento","Campo","Digitalização","Publicação"],
  OBRA:["Projeto","Contratação","Instalação"],CART:["Texto","Ilustração e diagramação","Revisão","Publicação"],EDITAL:["Minuta","Aprovação","Publicação"],FUND:["Levantamento dominial","Relatório","Processo encaminhado"],SITE:["Conteúdo","Publicação no site","Redes sociais ativas"]};
ET.PLANO_ANUAL=["Minuta","Aprovação pelo conselho","Publicação"];
ET.SINAL=["Projeto elaborado","Contratação","Implantação de 50%","Implantação de 100%"];
// [nome do indicador, unidade, tipo, sentido, linha de base (null = a levantar), meta final | etapas, origem da meta, fórmula, meta de 2026 (se a meta final for posterior)]
const KPI_ACAO={
 1:["Reuniões do Conselho Gestor realizadas","reuniões","num","maior",9,12,"plano","Nº de reuniões com ata registrada no ano"],
 2:["Programa de voluntariado consolidado","etapas","marco","maior",0,"PROG","plano","Etapas concluídas ÷ total de etapas",2],
 3:["Reuniões com o Quilombo São Pedro","reuniões","num","maior",null,4,"proposta","Nº de reuniões com ata no ano (consulta livre, prévia e informada)"],
 4:["Plano de Ação de Educação Ambiental","etapas","marco","maior",0,"DOC","plano","Etapas concluídas ÷ total de etapas",2],
 5:["Escolas do entorno com parceria formalizada","escolas","num","maior",null,10,"proposta","Nº de escolas com termo ou plano de trabalho assinado",3],
 6:["Sinalização turística da APA","etapas","marco","maior",0,"SINAL","plano","Etapas concluídas ÷ total de etapas (projeto em 3 anos; implantação em 5 anos)",1],
 7:["Oficina de planejamento integrado da fiscalização","oficinas","num","maior",0,1,"plano","Nº de oficinas no ano com IEMA, IBAMA, polícia e municípios"],
 8:["Dias de fiscalização no ano","dias","num","maior",41,60,"plano","Nº de dias com ação de fiscalização registrada"],
 9:["Banco SIG de ilícitos e denúncias","etapas","marco","maior",0,"SIS","plano","Etapas concluídas ÷ total de etapas"],
 10:["Pequenas barragens mapeadas","%","num","maior",0,100,"plano","Barragens mapeadas ÷ barragens existentes × 100"],
 11:["Parceria municipal de coleta de resíduos","etapas","marco","maior",0,"TERMO","plano","Etapas concluídas ÷ total de etapas"],
 12:["Área afetada por incêndios","ha","num","menor",5.1,2.5,"proposta","Soma da área queimada no ano (ROIF); meta: reduzir 50% em 2 anos",3.8],
 13:["Plano de Comunicação","etapas","marco","maior",0,"DOC","plano","Etapas concluídas ÷ total de etapas"],
 14:["Plano anual de trabalho","etapas","marco","maior",0,"PLANO_ANUAL","plano","Etapas concluídas ÷ total de etapas"],
 15:["Mapa geológico da APAGO","etapas","marco","maior",0,"ESTUDO","plano","Etapas concluídas ÷ total de etapas",1],
 16:["Pesquisas sobre juçara, patioba e aves ameaçadas","pesquisas","num","maior",0,3,"plano","Nº de pesquisas autorizadas ou concluídas sobre os alvos",1],
 17:["Plano de Comunicação e Educação Ambiental","etapas","marco","maior",0,"DOC","plano","Etapas concluídas ÷ total de etapas"],
 18:["Nascentes mapeadas e caracterizadas","%","num","maior",0,100,"plano","Nascentes caracterizadas ÷ nascentes existentes × 100",50],
 19:["Reuniões com proprietários rurais","reuniões","num","maior",1,2,"plano","Nº de reuniões com lista de presença e ata no ano"],
 20:["Escolas de Ibiraçu com parceria formalizada","escolas","num","maior",null,6,"proposta","Nº de escolas com termo ou plano de trabalho assinado",2],
 21:["Trilhas turísticas mapeadas","%","num","maior",0,100,"plano","Trilhas mapeadas ÷ trilhas conhecidas × 100",35],
 22:["Dias de fiscalização no ano","dias","num","maior",38,60,"plano","Nº de dias com ação de fiscalização registrada"],
 23:["Banco SIG de ilícitos","etapas","marco","maior",0,"SIS","plano","Etapas concluídas ÷ total de etapas"],
 24:["Parceria de coleta de resíduos com Ibiraçu","etapas","marco","maior",0,"TERMO","plano","Etapas concluídas ÷ total de etapas"],
 25:["Pontos de mineração irregular em atividade","pontos","num","menor",4,0,"proposta","Nº de pontos ativos na última vistoria (notificados à ANM)"],
 26:["Site do IEMA e redes sociais da ARIE atualizados","etapas","marco","maior",0,"SITE","plano","Etapas concluídas ÷ total de etapas",1],
 27:["Instrumento Regulamentador Específico","etapas","marco","maior",0,"NORMA","plano","Etapas concluídas ÷ total de etapas",1],
 28:["Estudos publicados sobre a gênese do Morro da Vargem","estudos","num","maior",0,1,"proposta","Nº de estudos publicados ou divulgados"],
 29:["Levantamento fundiário encaminhado","etapas","marco","maior",0,"FUND","proposta","Etapas concluídas ÷ total de etapas"],
 30:["Regras da Zona de Amortecimento publicadas","etapas","marco","maior",0,"NORMA","proposta","Etapas concluídas ÷ total de etapas"],
 31:["Escolas atendidas — Preservando o Nosso Quintal","escolas","num","maior",6,10,"proposta","Nº de escolas atendidas no ano"],
 32:["Cartilha didática do plano de manejo","etapas","marco","maior",0,"CART","proposta","Etapas concluídas ÷ total de etapas"],
 33:["Campanhas contra caça e captura de aves","campanhas","num","maior",0,2,"proposta","Nº de campanhas realizadas no ano"],
 34:["Edital de chamamento para pesquisa","etapas","marco","maior",0,"EDITAL","proposta","Etapas concluídas ÷ total de etapas"],
 35:["Rotina e cronograma de fiscalização","etapas","marco","maior",0,"CRON","proposta","Etapas concluídas ÷ total de etapas"],
 36:["Acessos clandestinos bloqueados e sinalizados","acessos","num","maior",0,10,"proposta","Nº de acessos bloqueados (com foto georreferenciada)"],
 37:["Bebedouros para fauna instalados","bebedouros","num","maior",0,6,"proposta","Nº de bebedouros instalados antes da estiagem"],
 38:["Guarda-corpo do mirante da Pedra Azul","etapas","marco","maior",0,"OBRA","proposta","Etapas concluídas ÷ total de etapas",1],
 39:["Plano de contingência e gerenciamento de risco","etapas","marco","maior",0,"DOC","proposta","Etapas concluídas ÷ total de etapas",2],
 40:["Cronograma de controle de exóticas","etapas","marco","maior",0,"CRON","proposta","Etapas concluídas ÷ total de etapas",1],
 41:["Ações do Prevines realizadas","ações","num","maior",2,6,"proposta","Nº de ações de prevenção a incêndios no ano"],
 42:["Plano de Monitoramento da Biodiversidade","etapas","marco","maior",0,"DOC","proposta","Etapas concluídas ÷ total de etapas",2],
 43:["Ninhos de tartaruga monitorados","%","num","maior",90,100,"plano","Ninhos monitorados ÷ ninhos encontrados na temporada × 100"],
 44:["Campanhas do peixe-anual-de-Itaúnas","campanhas","num","maior",0,2,"proposta","Nº de campanhas de monitoramento no ano"],
 45:["Plano de Educação Ambiental e Comunicação","etapas","marco","maior",0,"DOC","proposta","Etapas concluídas ÷ total de etapas",2],
 46:["TCPU com a Aldeia Jacó Pataxó","etapas","marco","maior",0,"TERMO","plano","Etapas concluídas ÷ total de etapas"],
 47:["TCPU com a Comunidade de Riacho Doce","etapas","marco","maior",0,"TERMO","plano","Etapas concluídas ÷ total de etapas"],
 48:["TCPU com pescadores artesanais do Rio Itaúnas","etapas","marco","maior",0,"TERMO","plano","Etapas concluídas ÷ total de etapas"],
 49:["Barracas de praia em conformidade com o TAC","barracas","num","maior",3,8,"plano","Nº de barracas conformes na última vistoria semestral"],
 50:["Plano de Uso Público","etapas","marco","maior",0,"DOC","proposta","Etapas concluídas ÷ total de etapas",2],
 51:["Sítios arqueológicos vistoriados no ano","sítios","num","maior",0,14,"plano","Nº de sítios com relatório de vistoria no ano"],
 52:["Plano de Proteção e Consolidação Territorial","etapas","marco","maior",0,"DOC","proposta","Etapas concluídas ÷ total de etapas"],
 53:["Plano de Gestão","etapas","marco","maior",0,"DOC","proposta","Etapas concluídas ÷ total de etapas"]};
const ORIG={plano:["Meta do plano de manejo","st-conc"],proposta:["Meta proposta — validar","st-venc"]};
const metaFinal=k=>k.tipo==="marco"?k.etapas.length:k.meta;
const multiAno=a=>parseD(a.prazo).getFullYear()>ANO;
function kpiPct(k){if(!k)return null;
  if(k.tipo==="marco")return k.feitas/k.etapas.length;
  if(k.sentido==="menor")return (k.base??0)===k.meta?(k.atual<=k.meta?1:0):Math.max(0,Math.min(1,((k.base??0)-k.atual)/((k.base??0)-k.meta)));
  return k.meta?Math.max(0,Math.min(1,k.atual/k.meta)):null}
function kpiEsperado(a){const k=a.kpi,ini=new Date(ANO,0,1);
  if(k&&k.m26!=null&&multiAno(a)){const fimAno=new Date(ANO,11,31),frac=Math.max(0,Math.min(1,(HOJE-ini)/(fimAno-ini)));
    const alvo=k.sentido==="menor"?(((k.base??0)-k.m26)/(((k.base??0)-k.meta)||1)):k.m26/metaFinal(k);return Math.max(0,Math.min(1,alvo*frac))}
  const fim=parseD(a.prazo);const t=(HOJE-ini)/(fim-ini);return Math.max(0,Math.min(1,t))}
function kpiRitmo(a){const k=a.kpi,p=kpiPct(k);if(p===null)return["Sem meta","st-nao"];if(p>=1)return["Meta atingida","st-conc"];
  const e=kpiEsperado(a);if(dias(a.prazo)<0)return["Prazo vencido","st-atr"];if(p>=e-.1)return["No ritmo","st-and"];if(p>=e-.3)return["Atenção","st-venc"];return["Abaixo do esperado","st-atr"]}
const kpiFmt=(k,v)=>k.tipo==="marco"?`${v}/${k.etapas.length} etapas`:`${fmt(v,1)} ${k.un}`;
function kpiSeed(){
  let mud=false;
  S.acoes.forEach(a=>{if(a.kpi&&a.kpi.v===3)return;const n=+a.id.slice(1),K=KPI_ACAO[n];
    if(!K){a.kpi={v:3,nome:a.ind||a.ativ,un:"etapas",tipo:"marco",sentido:"maior",base:0,etapas:ET.DOC.slice(),feitas:Math.round(5*a.pct/100),orig:"proposta",form:"Etapas concluídas ÷ total de etapas",m26:null,med:[]};mud=true;return}
    const [nome,un,tipo,sent,base,meta,orig,form,m26]=K, base0=base??0;
    if(tipo==="marco"){const et=ET[meta].slice();a.kpi={v:3,nome,un,tipo,sentido:"maior",base:0,etapas:et,feitas:Math.round(et.length*a.pct/100),orig,form,m26:m26??null,med:[]}}
    else{const at=sent==="menor"?base0-(base0-meta)*a.pct/100:meta*a.pct/100;a.kpi={v:3,nome,un,tipo,sentido:sent,base,meta,atual:["%","ha"].includes(un)?Math.round(at*10)/10:Math.round(at),orig,form,m26:m26??null,med:[]};
      let v=sent==="menor"?base0:0;[2,5,8].forEach(m=>{if(m<FECHADOS){v=sent==="menor"?Math.max(a.kpi.atual,v-(base0-a.kpi.atual)/3):Math.min(a.kpi.atual,v+a.kpi.atual/3);a.kpi.med.push({d:`${ANO}-${String(m+1).padStart(2,"0")}-28`,v:["%","ha"].includes(un)?Math.round(v*10)/10:Math.round(v)})}})}
    mud=true});
  if(mud)save();
}
kpiSeed();
{const _r=resetDemo; resetDemo=function(){try{localStorage.removeItem("sisgap:metasC")}catch(e){};_r()};}

// --- bloco “Indicador da ação” dentro da ficha da ação ---
{const _ea=editarAcao; editarAcao=function(id){_ea(id);if(!id)return;const a=S.acoes.find(x=>x.id===id);if(!a||!a.kpi)return;
  const k=JSON.parse(JSON.stringify(a.kpi)),pode=isAdmin()||user().uc===a.uc;
  const box=document.createElement("div");box.className="card";box.style.cssText="background:var(--surface-2);margin:10px 0";
  const draw=()=>{const p=kpiPct(k),aa=Object.assign({},a,{kpi:k}),[rt,cl]=kpiRitmo(aa);
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3 style="margin:0">📈 Indicador da ação</h3><span class="pill ${cl}"><i></i>${rt}</span></div>
     <div class="fld" style="margin-top:8px"><label>Indicador</label><input id="kNome" value="${esc(k.nome)}" ${pode?"":"disabled"}></div>
     <div style="display:grid;grid-template-columns:130px 1fr;gap:4px 10px;margin:4px 0 10px" class="small"><span class="muted">Fórmula</span><span>${esc(k.form||"")}</span><span class="muted">Meio de verificação</span><span>${esc(a.ind||"")}</span>
     <span class="muted">Origem da meta</span><span><span class="pill ${ORIG[k.orig||"proposta"][1]}"><i></i>${ORIG[k.orig||"proposta"][0]}</span> <span class="muted">(${esc(a.meta)})</span></span></div>
     ${k.tipo==="num"?`<div class="grid" style="grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">
       <div class="fld"><label>Unidade</label><input id="kUn" value="${esc(k.un)}" ${pode?"":"disabled"}></div>
       <div class="fld"><label>Linha de base</label><input id="kBase" type="number" step="any" value="${k.base??""}" placeholder="a levantar" ${pode?"":"disabled"}></div>
       <div class="fld"><label>Meta final ${k.sentido==="menor"?"(≤)":""}</label><input id="kMeta" type="number" step="any" value="${k.meta}" ${pode?"":"disabled"}></div>
       <div class="fld"><label>Valor atual</label><input id="kAt" type="number" step="any" value="${k.atual}" ${pode?"":"disabled"} style="font-weight:700"></div></div>
       ${multiAno(a)?`<div class="fld"><label>Meta para ${ANO} (meta final em ${fmtD(a.prazo)})</label><input id="kM26" type="number" step="any" value="${k.m26??""}" placeholder="—" ${pode?"":"disabled"}></div>`:""}
       <div class="fld"><label>Sentido</label><select id="kSen" ${pode?"":"disabled"}><option value="maior" ${k.sentido==="maior"?"selected":""}>Quanto maior, melhor</option><option value="menor" ${k.sentido==="menor"?"selected":""}>Quanto menor, melhor</option></select></div>`
     :`${multiAno(a)?`<div class="fld"><label>Etapas a concluir em ${ANO} (entrega final em ${fmtD(a.prazo)})</label><input id="kM26" type="number" min="0" max="${k.etapas.length}" value="${k.m26??""}" ${pode?"":"disabled"} style="width:120px"></div>`:""}<div class="fld"><label>Etapas da entrega (marque as concluídas)</label>${k.etapas.map((e,i)=>`<label style="display:flex;gap:10px;align-items:center;justify-content:flex-start;padding:5px 0;font-weight:400;cursor:pointer"><input type="checkbox" style="width:18px;height:18px;flex:0 0 auto;margin:0" data-et="${i}" ${i<k.feitas?"checked":""} ${pode?"":"disabled"}> ${i+1}. ${esc(e)}</label>`).join("")}</div>`}
     <div style="display:flex;gap:10px;align-items:center;margin-top:6px"><div class="prog" style="flex:1;height:10px"><i style="width:${(p||0)*100}%;background:${p>=1?"var(--good)":"var(--prog)"}"></i></div><b>${Math.round((p||0)*100)}%</b></div>
     <div class="small muted" style="margin-top:4px">Progresso da ação calculado pelo indicador · esperado para hoje: ${Math.round(kpiEsperado(aa)*100)}% (prazo ${fmtD(a.prazo)})</div>
     ${k.tipo==="num"&&k.med.length?`<div style="margin-top:8px">${lineChart(k.med.map(m=>fmtD(m.d).slice(0,5)),k.med.map(m=>m.v),{unit:k.un,h:140,closed:99})}</div><div class="small muted">Medições registradas: ${k.med.length} · cada novo valor salvo entra na série</div>`:""}`;
    const bind=(id,f)=>{const el=box.querySelector("#"+id);if(el)el.onchange=e=>{f(e.target.value);draw()}};
    bind("kNome",v=>k.nome=v);bind("kUn",v=>k.un=v);bind("kBase",v=>k.base=v===""?null:+v);bind("kM26",v=>k.m26=v===""?null:+v);bind("kMeta",v=>k.meta=+v);bind("kAt",v=>k.atual=+v);bind("kSen",v=>k.sentido=v);
    box.querySelectorAll("[data-et]").forEach(c=>c.onchange=()=>{k.feitas=[...box.querySelectorAll("[data-et]")].filter(x=>x.checked).length;draw()});
    const sl=$("#ePct");if(sl){sl.step=1;sl.value=Math.round((p||0)*100);sl.disabled=true;$("#ePv").textContent=sl.value+"% (pelo indicador)"}
  };
  const ref=document.querySelector(".drawer #eResp");const anchor=ref?ref.closest(".grid"):null;if(anchor)anchor.before(box);draw();
  const bt=$("#eSave");if(bt)bt.addEventListener("click",()=>{const antes=a.kpi;
    if(k.tipo==="num"&&antes.atual!==k.atual)k.med.push({d:new Date().toISOString().slice(0,10),v:k.atual});
    if(k.tipo==="marco"&&antes.feitas!==k.feitas)a.hist.unshift({q:new Date().toISOString(),t:`Indicador: ${k.feitas}/${k.etapas.length} etapas (${k.etapas[k.feitas-1]||"nenhuma"}) por ${user().nome}`});
    a.kpi=k;const p=kpiPct(k);$("#ePct").disabled=false;$("#ePct").step=1;$("#ePct").value=Math.round((p||0)*100);if(p>=1&&$("#eSt").value!=="conc")$("#eSt").value="conc";else if(p>0&&$("#eSt").value==="nao")$("#eSt").value="and"},true);
};}

// --- metas anuais dos indicadores comuns, por UC ---
S.metasC=LS.get("metasC",null);
if(!S.metasC){S.metasC={};UCS.forEach(u=>{const r=rng("mt"+u.s);S.metasC[u.s]={};IND_LIST.forEach(([id,nm,un,rg])=>{
  const pol=POL_COMUM[id];const anual=rg==="Último"?(ultimo(u.s,id)||0):soma(u.s,id)/Math.max(1,FECHADOS)*12;
  const base=Math.round(anual*(rg==="Último"?.95:(.85+r()*.25)));
  S.metasC[u.s][id]={base,meta:pol==="—"?null:pol==="↑"?Math.max(1,Math.round(base*(rg==="Último"?1.05:1.1))):Math.round(base*.8)}})});LS.set("metasC",S.metasC)}
const saveMetas=()=>LS.set("metasC",S.metasC);
function metaC(uc,id){if(uc)return S.metasC[uc][id];const m={base:0,meta:0};let sem=false;UCS.forEach(u=>{const x=S.metasC[u.s][id];m.base+=x.base;if(x.meta===null)sem=true;else m.meta+=x.meta});if(sem)m.meta=null;return m}
function situC(uc,id){const ind=IND_LIST.find(i=>i[0]===id),m=metaC(uc,id),pol=POL_COMUM[id];if(!m||m.meta===null)return null;
  const est=ind[3]==="Último",at=est?vUlt(uc,id):vSoma(uc,id),esp=est?m.meta:m.meta*FECHADOS/12;
  let r;if(pol==="↑")r=esp?at/esp:1;else r=esp?at/esp:(at?9:0);
  const ok=pol==="↑"?r>=.95:r<=1, at2=pol==="↑"?r>=.75:r<=1.25;
  return {at,esp,r,lbl:ok?(pol==="↑"&&!est&&at>=m.meta?"Meta atingida":"No ritmo"):at2?"Atenção":"Fora da meta",cl:ok?"st-conc":at2?"st-venc":"st-atr"};
}
