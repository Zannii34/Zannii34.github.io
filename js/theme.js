document.addEventListener('DOMContentLoaded',()=>{
  const themeButton=document.getElementById('themeToggle');
  const menuButton=document.getElementById('menuToggle');
  const nav=document.getElementById('mainNav');
  const savedTheme=localStorage.getItem('wayne-portfolio-theme');

  if(savedTheme==='light'){
    document.body.classList.add('light-mode');
    if(themeButton){themeButton.textContent='☾';themeButton.setAttribute('aria-label','Switch to dark theme')}
  }

  if(themeButton)themeButton.addEventListener('click',()=>{
    document.body.classList.toggle('light-mode');
    const isLight=document.body.classList.contains('light-mode');
    localStorage.setItem('wayne-portfolio-theme',isLight?'light':'dark');
    themeButton.textContent=isLight?'☾':'☀';
    themeButton.setAttribute('aria-label',isLight?'Switch to dark theme':'Switch to light theme');
  });

  if(menuButton&&nav){
    menuButton.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded',String(open));
      menuButton.textContent=open?'✕':'☰';
    });
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
      menuButton.textContent='☰';
    }));
  }

  const filterButtons=[...document.querySelectorAll('.project-filter')];
  const projectCards=[...document.querySelectorAll('.portfolio-grid .project-card')];
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    filterButtons.forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});
    button.classList.add('active');button.setAttribute('aria-pressed','true');
    projectCards.forEach(card=>{
      const categories=(card.dataset.category||'').split(/\s+/);
      const show=filter==='all'||categories.includes(filter);
      card.hidden=!show;
    });
  }));

  const copyButton=document.getElementById('copyEmail');
  if(copyButton)copyButton.addEventListener('click',async()=>{
    const email=copyButton.dataset.email;
    try{
      await navigator.clipboard.writeText(email);
      const strong=copyButton.querySelector('strong');
      const old=strong.textContent;
      strong.textContent='Email Copied ✓';
      setTimeout(()=>strong.textContent=old,1800);
    }catch{
      window.location.href=`mailto:${email}`;
    }
  });
});