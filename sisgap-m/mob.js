// SisGAP-ES — comportamento para celular: menu lateral deslizante e barra inferior
(function(){
  const veil=document.createElement("div");veil.id="mobVeil";document.body.appendChild(veil);
  const nav=document.createElement("nav");nav.id="mobNav";document.body.appendChild(nav);
  const tb=document.querySelector(".topbar");
  if(tb){const b=document.createElement("button");b.id="mobBurger";b.setAttribute("aria-label","Menu");b.textContent="☰";tb.prepend(b);b.onclick=()=>document.body.classList.toggle("menu-on")}
  const fechar=()=>document.body.classList.remove("menu-on");
  veil.onclick=fechar;window.addEventListener("hashchange",fechar);
  document.addEventListener("click",e=>{if(e.target.closest("aside nav a, #btnHome"))setTimeout(fechar,50)});
  const PRI=["painel","uc","lancar","acoes","biodiversidade","alertas"];
  function bar(){
    const app=document.getElementById("app");nav.style.display=(!app||app.classList.contains("hidden"))?"none":"flex";
    const links=[...document.querySelectorAll("#nav a")];const h=(location.hash.slice(1).split("/")[0])||"";
    const esc=[];PRI.forEach(k=>{const a=links.find(l=>l.getAttribute("href")==="#"+k);if(a&&esc.length<4)esc.push(a)});
    nav.innerHTML=esc.map(a=>{const k=a.getAttribute("href").slice(1),ic=(a.querySelector(".ic")||{}).textContent||"•",bd=a.querySelector(".badge");
      let t=a.textContent.replace(bd?bd.textContent:"","").replace(ic,"").trim().replace(" (SISEUC)","").replace("Lançamento mensal","Lançar").replace("Plano de ação","Plano").replace("Alertas e e-mails","Alertas").replace("Painel geral","Painel").replace("Painel da UC","Minha UC");
      return `<a href="#${k}" class="${h===k?"on":""}"><span class="i">${ic}</span>${t}${bd?`<span class="bd">${bd.textContent}</span>`:""}</a>`}).join("")+`<a href="#" id="mobMais"><span class="i">☰</span>Mais</a>`;
    const m=document.getElementById("mobMais");if(m)m.onclick=e=>{e.preventDefault();document.body.classList.add("menu-on")};
  }
  const obs=new MutationObserver(()=>{clearTimeout(bar._t);bar._t=setTimeout(bar,30)});
  const n=document.getElementById("nav");if(n)obs.observe(n,{childList:true,subtree:true});
  const app=document.getElementById("app");if(app)obs.observe(app,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("hashchange",bar);bar();
  // link para a versão de computador na tela de entrada
  const pnl=document.querySelector("#login .panel");if(pnl){const d=document.createElement("a");d.id="mobDesk";d.href="../sisgap/";d.textContent="🖥 Abrir a versão para computador";pnl.appendChild(d)}
})();
