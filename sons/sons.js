// Página de vocalizações da série Preservando o Nosso Quintal.
// Uso: defina window.PAGINA = {titulo, paginas, especies:[{nome, cientifico, foto, xc, autor, local, licenca, tipo, nota}]}
(function(){
  const P = window.PAGINA;
  const css = `
  :root{--azul:#1e4575;--verde:#18965f;--fundo:#0f1f38;--card:#16294a;--linha:#27406b;--txt:#e8eef8;--suave:#9fb0cc}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{margin:0;background:var(--fundo);color:var(--txt);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .app{max-width:640px;margin:0 auto;padding:18px 14px 40px}
  header{display:flex;gap:12px;align-items:center;margin-bottom:6px}
  header img{width:54px;background:#fff;border-radius:12px;padding:4px}
  header small{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#4fd08f;font-weight:700}
  header h1{margin:2px 0 0;font-size:23px;line-height:1.1;font-weight:800}
  header p{margin:3px 0 0;font-size:13px;color:var(--suave)}
  .dica{font-size:13.5px;color:var(--suave);margin:12px 2px 14px;line-height:1.45}
  .ave{display:flex;gap:14px;align-items:center;background:var(--card);border:1px solid var(--linha);border-radius:18px;padding:12px;margin-bottom:10px}
  .foto{position:relative;flex:none;width:84px;height:84px;border:0;padding:0;border-radius:50%;overflow:hidden;cursor:pointer;background:#000}
  .foto img{width:100%;height:100%;object-fit:cover;display:block}
  .foto .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,20,40,.35);color:#fff;font-size:28px;transition:background .2s}
  .ave.tocando .foto .play{background:rgba(24,150,95,.55)}
  .ave.tocando{border-color:#4fd08f}
  .info{flex:1;min-width:0}
  .info b{display:block;font-size:17px}
  .info i{font-size:13px;color:var(--suave)}
  .barra{height:5px;background:#0b1830;border-radius:3px;margin-top:9px;overflow:hidden}
  .barra div{height:100%;width:0;background:#4fd08f}
  .nota{font-size:12.5px;color:#ffd27a;margin-top:6px;line-height:1.4}
  .cred{font-size:11px;color:#7f92b3;margin-top:6px;line-height:1.4}
  .cred a{color:#9fb0cc}
  .onda{display:flex;gap:2px;align-items:flex-end;height:18px;margin-left:auto;flex:none;width:26px}
  .onda span{width:4px;background:#4fd08f;border-radius:2px;height:4px}
  .ave.tocando .onda span{animation:onda .8s infinite ease-in-out}
  .onda span:nth-child(2){animation-delay:.15s!important}.onda span:nth-child(3){animation-delay:.3s!important}.onda span:nth-child(4){animation-delay:.45s!important}
  @keyframes onda{0%,100%{height:4px}50%{height:18px}}
  footer{margin-top:22px;font-size:11.5px;color:#7f92b3;line-height:1.55;text-align:center}
  footer a{color:#9fb0cc}`;
  document.head.insertAdjacentHTML('beforeend','<style>'+css+'</style>');
  const lic = l => l ? `<a href="https://creativecommons.org/licenses/${l}" target="_blank" rel="noopener">CC ${l.replace(/\/$/,'').replace('/',' ').toUpperCase()}</a>` : '';
  document.body.innerHTML = `<div class="app">
    <header><img src="../../passaporte/logo.png" alt=""><div><small>Preservando o Nosso Quintal · Sons</small><h1>${P.titulo}</h1><p>${P.paginas}</p></div></header>
    <p class="dica">Toque na foto para ouvir. Use fone de ouvido ou aumente o volume.</p>
    ${P.especies.map((e,i)=>`<div class="ave" id="a${i}">
      <button class="foto" aria-label="Ouvir ${e.nome}" onclick="tocar(${i})"><img src="${e.foto}" alt=""><span class="play">▶</span></button>
      <div class="info"><b>${e.nome}</b><i>${e.cientifico}</i>
        ${e.nota?`<div class="nota">${e.nota}</div>`:''}
        <div class="barra"><div id="b${i}"></div></div>
        <div class="cred">${e.tipo||'Canto'} · gravação de ${e.autor}, ${e.local} · <a href="https://xeno-canto.org/${e.xc}" target="_blank" rel="noopener">XC${e.xc}</a> · ${lic(e.licenca)}</div></div>
      <div class="onda" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    </div>`).join('')}
    <footer>Gravações do acervo <a href="https://xeno-canto.org" target="_blank" rel="noopener">xeno-canto.org</a>, usadas conforme a licença de cada autor.<br>Série Preservando o Nosso Quintal · Editora Naturalistas</footer></div>`;
  const audio = new Audio(); audio.preload = 'none'; let atual = -1;
  window.tocar = i => {
    if (atual === i && !audio.paused) { audio.pause(); return; }
    if (atual !== i) { audio.src = `https://xeno-canto.org/${P.especies[i].xc}/download`; atual = i; }
    audio.play().catch(()=>{});
  };
  const marca = () => document.querySelectorAll('.ave').forEach((el,k)=>{
    const on = k===atual && !audio.paused; el.classList.toggle('tocando',on);
    el.querySelector('.play').textContent = on ? '❚❚' : '▶'; });
  audio.addEventListener('play',marca); audio.addEventListener('pause',marca);
  audio.addEventListener('ended',()=>{marca();});
  audio.addEventListener('timeupdate',()=>{ document.querySelectorAll('.barra div').forEach((b,k)=>b.style.width = k===atual && audio.duration ? (audio.currentTime/audio.duration*100)+'%' : '0'); });
})();
