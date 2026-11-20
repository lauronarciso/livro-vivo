// SisGAP-ES — lançamento por REGISTROS com evidência (todos os indicadores comuns)
// Cada indicador tem um formulário próprio; o valor do mês é calculado a partir dos registros.

const OCOR = (extra=[]) => ({t:"Ocorrência",pessoal:true,fields:[["desc","O que foi constatado","textarea"],...extra,
  ["prov","Providência","select",["Orientação","Notificação","Auto de infração","Boletim de ocorrência","Encaminhado a outro órgão","Nenhuma"]],["doc","Nº do auto / BO / notificação","text"]],docs:"Fotos do local, auto ou BO"});
const REG = {
  vis:{t:"Registro de visitação",qty:"n",fields:[["n","Nº de visitantes","number"],["metodo","Método de contagem","select",["Livro de visitas","Contador/catraca","Contagem manual","Estimativa"]],["periodo","Período (ex.: semana 1, feriado)","text"]],docs:"Foto do livro de visitas ou planilha da contagem"},
  reu:{t:"Reunião do conselho",fields:[["tipo","Tipo","select",["Ordinária","Extraordinária","Câmara técnica"]],["part","Nº de participantes","number"],["quorum","Houve quórum?","select",["Sim","Não"]],["pauta","Pauta","textarea"],["delib","Deliberações / encaminhamentos","textarea"]],docs:"Ata, lista de presença e fotos"},
  eve:{t:"Evento",fields:[["titulo","Título do evento","text"],["tipo","Tipo","select",["Palestra","Oficina","Trilha guiada","Mutirão","Ação em escola","Exposição/feira","Outro"]],["part","Nº de participantes","number"],["fora","Realizado fora da UC?","select",["Não","Sim"]],["parc","Parceiros","text"]],docs:"Lista de presença, fotos, cartaz"},
  mid:{t:"Publicação / mídia",fields:[["canal","Canal","select",["Rede social da UC","Site do IEMA","Jornal/portal","TV","Rádio","Outro"]],["tipo","Tipo","select",["Publicação própria","Matéria ou menção na imprensa"]],["link","Link","text"],["alcance","Alcance (se souber)","number"]],docs:"Print ou PDF da publicação"},
  aci:{t:"Acidente no uso público",pessoal:true,fields:[["tipo","Tipo","select",["Queda","Picada/mordida de animal","Afogamento","Mal súbito","Outro"]],["grav","Gravidade","select",["Leve","Moderada","Grave","Óbito"]],["vit","Nº de vítimas","number"],["atend","Atendimento","select",["Equipe da UC","SAMU/Bombeiros","Sem atendimento"]],["desc","Descrição","textarea"]],docs:"Fotos do local, relatório"},
  atr:{t:"Fauna atropelada",qty:"n",bio:"Encontrado morto (atropelamento)",fields:[["esp","Espécie","text"],["grupo","Grupo","select",["Aves","Mamíferos","Répteis","Anfíbios","Peixes","Invertebrados","Flora"]],["n","Nº de indivíduos","number"],["via","Via / km","text"]],docs:"Fotos do animal e do local"},
  exo:{t:"Manejo de espécie exótica",bio:"Manejo de espécie exótica",fields:[["esp","Espécie-alvo","text"],["grupo","Grupo","select",["Aves","Mamíferos","Répteis","Anfíbios","Peixes","Invertebrados","Flora"]],["acao","Ação","select",["Corte/anelamento","Arranquio","Captura/remoção de animal","Monitoramento","Outra"]],["qtd","Quantidade (indivíduos ou m²)","text"]],docs:"Fotos antes/depois"},
  mon:{t:"Ação de monitoramento",bio:"Monitoramento",fields:[["tema","Tema / grupo","text"],["metodo","Método","text"],["equipe","Equipe / parceiros","text"],["esps","Espécies registradas (uma por linha, opcional)","textarea"]],docs:"Fotos, planilha de campo"},
  mfa:{t:"Manejo de fauna",bio:"Manejo de fauna",fields:[["esp","Espécie","text"],["grupo","Grupo","select",["Aves","Mamíferos","Répteis","Anfíbios","Peixes","Invertebrados","Flora"]],["tipo","Tipo","select",["Resgate","Soltura","Afugentamento","Translocação","Outro"]],["n","Nº de indivíduos","number"],["dest","Destino","text"]],docs:"Fotos, termo de soltura/entrega"},
  cac:OCOR(), sup:OCOR([["area","Área suprimida (ha, se souber)","number"]]), air:OCOR(), dom:OCOR([["anim","Animal","select",["Cão","Gato","Gado","Equino","Outro"]]]),
  fog:OCOR([["area","Área atingida (ha)","number"]]),
  aut:{t:"Autuação",pessoal:true,fields:[["num","Nº do auto de infração","text"],["infr","Tipo de infração","select",["Fauna","Flora/supressão","Fogo","Ocupação/obra irregular","Poluição","Outra"]],["valor","Valor da multa (R$)","number"]],docs:"Cópia do auto (sem dados pessoais visíveis)"},
  fis:{t:"Ação de fiscalização",fields:[["tipo","Tipo","select",["Ronda","Operação conjunta","Vistoria de denúncia","Barreira/blitz","Outra"]],["orgaos","Órgãos / equipe","text"],["horas","Duração (h)","number"],["km","Distância percorrida (km)","number"]],docs:"Fotos, relatório, trilha do GPS"},
  inc:{t:"Incêndio combatido",fields:[["area","Área atingida (ha)","number"],["dur","Duração do combate (h)","number"],["orgaos","Brigada / órgãos","text"],["causa","Causa provável","select",["Desconhecida","Queima de pasto/roçado","Criminosa","Natural (raio)","Outra"]]],docs:"Fotos, ROIF"},
  roi:{t:"ROIF",fields:[["num","Nº do ROIF","text"],["ref","Incêndio de referência","text"]],docs:"Anexe o ROIF"},
  fau:{t:"Atualização do levantamento",stock:"n",fields:[["n","Nº de espécies","number"],["fonte","Fonte do levantamento","text"]],docs:"Lista de espécies, relatório"},
};
REG.faa=REG.fau; REG.flo=REG.fau; REG.fla=REG.fau;
const AUTO_IND={pev:"Soma dos participantes dos eventos registrados"};
const resumoReg=(ind,r)=>{const c=r.c||{};const S2=REG[ind];
  const partes=S2.fields.filter(f=>f[2]!=="textarea").map(f=>c[f[0]]).filter(v=>v!==undefined&&v!=="");
  const txt=(c.titulo||c.desc||c.pauta||c.tema||c.esp||"").toString();
  return [partes.slice(0,3).join(" · "),txt&&!partes.includes(txt)?txt.slice(0,70):""].filter(Boolean).join(" — ")};

// ---------- armazenamento ----------
S.reg = LS.get("reg",null);
S.src = LS.get("src",null) || {};   // origem do valor do mês: reg | flag | sim
const srcOf=(uc,ind,m)=>(S.src[uc]&&S.src[uc][ind]&&S.src[uc][ind][m])||(S.lanc[uc][ind][m]!==""?"sim":"");
function setSrc(uc,ind,m,v){((S.src[uc]=S.src[uc]||{})[ind]=S.src[uc][ind]||Array(12).fill(""))[m]=v}
function saveReg(){try{localStorage.setItem("sisgap:reg",JSON.stringify(S.reg));LS.set("src",S.src);save();return true}catch(e){toast("Armazenamento do navegador cheio — remova anexos antigos (no sistema real os arquivos vão para o Google Drive)");return false}}
{const _r=resetDemo; resetDemo=function(){try{["reg","src"].forEach(k=>localStorage.removeItem("sisgap:"+k))}catch(e){};_r()};}
const mesDe=d=>+d.slice(5,7)-1, anoDe=d=>+d.slice(0,4);
const regsDe=(uc,ind,m)=>S.reg.filter(r=>r.uc===uc&&r.ind===ind&&anoDe(r.data)===ANO&&mesDe(r.data)===m).sort((a,b)=>a.data.localeCompare(b.data));

function recompute(uc,ind,m){
  const R=regsDe(uc,ind,m), sc=REG[ind];
  if(R.length){
    let v; if(sc.stock)v=num(R[R.length-1].c[sc.stock])??"" ; else if(sc.qty)v=R.reduce((t,r)=>t+(num(r.c[sc.qty])||0),0); else v=R.length;
    S.lanc[uc][ind][m]=v; setSrc(uc,ind,m,"reg");
  }else if(srcOf(uc,ind,m)==="reg"){S.lanc[uc][ind][m]="";setSrc(uc,ind,m,"")}
  if(ind==="eve"){ // público dos eventos é automático
    if(R.length){S.lanc[uc].pev[m]=R.reduce((t,r)=>t+(num(r.c.part)||0),0);setSrc(uc,"pev",m,"reg")}
    else if(srcOf(uc,"pev",m)==="reg"){S.lanc[uc].pev[m]="";setSrc(uc,"pev",m,"")}
    else if(srcOf(uc,"eve",m)==="flag"){S.lanc[uc].pev[m]=S.lanc[uc].eve[m]==="N/A"?"N/A":0;setSrc(uc,"pev",m,"flag")}
  }
}

// ---------- registros de demonstração (UCs de teste, último mês fechado) ----------
function seedReg(){
  const out=[], m=Math.max(0,FECHADOS-1), mm=String(m+1).padStart(2,"0");
  GEO_UCS.forEach(uc=>{
    const r=rng("reg"+uc), f=limiteDe(uc), b=bbox(f.geometry), g=USERS.find(u=>u.uc===uc&&u.papel==="gestor").id;
    const pt=()=>{let lat,lon,t=0;do{lon=b[0]+r()*(b[2]-b[0]);lat=b[1]+r()*(b[3]-b[1]);t++}while(!pip(lon,lat,f.geometry)&&t<200);return [+lat.toFixed(5),+lon.toFixed(5)]};
    const add=(ind,dia,c,geo)=>{const p=geo?pt():[null,null];out.push({id:"r"+uc+ind+dia,uc,ind,data:`${ANO}-${mm}-${String(dia).padStart(2,"0")}`,c:Object.assign({simulado:true},c),anexos:[],lat:p[0],lon:p[1],autor:g,criado:new Date().toISOString()})};
    add("reu",14,{tipo:"Ordinária",part:12+Math.floor(r()*8),quorum:"Sim",pauta:"Informes da gestão; plano de ação do plano de manejo; calendário de fiscalização.",delib:"Aprovado o calendário de reuniões de 2027."});
    add("eve",9,{titulo:"Trilha guiada com escola municipal",tipo:"Trilha guiada",part:28+Math.floor(r()*10),fora:"Não",parc:"Secretaria Municipal de Educação"},true);
    add("eve",23,{titulo:"Palestra sobre prevenção de incêndios",tipo:"Palestra",part:15+Math.floor(r()*20),fora:"Sim",parc:"Associação de produtores"});
    [5,12,19,26].forEach((d,i)=>add("fis",d,{tipo:i===2?"Operação conjunta":"Ronda",orgaos:i===2?"IEMA, BPMA":"Equipe da UC",horas:4+i,km:12+i*5},true));
    add("cac",12,{desc:"Armadilha para aves (alçapão) encontrada na trilha.",prov:"Nenhuma"},true);
    add("dom",19,{desc:"Cães soltos próximos à mata.",anim:"Cão",prov:"Orientação"},true);
    add("mid",3,{canal:"Rede social da UC",tipo:"Publicação própria",link:"",alcance:850});
  });
  return out;
}
if(!S.reg){S.reg=seedReg();const ms=new Set(S.reg.map(r=>r.uc+"|"+r.ind+"|"+mesDe(r.data)));ms.forEach(k=>{const [u,i,m]=k.split("|");recompute(u,i,+m)});saveReg()}

// ---------- tela de lançamento ----------
let regAberto={};
vLancar=function(){
  const s=ucAtual();
  if(!s){title("Lançamento mensal","Selecione uma UC no seletor acima");$("#view").innerHTML=`<div class="card"><h3>Escolha a unidade</h3><p class="sub">Como administrador(a), você pode lançar ou revisar os dados de qualquer UC.</p><div class="grid g4">${UCS.map(u=>`<div class="uc-tile" onclick="S.uc='${u.s}';save();route()"><b>${u.s}</b>${u.piloto?'<span class="tag-p">PILOTO</span>':""}<div class="meta">${esc(u.n)}</div><div class="prog"><i style="width:${completude(u.s,FECHADOS-1)*100}%"></i></div></div>`).join("")}</div></div>`;return}
  if(mesLanc===null)mesLanc=Math.max(0,FECHADOS-1);
  const u=ucObj(s),d=S.lanc[s],m=mesLanc,enviado=S.enviados[s].includes(m);
  title(`Lançamento mensal — ${u.s}`,`${esc(u.n)} · ${MESL[m]} de ${ANO}`);
  const manuais=IND_LIST.filter(([id])=>!AUTO_IND[id]&&!_estoqueAuto(s,id));
  const st=id=>{const sr=srcOf(s,id,m),v=d[id][m];return sr==="reg"?"reg":sr==="flag"?(v==="N/A"?"na":"zero"):v!==""?"sim":"vazio"};
  const nEv=manuais.filter(([id])=>["reg","na","zero"].includes(st(id))).length, nSim=manuais.filter(([id])=>st(id)==="sim").length, nVz=manuais.filter(([id])=>st(id)==="vazio").length;
  const badge={reg:id=>`<span class="pill st-conc"><i></i>${regsDe(s,id,m).length} registro${regsDe(s,id,m).length>1?"s":""}</span>`,
    zero:()=>`<span class="pill"><i style="background:#86b6ef"></i>Verificado: nenhum</span>`,na:()=>`<span class="pill">Não se aplica</span>`,
    sim:()=>`<span class="pill st-venc" title="Valor simulado/antigo, sem registro que comprove"><i></i>Sem evidência</span>`,vazio:()=>`<span class="pill st-atr"><i></i>Não informado</span>`};
  $("#view").innerHTML=`
  <div class="filters"><div class="seg">${MES.map((mn,i)=>`<button class="${i===m?"on":""}" ${i>FECHADOS?"disabled style='opacity:.4'":""} data-m="${i}">${mn}${S.enviados[s].includes(i)?" ✓":""}</button>`).join("")}</div>
    <span style="flex:1"></span>${enviado?'<span class="pill st-conc"><i></i>Enviado à GGUC</span>':'<span class="pill st-venc"><i></i>Não enviado</span>'}</div>
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><div class="lbl">Indicadores com evidência</div><div class="val">${nEv}<span style="font-size:18px;color:var(--muted)">/${manuais.length}</span></div><div class="foot">registros, “verificado: nenhum” ou “não se aplica”</div></div>
    <div class="card kpi"><div class="lbl">Sem evidência</div><div class="val" style="color:${nSim?"#7a5a00":"inherit"}">${nSim}</div><div class="foot">valor sem registro (dados antigos/simulados)</div></div>
    <div class="card kpi"><div class="lbl">Não informados</div><div class="val" style="color:${nVz?"#9b2424":"inherit"}">${nVz}</div><div class="foot">adicione registros ou marque “nenhum”</div></div>
    <div class="card kpi"><div class="lbl">Registros no mês</div><div class="val">${S.reg.filter(r=>r.uc===s&&anoDe(r.data)===ANO&&mesDe(r.data)===m).length}</div><div class="foot"><b>${S.reg.filter(r=>r.uc===s&&anoDe(r.data)===ANO&&mesDe(r.data)===m).reduce((t,r)=>t+r.anexos.length,0)}</b> anexos (fotos e documentos)</div></div>
  </div>
  <div class="info" style="margin-bottom:16px">Para cada indicador, use <b>+ Adicionar</b> e preencha o registro com anexos: o número do mês é calculado sozinho. Se não houve nada no mês, marque <b>Nenhum</b> (verificado). Se o indicador não se aplica à UC, marque <b>N/A</b>.</div>
  <div class="grid g21">
    <div>${COMUNS.map(([p,inds])=>`<div class="card" style="margin-bottom:16px;padding:0"><div style="padding:14px 18px 6px;font-weight:700;color:var(--brand)">${p}</div>
      ${inds.map(([id,nm,un,rg])=>{const auto=AUTO_IND[id]||(_estoqueAuto(s,id)?"Vem da lista de Biodiversidade da UC":""),k=_estoqueAuto(s,id)?"reg":st(id),R=regsDe(s,id,m),open=regAberto[s+id+m];const v=d[id][m];
      return `<div style="border-top:1px solid var(--line);padding:12px 18px">
        <div style="display:grid;grid-template-columns:1fr 90px auto;gap:12px;align-items:center">
          <div><div style="font-weight:600">${nm}</div><div class="small muted">${un}${rg==="Último"?" · estoque (último valor)":""}${auto?" · automático: "+auto.toLowerCase():""}</div>
            <div style="margin-top:5px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">${auto?(_estoqueAuto(s,id)?`<span class="pill st-conc"><i></i>Da Biodiversidade</span> <a class="small" href="#biodiversidade">abrir lista ›</a>`:k==="reg"?'<span class="pill st-conc"><i></i>Calculado dos eventos</span>':badge[k](id)):badge[k](id)}
            ${R.length?`<button class="btn sm" style="padding:2px 8px" data-tg="${id}">${open?"▾ ocultar":"▸ ver"} registros</button>`:""}</div></div>
          <div style="text-align:right;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;color:${k==="sim"?"#a07a12":k==="vazio"?"#c4c9c4":"inherit"}">${v===""?"—":v==="N/A"?"N/A":fmt(v,1)}</div>
          <div style="display:flex;gap:6px">${auto?"":`<button class="btn primary sm" data-add="${id}">+ Adicionar</button><button class="btn sm" data-zero="${id}" title="Verificado: nenhuma ocorrência/atividade no mês" ${R.length?"disabled":""}>Nenhum</button><button class="btn sm" data-na="${id}" ${R.length?"disabled":""}>N/A</button>`}</div>
        </div>
        ${R.length&&open?`<div style="margin-top:10px;border:1px solid var(--line);border-radius:10px;overflow:hidden">${R.map(r=>`<div style="display:grid;grid-template-columns:78px 1fr auto;gap:10px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--line)">
          <span class="small" style="font-weight:600">${fmtD(r.data)}</span>
          <div class="small" style="min-width:0"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(resumoReg(id,r))||"<span class='muted'>sem descrição</span>"}</div>
            <div class="muted">${r.anexos.length?`📎 ${r.anexos.length} anexo(s)`:"<span style='color:#a07a12'>sem anexo</span>"}${r.lat!==null?" · 📍 com local":""} · ${esc(userById(r.autor).nome)}${r.c.simulado?" · exemplo":""}</div></div>
          <div style="display:flex;gap:4px">${r.anexos.filter(a=>a.thumb).slice(0,3).map(a=>`<img src="${a.thumb}" style="width:34px;height:34px;object-fit:cover;border-radius:5px">`).join("")}<button class="btn sm" data-ed="${r.id}">Editar</button></div></div>`).join("")}</div>`:""}
      </div>`}).join("")}</div>`).join("")}
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-bottom:24px"><button class="btn primary" id="bEnviar">Enviar lançamento de ${MESL[m]}</button></div>
    </div>
    <div>
      <div class="card" style="position:sticky;top:76px"><h3>Calculados automaticamente</h3><p class="sub">Não precisam ser digitados</p><div id="autos"></div>
      ${ESPECIFICOS[s]?`<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)"><h3>Indicadores específicos do PM</h3><p class="sub">Valor acumulado no ano</p>
        ${ESPECIFICOS[s].map(([id,nm,un,meta,_,tipo])=>`<div class="f-row" style="grid-template-columns:1fr 90px"><label>${esc(nm)}<small>${un} · meta ${meta===null?"—":(tipo==="menor"?"≤ ":"")+fmt(meta)}</small></label><input data-esp="${id}" value="${String(S.espec[id]).replace(".",",")}" inputmode="decimal"></div>`).join("")}</div>`:""}
      </div>
    </div>
  </div>`;
  const v=num(d.vis[m]),e=num(d.pev[m]),a=num(d.aci[m]);
  $("#autos").innerHTML=`<div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Público dos eventos<div class="src">soma dos participantes dos eventos</div></div><div class="v">${d.pev[m]===""?"—":d.pev[m]==="N/A"?"N/A":fmt(d.pev[m])}</div></div>
   <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Público total atingido<div class="src">visitantes + público dos eventos</div></div><div class="v">${v===null&&e===null?"—":fmt((v||0)+(e||0))}</div></div>
   <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Acidentes por mil visitas</div><div class="v">${v&&a!==null?fmt(a/v*1000,2):"—"}</div></div>
   <div class="ind-row" style="grid-template-columns:1fr auto"><div class="nm">Ocorrências de pressão no mês</div><div class="v">${fmt(PRESSAO.reduce((t,id)=>t+(num(d[id][m])||0),0))}</div></div>`;
  document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{mesLanc=+b.dataset.m;vLancar()});
  document.querySelectorAll("[data-tg]").forEach(b=>b.onclick=()=>{const k=s+b.dataset.tg+m;regAberto[k]=!regAberto[k];vLancar()});
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>formReg(s,b.dataset.add,null));
  document.querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>{const r=S.reg.find(x=>x.id===b.dataset.ed);formReg(r.uc,r.ind,r)});
  const flag=(id,val)=>{if(regsDe(s,id,m).length)return;const atual=srcOf(s,id,m)==="flag"&&String(d[id][m])===String(val);
    d[id][m]=atual?"":val;setSrc(s,id,m,atual?"":"flag");recompute(s,id,m);saveReg();vLancar()};
  document.querySelectorAll("[data-zero]").forEach(b=>b.onclick=()=>flag(b.dataset.zero,0));
  document.querySelectorAll("[data-na]").forEach(b=>b.onclick=()=>flag(b.dataset.na,"N/A"));
  document.querySelectorAll("[data-esp]").forEach(i=>i.oninput=()=>{const n=num(i.value);if(n!==null){S.espec[i.dataset.esp]=n;save()}});
  $("#bEnviar").onclick=()=>{
    const vz=manuais.filter(([id])=>st(id)==="vazio").map(x=>x[1]);
    if(vz.length&&!confirmBox(`${vz.length} indicador(es) sem informação: ${vz.slice(0,4).join(", ")}${vz.length>4?"…":""}. Envie mesmo assim ou marque “Nenhum”/“N/A”.`))return;
    if(!S.enviados[s].includes(m))S.enviados[s].push(m);
    S.log.unshift({quando:new Date().toISOString(),para:"gguc@exemplo.org",assunto:`[SisGAP-ES] ${s} enviou o lançamento de ${MESL[m]} (${nEv}/${manuais.length} com evidência)`,tipo:"Confirmação"});
    save();toast(`Lançamento de ${MESL[m]} enviado à GGUC`);vLancar();
  };
};
// confirmação embutida (o navegador do protótipo pode bloquear confirm())
let _confirmOk=false;
function confirmBox(msg){if(_confirmOk){_confirmOk=false;return true}
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" style="align-items:center;justify-content:center"><div class="card" style="max-width:460px"><h3>Enviar com pendências?</h3><p class="small" style="line-height:1.5">${esc(msg)}</p>
  <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="btn" id="cbN">Voltar</button><button class="btn primary" id="cbS">Enviar mesmo assim</button></div></div></div>`;
  $("#cbN").onclick=()=>$("#drawerRoot").innerHTML="";$("#cbS").onclick=()=>{$("#drawerRoot").innerHTML="";_confirmOk=true;$("#bEnviar").click()};return false}

// ---------- formulário do registro ----------
let _regMap=null;
function formReg(uc,ind,r){
  const sc=REG[ind], nm=IND_LIST.find(x=>x[0]===ind)[1], nova=!r, m=mesLanc??Math.max(0,FECHADOS-1);
  const dDef=(()=>{const hoje=new Date();if(hoje.getFullYear()===ANO&&hoje.getMonth()===m)return hoje.toISOString().slice(0,10);return `${ANO}-${String(m+1).padStart(2,"0")}-15`})();
  const R=r?JSON.parse(JSON.stringify(r)):{id:"r"+Date.now(),uc,ind,data:dDef,c:{},anexos:[],lat:null,lon:null,autor:S.user,criado:new Date().toISOString()};
  const pode=isAdmin()||user().uc===uc;
  const campo=([k,lb,tp,op])=>{const v=R.c[k]??"";const dis=pode?"":"disabled";
    if(tp==="select")return `<div class="fld"><label>${lb}</label><select data-k="${k}" ${dis}><option value="">—</option>${op.map(o=>`<option ${v===o?"selected":""}>${o}</option>`).join("")}</select></div>`;
    if(tp==="textarea")return `<div class="fld"><label>${lb}</label><textarea data-k="${k}" ${dis}>${esc(v)}</textarea></div>`;
    if(k==="esp")return `<div class="fld"><label>${lb}</label><input data-k="esp" list="spReg" value="${esc(v)}" placeholder="Nome científico — a lista da UC aparece ao digitar" ${dis}><div class="small muted" style="margin-top:4px">${sc.bio?"Vai também para a lista de Biodiversidade da UC (registro da equipe).":""}</div></div>`;
    return `<div class="fld"><label>${lb}</label><input data-k="${k}" type="text" ${tp==="number"?'inputmode="decimal"':""} value="${esc(v)}" ${dis}></div>`};
  const draw=()=>{
  $("#drawerRoot").innerHTML=`<div class="drawer-bg" id="dbg"><div class="drawer">
    <div style="display:flex;justify-content:space-between;gap:10px"><div><div class="small muted">${uc} · ${nm}</div><h2>${nova?"Novo registro":"Editar registro"} — ${sc.t}</h2></div><button class="btn sm" id="dX">✕</button></div>
    ${R.c.simulado?'<div class="note" style="margin-top:10px">Registro de exemplo, criado para a validação.</div>':""}
    ${sc.pessoal?'<div class="note" style="margin-top:10px">Não registre nomes, CPF ou outros dados pessoais de envolvidos. Use o nº do auto, BO ou processo.</div>':""}
    <div class="fld"><label>Data</label><input type="date" id="rData" value="${R.data}" min="${ANO}-01-01" max="${ANO}-12-31" ${pode?"":"disabled"}></div>
    ${sc.fields.map(campo).join("")}
    ${sc.bio?`<datalist id="spReg">${(BIO[uc]?BIO[uc].especies:[]).map(x=>`<option value="${esc(x.s)}">${esc(x.p||x.g)}</option>`).join("")}</datalist>`:""}
    ${ind==="mon"?'<div class="small muted" style="margin:-8px 0 10px">Cada espécie listada vai para a lista de Biodiversidade da UC como registro da equipe.</div>':""}
    <div class="fld"><label>Anexos — ${esc(sc.docs||"fotos e documentos")}</label>
      <div style="display:grid;gap:6px">${R.anexos.map((a,i)=>`<div style="display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:5px">
        ${a.thumb?`<img src="${a.thumb}" style="width:52px;height:40px;object-fit:cover;border-radius:5px">`:`<div style="width:52px;height:40px;display:grid;place-items:center;background:var(--surface-2);border-radius:5px">${a.tipo==="pdf"?"📄":"📎"}</div>`}
        <div class="small" style="min-width:0"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600">${esc(a.nome)}</div><div class="muted">${a.lat!==null?`📍 ${a.lat.toFixed(5)}, ${a.lon.toFixed(5)} (GPS da foto)`:a.tipo==="foto"?"foto sem GPS":"documento"}</div></div>
        ${pode?`<button class="btn sm" data-rx="${i}">✕</button>`:""}</div>`).join("")||'<div class="ro small muted">Nenhum anexo ainda.</div>'}</div>
      ${pode?`<label class="btn" style="display:inline-flex;gap:8px;align-items:center;margin-top:8px;cursor:pointer">📎 Anexar fotos, PDF ou documentos<input type="file" id="rUp" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.odt" style="display:none"></label>`:""}</div>
    ${temGeo(uc)?`<div class="fld"><label>Local do registro <span class="muted" style="font-weight:400">(opcional · vem do GPS da 1ª foto ou clique no mapa)</span></label>
      <div class="small" id="rLoc" style="margin-bottom:6px">${R.lat!==null?`📍 ${R.lat.toFixed(5)}, ${R.lon.toFixed(5)}${dentroUC(uc,R.lat,R.lon)===false?' <b style="color:#9b2424">· fora do limite da UC</b>':""} <button class="btn sm" id="rLocX">limpar</button>`:"Sem local."}</div>
      <div id="rMap" style="height:210px;border-radius:10px;border:1px solid var(--line)"></div></div>`:""}
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">${pode?`<button class="btn primary" id="rSave">Salvar registro</button>`:""}${!nova&&pode?`<button class="btn" id="rDel">Excluir</button>`:""}</div>
    <p class="small muted" style="margin-top:10px">Ao salvar, o registro entra na contagem de ${MESL[m]} e fica como evidência do indicador.</p>
  </div></div>`;
  const pull=()=>{document.querySelectorAll("[data-k]").forEach(el=>R.c[el.dataset.k]=el.value.trim());R.data=$("#rData").value||R.data};
  const close=()=>{if(_regMap){_regMap.remove();_regMap=null}$("#drawerRoot").innerHTML=""};
  $("#dX").onclick=close;$("#dbg").onclick=e=>{if(e.target.id==="dbg")close()};
  document.querySelectorAll("[data-rx]").forEach(b=>b.onclick=()=>{pull();R.anexos.splice(+b.dataset.rx,1);setTimeout(draw,0)});
  if($("#rLocX"))$("#rLocX").onclick=()=>{pull();R.lat=null;R.lon=null;setTimeout(draw,0)};
  const up=$("#rUp");
  if(up)up.onchange=async()=>{pull();toast("Lendo anexos…");for(const f of up.files){const a=await lerArquivo(f);R.anexos.push({nome:a.nome,tipo:a.tipo,thumb:a.thumb,lat:a.lat,lon:a.lon});if(R.lat===null&&a.lat!==null){R.lat=a.lat;R.lon=a.lon}if(a.data&&nova&&a.origem==="exif"&&anoDe(a.data)===ANO)R.data=a.data}draw()};
  if(temGeo(uc)){if(_regMap){_regMap.remove();_regMap=null}_regMap=L_map("rMap",uc,{small:true});
    if(R.lat!==null){window.L.circleMarker([R.lat,R.lon],{radius:8,color:"#fff",weight:2,fillColor:"#6250d6",fillOpacity:1}).addTo(_regMap)}
    _regMap.getContainer().style.cursor="crosshair";
    _regMap.on("click",e=>{if(!pode)return;pull();R.lat=+e.latlng.lat.toFixed(6);R.lon=+e.latlng.lng.toFixed(6);setTimeout(draw,0)});setTimeout(()=>_regMap&&_regMap.invalidateSize(),60)}
  if($("#rSave"))$("#rSave").onclick=()=>{
    pull();
    if(!R.data||anoDe(R.data)!==ANO){toast("Informe uma data de "+ANO);return}
    for(const f of sc.fields)if(f[2]==="number"&&R.c[f[0]]!==""&&(num(R.c[f[0]])===null||num(R.c[f[0]])<0)){toast(`“${f[1]}” precisa ser um número`);return}
    if(sc.qty&&num(R.c[sc.qty])===null){toast(`Informe “${sc.fields.find(f=>f[0]===sc.qty)[1]}”`);return}
    if(sc.stock&&num(R.c[sc.stock])===null){toast("Informe o nº de espécies");return}
    const antigo=r?{uc:r.uc,ind:r.ind,m:mesDe(r.data)}:null;
    delete R.c.simulado;
    S.reg=S.reg.filter(x=>x.id!==R.id);S.reg.push(R);
    // um registro substitui marcação de "nenhum"/"N/A" no mês
    const mm=mesDe(R.data);if(srcOf(uc,ind,mm)==="flag")setSrc(uc,ind,mm,"");
    recompute(uc,ind,mm);if(antigo&&antigo.m!==mm)recompute(uc,ind,antigo.m);
    regAberto[uc+ind+mm]=true;
    const nBio=especiesParaBio(R);
    if(!saveReg())return;close();toast(`Registro salvo · ${nm}: ${S.lanc[uc][ind][mm]} em ${MESL[mm]}${nBio?` · ${nBio} espécie(s) enviada(s) à Biodiversidade`:""}`);mesLanc=mm;vLancar();
  };
  if($("#rDel"))$("#rDel").onclick=()=>{S.reg=S.reg.filter(x=>x.id!==R.id);S.bioReg=S.bioReg.filter(b=>b.regId!==R.id);saveBioReg();recompute(uc,ind,mesDe(r.data));saveReg();close();toast("Registro excluído");vLancar()};
  };
  draw();
}

// ---------- registros no mapa da UC ----------
{const _gm=geoMount; geoMount=function(uc){_gm(uc);const map=_mapas[0];if(!map)return;
  const lay=window.L.layerGroup().addTo(map);
  S.reg.filter(r=>r.lat!==null&&(uc?r.uc===uc:temGeo(r.uc))).forEach(r=>{const nm=IND_LIST.find(x=>x[0]===r.ind)[1],pres=PRESSAO.includes(r.ind)||r.ind==="inc";
    const icon=window.L.divIcon({className:"",html:`<div style="width:14px;height:14px;transform:rotate(45deg);background:${pres?"#e34948":"#6250d6"};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)"></div>`,iconSize:[14,14],iconAnchor:[7,7]});
    window.L.marker([r.lat,r.lon],{icon}).bindPopup(`<div style="width:220px;font-family:Inter,sans-serif">${(r.anexos.find(a=>a.thumb)||{}).thumb?`<img src="${r.anexos.find(a=>a.thumb).thumb}" style="width:100%;border-radius:8px;margin-bottom:6px">`:""}
      <div style="font-size:11px;color:#7c877f">${r.uc} · indicador comum</div><div style="font-weight:600">${esc(nm)}</div><div style="font-size:12px;margin-top:4px">${fmtD(r.data)} · ${esc(resumoReg(r.ind,r))}</div>
      <div style="font-size:11px;color:#7c877f;margin-top:4px">${r.anexos.length} anexo(s)${r.c.simulado?" · exemplo":""}</div></div>`).addTo(lay)});
  const leg=document.getElementById("mpLeg");
  if(leg)leg.insertAdjacentHTML("beforeend",`<div style="display:flex;gap:8px;align-items:center;padding:2px 0;margin-top:6px"><span style="width:11px;height:11px;transform:rotate(45deg);background:#e34948;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;margin:0 1px"></span>Ocorrência de pressão / incêndio</div><div style="display:flex;gap:8px;align-items:center;padding:2px 0"><span style="width:11px;height:11px;transform:rotate(45deg);background:#6250d6;border:2px solid #fff;box-shadow:0 0 0 1px #ccc;margin:0 1px"></span>Outros registros (fiscalização, eventos…)</div>`);
  const cb=document.getElementById("lyPts");if(cb){const old=cb.onchange;cb.onchange=e=>{old&&old(e);e.target.checked?lay.addTo(map):map.removeLayer(lay)}}
};}

// espécies citadas em registros de monitoramento → lista de Biodiversidade (registro da equipe)
function especiesParaBio(R){
  const sc=REG[R.ind];if(!sc||!sc.bio)return 0;
  const nomes=(R.ind==="mon"?String(R.c.esps||"").split(/\n|;/):[R.c.esp||""]).map(x=>x.trim()).filter(Boolean);
  const lista=BIO[R.uc]?BIO[R.uc].especies:[];
  const antigos=S.bioReg.filter(b=>b.regId===R.id);
  S.bioReg=S.bioReg.filter(b=>b.regId!==R.id);
  const auto=podeValidar(R.uc);
  nomes.forEach((sp,i)=>{const c=lista.find(x=>x.s.toLowerCase()===sp.toLowerCase()), prev=antigos.find(a=>a.sp.toLowerCase()===sp.toLowerCase());
    S.bioReg.push({id:R.id+"_b"+i,regId:R.id,origem:IND_LIST.find(x=>x[0]===R.ind)[1],uc:R.uc,sp,pop:c?c.p:"",g:(c&&c.g)||R.c.grupo||"",fam:c?c.f:"",es:c?c.es:"",br:c?c.br:"",
      tipo:R.ind==="mfa"&&R.c.tipo?"Manejo de fauna — "+R.c.tipo:sc.bio,n:String(R.c.n||"1"),data:R.data,obs:[R.c.desc,R.c.metodo,R.c.via].filter(Boolean).join(" · "),
      anexos:R.anexos.filter(a=>a.thumb).slice(0,3),lat:R.lat,lon:R.lon,autor:R.autor,
      st:prev?prev.st:(auto&&(c||R.c.grupo)?"val":"pend"),val:prev?prev.val:(auto&&(c||R.c.grupo)?{por:S.user,q:new Date().toISOString(),com:"Registrado pela gestão no lançamento mensal"}:null)})});
  saveBioReg();atualizaEstoques(R.uc);return nomes.length;
}
// indicadores de estoque (fauna/flora) vêm da Biodiversidade quando a UC tem lista
const _estoqueAuto=(uc,id)=>["fau","faa","flo","fla"].includes(id)&&especiesUC(uc).length>0;
