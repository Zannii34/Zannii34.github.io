const quotes=[
  {ref:'MH-10024',client:'Lerato M.',service:'CCTV',value:'R12,500',status:'Pending'},
  {ref:'MH-10023',client:'ABC Company',service:'Access Control',value:'R25,000',status:'In Progress'},
  {ref:'MH-10022',client:'Sarah N.',service:'Networking',value:'R8,750',status:'Completed'},
  {ref:'MH-10021',client:'Thabo K.',service:'Intercom',value:'R6,200',status:'Completed'},
  {ref:'MH-10020',client:'KJ Offices',service:'CCTV',value:'R19,900',status:'In Progress'}
];
const clients=[
  {name:'Lerato M.',quotes:'2 quotations',focus:'CCTV / Security'},
  {name:'ABC Company',quotes:'3 quotations',focus:'Access Control'},
  {name:'Sarah N.',quotes:'1 quotation',focus:'Networking'},
  {name:'Thabo K.',quotes:'2 quotations',focus:'Intercom'},
  {name:'KJ Offices',quotes:'4 quotations',focus:'Security Systems'}
];
const $=id=>document.getElementById(id);
function statusClass(s){return s.toLowerCase().replace(/\s+/g,'-')}
function recentRows(list){return list.map(q=>`<tr><td>${q.ref}</td><td>${q.client}</td><td>${q.service}</td><td><span class="status ${statusClass(q.status)}">${q.status}</span></td></tr>`).join('')}
function quoteRows(list){return list.map(q=>`<tr><td>${q.ref}</td><td>${q.client}</td><td>${q.value}</td><td><span class="status ${statusClass(q.status)}">${q.status}</span></td><td><button class="action" data-ref="${q.ref}">View</button></td></tr>`).join('')||'<tr><td colspan="5">No matching quotes.</td></tr>'}
$('recent').innerHTML=recentRows(quotes.slice(0,4));
$('quoteRows').innerHTML=quoteRows(quotes);
$('clientCards').innerHTML=clients.map(c=>`<article><h3>${c.name}</h3><p>${c.quotes}</p><b>${c.focus}</b></article>`).join('');
document.querySelectorAll('nav button[data-view]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('main>section').forEach(s=>s.hidden=true);$(btn.dataset.view).hidden=false;document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('title').textContent=btn.textContent}));
$('qsearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase();$('quoteRows').innerHTML=quoteRows(quotes.filter(x=>Object.values(x).join(' ').toLowerCase().includes(q)))});
$('quoteRows').addEventListener('click',e=>{const btn=e.target.closest('[data-ref]');if(!btn)return;const q=quotes.find(x=>x.ref===btn.dataset.ref);alert(`${q.ref}\nClient: ${q.client}\nService: ${q.service}\nValue: ${q.value}\nStatus: ${q.status}\n\nStatic portfolio demo — no real customer data.`)});
