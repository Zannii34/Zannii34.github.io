const KEY='wayne-todo-demo-v3';
const $=id=>document.getElementById(id);
let tasks=JSON.parse(localStorage.getItem(KEY)||'[]');
const save=()=>localStorage.setItem(KEY,JSON.stringify(tasks));
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
  const q=$('filter').value.toLowerCase();
  const st=$('status').value;
  const filtered=tasks.filter(t=>t.title.toLowerCase().includes(q)&&(st==='all'||(st==='done'?t.done:!t.done)));
  $('list').innerHTML=filtered.map(t=>`<li class="${t.done?'done':''}" data-id="${t.id}"><input class="check" aria-label="Mark ${esc(t.title)} complete" type="checkbox" ${t.done?'checked':''}><div><div class="title">${esc(t.title)}</div><div class="meta"><span class="tag">${t.category}</span><span class="tag">${t.priority}</span>${t.due?`<span class="tag">Due ${new Date(t.due+'T00:00').toLocaleDateString()}</span>`:''}<span>${new Date(t.created).toLocaleString()}</span></div></div><button class="delete" aria-label="Delete ${esc(t.title)}">Delete</button></li>`).join('')||'<li>No tasks match your filters.</li>';
  $('summary').textContent=`${tasks.filter(t=>!t.done).length} active • ${tasks.filter(t=>t.done).length} completed • ${tasks.length} total`;
  save();
}
$('taskForm').addEventListener('submit',e=>{
  e.preventDefault();
  const title=$('task').value.trim();
  if(!title)return;
  tasks.unshift({id:Date.now(),title,category:$('category').value,priority:$('priority').value,due:$('due').value,done:false,created:new Date().toISOString()});
  $('task').value='';$('due').value='';render();
});
$('list').addEventListener('click',e=>{
  const li=e.target.closest('[data-id]');if(!li)return;
  const id=Number(li.dataset.id);
  if(e.target.classList.contains('delete'))tasks=tasks.filter(t=>t.id!==id);
  if(e.target.classList.contains('check')){const t=tasks.find(t=>t.id===id);if(t)t.done=e.target.checked}
  render();
});
$('filter').addEventListener('input',render);$('status').addEventListener('change',render);$('clearDone').addEventListener('click',()=>{tasks=tasks.filter(t=>!t.done);render()});
if(!tasks.length)tasks=[{id:1,title:'Review portfolio projects',category:'Work',priority:'High',due:'',done:true,created:new Date().toISOString()},{id:2,title:'Practice Python',category:'Learning',priority:'Normal',due:'',done:false,created:new Date().toISOString()}];
render();
