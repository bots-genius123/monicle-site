// Mobiel menu
(function(){
  var h=document.querySelector('.site-header'), t=h&&h.querySelector('.nav-toggle');
  if(!t) return;
  t.addEventListener('click',function(){
    var open=h.classList.toggle('open');
    t.setAttribute('aria-expanded',open?'true':'false');
    t.setAttribute('aria-label',open?'Menu sluiten':'Menu openen');
  });
  h.querySelectorAll('.nav-links a').forEach(function(a){a.addEventListener('click',function(){h.classList.remove('open');t.setAttribute('aria-expanded','false');});});
})();

// Formulieren (Web3Forms) + conversie-event per formulier
document.querySelectorAll('form[data-w3f]').forEach(function(f){
  var kind=f.getAttribute('data-w3f');
  var site=f.querySelector('input[name=website]');
  if(site) site.addEventListener('blur',function(){ var v=site.value.trim(); if(v && !/^https?:\/\//i.test(v)) site.value='https://'+v; });
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var b=f.querySelector('button[type=submit]'), t=b.textContent; b.disabled=true; b.textContent='Versturen...';
    fetch(f.action,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)})
      .then(function(r){return r.json()})
      .then(function(j){
        if(!j.success) throw new Error(j.message);
        f.classList.add('sent');
        var ev=kind+'_aanvraag';
        window.dataLayer=window.dataLayer||[]; window.dataLayer.push({event:ev,formulier:kind});
        if(typeof window.gtag==='function') window.gtag('event',ev,{formulier:kind});
      })
      .catch(function(){ b.disabled=false; b.textContent=t; alert('Versturen lukte niet. Mail ons gerust op contact@monicle.ai.'); });
  });
});

// Animaties: één keer bij in beeld komen; zonder JS of met reduced motion blijft de eindstaat staan
(function(){
  if(!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function visible(el){ return el && el.offsetParent!==null; }
  function once(el,fn){ var io=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ io.disconnect(); fn(); } },{threshold:0.3}); io.observe(el); }
  function hide(el){ el.classList.add('a-hide'); }
  function show(el,delay){ setTimeout(function(){ el.classList.remove('a-hide'); el.classList.add('a-show'); },delay); }
  function prepDraw(p){ var L=p.getTotalLength(); p.style.strokeDasharray=L; p.style.strokeDashoffset=L; return L; }
  function draw(p,ms,delay){ setTimeout(function(){ p.style.transition='stroke-dashoffset '+ms+'ms ease-out'; p.style.strokeDashoffset='0'; },delay||0); }
  function ring(el,delay){ el.classList.add('a-ring','a-start'); return function(){ setTimeout(function(){ el.classList.remove('a-start'); el.classList.add('a-go'); },delay); }; }
  function kids(box){ return [].slice.call(box.children).filter(function(c){ return c.nodeType===1; }); }

  // Homepage: dienstencirkel
  document.querySelectorAll('.variant-boog > div').forEach(function(box){
    if(!visible(box)) return;
    var path=box.querySelector('svg path'); var items=kids(box).filter(function(c){return c.tagName==='DIV';}).slice(1);
    if(path) prepDraw(path); items.forEach(hide);
    once(box,function(){ if(path) draw(path,1300); items.forEach(function(it,i){ show(it,900+Math.floor(i/2)*220); }); });
  });

  // Werkwijze: groeicyclus
  document.querySelectorAll('.variant-cyclus > div').forEach(function(box){
    if(!visible(box)) return;
    var c=kids(box), lead=c.slice(0,2), circle=null, arrows=[], center=null, steps=[];
    c.slice(2).forEach(function(el){
      if(!circle && el.tagName==='DIV' && !el.textContent.trim()) circle=el;
      else if(el.tagName.toLowerCase()==='svg') arrows.push(el);
      else if(!center && /maand/.test(el.textContent)) center=el;
      else if(el.tagName==='DIV') steps.push(el);
    });
    lead.forEach(hide); arrows.forEach(hide); steps.forEach(hide);
    var go=circle?ring(circle,500):function(){};
    once(box,function(){
      lead.forEach(function(el){ show(el,0); });
      go();
      for(var s=0;s<4;s++){ (function(s){ var d=1500+s*350; if(steps[2*s]) show(steps[2*s],d); if(steps[2*s+1]) show(steps[2*s+1],d); if(arrows[s]) show(arrows[s],d); })(s); }
    });
  });
  // Werkwijze mobiel: stappenlijst
  document.querySelectorAll('.variant-cycluslijst').forEach(function(list){
    if(!visible(list)) return;
    var items=kids(list); items.forEach(hide);
    once(list,function(){ items.forEach(function(it,i){ show(it,i*250); }); });
  });

  // Werkwijze: Monicle Lens-dashboard
  [].forEach.call(document.querySelectorAll('p'),function(p){
    if(p.textContent.trim()!=='Illustratie van het Monicle Lens-dashboard') return;
    var box=p.parentElement, xs=[], ys=[];
    box.querySelectorAll('div[style]').forEach(function(d){
      var st=d.getAttribute('style');
      if(/(^|;)\s*height:\s*\d+(\.\d+)?%/.test(st) && /background/.test(st)) ys.push(d);
      else if(/(^|;)\s*width:\s*\d+(\.\d+)?%/.test(st) && /background/.test(st) && d.offsetHeight<=14) xs.push(d);
    });
    if(!visible(box)) return;
    xs.forEach(function(d){ d.classList.add('a-bar-x'); }); ys.forEach(function(d){ d.classList.add('a-bar-y'); });
    once(box,function(){
      xs.forEach(function(d,i){ setTimeout(function(){ d.classList.add('a-bar-go'); },i*120); });
      ys.forEach(function(d,i){ setTimeout(function(){ d.classList.add('a-bar-go'); },400+i*90); });
    });
  });
})();
