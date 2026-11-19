// SisGAP-ES — evidências georreferenciadas e mapas (somente UCs da versão de teste)
const GEO_UCS = LIMITES.features.map(f=>f.properties.s);
const temGeo = uc => GEO_UCS.includes(uc);
const limiteDe = uc => LIMITES.features.find(f=>f.properties.s===uc);
const HEX = {conc:"#0ca30c",and:"#2a78d6",venc:"#fab219",atr:"#d03b3b",nao:"#8f8d86"};
const PROG_HEX = ["#2a78d6","#eb6834","#1baf7a","#eda100","#e87ba4","#008300","#6250d6","#e34948"];

// ---------- geometria ----------
function pip(lon,lat,geom){
  const polys = geom.type==="Polygon"?[geom.coordinates]:geom.coordinates;
  const inRing=(r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,yi]=r[i],[xj,yj]=r[j];if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))c=!c}return c};
  return polys.some(p=>inRing(p[0])&&!p.slice(1).some(inRing));
}
function bbox(geom){let a=[180,90,-180,-90];const w=c=>typeof c[0]==="number"?(a=[Math.min(a[0],c[0]),Math.min(a[1],c[1]),Math.max(a[2],c[0]),Math.max(a[3],c[1])]):c.forEach(w);w(geom.coordinates);return a}
function dentroUC(uc,lat,lon){const f=limiteDe(uc);return f?pip(lon,lat,f.geometry):null}

// ---------- evidências ----------
function seedEvid(){
  const out=[];
  S.acoes.filter(a=>temGeo(a.uc)&&a.st!=="nao").forEach((a,i)=>{
    const r=rng(a.id+a.uc), f=limiteDe(a.uc), b=bbox(f.geometry), n=a.st==="conc"?2:1;
    for(let k=0;k<n;k++){
      let lat,lon,t=0;do{lon=b[0]+r()*(b[2]-b[0]);lat=b[1]+r()*(b[3]-b[1]);t++}while(!pip(lon,lat,f.geometry)&&t<200);
      const m=Math.floor(r()*Math.max(1,FECHADOS)), d=1+Math.floor(r()*27);
      out.push({id:"e"+a.id+"_"+k,acao:a.id,uc:a.uc,nome:"Registro de campo (simulado)",tipo:"sim",lat:+lat.toFixed(6),lon:+lon.toFixed(6),prec:Math.round(4+r()*12),
        data:`${ANO}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,origem:"simulado",thumb:null,autor:a.resp});
    }
  });
  return out;
}
S.evid = LS.get("evid",null) || seedEvid();
function saveEvid(){try{localStorage.setItem("sisgap:evid",JSON.stringify(S.evid));return true}catch(e){toast("Armazenamento do navegador cheio — remova fotos antigas (no sistema real as fotos vão para o Google Drive)");return false}}
const _reset=resetDemo; resetDemo=function(){try{localStorage.removeItem("sisgap:evid")}catch(e){};_reset()};
const evidDe = id => S.evid.filter(e=>e.acao===id);

function thumbDe(file){
  return new Promise(res=>{
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{const M=640,k=Math.min(1,M/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL("image/jpeg",.72))};
    img.onerror=()=>{URL.revokeObjectURL(url);res(null)};img.src=url;
  });
}
async function lerArquivo(file){
  const ev={id:"e"+Date.now()+Math.random().toString(36).slice(2,6),nome:file.name,tipo:file.type.startsWith("image/")?"foto":file.type==="application/pdf"?"pdf":"arquivo",
    lat:null,lon:null,prec:null,data:null,origem:null,thumb:null,autor:S.user};
  if(ev.tipo==="foto"){
    try{
      const g=await exifr.gps(file).catch(()=>null);
      if(g&&isFinite(g.latitude)&&isFinite(g.longitude)){ev.lat=+g.latitude.toFixed(6);ev.lon=+g.longitude.toFixed(6);ev.origem="exif"}
      const x=await exifr.parse(file,{tiff:true,exif:true,gps:true}).catch(()=>null);
      if(x&&x.GPSHPositioningError)ev.prec=Math.round(x.GPSHPositioningError);
      const dt=x&&(x.DateTimeOriginal||x.CreateDate); if(dt instanceof Date)ev.data=new Date(dt.getTime()-dt.getTimezoneOffset()*6e4).toISOString().slice(0,10);
      if(x&&x.Model)ev.cam=[x.Make,x.Model].filter(Boolean).join(" ");
    }catch(e){}
    ev.thumb=await thumbDe(file);
  }
  if(!ev.data)ev.data=new Date().toISOString().slice(0,10);
  return ev;
}

// ---------- bloco de evidências na ficha da ação ----------
let _miniMap=null, _pendente=null;
function geoEvid(a){
  const box=document.getElementById("evidBox"); if(!box)return;
  if(!temGeo(a.uc)){box.innerHTML=`<div class="fld"><label>Evidências</label><div class="ro small muted">O registro de evidências com foto e GPS está ativo só para as UCs da versão de teste (APAGO, ARIEMV, PEFG e PEI).</div></div>`;return}
  const pode=isAdmin()||user().uc===a.uc;
  const L=evidDe(a.id);
  const badge=e=>e.origem==="exif"?`<span class="pill st-conc"><i></i>GPS da foto</span>`:e.origem==="manual"?`<span class="pill"><i style="background:#2a78d6"></i>Marcado no mapa</span>`:e.origem==="simulado"?`<span class="pill">Simulado</span>`:`<span class="pill st-venc"><i></i>Sem local</span>`;
  const fora=e=>e.lat!==null&&dentroUC(a.uc,e.lat,e.lon)===false?`<span class="pill st-atr" title="Fora do limite da UC — confira o GPS ou a foto"><i></i>Fora do limite</span>`:"";
  box.innerHTML=`<div class="fld"><label>Evidências georreferenciadas (${L.length})</label>
    <div style="display:grid;gap:8px">${L.map(e=>`<div style="display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:6px">
      ${e.thumb?`<img src="${e.thumb}" style="width:64px;height:48px;object-fit:cover;border-radius:6px">`:`<div style="width:64px;height:48px;border-radius:6px;background:var(--surface-2);display:grid;place-items:center;color:var(--muted);font-size:20px">${e.tipo==="pdf"?"📄":"📍"}</div>`}
      <div style="min-width:0"><div class="small" style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(e.nome)}</div>
        <div class="small muted">${e.lat!==null?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}${e.prec?` · ±${e.prec} m`:""}`:"sem coordenadas"} · ${fmtD(e.data)}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">${badge(e)}${fora(e)}</div></div>
      <div style="display:flex;flex-direction:column;gap:4px">${pode?`<button class="btn sm" data-mk="${e.id}" title="Marcar/ajustar no mapa">📍</button><button class="btn sm" data-rm="${e.id}" title="Remover">✕</button>`:""}</div>
    </div>`).join("")||`<div class="ro small muted">Nenhuma evidência ainda.</div>`}</div>
    ${pode?`<label class="btn" style="display:inline-flex;gap:8px;align-items:center;margin-top:10px;cursor:pointer">📷 Enviar fotos ou PDF<input type="file" id="evUp" accept="image/*,application/pdf" multiple style="display:none"></label>
      <div class="small muted" style="margin-top:6px">O local é lido do GPS da foto. Se a foto não tiver GPS (print, WhatsApp) ou for PDF, clique no mapa para marcar o ponto.</div>`:""}
    <div id="miniMapMsg" class="small" style="margin-top:10px;font-weight:600;color:var(--brand)"></div>
    <div id="miniMap" style="height:240px;border-radius:10px;border:1px solid var(--line);margin-top:6px"></div></div>`;
  // mini mapa
  if(_miniMap){_miniMap.remove();_miniMap=null}
  _miniMap=L_map("miniMap",a.uc,{small:true});
  const pts=L.filter(e=>e.lat!==null).map(e=>window.L.circleMarker([e.lat,e.lon],{radius:7,color:"#fff",weight:2,fillColor:HEX[status(a)],fillOpacity:1}).bindTooltip(esc(e.nome)).addTo(_miniMap));
  const marcar=(ev,msg)=>{_pendente=ev;$("#miniMapMsg").textContent=msg;$("#miniMap").style.outline="3px solid #2c7a54";_miniMap.getContainer().style.cursor="crosshair"};
  _miniMap.on("click",m=>{if(!_pendente)return;_pendente.lat=+m.latlng.lat.toFixed(6);_pendente.lon=+m.latlng.lng.toFixed(6);_pendente.origem="manual";_pendente.prec=null;
    if(!S.evid.includes(_pendente))S.evid.push(_pendente);_pendente=null;saveEvid();logEvid(a);geoEvid(a)});
  box.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{S.evid=S.evid.filter(e=>e.id!==b.dataset.rm);saveEvid();geoEvid(a)});
  box.querySelectorAll("[data-mk]").forEach(b=>b.onclick=()=>marcar(S.evid.find(e=>e.id===b.dataset.mk),"Clique no mapa para ajustar o local desta evidência."));
  const up=document.getElementById("evUp");
  if(up)up.onchange=async()=>{
    const files=[...up.files];if(!files.length)return;toast("Lendo "+files.length+" arquivo(s)…");
    const sem=[];
    for(const f of files){const ev=await lerArquivo(f);ev.acao=a.id;ev.uc=a.uc;if(ev.lat!==null)S.evid.push(ev);else sem.push(ev)}
    if(!saveEvid())return;
    const ok=files.length-sem.length;
    geoEvid(a);
    if(sem.length){marcar(sem[0],`“${sem[0].nome}” não tem GPS: clique no mapa para marcar o local.`);
      // demais sem GPS entram sem local e podem ser marcadas depois
      sem.slice(1).forEach(e=>S.evid.push(e));saveEvid();}
    toast(ok?`${ok} evidência(s) com GPS registradas`:"Marque o local no mapa");
    if(ok)logEvid(a);
  };
  setTimeout(()=>{_miniMap.invalidateSize();const pp=L.filter(e=>e.lat!==null);if(pp.length===1)_miniMap.setView([pp[0].lat,pp[0].lon],14)},60);
}
function logEvid(a){a.hist.unshift({q:new Date().toISOString(),t:"Evidência registrada por "+user().nome});save()}

// ---------- mapa base ----------
function L_map(el,uc,{small=false}={}){
  const map=window.L.map(el,{scrollWheelZoom:!small,attributionControl:true,zoomControl:true});
  const osm=window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"});
  const sat=window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Imagem © Esri"});
  (small?sat:osm).addTo(map);
  map._bases={"Mapa":osm,"Satélite":sat};
  const feats=uc?[limiteDe(uc)]:LIMITES.features;
  const lim=window.L.geoJSON({type:"FeatureCollection",features:feats},{style:{color:small?"#ffe14d":"#1f5c3f",weight:2.5,fillColor:"#2c7a54",fillOpacity:small?.05:.12},interactive:!uc,
    onEachFeature:(f,l)=>{if(!uc){l.bindTooltip(`<b>${f.properties.s}</b> · ${esc(f.properties.nome)} · ${fmt(f.properties.ha,1)} ha`,{permanent:true,direction:"right",offset:[14,0],className:"uc-lbl"});l.on("click",()=>location.hash="uc/"+f.properties.s)}}}).addTo(map);
  map._lim=lim; map.fitBounds(lim.getBounds(),{padding:[16,16]});
  return map;
}

// ---------- card de mapa (painel da UC e painel geral) ----------
let _mapas=[];
function geoCard(uc){
  if(uc&&!temGeo(uc))return "";
  const f=uc?limiteDe(uc):null;
  return `<div class="card" style="margin-top:16px"><div class="card-h"><div><h3>${uc?"Mapa da UC — evidências das ações":"Mapa das UCs da versão de teste — evidências das ações"}</h3>
    <p class="sub">${uc?`${esc(f.properties.nome)} · ${fmt(f.properties.ha,1)} ha · ${esc(f.properties.leg)}`:"Clique numa UC para abrir o painel dela"} · Limite: IEMA 2026</p></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
      <select id="mpCor" class="btn sm"><option value="st">Cor por status</option><option value="prog">Cor por programa</option></select>
      <select id="mpPer" class="btn sm"><option value="">Todo o período</option><option value="90">Últimos 90 dias</option><option value="30">Últimos 30 dias</option></select>
      <button class="btn sm" id="mpKml">⬇ KML</button><button class="btn sm" id="mpGj">⬇ GeoJSON</button></div></div>
    <div style="display:grid;grid-template-columns:1fr 250px;gap:14px">
      <div id="mpMap" style="height:${uc?460:420}px;border-radius:10px;border:1px solid var(--line)"></div>
      <div class="small">
        <div style="font-weight:700;margin-bottom:6px">Camadas</div>
        <label style="display:flex;gap:8px;align-items:center;padding:4px 0"><input type="checkbox" id="lyLim" checked> Limite da UC <span class="muted">(IEMA 2026)</span></label>
        <label style="display:flex;gap:8px;align-items:center;padding:4px 0;color:var(--muted)" title="Arquivo ainda não enviado"><input type="checkbox" disabled> Zoneamento <span class="pill" style="font-size:10px">aguardando arquivo</span></label>
        <label style="display:flex;gap:8px;align-items:center;padding:4px 0;color:var(--muted)" title="Arquivo ainda não enviado"><input type="checkbox" disabled> Zona de amortecimento <span class="pill" style="font-size:10px">aguardando arquivo</span></label>
        <label style="display:flex;gap:8px;align-items:center;padding:4px 0"><input type="checkbox" id="lyPts" checked> Evidências das ações</label>
        <label style="display:flex;gap:8px;align-items:center;padding:4px 0"><input type="checkbox" id="lySat"> Imagem de satélite</label>
        <div style="font-weight:700;margin:12px 0 6px">Legenda</div><div id="mpLeg"></div>
        <div id="mpStat" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line);line-height:1.6"></div>
      </div></div></div>`;
}
function geoMount(uc){
  if(!document.getElementById("mpMap"))return;
  _mapas.forEach(m=>m.remove());_mapas=[];
  const map=L_map("mpMap",uc);_mapas.push(map);
  const pts=window.L.layerGroup().addTo(map);
  const acoes=S.acoes.filter(a=>uc?a.uc===uc:temGeo(a.uc));
  const progs=[...new Set(acoes.map(a=>a.prog))];
  const draw=()=>{
    pts.clearLayers();
    const porCor=$("#mpCor").value, per=+$("#mpPer").value||0;
    let n=0,fora=0,foto=0;
    S.evid.filter(e=>e.lat!==null&&(uc?e.uc===uc:temGeo(e.uc))).forEach(e=>{
      const a=S.acoes.find(x=>x.id===e.acao);if(!a)return;
      if(per&&(HOJE-parseD(e.data))/864e5>per)return;
      const st=status(a), cor=porCor==="st"?HEX[st]:PROG_HEX[progs.indexOf(a.prog)%PROG_HEX.length];
      const out=dentroUC(e.uc,e.lat,e.lon)===false; n++; if(out)fora++; if(e.thumb)foto++;
      window.L.circleMarker([e.lat,e.lon],{radius:e.thumb?8:6.5,color:out?"#d03b3b":"#fff",weight:out?3:2,fillColor:cor,fillOpacity:.95})
        .bindPopup(`<div style="width:230px;font-family:Inter,sans-serif">${e.thumb?`<img src="${e.thumb}" style="width:100%;border-radius:8px;margin-bottom:6px">`:""}
          <div style="font-size:11px;color:#7c877f">${a.uc} · ${esc(a.prog)}</div><div style="font-weight:600;margin:2px 0 4px">${esc(a.ativ)}</div>
          <div style="font-size:12px">${pill(st)}</div>
          <div style="font-size:11.5px;color:#4d5a51;margin-top:6px">${esc(e.nome)}<br>${fmtD(e.data)} · ${esc(userById(a.resp).nome)}<br>${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}${e.prec?` (±${e.prec} m)`:""} · ${e.origem==="exif"?"GPS da foto":e.origem==="manual"?"marcado no mapa":"simulado"}${out?'<br><b style="color:#d03b3b">Fora do limite da UC</b>':""}</div>
          <button class="btn sm" style="margin-top:8px" onclick="editarAcao('${a.id}')">Abrir ação</button></div>`).addTo(pts);
    });
    $("#mpLeg").innerHTML=porCor==="st"
      ? ST_ORDER.map(k=>`<div style="display:flex;gap:8px;align-items:center;padding:2px 0"><span style="width:12px;height:12px;border-radius:50%;background:${HEX[k]};border:2px solid #fff;box-shadow:0 0 0 1px #ccc"></span>${ST[k]}</div>`).join("")
      : progs.map((p,i)=>`<div style="display:flex;gap:8px;align-items:center;padding:2px 0"><span style="width:12px;height:12px;border-radius:50%;background:${PROG_HEX[i%PROG_HEX.length]};flex:0 0 12px"></span>${esc(p)}</div>`).join("");
    $("#mpLeg").innerHTML+=`<div style="display:flex;gap:8px;align-items:center;padding:2px 0;margin-top:4px"><span style="width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid #d03b3b"></span>Ponto fora do limite</div>`;
    $("#mpStat").innerHTML=`<b>${n}</b> evidências no mapa<br><b>${foto}</b> com foto · <b>${n-foto}</b> simuladas<br>${fora?`<b style="color:#9b2424">${fora} fora do limite</b>`:"Nenhuma fora do limite"}`;
  };
  $("#mpCor").onchange=draw;$("#mpPer").onchange=draw;
  $("#lyLim").onchange=e=>e.target.checked?map._lim.addTo(map):map.removeLayer(map._lim);
  $("#lyPts").onchange=e=>e.target.checked?pts.addTo(map):map.removeLayer(pts);
  $("#lySat").onchange=e=>{if(e.target.checked){map.removeLayer(map._bases["Mapa"]);map._bases["Satélite"].addTo(map)}else{map.removeLayer(map._bases["Satélite"]);map._bases["Mapa"].addTo(map)}};
  $("#mpKml").onclick=()=>exportar(uc,"kml");$("#mpGj").onclick=()=>exportar(uc,"geojson");
  draw();setTimeout(()=>map.invalidateSize(),80);
}
function exportar(uc,fmtx){
  const E=S.evid.filter(e=>e.lat!==null&&(uc?e.uc===uc:temGeo(e.uc))).map(e=>({e,a:S.acoes.find(x=>x.id===e.acao)})).filter(x=>x.a);
  let txt,mime,ext;
  if(fmtx==="geojson"){
    txt=JSON.stringify({type:"FeatureCollection",features:E.map(({e,a})=>({type:"Feature",geometry:{type:"Point",coordinates:[e.lon,e.lat]},
      properties:{uc:a.uc,programa:a.prog,acao:a.ativ,status:ST[status(a)],responsavel:userById(a.resp).nome,prazo:a.prazo,evidencia:e.nome,data:e.data,origem:e.origem,precisao_m:e.prec,dentro_uc:dentroUC(e.uc,e.lat,e.lon)}}))},null,1);
    mime="application/geo+json";ext="geojson";
  }else{
    const x=s=>esc(s).replace(/'/g,"&apos;");
    txt=`<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>SisGAP-ES — evidências ${uc||"UCs de teste"}</name>\n`+
      E.map(({e,a})=>`<Placemark><name>${x(a.ativ)}</name><description>${x(`${a.uc} · ${a.prog} · ${ST[status(a)]} · ${userById(a.resp).nome} · ${fmtD(e.data)} · ${e.nome}`)}</description><Point><coordinates>${e.lon},${e.lat},0</coordinates></Point></Placemark>`).join("\n")+`\n</Document></kml>`;
    mime="application/vnd.google-earth.kml+xml";ext="kml";
  }
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:mime}));a.download=`sisgap_evidencias_${uc||"ucs_teste"}_${new Date().toISOString().slice(0,10)}.${ext}`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast(`${E.length} pontos exportados em ${ext.toUpperCase()}`);
}
