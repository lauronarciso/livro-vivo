// SisGAP-ES — Gestão institucional: plano de manejo, conselho, equipe, parcerias, capacitações,
// regularização fundiária, autos e multas, prazos de processos, instrumentos legais e criação de UCs.
// Versão de teste: todos os registros abaixo são SIMULADOS (marcados "exemplo").

const PM_SIT=["Aprovado","Em revisão","Em elaboração","Sem plano"];
const PM_COR={"Aprovado":"#0ca30c","Em revisão":"#2a78d6","Em elaboração":"#eda100","Sem plano":"#d03b3b"};
const CONS_SIT=["Ativo","Em recomposição","Não instituído"];
const CONS_COR={"Ativo":"#0ca30c","Em recomposição":"#eda100","Não instituído":"#d03b3b"};
const PARC_TIPOS=["Acordo de cooperação técnica","Termo de fomento / colaboração","Convênio","Adoção de UC (empresa)","Termo de compromisso (TCPU)","Voluntariado","Protocolo de intenções"];
const CAP_TEMAS=["Gestão de unidades de conservação","Prevenção e combate a incêndios florestais","Fiscalização e lavratura de autos","Geoprocessamento (QGIS) aplicado a UCs","Manejo e resgate de fauna","Condução e segurança de visitantes","Primeiros socorros em áreas remotas","Mediação de conflitos e conselhos gestores","Educação ambiental"];
const CAP_MOD=["Presencial","EAD","Híbrido"];
const PROC_TIPOS=[["Anuência / manifestação em licenciamento",60],["Autorização de pesquisa",30],["Autorização de uso, evento ou imagem",15],["Ouvidoria / denúncia",20],["Ofício / manifestação técnica",15]];
const PROC_RES=["","Anuência emitida","Anuência com condicionantes","Anuência negada","Pesquisa autorizada","Pesquisa indeferida","Autorizado","Indeferido","Respondido / encaminhado"];
const ehAnu=p=>p.tipo.startsWith("Anuência"), ehPesq=p=>p.tipo==="Autorização de pesquisa";
const MULTA_SIT=["Em defesa / recurso","Julgado — mantido","Pago","Convertido em serviços ambientais","Cancelado / anulado","Inscrito em dívida ativa"];
const INST_TIPOS=["Lei","Decreto","Instrução Normativa","Portaria","Resolução","Regimento interno do conselho","Ordem de serviço"];
const INST_SIT=["Em elaboração","Em consulta pública","Publicado / vigente","Revogado"];
const CRIA_ETAPAS=["Demanda recebida","Estudos técnicos","Consulta pública","Minuta de decreto","Criada"];
const pmVenceTxt=i=>!i.pmVence?"sem plano":i.pm==="Aprovado"?(dias(i.pmVence)<0?`aprovado em ${i.pmAno} · <b style="color:#9b2424">revisão vencida desde ${fmtD(i.pmVence)}</b>`:`aprovado em ${i.pmAno} · revisão prevista ${fmtD(i.pmVence)}`):`conclusão prevista ${fmtD(i.pmVence)}`;
const brlC=v=>v>=1e6?"R$ "+(v/1e6).toLocaleString("pt-BR",{maximumFractionDigits:1})+" mi":v>=1e3?"R$ "+Math.round(v/1e3)+" mil":"R$ "+v;
const brl=v=>"R$ "+Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:0,maximumFractionDigits:0});
const iso=d=>d.toISOString().slice(0,10);
const addD=(s,n)=>{const d=parseD(s);d.setDate(d.getDate()+n);return iso(d)};

function seedGes(){
  const G={uc:{},parc:[],cap:[],proc:[],multa:[],inst:[],cria:[]};let id=0;const nid=p=>p+(++id);
  const PM={APAGO:["Aprovado",2025],ARIEMV:["Aprovado",2024],PEFG:["Aprovado",2023],PEI:["Aprovado",2024]};
  UCS.forEach((u,k)=>{
    const r=rng("ges"+u.s), pick=a=>a[Math.floor(r()*a.length)];
    const pm=PM[u.s]||[pick(["Aprovado","Aprovado","Em revisão","Em elaboração","Sem plano"]),2008+Math.floor(r()*14)];
    const cs=pick(["Ativo","Ativo","Ativo","Em recomposição","Não instituído"]);
    const eq={ef:1+Math.floor(r()*3),co:Math.floor(r()*2),te:2+Math.floor(r()*7),br:u.g==="PI"?Math.floor(r()*10):0,vo:Math.floor(r()*8)};
    const tot=(typeof CAR!=="undefined"&&CAR.resumo[u.s]&&u.g==="PI")?CAR.resumo[u.s].n_relevante:(u.g==="PI"?8+Math.floor(r()*60):0);
    const reg=u.g==="PI"?Math.floor(tot*(.1+r()*.5)):0, haTot=u.g==="PI"?Math.round(200+r()*3000):0;
    const mm=String(1+Math.floor(r()*12)).padStart(2,"0");
    G.uc[u.s]={pm:pm[0],pmAno:(pm[0]==="Aprovado"||pm[0]==="Em revisão")?pm[1]:"",pmVence:pm[0]==="Aprovado"?`${pm[1]+10}-${mm}-15`:pm[0]==="Sem plano"?"":`${2027+Math.floor(r()*2)}-${mm}-30`,pmDoc:PLANOS[u.s]?PLANOS[u.s].doc:"",cons:cs,consFim:cs==="Ativo"?addD("2026-11-25",Math.floor(r()*900)):"",quorum:cs==="Ativo"?Math.round(55+r()*40):null,eq,
      fund:u.g==="PI"?{tot,reg,haTot,haReg:Math.round(haTot*reg/Math.max(1,tot))}:null};
    // parcerias
    const np=1+Math.floor(r()*4);
    for(let i=0;i<np;i++){const ini=addD("2023-01-15",Math.floor(r()*1300));const tp=pick(PARC_TIPOS);
      G.parc.push({id:nid("p"),uc:u.s,parceiro:pick(["Prefeitura Municipal","Universidade","ONG ambientalista","Associação de moradores","Empresa parceira","Instituto de pesquisa","Escola estadual","Batalhão de Polícia Ambiental"])+" (exemplo)",tipo:tp,
        objeto:pick(["Monitoramento da biodiversidade","Educação ambiental nas escolas do entorno","Manutenção de trilhas","Prevenção de incêndios","Apoio à visitação","Pesquisa científica","Restauração florestal"]),inicio:ini,fim:addD(ini,365*(1+Math.floor(r()*4))),valor:r()<.4?Math.round(r()*300)*1000:0});}
    // capacitações
    const nc=1+Math.floor(r()*4);
    for(let i=0;i<nc;i++){G.cap.push({id:nid("c"),uc:u.s,curso:pick(CAP_TEMAS),inst:pick(["IEMA/GGUC","ICMBio (curso aberto)","Corpo de Bombeiros","Universidade","Escola de governo"])+" (exemplo)",modal:pick(CAP_MOD),horas:pick([8,16,20,24,40,60]),data:addD("2026-01-20",Math.floor(r()*290)),part:1+Math.floor(r()*Math.max(1,eq.ef+eq.te))});}
    // processos com prazo de resposta
    const npr=4+Math.floor(r()*12);
    for(let i=0;i<npr;i++){const [tp,pz]=i<2?PROC_TIPOS[0]:i<4?PROC_TIPOS[1]:pick(PROC_TIPOS);const ent=addD("2026-01-05",Math.floor(r()*310));const t=Math.round(pz*(.3+r()*1.3));const resp=addD(ent,t);
      G.proc.push({id:nid("q"),uc:u.s,tipo:tp,num:"2026-"+String(10000+Math.floor(r()*89999))+" (exemplo)",assunto:pick({"Anuência / manifestação em licenciamento":["Anuência para empreendimento na zona de amortecimento","Manifestação sobre supressão de vegetação no entorno","Anuência para linha de transmissão / estrada"],"Autorização de pesquisa":["Pesquisa de campo com coleta de material","Levantamento de fauna com armadilhas fotográficas","Estudo de flora e regeneração"],"Autorização de uso, evento ou imagem":["Evento esportivo na UC","Filmagem / fotografia comercial","Atividade de turismo de aventura"],"Ouvidoria / denúncia":["Denúncia de desmatamento","Reclamação de visitante","Denúncia de caça"],"Ofício / manifestação técnica":["Ofício do Ministério Público","Pedido de informação da Câmara Municipal","Consulta de órgão público"]}[tp]),entrada:ent,prazo:pz,resposta:parseD(resp)<=HOJE?resp:""});const P=G.proc[G.proc.length-1];if(P.resposta)P.res=tp.startsWith("Anuência")?pick(["Anuência emitida","Anuência emitida","Anuência com condicionantes","Anuência negada"]):tp==="Autorização de pesquisa"?pick(["Pesquisa autorizada","Pesquisa autorizada","Pesquisa autorizada","Pesquisa indeferida"]):tp.startsWith("Autorização")?pick(["Autorizado","Indeferido"]):"Respondido / encaminhado";else P.res="";}
    // autos e multas
    const na=Math.min(12,Math.max(0,typeof soma==="function"?soma(u.s,"aut"):3));
    for(let i=0;i<na;i++){const v=Math.round((500+r()*48000)/100)*100;const sit=pick(MULTA_SIT);
      G.multa.push({id:nid("m"),uc:u.s,auto:"AI "+String(1000+Math.floor(r()*8999))+"/2026 (exemplo)",data:addD("2026-01-10",Math.floor(r()*300)),infr:pick(["Supressão de vegetação","Caça","Uso de fogo","Construção irregular","Pesca irregular","Entrada de animais domésticos","Extração mineral"]),valor:v,sit,pago:sit==="Pago"?v:sit==="Convertido em serviços ambientais"?Math.round(v*.6):0});}
    // instrumentos legais da UC
    if(r()<.6)G.inst.push({id:nid("i"),uc:u.s,tipo:pick(["Portaria","Instrução Normativa","Regimento interno do conselho","Ordem de serviço"]),num:"nº "+(1+Math.floor(r()*80))+"-S/2026 (exemplo)",data:addD("2026-02-01",Math.floor(r()*250)),ementa:pick(["Regulamenta a visitação e o uso público","Normas para pesquisa científica na UC","Aprova o regimento interno do conselho gestor","Disciplina o uso de drones","Define horários e capacidade de suporte das trilhas","Procedimentos de fiscalização integrada"]),sit:pick(INST_SIT.slice(0,3))});
  });
  // instrumentos da rede (GGUC)
  [["Instrução Normativa","Procedimentos para elaboração e revisão de planos de manejo","Publicado / vigente"],["Instrução Normativa","Regras de cobrança de ingressos e uso público nas UCs estaduais","Em consulta pública"],["Portaria","Institui o SisGAP-ES como sistema oficial de monitoramento da gestão das UCs","Em elaboração"],["Resolução","Critérios para destinação de compensação ambiental às UCs","Publicado / vigente"],["Decreto","Regulamenta o voluntariado nas UCs estaduais","Em elaboração"]]
   .forEach(([tp,em,st],i)=>G.inst.push({id:nid("i"),uc:null,tipo:tp,num:"nº "+(10+i*7)+"/2026 (exemplo)",data:addD("2026-01-20",i*55),ementa:em,sit:st}));
  // criação / ampliação de UCs
  [["Proposta de UC — região serrana (exemplo)","Parque","PI",4200,2,"Montanha (exemplo)"],["Proposta de UC — litoral norte (exemplo)","RDS","US",1850,1,"Litoral norte (exemplo)"],["Ampliação de UC existente (exemplo)","Ampliação","PI",640,3,"—"],["Proposta de MONA — afloramento rochoso (exemplo)","Monumento Natural","PI",980,0,"Noroeste (exemplo)"]]
   .forEach(([n,c,g,a,e,mun],i)=>G.cria.push({id:nid("n"),nome:n,cat:c,grupo:g,area:a,etapa:e,mun,inicio:addD("2024-03-01",i*160),obs:"Exemplo para validação."}));
  return G;
}
S.ges=LS.get("ges5",null)||seedGes();
const saveGes=()=>LS.set("ges5",S.ges);
{const _r=resetDemo; resetDemo=function(){try{localStorage.removeItem("sisgap:ges5")}catch(e){};_r()};}

// ---------- cálculo dos indicadores ----------
function gesInd(uc){ // uc=null → rede
  const G=S.ges, ucs=uc?[uc]:UCS.map(u=>u.s), F=a=>a.filter(x=>uc?x.uc===uc:true);
  const info=ucs.map(s=>G.uc[s]);
  const pmAprov=info.filter(i=>i.pm==="Aprovado").length, pmAnd=info.filter(i=>i.pm==="Em revisão"||i.pm==="Em elaboração").length;
  const pmVelho=info.filter(i=>i.pm==="Aprovado"&&i.pmVence&&dias(i.pmVence)<0).length, pmVence2=info.filter(i=>i.pm==="Aprovado"&&i.pmVence&&dias(i.pmVence)>=0&&dias(i.pmVence)<=730).length;
  const consAt=info.filter(i=>i.cons==="Ativo").length, consVence=info.filter(i=>i.consFim&&dias(i.consFim)<=90).length;
  const quor=info.filter(i=>i.quorum!==null).map(i=>i.quorum), quorum=quor.length?Math.round(quor.reduce((a,b)=>a+b,0)/quor.length):null;
  const eqT=info.reduce((t,i)=>t+i.eq.ef+i.eq.co+i.eq.te,0), brig=info.reduce((t,i)=>t+i.eq.br,0), vol=info.reduce((t,i)=>t+i.eq.vo,0), efet=info.reduce((t,i)=>t+i.eq.ef,0);
  const parc=F(G.parc), parcVig=parc.filter(p=>dias(p.fim)>=0&&dias(p.inicio)<=0), parcVence=parcVig.filter(p=>dias(p.fim)<=90), parcValor=parcVig.reduce((t,p)=>t+p.valor,0);
  const cap=F(G.cap).filter(c=>parseD(c.data).getFullYear()===ANO), capH=cap.reduce((t,c)=>t+c.horas*c.part,0), capP=cap.reduce((t,c)=>t+c.part,0);
  const capPct=eqT?Math.min(100,Math.round(Math.min(capP,eqT)/eqT*100)):0;
  const pr=F(G.proc), resp=pr.filter(p=>p.resposta), tempos=resp.map(p=>Math.round((parseD(p.resposta)-parseD(p.entrada))/864e5));
  const tMed=tempos.length?Math.round(tempos.reduce((a,b)=>a+b,0)/tempos.length):null, noPrazo=resp.filter((p,i)=>tempos[i]<=p.prazo).length;
  const pend=pr.filter(p=>!p.resposta), vencidos=pend.filter(p=>Math.round((HOJE-parseD(p.entrada))/864e5)>p.prazo).length;
  const mu=F(G.multa), muV=mu.reduce((t,m)=>t+m.valor,0), muP=mu.reduce((t,m)=>t+m.pago,0), muJ=mu.filter(m=>m.sit!=="Em defesa / recurso").length;
  const inst=G.inst.filter(i=>uc?i.uc===uc:true), instPub=inst.filter(i=>i.sit==="Publicado / vigente"&&parseD(i.data).getFullYear()===ANO).length, instElab=inst.filter(i=>i.sit==="Em elaboração"||i.sit==="Em consulta pública").length;
  const fu=info.filter(i=>i.fund).map(i=>i.fund), fTot=fu.reduce((t,f)=>t+f.tot,0), fReg=fu.reduce((t,f)=>t+f.reg,0), haTot=fu.reduce((t,f)=>t+f.haTot,0), haReg=fu.reduce((t,f)=>t+f.haReg,0);
  const procF=typeof S.fund!=="undefined"?Object.keys(S.fund).filter(k=>uc?k.endsWith("|"+uc):true).length:0;
  const cria=uc?[]:G.cria, criaAnd=cria.filter(c=>c.etapa<CRIA_ETAPAS.length-1), criaHa=criaAnd.reduce((t,c)=>t+c.area,0);
  const prAno=pr.filter(p=>parseD(p.entrada).getFullYear()===ANO), respAno=pr.filter(p=>p.resposta&&parseD(p.resposta).getFullYear()===ANO);
  const anu=pr.filter(ehAnu), anuEmit=anu.filter(p=>p.res==="Anuência emitida"||p.res==="Anuência com condicionantes"), anuNeg=anu.filter(p=>p.res==="Anuência negada");
  const pesq=pr.filter(ehPesq), pesqAut=pesq.filter(p=>p.res==="Pesquisa autorizada"), pesqPend=pesq.filter(p=>!p.resposta);
  return {n:ucs.length,pmAprov,pmAnd,pmVelho,pmVence2,prAno,respAno,anu,anuEmit,anuNeg,pesq,pesqAut,pesqPend,consAt,consVence,quorum,eqT,efet,brig,vol,parc,parcVig,parcVence,parcValor,cap,capH,capP,capPct,pr,resp,tMed,noPrazo,pend,vencidos,
    pctPrazo:resp.length?Math.round(noPrazo/resp.length*100):null,mu,muV,muP,muJ,inst,instPub,instElab,fu:fu.length,fTot,fReg,haTot,haReg,procF,cria,criaAnd,criaHa,tempos};
}
const GES_DEF={
  pm:"UCs com plano de manejo aprovado / total. Revisão recomendada a cada 10 anos.",
  cons:"Conselhos gestores com mandato vigente e reuniões regulares.",
  parc:"Instrumentos de parceria vigentes hoje (ACT, convênio, fomento, adoção, TCPU, voluntariado).",
  cap:"Cursos concluídos no ano; horas = carga horária × participantes; média de horas por integrante da equipe (efetivos, comissionados e terceirizados).",
  pm2:"Data prevista para a revisão do plano de manejo (em geral, 10 anos após a aprovação) ou para a conclusão do plano em elaboração.",
  proc:"Processos que entraram no ano × processos respondidos; tempo médio de resposta e % respondidos dentro do prazo do tipo de processo.",
  anu:"Anuências da UC para licenciamento de empreendimentos (emitidas, com condicionantes ou negadas).",
  pesq:"Autorizações de pesquisa científica concedidas para a UC.",
  multa:"Autos de infração lavrados no ano, valor das multas aplicadas e valor efetivamente recolhido ou convertido.",
  fund:"UCs de proteção integral: imóveis a regularizar (CAR/levantamento dominial) e quantos já foram indenizados ou desapropriados.",
  inst:"Instruções normativas, portarias, decretos e outros atos publicados no ano e em elaboração.",
  cria:"Processos de criação ou ampliação de UCs em andamento e área proposta."
};

// ---------- blocos de painel (rede e UC) ----------
function gesTiles(uc){
  const g=gesInd(uc), t=(cor,lbl,val,foot,def,link)=>`<div class="card kpi" style="border-top:4px solid ${cor};cursor:pointer" onclick="location.hash='gestao/${link}'" data-tip="<b>${esc(lbl)}</b>${esc(def)}"><div class="lbl">${lbl}</div><div class="val" style="font-size:26px">${val}</div><div class="foot">${foot}</div></div>`;
  const ui=uc?S.ges.uc[uc]:null, eh=uc&&ucObj(uc).g==="PI";
  return [
    uc?t(PM_COR[ui.pm],"Plano de manejo",ui.pm,pmVenceTxt(ui),GES_DEF.pm2,"plano")
      :t("#0ca30c","UCs com plano de manejo",`${g.pmAprov}<span style="font-size:15px;color:var(--muted)">/${g.n}</span>`,`${g.pmAnd} em elaboração ou revisão · <b style="color:#9b2424">${g.pmVelho} com revisão vencida</b> · ${g.pmVence2} vencem em 2 anos`,GES_DEF.pm,"plano"),
    uc?t(CONS_COR[ui.cons],"Conselho gestor",ui.cons,ui.consFim?`mandato até ${fmtD(ui.consFim)} · quórum médio ${ui.quorum}%`:"—",GES_DEF.cons,"plano")
      :t("#2a78d6","Conselhos gestores ativos",`${g.consAt}<span style="font-size:15px;color:var(--muted)">/${g.n}</span>`,`quórum médio ${g.quorum??"—"}% · ${g.consVence} mandatos vencem em 90 dias`,GES_DEF.cons,"plano"),
    t("#1baf7a","Parcerias vigentes",g.parcVig.length,`${g.parcVence.length} vencem em 90 dias${g.parcValor?` · ${brl(g.parcValor)} em recursos`:""}`,GES_DEF.parc,"parcerias"),
    t("#6250d6","Capacitação da equipe",fmt(g.capH)+" h",`${g.cap.length} cursos · ${g.capP} participações · ${g.eqT?fmt(g.capH/g.eqT,1):"—"} h por integrante da equipe`,GES_DEF.cap,"capacitacao"),
    t("#eda100","Processos: entrada × respondidos",`${g.prAno.length}<span style="font-size:15px;color:var(--muted)"> / ${g.respAno.length}</span>`,`${g.pend.length} pendentes · <b style="color:#9b2424">${g.vencidos} vencidos</b> · resposta média ${g.tMed??"—"} d (${g.pctPrazo??"—"}% no prazo)`,GES_DEF.proc,"processos"),
    t("#2a78d6","Anuências emitidas",g.anuEmit.length,`${g.anu.length} pedidos · ${g.anuNeg.length} negadas · ${g.anu.filter(p=>!p.resposta).length} em análise`,GES_DEF.anu,"processos"),
    t("#1baf7a","Pesquisas autorizadas",g.pesqAut.length,`${g.pesq.length} pedidos · ${g.pesqPend.length} em análise`,GES_DEF.pesq,"processos"),
    t("#e34948","Autos e multas",brl(g.muV),`${g.mu.length} autos · ${brl(g.muP)} recolhido/convertido · ${g.muJ} julgados`,GES_DEF.multa,"multas"),
    (!uc||eh)?t("#eb6834","Regularização fundiária",g.fTot?Math.round(g.fReg/g.fTot*100)+"%":"—",`${g.fReg}/${g.fTot} imóveis · ${fmt(g.haReg)} de ${fmt(g.haTot)} ha · ${g.procF} processos no sistema`,GES_DEF.fund,"fundiaria"):"",
    t("#8a4b1f","Instrumentos legais",g.instPub,`publicados em ${ANO} · ${g.instElab} em elaboração ou consulta`,GES_DEF.inst,"instrumentos"),
    uc?"":t("#008300","Criação de UCs",g.criaAnd.length,`processos em andamento · ${fmt(g.criaHa)} ha propostos`,GES_DEF.cria,"criacao"),
    uc?t("#7c877f","Equipe da UC",g.eqT,`${g.efet} efetivos · ${g.brig} brigadistas · ${g.vol} voluntários`,"Servidores efetivos, comissionados e terceirizados lotados na UC.","plano"):""
  ].filter(Boolean).join("");
}
function gesCard(uc){
  return `<div class="card" style="margin-top:16px"><div class="card-h"><div><h3>Gestão institucional${uc?" da UC":" da rede"}</h3><p class="sub">Planejamento, parcerias, capacitação, prazos, multas, regularização fundiária e instrumentos legais · clique em um indicador para ver os registros · dados simulados</p></div><button class="btn sm" onclick="location.hash='gestao'">Abrir módulo</button></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:12px">${gesTiles(uc)}</div>${uc?"":gesTabelaUCs()}</div>`;
}
{const _p=vPainel; vPainel=function(){_p();const g4=document.querySelector("#view .grid.g4");if(g4)g4.insertAdjacentHTML("afterend",gesCard(null))};}
{const _v=vUC; vUC=function(s){_v(s);if(!ucObj(s))return;const g4=document.querySelector("#view .grid.g4");if(g4)g4.insertAdjacentHTML("afterend",gesCard(s))};}

function procUCs(){const M=UCS.map(u=>{const k=gesInd(u.s);return{s:u.s,e:k.prAno.length,r:k.respAno.length}}),mx=Math.max(1,...M.map(m=>Math.max(m.e,m.r)));
  return M.map(m=>`<div style="display:grid;grid-template-columns:70px 1fr 60px;gap:8px;align-items:center;margin:4px 0" data-tip="<b>${m.s}</b>${m.e} entraram · ${m.r} respondidos"><span class="small"><b>${m.s}</b></span><div><div style="height:7px;width:${m.e/mx*100}%;background:#eda100;border-radius:3px"></div><div style="height:7px;width:${m.r/mx*100}%;background:#1f5c3f;border-radius:3px;margin-top:2px"></div></div><span class="small" style="text-align:right">${m.e} / ${m.r}</span></div>`).join("")+`<div class="legend"><span><i style="background:#eda100"></i>Entrada</span><span><i style="background:#1f5c3f"></i>Respondidos</span></div>`}
function pesqUCs(){const M=UCS.map(u=>{const k=gesInd(u.s);return{s:u.s,p:k.pesqAut.length,a:k.anuEmit.length}}),mx=Math.max(1,...M.map(m=>Math.max(m.p,m.a)));
  return M.map(m=>`<div style="display:grid;grid-template-columns:70px 1fr 60px;gap:8px;align-items:center;margin:4px 0" data-tip="<b>${m.s}</b>${m.p} pesquisas autorizadas · ${m.a} anuências emitidas"><span class="small"><b>${m.s}</b></span><div><div style="height:7px;width:${m.p/mx*100}%;background:#1baf7a;border-radius:3px"></div><div style="height:7px;width:${m.a/mx*100}%;background:#2a78d6;border-radius:3px;margin-top:2px"></div></div><span class="small" style="text-align:right">${m.p} / ${m.a}</span></div>`).join("")+`<div class="legend"><span><i style="background:#1baf7a"></i>Pesquisas autorizadas</span><span><i style="background:#2a78d6"></i>Anuências emitidas</span></div>`}
function gesTabelaUCs(){
  return `<details style="margin-top:14px" open><summary style="cursor:pointer;font-weight:600">Gestão por unidade (19 UCs)</summary><div class="tbl-wrap" style="max-height:440px;margin-top:8px"><table><thead><tr><th>UC</th><th>Plano de manejo</th><th>Revisão / vencimento</th><th>Conselho</th><th class="num">Parcerias</th><th class="num">Horas cap.</th><th class="num">Processos entr. / resp.</th><th class="num">Anuências emitidas</th><th class="num">Pesquisas autorizadas</th><th class="num">Multas</th><th class="num">Regul. fundiária</th></tr></thead><tbody>
  ${UCS.map(u=>{const i=S.ges.uc[u.s],k=gesInd(u.s),venc=i.pmVence&&i.pm==="Aprovado"&&dias(i.pmVence)<0;
   return `<tr style="cursor:pointer" onclick="location.hash='uc/${u.s}'"><td><b>${u.s}</b></td><td><span class="pill" style="background:${PM_COR[i.pm]}22;color:${PM_COR[i.pm]}"><i style="background:${PM_COR[i.pm]}"></i>${i.pm}</span></td>
   <td>${i.pmVence?(venc?`<b style="color:#9b2424">${fmtD(i.pmVence)} · vencido</b>`:fmtD(i.pmVence)):"—"}</td><td>${i.cons}</td><td class="num">${k.parcVig.length}</td><td class="num">${fmt(k.capH)}</td><td class="num">${k.prAno.length} / ${k.respAno.length}</td><td class="num">${k.anuEmit.length}</td><td class="num">${k.pesqAut.length}</td><td class="num">${brl(k.muV)}</td><td class="num">${k.fTot?Math.round(k.fReg/k.fTot*100)+"%":"—"}</td></tr>`}).join("")}</tbody></table></div></details>`;
}

// ---------- módulo ----------
ROTAS.splice(ROTAS.findIndex(r=>r[0]==="alertas"),0,["gestao","◈","Gestão institucional"]);
const GTABS=[["geral","Visão geral"],["plano","Plano, conselho e equipe"],["parcerias","Parcerias"],["capacitacao","Capacitações"],["processos","Processos e prazos"],["multas","Autos e multas"],["fundiaria","Regularização fundiária"],["instrumentos","Instrumentos legais"],["criacao","Criação de UCs"]];
const podeGes=uc=>isAdmin()||(user().uc===uc&&["gestor","tecnico"].includes(user().papel));
const SCH={
  parcerias:{arr:"parc",t:"Parceria",f:[["parceiro","Parceiro / instituição","text"],["tipo","Tipo de instrumento","sel",PARC_TIPOS],["objeto","Objeto","text"],["inicio","Início da vigência","date"],["fim","Fim da vigência","date"],["valor","Valor / contrapartida (R$)","num"]]},
  capacitacao:{arr:"cap",t:"Capacitação",f:[["curso","Curso / tema","text",CAP_TEMAS],["inst","Instituição","text"],["modal","Modalidade","sel",CAP_MOD],["horas","Carga horária (h)","num"],["data","Data de conclusão","date"],["part","Nº de participantes da equipe","num"]]},
  processos:{arr:"proc",t:"Processo",f:[["num","Nº do processo (E-Docs)","text"],["tipo","Tipo","sel",PROC_TIPOS.map(x=>x[0])],["assunto","Assunto","text"],["entrada","Data de entrada","date"],["prazo","Prazo de resposta (dias)","num"],["resposta","Data da resposta (vazio = pendente)","date"],["res","Resultado","sel",PROC_RES]]},
  multas:{arr:"multa",t:"Auto de infração",f:[["auto","Nº do auto","text"],["data","Data","date"],["infr","Infração","text"],["valor","Valor da multa (R$)","num"],["sit","Situação","sel",MULTA_SIT],["pago","Valor recolhido / convertido (R$)","num"]]},
  instrumentos:{arr:"inst",t:"Instrumento legal",f:[["tipo","Tipo","sel",INST_TIPOS],["num","Número","text"],["data","Data","date"],["ementa","Ementa / assunto","text"],["sit","Situação","sel",INST_SIT],["link","Link (DIO-ES ou E-Docs)","text"]]},
  criacao:{arr:"cria",t:"Processo de criação/ampliação",f:[["nome","Nome da proposta","text"],["cat","Categoria","text"],["grupo","Grupo","sel",["PI","US"]],["mun","Municípios","text"],["area","Área proposta (ha)","num"],["etapa","Etapa","selIdx",CRIA_ETAPAS],["inicio","Início","date"],["obs","Observações","text"]]}
};
let gTab="geral";
function vGestao(arg){
  if(arg&&GTABS.some(t=>t[0]===arg))gTab=arg;
  const uc=ucAtual()||null, g=gesInd(uc);
  title("Gestão institucional",uc?`${uc} — ${ucObj(uc).n}`:"Rede de UCs estaduais · selecione uma UC no topo para ver só ela");
  const tabs=GTABS.filter(t=>!(uc&&t[0]==="criacao")&&!(uc&&t[0]==="fundiaria"&&ucObj(uc).g!=="PI"));
  if(!tabs.some(t=>t[0]===gTab))gTab="geral";
  $("#view").innerHTML=`<div class="note"><b>Versão de teste.</b> Todos os registros deste módulo são simulados (marcados “exemplo”). Na versão real, cada UC cadastra os seus e a GGUC cadastra os da rede.</div>
   <div class="tabs" style="flex-wrap:wrap">${tabs.map(([k,l])=>`<button data-t="${k}" class="${gTab===k?"on":""}">${l}</button>`).join("")}</div><div id="gx"></div>`;
  document.querySelectorAll(".tabs [data-t]").forEach(b=>b.onclick=()=>{gTab=b.dataset.t;history.replaceState(null,"","#gestao/"+gTab);vGestao()});
  const X=$("#gx"), ucCell=x=>uc?"":`<td><b>${x.uc||"Rede"}</b></td>`, ucH=uc?"":"<th>UC</th>";
  const add=k=>(uc?podeGes(uc):isAdmin())?`<button class="btn primary sm" onclick="gesForm('${k}')">+ Adicionar</button>`:"";
  const head=(t,s,k)=>`<div class="card-h"><div><h3>${t}</h3><p class="sub">${s}</p></div>${k?add(k):""}</div>`;
  const F=a=>a.filter(x=>uc?x.uc===uc:true);
  if(gTab==="geral"){
    X.innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:12px">${gesTiles(uc)}</div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h3>Tempo de resposta por tipo de processo</h3><p class="sub">Média em dias × prazo de referência</p>${hbars(PROC_TIPOS.map(([tp,pz])=>{const r=g.resp.filter(p=>p.tipo===tp);return{l:`${tp} (prazo ${pz} d)`,v:r.length?Math.round(r.reduce((t,p)=>t+(parseD(p.resposta)-parseD(p.entrada))/864e5,0)/r.length):0}}),{unit:"dias",color:"#eda100"})}</div>
      <div class="card"><h3>Autos de infração por situação</h3><p class="sub">${g.mu.length} autos · ${brl(g.muV)} aplicados</p>${hbars(MULTA_SIT.map(s=>({l:s,v:g.mu.filter(m=>m.sit===s).length})),{unit:"autos",color:"#e34948"})}</div>
    </div>
    ${uc?"":`<div class="grid g2" style="margin-top:16px">
      <div class="card"><h3>Processos por UC: entrada × respondidos</h3><p class="sub">${ANO}</p>${procUCs()}</div>
      <div class="card"><h3>Pesquisas e anuências por UC</h3><p class="sub">Autorizações de pesquisa concedidas e anuências emitidas · ${ANO}</p>${pesqUCs()}</div></div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h3>Plano de manejo por UC</h3><p class="sub">Situação nas 19 UCs</p>${hbars(PM_SIT.map(s=>({l:s,v:UCS.filter(u=>S.ges.uc[u.s].pm===s).length})),{unit:"UCs",color:"#0ca30c"})}</div>
      <div class="card"><h3>Horas de capacitação por UC</h3><p class="sub">${ANO} · carga horária × participantes</p>${hbars(UCS.map(u=>({l:u.s,v:gesInd(u.s).capH})).sort((a,b)=>b.v-a.v).slice(0,10),{unit:"h",color:"#6250d6"})}</div></div>`}
    <div class="info" style="margin-top:16px"><b>Como cada indicador é calculado:</b><ul style="margin:6px 0 0 18px;padding:0">${Object.values(GES_DEF).map(d=>`<li class="small">${esc(d)}</li>`).join("")}</ul></div>`;
  }
  if(gTab==="plano"){
    const L=(uc?[ucObj(uc)]:UCS);
    X.innerHTML=`<div class="card">${head("Plano de manejo, conselho gestor e equipe","Situação por UC · clique para editar")}
     <div class="tbl-wrap"><table><thead><tr><th>UC</th><th>Plano de manejo</th><th>Aprovação</th><th>Revisão / vencimento</th><th>Conselho</th><th>Mandato até</th><th class="num">Quórum</th><th class="num">Efetivos</th><th class="num">Comiss.</th><th class="num">Terceiriz.</th><th class="num">Brigadistas</th><th class="num">Voluntários</th></tr></thead><tbody>
     ${L.map(u=>{const i=S.ges.uc[u.s];return `<tr style="cursor:pointer" onclick="gesUcForm('${u.s}')"><td style="min-width:190px"><b>${u.s}</b><div class="small muted">${esc(u.n)}</div></td><td><span class="pill" style="background:${PM_COR[i.pm]}22;color:${PM_COR[i.pm]}"><i style="background:${PM_COR[i.pm]}"></i>${i.pm}</span></td><td>${i.pmAno||"—"}</td><td>${i.pmVence?(dias(i.pmVence)<0&&i.pm==="Aprovado"?`<b style="color:#9b2424">${fmtD(i.pmVence)} (vencido)</b>`:fmtD(i.pmVence)+(dias(i.pmVence)<=730&&i.pm==="Aprovado"?' <span class="pill st-venc"><i></i>em até 2 anos</span>':"")):"—"}</td>
       <td><span class="pill" style="background:${CONS_COR[i.cons]}22;color:${CONS_COR[i.cons]}"><i style="background:${CONS_COR[i.cons]}"></i>${i.cons}</span></td><td>${i.consFim?fmtD(i.consFim):"—"}</td><td class="num">${i.quorum!==null?i.quorum+"%":"—"}</td>
       <td class="num">${i.eq.ef}</td><td class="num">${i.eq.co}</td><td class="num">${i.eq.te}</td><td class="num">${i.eq.br}</td><td class="num">${i.eq.vo}</td></tr>`}).join("")}</tbody></table></div></div>`;
  }
  const tabela=(k,cols,rows,sub)=>{X.innerHTML=`<div class="card">${head(SCH[k].t+(rows.length!==1?"s":"").replace("ãos","ões"),sub,k)}<div class="tbl-wrap" style="max-height:560px"><table><thead><tr>${ucH}${cols.map(c=>`<th${c[2]?' class="num"':""}>${c[0]}</th>`).join("")}</tr></thead><tbody>
    ${rows.length?rows.map(x=>`<tr style="cursor:pointer" onclick="gesForm('${k}','${x.id}')">${ucCell(x)}${cols.map(c=>`<td${c[2]?' class="num"':""}>${c[1](x)}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="9" class="muted">Nenhum registro.</td></tr>`}</tbody></table></div>
    <div style="margin-top:10px"><button class="btn sm" onclick="gesCsv('${k}')">⬇ Planilha (CSV)</button></div></div>`};
  const stPrazo=p=>{if(p.resposta){const t=Math.round((parseD(p.resposta)-parseD(p.entrada))/864e5);return t<=p.prazo?`<span class="pill st-conc"><i></i>Respondido em ${t} d</span>`:`<span class="pill st-venc"><i></i>Respondido em ${t} d (atraso)</span>`}
    const d=Math.round((HOJE-parseD(p.entrada))/864e5);return d>p.prazo?`<span class="pill st-atr"><i></i>Vencido há ${d-p.prazo} d</span>`:`<span class="pill st-and"><i></i>Pendente · ${p.prazo-d} d restantes</span>`};
  if(gTab==="parcerias")tabela("parcerias",[["Parceiro",x=>esc(x.parceiro)],["Instrumento",x=>esc(x.tipo)],["Objeto",x=>esc(x.objeto)],["Vigência",x=>`${fmtD(x.inicio)} a ${fmtD(x.fim)}`],["Situação",x=>dias(x.fim)<0?'<span class="pill st-nao"><i></i>Encerrada</span>':dias(x.fim)<=90?'<span class="pill st-venc"><i></i>Vence em '+dias(x.fim)+' d</span>':'<span class="pill st-conc"><i></i>Vigente</span>'],["Valor",x=>x.valor?brl(x.valor):"—",1]],F(S.ges.parc).sort((a,b)=>a.fim.localeCompare(b.fim)),`${g.parcVig.length} vigentes · ${g.parcVence.length} vencem em 90 dias`);
  if(gTab==="capacitacao")tabela("capacitacao",[["Curso",x=>esc(x.curso)],["Instituição",x=>esc(x.inst)],["Modalidade",x=>x.modal],["Data",x=>fmtD(x.data)],["Horas",x=>x.horas,1],["Participantes",x=>x.part,1],["Horas × pessoa",x=>x.horas*x.part,1]],F(S.ges.cap).sort((a,b)=>b.data.localeCompare(a.data)),`${g.cap.length} cursos em ${ANO} · ${fmt(g.capH)} horas (carga × participantes) · ${g.eqT?fmt(g.capH/g.eqT,1):"—"} h por integrante da equipe`);
  if(gTab==="processos")tabela("processos",[["Nº",x=>esc(x.num)],["Tipo",x=>esc(x.tipo)],["Assunto",x=>esc(x.assunto)],["Entrada",x=>fmtD(x.entrada)],["Prazo",x=>x.prazo+" d",1],["Situação",stPrazo],["Resultado",x=>x.res?`<span class="small"><b style="color:${/negada|indeferid/i.test(x.res)?"#9b2424":"#1e4b34"}">${esc(x.res)}</b></span>`:"—"]],F(S.ges.proc).sort((a,b)=>(a.resposta?1:0)-(b.resposta?1:0)||a.entrada.localeCompare(b.entrada)),`${g.prAno.length} entraram em ${ANO} · ${g.respAno.length} respondidos · ${g.pend.length} pendentes (${g.vencidos} vencidos) · ${g.anuEmit.length} anuências emitidas · ${g.pesqAut.length} pesquisas autorizadas · resposta média ${g.tMed??"—"} dias`);
  if(gTab==="multas")tabela("multas",[["Auto",x=>esc(x.auto)],["Data",x=>fmtD(x.data)],["Infração",x=>esc(x.infr)],["Valor",x=>brl(x.valor),1],["Situação",x=>esc(x.sit)],["Recolhido / convertido",x=>x.pago?brl(x.pago):"—",1]],F(S.ges.multa).sort((a,b)=>b.data.localeCompare(a.data)),`${g.mu.length} autos · ${brl(g.muV)} aplicados · ${brl(g.muP)} recolhidos ou convertidos (${g.muV?Math.round(g.muP/g.muV*100):0}%)`);
  if(gTab==="instrumentos")tabela("instrumentos",[["Tipo",x=>esc(x.tipo)],["Número",x=>esc(x.num)],["Data",x=>fmtD(x.data)],["Ementa",x=>esc(x.ementa)+(x.link?` <a href="${esc(x.link)}" target="_blank" onclick="event.stopPropagation()">↗</a>`:"")],["Situação",x=>`<span class="pill ${x.sit==="Publicado / vigente"?"st-conc":x.sit==="Revogado"?"st-nao":"st-venc"}"><i></i>${x.sit}</span>`]],(uc?S.ges.inst.filter(i=>i.uc===uc):S.ges.inst).sort((a,b)=>b.data.localeCompare(a.data)),`${g.instPub} publicados em ${ANO} · ${g.instElab} em elaboração ou consulta pública${uc?"":" · inclui atos da rede (GGUC)"}`);
  if(gTab==="criacao"){tabela("criacao",[["Proposta",x=>esc(x.nome)],["Categoria",x=>esc(x.cat)+" ("+x.grupo+")"],["Municípios",x=>esc(x.mun)],["Área (ha)",x=>fmt(x.area),1],["Etapa",x=>`<div style="display:flex;gap:3px;align-items:center">${CRIA_ETAPAS.map((e,i)=>`<i title="${e}" style="width:16px;height:8px;border-radius:3px;background:${i<=x.etapa?"#0ca30c":"#e3e6df"}"></i>`).join("")}<span class="small" style="margin-left:6px">${CRIA_ETAPAS[x.etapa]}</span></div>`],["Início",x=>fmtD(x.inicio)]],S.ges.cria,`${g.criaAnd.length} em andamento · ${fmt(g.criaHa)} ha propostos`);X.querySelectorAll("td:first-child b").forEach(b=>b.remove())}
  if(gTab==="fundiaria"){
    const L=(uc?[ucObj(uc)]:UCS).filter(u=>u.g==="PI");
    X.innerHTML=`<div class="card">${head("Regularização fundiária — UCs de proteção integral","Imóveis a regularizar e já regularizados (indenizados ou desapropriados) · processos detalhados no módulo Fundiário")}
     <div class="tbl-wrap"><table><thead><tr><th>UC</th><th class="num">Imóveis a regularizar</th><th class="num">Regularizados</th><th>%</th><th class="num">Área total (ha)</th><th class="num">Área regularizada (ha)</th><th class="num">Processos no sistema</th></tr></thead><tbody>
     ${L.map(u=>{const f=S.ges.uc[u.s].fund,p=Math.round(f.reg/Math.max(1,f.tot)*100);return `<tr style="cursor:pointer" onclick="${CAR.resumo[u.s]?`S.uc='${u.s}';save();location.hash='fundiario'`:`gesUcForm('${u.s}')`}"><td><b>${u.s}</b><div class="small muted">${esc(u.n)}</div></td><td class="num">${f.tot}</td><td class="num">${f.reg}</td>
      <td><div style="display:flex;gap:8px;align-items:center"><div class="prog" style="width:90px"><i style="width:${p}%;background:#eb6834"></i></div>${p}%</div></td><td class="num">${fmt(f.haTot)}</td><td class="num">${fmt(f.haReg)}</td><td class="num">${Object.keys(S.fund).filter(k=>k.endsWith("|"+u.s)).length||"—"}</td></tr>`}).join("")}</tbody></table></div>
     <div class="info" style="margin-top:12px">Nas UCs com CAR carregado (PE Forno Grande e PE Itaúnas), o total de imóveis vem do CAR e a linha abre a tabela de regularização com o nº do processo e os andamentos.</div></div>`;
  }
}
function gesCsv(k){const s=SCH[k],rows=(k==="instrumentos"||k==="criacao"?S.ges[s.arr]:S.ges[s.arr].filter(x=>ucAtual()?x.uc===ucAtual():true));
  const cols=["uc",...s.f.map(f=>f[0])],csv=[["UC",...s.f.map(f=>f[1])].join(";"),...rows.map(r=>cols.map(c=>`"${String(c==="etapa"?CRIA_ETAPAS[r[c]]:r[c]??"").replace(/"/g,'""')}"`).join(";"))].join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv"}));a.download=`SisGAP-ES_${k}_${ucAtual()||"rede"}.csv`;a.click()}
function gesForm(k,id){
  const s=SCH[k],uc=ucAtual()||null,arr=S.ges[s.arr],x=id?arr.find(r=>r.id===id):null;
  const ed=x?(x.uc?podeGes(x.uc):isAdmin()):(uc?podeGes(uc):isAdmin());
  const R=x?Object.assign({},x):{id:k[0]+Date.now(),uc:(k==="criacao")?undefined:uc};
  const inp=([c,l,t,o])=>{const v=R[c]??"";const dis=ed?"":"disabled";
    if(t==="sel")return `<select id="g_${c}" ${dis}>${o.map(z=>`<option ${v===z?"selected":""}>${z}</option>`).join("")}</select>`;
    if(t==="selIdx")return `<select id="g_${c}" ${dis}>${o.map((z,i)=>`<option value="${i}" ${Number(v)===i?"selected":""}>${z}</option>`).join("")}</select>`;
    return `<input id="g_${c}" type="${t==="num"?"number":t==="date"?"date":"text"}" value="${esc(v)}" ${o?`list="dl_${c}"`:""} ${dis}>${o?`<datalist id="dl_${c}">${o.map(z=>`<option value="${esc(z)}">`).join("")}</datalist>`:""}`};
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
   <div style="display:flex;justify-content:space-between;gap:10px"><div><div class="small muted">${R.uc||"Rede (GGUC)"} · Gestão institucional</div><h2>${x?s.t:"Novo registro: "+s.t.toLowerCase()}</h2></div><button class="btn sm" id="dX">✕</button></div>
   ${s.f.map(f=>`<div class="fld"><label>${f[1]}</label>${inp(f)}</div>`).join("")}
   ${k==="instrumentos"&&!uc&&ed?`<div class="fld"><label>Abrangência</label><select id="g__uc"><option value="">Rede (todas as UCs)</option>${UCS.map(u=>`<option ${R.uc===u.s?"selected":""}>${u.s}</option>`).join("")}</select></div>`:""}
   <div class="fld"><label>Evidência (documento, foto ou certificado)</label><input type="file" multiple ${ed?"":"disabled"}><div class="small muted" style="margin-top:4px">Na versão real, os anexos ficam guardados com o registro.</div></div>
   <div style="display:flex;gap:8px;margin-top:16px">${ed?`<button class="btn primary" id="gS">Salvar</button>${x?'<button class="btn" id="gD">Excluir</button>':""}`:'<span class="small muted">Somente leitura para o seu cargo.</span>'}</div></div></div>`;
  const close=()=>$("#drawerRoot").innerHTML="";$("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  if($("#gS"))$("#gS").onclick=()=>{
    for(const [c,l,t] of s.f){let v=$("#g_"+c).value;if(t==="num"||t==="selIdx")v=v===""?0:Number(v);R[c]=v}
    if($("#g__uc"))R.uc=$("#g__uc").value||null;
    const req=s.f.filter(f=>f[2]!=="num"&&!["resposta","link","obs","valor","res"].includes(f[0])).find(f=>R[f[0]]===""||R[f[0]]===undefined);
    if(req){toast("Preencha: "+req[1]);return}
    if(x)Object.assign(x,R);else arr.push(R);saveGes();close();toast("Registro salvo");vGestao()};
  if($("#gD"))$("#gD").onclick=()=>{S.ges[s.arr]=arr.filter(r=>r.id!==id);saveGes();close();toast("Registro excluído");vGestao()};
}
function gesUcForm(s){
  const i=S.ges.uc[s],ed=podeGes(s),dis=ed?"":"disabled",u=ucObj(s);
  const n=(id,l,v)=>`<div class="fld"><label>${l}</label><input id="${id}" type="number" min="0" value="${v??""}" ${dis}></div>`;
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
   <div style="display:flex;justify-content:space-between"><div><div class="small muted">${s} · Gestão institucional</div><h2>${esc(u.n)}</h2></div><button class="btn sm" id="dX">✕</button></div>
   <h3 style="margin-top:12px">Plano de manejo</h3><div class="grid g2" style="gap:12px"><div class="fld"><label>Situação</label><select id="u_pm" ${dis}>${PM_SIT.map(z=>`<option ${i.pm===z?"selected":""}>${z}</option>`).join("")}</select></div>${n("u_pmAno","Ano de aprovação",i.pmAno)}<div class="fld"><label>Vencimento / revisão prevista</label><input type="date" id="u_pmVence" value="${i.pmVence||""}" ${dis}></div></div>
   <h3>Conselho gestor</h3><div class="grid g2" style="gap:12px"><div class="fld"><label>Situação</label><select id="u_cons" ${dis}>${CONS_SIT.map(z=>`<option ${i.cons===z?"selected":""}>${z}</option>`).join("")}</select></div><div class="fld"><label>Fim do mandato</label><input type="date" id="u_consFim" value="${i.consFim||""}" ${dis}></div>${n("u_quorum","Quórum médio (%)",i.quorum)}</div>
   <h3>Equipe</h3><div class="grid g2" style="gap:12px">${n("u_ef","Servidores efetivos",i.eq.ef)}${n("u_co","Comissionados",i.eq.co)}${n("u_te","Terceirizados / guarda-parques",i.eq.te)}${n("u_br","Brigadistas",i.eq.br)}${n("u_vo","Voluntários",i.eq.vo)}</div>
   ${i.fund?`<h3>Regularização fundiária</h3><div class="grid g2" style="gap:12px">${n("u_ft","Imóveis a regularizar",i.fund.tot)}${n("u_fr","Imóveis regularizados",i.fund.reg)}${n("u_ht","Área a regularizar (ha)",i.fund.haTot)}${n("u_hr","Área regularizada (ha)",i.fund.haReg)}</div>`:""}
   <div style="display:flex;gap:8px;margin-top:16px">${ed?'<button class="btn primary" id="uS">Salvar</button>':'<span class="small muted">Somente leitura para o seu cargo.</span>'}</div></div></div>`;
  const close=()=>$("#drawerRoot").innerHTML="";$("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  const v=id=>{const x=$("#"+id).value;return x===""?null:Number(x)};
  if($("#uS"))$("#uS").onclick=()=>{i.pm=$("#u_pm").value;i.pmAno=i.pm==="Sem plano"?"":(v("u_pmAno")||"");i.pmVence=$("#u_pmVence").value;i.cons=$("#u_cons").value;i.consFim=$("#u_consFim").value;i.quorum=v("u_quorum");
    i.eq={ef:v("u_ef")||0,co:v("u_co")||0,te:v("u_te")||0,br:v("u_br")||0,vo:v("u_vo")||0};
    if(i.fund)i.fund={tot:v("u_ft")||0,reg:v("u_fr")||0,haTot:v("u_ht")||0,haReg:v("u_hr")||0};saveGes();close();toast("Dados da UC salvos");vGestao()};
}
{const _route=route; route=function(){const [r,arg]=location.hash.slice(1).split("/");if(r==="gestao"&&user()){renderNav();renderUcSel();vGestao(arg);window.scrollTo(0,0);return}_route()};
 window.removeEventListener("hashchange",_route);window.addEventListener("hashchange",route);}

// ---------- página no PDF (UC e rede) ----------
function gesPagina(uc){
  const g=gesInd(uc), u=uc?ucObj(uc):null, ui=uc?S.ges.uc[uc]:null;
  const kpi=(cor,val,lb,sub="")=>`<div class="rp-k" style="background:${cor}"><b>${val}</b><span>${lb}</span>${sub?`<em>${sub}</em>`:""}</div>`;
  const card=(cor,t,body)=>`<div class="rp-c"><div class="rp-ch" style="border-color:${cor}"><span style="background:${cor}"></span>${t}</div>${body}</div>`;
  const tempoTipo=PROC_TIPOS.map(([tp,pz])=>{const r=g.resp.filter(p=>p.tipo===tp);return{l:["Anuência (licenc.)","Pesquisa","Uso / evento / imagem","Ouvidoria","Ofício"][PROC_TIPOS.findIndex(x=>x[0]===tp)],v:r.length?Math.round(r.reduce((t,p)=>t+(parseD(p.resposta)-parseD(p.entrada))/864e5,0)/r.length):0,c:"#eda100"}});
  return `<section class="rp-page"><div class="rp-mini"><b>${uc||"Rede"}</b> · Gestão institucional</div>
   <div class="rp-kpis">
    ${uc?kpi(PM_COR[ui.pm],ui.pm,"plano de manejo",ui.pmVence?(ui.pm==="Aprovado"?"revisão ":"conclusão ")+fmtD(ui.pmVence):""):kpi("#0ca30c",`${g.pmAprov}/${g.n}`,"UCs com plano de manejo",`${g.pmAnd} em elaboração/revisão · ${g.pmVelho} com revisão vencida`)}
    ${uc?kpi(CONS_COR[ui.cons],ui.cons,"conselho gestor",ui.quorum!==null?"quórum médio "+ui.quorum+"%":""):kpi("#2a78d6",`${g.consAt}/${g.n}`,"conselhos ativos",`quórum médio ${g.quorum??"—"}%`)}
    ${kpi("#3f8f6a",g.parcVig.length,"parcerias vigentes",`${g.parcVence.length} vencem em 90 dias`)}
    ${kpi("#6250d6",fmtN(g.capH)+" h","de capacitação",`${g.cap.length} cursos · ${g.eqT?fmtN(g.capH/g.eqT,1):"—"} h por integrante`)}
    ${kpi("#eda100",`${g.prAno.length}/${g.respAno.length}`,"processos: entrada / respondidos",`${g.pend.length} pendentes · ${g.vencidos} vencidos`)}
    ${kpi("#2a78d6",g.anuEmit.length,"anuências emitidas",`${g.anu.length} pedidos · ${g.anuNeg.length} negadas`)}
    ${kpi("#1baf7a",g.pesqAut.length,"pesquisas autorizadas",`${g.pesq.length} pedidos · ${g.pesqPend.length} em análise`)}
    ${kpi("#e34948",brlC(g.muV),"em multas aplicadas",`${g.mu.length} autos · ${brl(g.muP)} recolhido`)}
    ${g.fTot?kpi("#eb6834",Math.round(g.fReg/g.fTot*100)+"%","imóveis regularizados",`${fmtN(g.haReg)} de ${fmtN(g.haTot)} ha`):kpi("#7c877f",g.eqT,"pessoas na equipe",`${g.brig} brigadistas · ${g.vol} voluntários`)}
    ${uc?kpi("#8a4b1f",g.instPub,"instrumentos legais publicados",`${g.instElab} em elaboração`):kpi("#008300",g.criaAnd.length,"UCs em criação/ampliação",`${fmtN(g.criaHa)} ha propostos · ${g.instPub} atos publicados`)}
   </div>
   <div class="rp-g3">
    ${card("#eda100","Tempo médio de resposta por tipo (dias)",gH(tempoTipo,{lw:150}))}
    ${card("#e34948","Autos de infração por situação",gH(MULTA_SIT.map((s,k)=>({l:{"Em defesa / recurso":"Em defesa","Julgado — mantido":"Julgado","Pago":"Pago","Convertido em serviços ambientais":"Convertido","Cancelado / anulado":"Cancelado","Inscrito em dívida ativa":"Dívida ativa"}[s],v:g.mu.filter(m=>m.sit===s).length,c:CAT[k]})),{lw:150}))}
    ${uc?card("#1baf7a","Parcerias e capacitações",`<table class="rp-t"><thead><tr><th>Parceiro</th><th>Instrumento</th><th>Até</th></tr></thead><tbody>${g.parcVig.slice(0,6).map(p=>`<tr><td>${esc(p.parceiro)}</td><td>${esc(p.tipo)}</td><td>${fmtD(p.fim)}</td></tr>`).join("")||'<tr><td colspan="3">—</td></tr>'}</tbody></table>
      <table class="rp-t" style="margin-top:6px"><thead><tr><th>Curso</th><th>h</th><th>Pessoas</th></tr></thead><tbody>${g.cap.slice(0,6).map(c=>`<tr><td>${esc(c.curso)}</td><td>${c.horas}</td><td>${c.part}</td></tr>`).join("")||'<tr><td colspan="3">—</td></tr>'}</tbody></table>`)
     :card("#0ca30c","Plano de manejo e conselho nas 19 UCs",gH(PM_SIT.map(s=>({l:"PM: "+s,v:UCS.filter(u=>S.ges.uc[u.s].pm===s).length,c:PM_COR[s]})).concat(CONS_SIT.map(s=>({l:"Conselho: "+s,v:UCS.filter(u=>S.ges.uc[u.s].cons===s).length,c:CONS_COR[s]}))),{lw:150}))}
   </div>
   ${uc?"":`<div class="rp-g3">${card("#1baf7a","Pesquisas autorizadas por UC",gH(UCS.map(u=>({l:u.s,v:gesInd(u.s).pesqAut.length,c:"#1baf7a"})).sort((x,y)=>y.v-x.v).slice(0,10),{lw:70}))}${card("#2a78d6","Anuências emitidas por UC",gH(UCS.map(u=>({l:u.s,v:gesInd(u.s).anuEmit.length,c:"#2a78d6"})).sort((x,y)=>y.v-x.v).slice(0,10),{lw:70}))}${card("#eda100","Processos que entraram × respondidos, por UC",gH(UCS.map(u=>{const k=gesInd(u.s);return{l:u.s+" ("+k.respAno.length+" resp.)",v:k.prAno.length,c:"#eda100"}}).sort((x,y)=>y.v-x.v).slice(0,10),{lw:100}))}</div>`}
   ${uc?"":`</section><section class="rp-page"><div class="rp-mini"><b>Rede</b> · Gestão institucional por unidade</div>`}
   <div class="rp-g2">
    ${uc?card("#8a4b1f","Processos pendentes e instrumentos legais",`<table class="rp-t"><thead><tr><th>Processo</th><th>Tipo</th><th>Entrada</th><th>Prazo</th></tr></thead><tbody>${g.pend.slice(0,7).map(p=>`<tr><td>${esc(p.num)}</td><td>${esc(p.tipo)}</td><td>${fmtD(p.entrada)}</td><td>${p.prazo} d</td></tr>`).join("")||'<tr><td colspan="4">Nenhum pendente</td></tr>'}</tbody></table>
      <table class="rp-t" style="margin-top:6px"><thead><tr><th>Instrumento</th><th>Ementa</th><th>Situação</th></tr></thead><tbody>${g.inst.slice(0,5).map(i=>`<tr><td>${esc(i.tipo)} ${esc(i.num)}</td><td>${esc(i.ementa)}</td><td>${esc(i.sit)}</td></tr>`).join("")||'<tr><td colspan="3">—</td></tr>'}</tbody></table>`)
     :card("#6250d6","Por UC: capacitação, prazos e multas",`<table class="rp-t"><thead><tr><th>UC</th><th>PM</th><th>Revisão PM</th><th>Conselho</th><th>Parc.</th><th>Horas cap.</th><th>Proc. entr./resp.</th><th>Anuências</th><th>Pesquisas</th><th>Multas (R$)</th><th>Fund. %</th></tr></thead><tbody>${UCS.map(x=>{const k=gesInd(x.s),i=S.ges.uc[x.s];return `<tr><td><b>${x.s}</b></td><td>${i.pm}</td><td>${i.pmVence?fmtD(i.pmVence):"—"}</td><td>${i.cons}</td><td>${k.parcVig.length}</td><td>${fmtN(k.capH)}</td><td>${k.prAno.length}/${k.respAno.length}</td><td>${k.anuEmit.length}</td><td>${k.pesqAut.length}</td><td>${fmtN(k.muV)}</td><td>${k.fTot?Math.round(k.fReg/k.fTot*100)+"%":"—"}</td></tr>`}).join("")}</tbody></table>`)}
    ${uc?card("#7c877f","Equipe da UC",gH([["Efetivos",ui.eq.ef],["Comissionados",ui.eq.co],["Terceirizados",ui.eq.te],["Brigadistas",ui.eq.br],["Voluntários",ui.eq.vo]].map(([l,v],k)=>({l,v,c:CAT[k]})),{lw:110}))
     :card("#008300","Criação e ampliação de UCs · instrumentos legais da rede",`<table class="rp-t"><thead><tr><th>Proposta</th><th>Categoria</th><th>Área (ha)</th><th>Etapa</th></tr></thead><tbody>${g.cria.map(c=>`<tr><td>${esc(c.nome)}</td><td>${esc(c.cat)}</td><td>${fmtN(c.area)}</td><td>${CRIA_ETAPAS[c.etapa]}</td></tr>`).join("")}</tbody></table>
       <table class="rp-t" style="margin-top:6px"><thead><tr><th>Instrumento</th><th>Ementa</th><th>Situação</th></tr></thead><tbody>${S.ges.inst.filter(i=>!i.uc).map(i=>`<tr><td>${esc(i.tipo)} ${esc(i.num)}</td><td>${esc(i.ementa)}</td><td>${esc(i.sit)}</td></tr>`).join("")}</tbody></table>`)}
   </div><div class="rp-note">Indicadores de gestão institucional · registros simulados (marcados “exemplo”) nesta versão de teste.</div></section>`;
}
{const _r=relatorioUC; relatorioUC=function(uc){_r(uc);const el=document.getElementById("printArea");const p=el&&el.querySelector("section.rp-page");if(p)p.insertAdjacentHTML("afterend",gesPagina(uc))};}
{const _r=relatorioRede; relatorioRede=function(){_r();const el=document.getElementById("printArea");const p=el&&el.querySelector("section.rp-page");if(p)p.insertAdjacentHTML("afterend",gesPagina(null))};}
