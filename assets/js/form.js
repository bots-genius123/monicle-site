document.querySelectorAll('form[data-w3f]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var b=f.querySelector('button[type=submit]'); var t=b.textContent; b.disabled=true; b.textContent='Versturen...';
    fetch(f.action,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)})
      .then(function(r){return r.json()})
      .then(function(j){ if(j.success){f.classList.add('sent');} else {throw new Error(j.message)} })
      .catch(function(){ b.disabled=false; b.textContent=t; alert('Versturen lukte niet. Mail ons gerust op contact@monicle.ai.'); });
  });
});
