// SisGAP-ES — relatório da UC em PDF (via impressão do navegador: "Salvar como PDF")
function relatorioUC(uc){
  const u=ucObj(uc), m=FECHADOS, hoje=new Date().toLocaleDateString("pt-BR");
  const ac=acoesDe(uc), c=contaSt(ac), progs=[...new Set(ac.map(a=>a.prog))];
  const val=(id,i)=>{const v=S.lanc[uc][id][i];return v===""?"—":v==="N/A"?"N/A":fmt(v,1)};
  const ano=(id,rg)=>{if(rg==="Último"){const n=ultimo(uc,id);return n===null?"—":fmt(n)}return fmt(soma(uc,id,0,m))};
  const evid=id=>{let n=0;for(let i=0;i<m;i++){const sr=(typeof srcOf==="function")?srcOf(uc,id,i):"";if(sr==="reg"||sr==="flag")n++}return n};
  const r=(typeof CAR!=="undefined")&&CAR.resumo[uc], sp=(typeof especiesUC==="function")?especiesUC(uc):[];
  const nReg=(S.reg||[]).filter(x=>x.uc===uc&&anoDe(x.data)===ANO), nAnex=nReg.reduce((t,x)=>t+x.anexos.length,0)+(S.evid||[]).filter(e=>e.uc===uc&&e.thumb).length;
  const procs=r?CAR.imoveis.features.filter(f=>f.properties.uc===uc).map(f=>({f,p:procDe(uc,f.properties.cod)})).filter(x=>x.p):[];
  const html=`
  <div class="rp-head"><img src="iema-verde.png" alt="IEMA"><div><div class="rp-sis">SisGAP-ES · Sistema Integrado de Gestão de Áreas Protegidas do ES</div>
    <h1>${esc(u.n)} (${u.s})</h1><div class="rp-sub">${u.cat} · ${u.g==="PI"?"Proteção Integral":"Uso Sustentável"} · Relatório de gestão ${ANO} (jan–${MES[m-1]||"jan"}) · emitido em ${hoje} por ${esc(user().nome)}</div></div></div>
  <div class="rp-warn">Versão de teste do SisGAP-ES: valores de lançamento, responsáveis, processos e proprietários são simulados/fictícios. Ações, metas e indicadores específicos vêm do plano de manejo; dados do CAR e de espécies, das análises citadas.</div>
  <div class="rp-kpis">
    <div><b>${Math.round(Array.from({length:m},(_,i)=>completude(uc,i)).reduce((a,b)=>a+b,0)/Math.max(1,m)*100)}%</b>completude dos lançamentos</div>
    <div><b>${uc==="APAPM"?"N/A":fmt(soma(uc,"vis"))}</b>visitas no ano</div>
    <div><b>${fmt(PRESSAO.reduce((a,id)=>a+soma(uc,id),0))}</b>ocorrências de pressão</div>
    <div><b>${ac.length?c.conc+"/"+ac.length:"—"}</b>ações do PM concluídas</div>
    <div><b>${fmt(nReg.length)}</b>registros com evidência · ${fmt(nAnex)} anexos</div>
  </div>
  <h2>1. Indicadores comuns — lançamentos mensais</h2>
  <table class="rp-t"><thead><tr><th>Indicador</th>${MES.slice(0,m).map(x=>`<th>${x}</th>`).join("")}<th>Ano</th><th>Meses c/ evidência</th></tr></thead><tbody>
  ${COMUNS.map(([p,inds])=>`<tr class="rp-sec"><td colspan="${m+3}">${p}</td></tr>`+inds.map(([id,nm,un,rg])=>`<tr><td>${nm} <span class="rp-un">(${un})</span></td>${MES.slice(0,m).map((_,i)=>`<td>${val(id,i)}</td>`).join("")}<td><b>${ano(id,rg)}</b></td><td>${evid(id)}/${m}</td></tr>`).join("")).join("")}
  </tbody></table>
  ${ESPECIFICOS[uc]?`<h2>2. Indicadores específicos do plano de manejo</h2>
  <table class="rp-t"><thead><tr><th>Indicador</th><th>Meta</th><th>Atual</th><th>Situação</th><th>Fonte no plano</th></tr></thead><tbody>
  ${ESPECIFICOS[uc].map(([id,nm,un,meta,_,tipo,src])=>{const v=S.espec[id];const ok=meta===null?null:tipo==="menor"?v<=meta:v>=meta;
    return `<tr><td>${esc(nm)}</td><td>${meta===null?"—":(tipo==="menor"?"≤ ":"")+fmt(meta)+" "+un}</td><td><b>${fmt(v,1)}</b> ${un}</td><td>${ok===null?"sem meta":ok?"meta atingida":"abaixo da meta"}</td><td>${esc(src)}</td></tr>`}).join("")}</tbody></table>`:""}
  ${ac.length?`<h2>3. Plano de ação do plano de manejo</h2>
  <table class="rp-t"><thead><tr><th>Programa</th><th>Concluídas</th><th>Em andamento</th><th>A vencer (15 dias)</th><th>Atrasadas</th><th>Não iniciadas</th></tr></thead><tbody>
  ${progs.map(p=>{const k=contaSt(ac.filter(a=>a.prog===p));return `<tr><td>${esc(p)}</td><td>${k.conc}</td><td>${k.and}</td><td>${k.venc}</td><td>${k.atr}</td><td>${k.nao}</td></tr>`}).join("")}
  <tr class="rp-tot"><td>Total</td><td>${c.conc}</td><td>${c.and}</td><td>${c.venc}</td><td>${c.atr}</td><td>${c.nao}</td></tr></tbody></table>
  <table class="rp-t"><thead><tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Situação</th><th>Progresso</th><th>Evidências</th></tr></thead><tbody>
  ${ac.slice().sort((a,b)=>a.prazo.localeCompare(b.prazo)).map(a=>`<tr><td>${esc(a.ativ)}<div class="rp-un">${esc(a.prog)} · ${esc(a.fonte)}</div></td><td>${esc(userById(a.resp).nome)}</td><td>${fmtD(a.prazo)}</td><td>${ST[status(a)]}</td><td>${a.pct}%</td><td>${(S.evid||[]).filter(e=>e.acao===a.id).length}</td></tr>`).join("")}</tbody></table>`:""}
  ${r?`<h2>4. Situação fundiária (CAR)</h2>
  <p>${esc(r.moradores)}. <b>${r.n_relevante}</b> imóveis do CAR com área na UC (${r.n_inteiro_dentro} inteiros dentro), somando <b>${fmt(r.area_car_ha)} ha</b> (${fmt(r.pct_uc,1)}% da UC). População residente (Censo 2022): ${esc(r.pop_total)} (indígenas: ${esc(r.pop_indigena)}; quilombolas: ${esc(r.pop_quilombola)}).
  Análise do CAR: ${r.cond_aguardando} aguardando análise, ${r.cond_em_analise} em análise, ${r.cond_analisado_pendente} analisados aguardando regularização, ${r.cond_conforme} em conformidade. Processos cadastrados: <b>${procs.length}</b>.</p>
  ${procs.length?`<table class="rp-t"><thead><tr><th>Imóvel</th><th>Área na UC (ha)</th><th>Processo</th><th>Etapa</th><th>Nº E-Docs</th><th>Prazo</th></tr></thead><tbody>
  ${procs.map(({f,p})=>`<tr><td>${f.properties.cod}</td><td>${fmt(f.properties.a_dentro,1)}</td><td>${esc(p.tipo)}</td><td>${ETAPAS[grupoUC(uc)][p.etapa]}</td><td>${esc(p.edocs)}</td><td>${p.prazo?fmtD(p.prazo):""}</td></tr>`).join("")}</tbody></table>`:""}`:""}
  ${sp.length?`<h2>5. Biodiversidade</h2>
  <p><b>${sp.length}</b> espécies com evidência robusta (fauna ${sp.filter(x=>x.g!=="Flora").length}, flora ${sp.filter(x=>x.g==="Flora").length}); <b>${sp.filter(ehAmea).length}</b> ameaçadas no ES ou no Brasil; ${sp.filter(x=>x.nova).length} espécies novas registradas pela equipe; ${(S.bioReg||[]).filter(b=>b.uc===uc&&b.st==="pend").length} registros aguardando validação. Coordenadas de ocorrência não são incluídas neste relatório.</p>
  <table class="rp-t"><thead><tr><th>Grupo</th><th>Família</th><th>Espécie ameaçada</th><th>Nome popular</th><th>ES</th><th>Brasil</th></tr></thead><tbody>
  ${sp.filter(ehAmea).sort((a,b)=>a.g.localeCompare(b.g)||a.s.localeCompare(b.s)).map(x=>`<tr><td>${x.g}</td><td>${esc(x.f)}</td><td><i>${esc(x.s)}</i></td><td>${esc(x.p)}</td><td>${x.es||"—"}</td><td>${x.br||"—"}</td></tr>`).join("")}</tbody></table>`:""}
  <div class="rp-foot">SisGAP-ES · IEMA/GGUC · ${PLANOS[uc]?esc(PLANOS[uc].doc)+" · ":""}Limites: IEMA 2026. Relatório gerado automaticamente em ${new Date().toLocaleString("pt-BR")}.</div>`;
  let el=document.getElementById("printArea");if(!el){el=document.createElement("div");el.id="printArea";document.body.appendChild(el)}
  el.innerHTML=html;
  const t=document.title;document.title=`SisGAP-ES_relatorio_${uc}_${new Date().toISOString().slice(0,10)}`;
  setTimeout(()=>{try{window.print()}catch(e){toast("Use Ctrl+P / Cmd+P e escolha “Salvar como PDF”")}document.title=t},300);
}
// botão no painel da UC
{const _v=vUC; vUC=function(s){_v(s);if(!ucObj(s))return;
  const bar=document.createElement("div");bar.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px";
  bar.innerHTML=`<button class="btn primary" id="btnPdf">⬇ Exportar PDF do painel</button>`;
  $("#view").prepend(bar);$("#btnPdf").onclick=()=>{toast("Na janela de impressão, escolha “Salvar como PDF”");relatorioUC(s)}};}
