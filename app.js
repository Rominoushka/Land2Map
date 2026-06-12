const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const STORE_KEY = 'land2map_palette_state_v1';
const GIT_KEY = 'land2map_git_settings_v1';
let DATA, state, currentNet, selectedUid;

async function boot(){
  DATA = await fetch('data/palette_data.json').then(r=>r.json());
  state = loadLocalState();
  currentNet = Object.keys(DATA.netCounts)[0] || 'AEP';
  initFilters();
  bindGlobal();
  render();
}

function loadLocalState(){
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {items:{},lists:{}}; }
  catch { return {items:{},lists:{}}; }
}
function saveLocal(){
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}
function itemState(o){ return state.items[o.uid] || {}; }
function merged(o){ return {...o, ...itemState(o), attrs: itemState(o).attrs || o.attrs || []}; }
function setItem(uid, patch){ state.items[uid] = {...(state.items[uid]||{}), ...patch}; saveLocal(); render(); }
function decisionOf(o){ return merged(o).decision || 'À valider'; }
function statusClass(v){
  v = String(v||'').toLowerCase();
  if(v.includes('ok') || v === 'validé') return 'ok';
  if(v.includes('revoir') || v.includes('corriger') || v.includes('contrôle')) return 'warn';
  if(v.includes('manquant') || v.includes('invalide') || v.includes('exclu')) return 'bad';
  return '';
}
function esc(s){ return String(s ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function initFilters(){
  const groups = [...new Set(DATA.objects.map(o=>o.groupe_palette).filter(Boolean))].sort();
  $('#groupFilter').insertAdjacentHTML('beforeend', groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join(''));
}
function bindGlobal(){
  $('#search').addEventListener('input', renderMain);
  $('#decisionFilter').addEventListener('change', renderMain);
  $('#groupFilter').addEventListener('change', renderMain);
  $('#exportBtn').addEventListener('click', exportState);
  $('#syncBtn').addEventListener('click', openSync);
  $$('#editDialog .tabs button').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  $('#saveSettingsBtn').addEventListener('click', saveGitSettings);
  $('#loadGitBtn').addEventListener('click', loadFromGit);
  $('#saveGitBtn').addEventListener('click', saveToGit);
}

function render(){ renderStats(); renderNav(); renderMain(); }
function filteredObjects(){
  const q = $('#search').value.trim().toLowerCase();
  const dec = $('#decisionFilter').value;
  const grp = $('#groupFilter').value;
  return DATA.objects.filter(o=>{
    const m = merged(o);
    if(o.reseau !== currentNet) return false;
    if(dec && decisionOf(o) !== dec) return false;
    if(grp && o.groupe_palette !== grp) return false;
    if(q){
      const hay = [o.reseau,o.code,o.libelle,o.selection_attendue,o.calque,o.bloc_dwg,o.famille_mcd,o.type_mcd].join(' ').toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}
function allMerged(){ return DATA.objects.map(merged); }
function renderStats(){
  const all = allMerged();
  const counts = {total:all.length, ok:0, corr:0, excl:0, todo:0};
  all.forEach(o=>{ const d=decisionOf(o); if(d==='Validé') counts.ok++; else if(d==='À corriger') counts.corr++; else if(d==='Exclu') counts.excl++; else counts.todo++; });
  $('#stats').innerHTML = `
    <div class="stat"><b>${counts.total}</b><span>Objets</span></div>
    <div class="stat"><b>${counts.todo}</b><span>À valider</span></div>
    <div class="stat"><b>${counts.ok}</b><span>Validés</span></div>
    <div class="stat"><b>${counts.corr}</b><span>À corriger</span></div>`;
}
function renderNav(){
  const countsByNet = {};
  allMerged().forEach(o=>{ countsByNet[o.reseau] ||= {total:0, rest:0}; countsByNet[o.reseau].total++; if(decisionOf(o)==='À valider') countsByNet[o.reseau].rest++; });
  $('#netNav').innerHTML = Object.keys(DATA.netCounts).map(net=>{
    const label = DATA.netLabels[net] || net;
    const rest = countsByNet[net]?.rest || 0;
    return `<button class="net ${net===currentNet?'active':''}" data-net="${esc(net)}"><strong>${esc(net)}</strong><small>${esc(label.replace(/^\w+\s*-\s*/,''))}</small><span class="pill ${rest?'bad':'ok'}">${rest}</span></button>`;
  }).join('');
  $$('#netNav .net').forEach(b=>b.addEventListener('click',()=>{currentNet=b.dataset.net; render();}));
}
function renderMain(){
  renderStats();
  const objs = filteredObjects();
  const label = DATA.netLabels[currentNet] || currentNet;
  const byGroup = groupBy(objs, o=>o.groupe_palette || 'Autres');
  let html = `<div class="net-head"><h2>${esc(label)}</h2><p>${objs.length} objet(s) affiché(s). Validation rapide par Valider / Corriger / Exclure.</p></div>`;
  Object.entries(byGroup).forEach(([g, arr])=>{
    html += `<h3 class="section-title">${esc(g)} · ${arr.length}</h3><div class="cards">${arr.map(cardHtml).join('')}</div>`;
  });
  $('#main').innerHTML = html || '<p>Aucun objet.</p>';
  bindCards();
}
function groupBy(arr, fn){ return arr.reduce((a,x)=>{ const k=fn(x); (a[k]||=[]).push(x); return a; },{}); }
function cardHtml(o){
  const m = merged(o), d = decisionOf(o), cls = d==='Validé'?'ok':d==='À corriger'?'warn':d==='Exclu'?'bad':statusClass(o.statut_global);
  const iconText = (o.reseau||'?').slice(0,3);
  const block = m.bloc_dwg || o.bloc_dwg || '-';
  return `<article class="card ${cls}" data-uid="${esc(o.uid)}">
    <div class="icon" title="Déposer une icône ici">${iconText}</div>
    <div><div class="title">${esc(o.libelle)}</div><div class="code">${esc(o.code)}</div>
      <div class="pills"><span class="pill ${statusClass(o.statut_selection)}">${esc(o.statut_selection)}</span><span class="pill ${statusClass(o.statut_icone)}">${esc(o.statut_icone)}</span><span class="pill ${statusClass(o.statut_dwg)}">${esc(o.statut_dwg)}</span><span class="pill">${esc(o.famille_mcd)} / ${esc(o.type_mcd)}</span></div>
    </div>
    <div class="mini">SEL : <b>${esc(m.selection_attendue||'-')}</b><br>DWG : ${esc(block)}</div>
    <div class="card-actions">
      <button data-action="Validé">Valider</button><button data-action="À corriger">Corriger</button><button data-action="Exclu">Exclure</button><button data-edit>Modifier</button>
    </div>
  </article>`;
}
function bindCards(){
  $$('.card').forEach(card=>{
    const uid=card.dataset.uid;
    card.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation(); setItem(uid,{decision:b.dataset.action});}));
    card.querySelector('[data-edit]').addEventListener('click',e=>{e.stopPropagation(); openEdit(uid);});
    const icon=card.querySelector('.icon');
    icon.addEventListener('dragover',e=>{e.preventDefault(); icon.classList.add('drop');});
    icon.addEventListener('dragleave',()=>icon.classList.remove('drop'));
    icon.addEventListener('drop',e=>{e.preventDefault(); icon.classList.remove('drop'); const f=e.dataTransfer.files[0]; if(f) setItem(uid,{icone:f.name, decision:'À corriger'});});
  });
}
function openEdit(uid){ selectedUid=uid; switchTab('general'); renderDialog(); $('#editDialog').showModal(); }
function switchTab(tab){
  $$('#editDialog .tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  $$('#editDialog .tab').forEach(t=>t.classList.toggle('active',t.id===`tab-${tab}`));
}
function renderDialog(){
  const o=DATA.objects.find(x=>x.uid===selectedUid), m=merged(o);
  $('#dialogTitle').textContent = `${o.code} · ${o.libelle}`;
  $('#dialogSub').textContent = `${o.reseau} / ${o.groupe_palette} / ${o.famille_mcd} / ${o.type_mcd}`;
  $('#tab-general').innerHTML = `<div class="form-grid">
    <label>Décision<select id="editDecision"><option>À valider</option><option>Validé</option><option>À corriger</option><option>Exclu</option></select></label>
    <label>Priorité<input id="editPriorite" value="${esc(m.priorite||'')}"></label>
    <label>Sélection attendue<input id="editSel" value="${esc(m.selection_attendue||'')}"></label>
    <label>Calque<input id="editCalque" value="${esc(m.calque||'')}"></label>
    <label>Icône<input id="editIcone" value="${esc(m.icone||'')}"></label>
    <label>Bloc DWG<input id="editDwg" value="${esc(m.bloc_dwg||'')}"></label>
    <label class="full">Commentaire<textarea id="editComment" rows="4">${esc(m.commentaire_validation||'')}</textarea></label>
    <div class="full drop" id="dwgDrop">Déposer ici un bloc DWG ou une icône pour renseigner le nom du fichier.</div>
  </div><div class="actions"><button id="saveGeneral" class="primary">Enregistrer</button></div>`;
  $('#editDecision').value = decisionOf(o);
  $('#saveGeneral').addEventListener('click',()=>setItem(selectedUid,{decision:$('#editDecision').value,priorite:$('#editPriorite').value,selection_attendue:$('#editSel').value,calque:$('#editCalque').value,icone:$('#editIcone').value,bloc_dwg:$('#editDwg').value,commentaire_validation:$('#editComment').value}));
  const dz=$('#dwgDrop'); dz.addEventListener('dragover',e=>e.preventDefault()); dz.addEventListener('drop',e=>{e.preventDefault(); const f=e.dataTransfer.files[0]; if(!f)return; if(f.name.toLowerCase().endsWith('.dwg')) $('#editDwg').value=f.name; else $('#editIcone').value=f.name;});
  renderAttrs(o,m); renderLists(m);
}
function renderAttrs(o,m){
  const attrs = m.attrs || [];
  $('#tab-attrs').innerHTML = `<div class="actions"><button id="addAttr">Ajouter attribut</button><button id="saveAttrs" class="primary">Enregistrer attributs</button></div><div class="table-wrap"><table><thead><tr><th>Champ</th><th>Type</th><th>Libellé</th><th>Oblig.</th><th>Liste</th><th>Valeur forcée</th><th>Visible</th><th>Éditable</th><th></th></tr></thead><tbody id="attrsBody">${attrs.map((a,i)=>attrRow(a,i)).join('')}</tbody></table></div>`;
  $('#addAttr').addEventListener('click',()=>{$('#attrsBody').insertAdjacentHTML('beforeend',attrRow({champ:'',type_donnee:'Texte',libelle_attribut:'',obligatoire:'Non',liste_reference:'',valeur_forcee:'',visible:'Oui',editable:'Oui',verrouille:'Non'}, Date.now()));});
  $('#saveAttrs').addEventListener('click',()=>{ const out=$$('#attrsBody tr').map(tr=>Object.fromEntries($$('input,select',tr).map(i=>[i.dataset.k,i.value]))); setItem(selectedUid,{attrs:out,decision:'À corriger'}); });
  $('#attrsBody').addEventListener('click',e=>{ if(e.target.dataset.del) e.target.closest('tr').remove(); });
}
function attrRow(a,i){
  const sel=(v,on)=>`<select data-k="${on}"><option ${v==='Oui'?'selected':''}>Oui</option><option ${v==='Non'?'selected':''}>Non</option></select>`;
  return `<tr><td><input data-k="champ" value="${esc(a.champ)}"></td><td><input data-k="type_donnee" value="${esc(a.type_donnee)}"></td><td><input data-k="libelle_attribut" value="${esc(a.libelle_attribut)}"></td><td>${sel(a.obligatoire,'obligatoire')}</td><td><input data-k="liste_reference" value="${esc(a.liste_reference)}"></td><td><input data-k="valeur_forcee" value="${esc(a.valeur_forcee)}"></td><td>${sel(a.visible,'visible')}</td><td>${sel(a.editable,'editable')}</td><td><button data-del="${i}">Supprimer</button></td><input type="hidden" data-k="verrouille" value="${esc(a.verrouille||'Non')}"></tr>`;
}
function renderLists(m){
  const names = [...new Set((m.attrs||[]).map(a=>a.liste_reference).filter(Boolean))];
  $('#tab-lists').innerHTML = names.length ? names.map(name=>listHtml(name)).join('') : '<p>Aucune liste appelée.</p>';
  $$('#tab-lists [data-save-list]').forEach(btn=>btn.addEventListener('click',()=>{
    const name=btn.dataset.saveList; const values=$(`#list-${cssId(name)}`).value.split('\n').map(x=>x.trim()).filter(Boolean);
    state.lists[name]=values; saveLocal(); alert('Liste sauvegardée localement et répercutée dans l’export.');
  }));
}
function listValues(name){ return state.lists[name] || DATA.listRegistry?.[name] || []; }
function listHtml(name){ const vals=listValues(name); return `<div class="list-card"><h3>${esc(name)}</h3><p>${usageOfList(name)} attribut(s) utilisent cette liste.</p><textarea id="list-${cssId(name)}" rows="8" style="width:100%">${esc(vals.join('\n'))}</textarea><div class="actions"><button data-save-list="${esc(name)}">Enregistrer cette liste</button></div></div>`; }
function usageOfList(name){ return DATA.objects.reduce((n,o)=> n + (o.attrs||[]).filter(a=>a.liste_reference===name).length,0); }
function cssId(s){ return String(s).replace(/[^a-zA-Z0-9_-]/g,'_'); }

function exportState(){
  const blob = new Blob([JSON.stringify(buildSavePayload(), null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='validation_palette_land2map.json'; a.click(); URL.revokeObjectURL(a.href);
}
function buildSavePayload(){ return {version:1,updatedAt:new Date().toISOString(),items:state.items||{},lists:state.lists||{},meta:{objects:DATA.objects.length,app:'Land2Map programmation palette'}}; }

function gitSettings(){ try{return JSON.parse(localStorage.getItem(GIT_KEY))||{};}catch{return{};} }
function openSync(){ const s=gitSettings(); $('#repoInput').value=s.repo||'Rominoushka/Land2Map'; $('#branchInput').value=s.branch||'main'; $('#statePathInput').value=s.path||'data/validation_state.json'; $('#tokenInput').value=s.token||''; $('#syncLog').textContent=''; $('#syncDialog').showModal(); }
function saveGitSettings(){ localStorage.setItem(GIT_KEY, JSON.stringify({repo:$('#repoInput').value,branch:$('#branchInput').value,path:$('#statePathInput').value,token:$('#tokenInput').value})); logSync('Paramètres mémorisés.'); }
function logSync(s){ $('#syncLog').textContent += s + '\n'; }
async function ghFetch(url, options={}){
  const token=$('#tokenInput').value.trim(); if(!token) throw new Error('Token GitHub manquant.');
  const res = await fetch(url,{...options,headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})}});
  if(!res.ok){ const t=await res.text(); throw new Error(`${res.status} ${res.statusText} · ${t}`); }
  return res.json();
}
async function loadFromGit(){
  saveGitSettings(); const {repo,branch,path}=gitSettings();
  try{ logSync('Chargement Git…'); const c=await ghFetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`); const txt=decodeURIComponent(escape(atob(c.content.replace(/\n/g,'')))); state=JSON.parse(txt); saveLocal(); render(); logSync('État chargé depuis Git.'); }
  catch(e){ logSync('Erreur : '+e.message); }
}
async function saveToGit(){
  saveGitSettings(); const {repo,branch,path}=gitSettings();
  try{ logSync('Lecture du SHA courant…'); let sha=null; try{ const c=await ghFetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`); sha=c.sha; }catch(e){ logSync('Fichier absent, création.'); }
    const payload=buildSavePayload();
    const content=btoa(unescape(encodeURIComponent(JSON.stringify(payload,null,2))));
    logSync('Commit en cours…');
    await ghFetch(`https://api.github.com/repos/${repo}/contents/${path}`,{method:'PUT',body:JSON.stringify({message:`Sauvegarde validation palette Land2Map ${new Date().toISOString()}`,content,branch,sha})});
    logSync('Sauvegarde Git terminée.');
  }catch(e){ logSync('Erreur : '+e.message); }
}

boot().catch(e=>{ document.body.innerHTML='<pre>'+esc(e.stack||e.message)+'</pre>'; });
