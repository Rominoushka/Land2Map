(function(){
  if(!window.O||!window.C)return;
  const GROUPS=[['Transversal',['GEN']],['Eau',['AEP','ARO','HYD','DEI']],['Assainissement',['EUS','EPL','UNI']],['Electricite / eclairage',['BTA','HTA','HTB','ECL']],['Telecom / signalisation',['TEL','CFA','SGN']],['Autres reseaux',['GAZ','CHI','CHU','NDE','FRV','MLT']]];
  function fileInfo(o){try{return typeof ffiles==='function'?ffiles(o):(files(o)||{})}catch(e){return files(o)||{}}}
  function listOK(o){let ar=aa(o);let bad=ar.filter(a=>a.li&&!C.vals[a.li]);return bad.length===0}
  function needsBloc(o){return o.f!=='troncon'}
  function status(o){let f=fileInfo(o),ar=aa(o),bloc=!needsBloc(o)||!!f.bloc_dwg,ico=!!(f.icone_palette||f.icone_bloc),sel=!!o.sel,lst=listOK(o);if(bloc&&ico&&sel&&lst)return'Prêt';if(!bloc||!ico||!sel||!lst)return'Incomplet';return'A compléter'}
  function dashboard(){
    let sansBloc=O.filter(o=>needsBloc(o)&&!fileInfo(o).bloc_dwg).length;
    let sansIcone=O.filter(o=>!(fileInfo(o).icone_palette||fileInfo(o).icone_bloc)).length;
    let sansSel=O.filter(o=>!o.sel).length;
    let lstGen=O.filter(o=>aa(o).some(a=>a.li==='lst_eqp_spec')).length;
    let arb=O.filter(o=>['A valider','A corriger'].includes(deci(o))).length;
    return '<div class=stat><b>Tableau de bord</b><div class=dash>'+
      '<div class=metric><b>'+sansBloc+'</b><span>Sans bloc</span></div>'+
      '<div class=metric><b>'+sansIcone+'</b><span>Sans icône</span></div>'+
      '<div class=metric><b>'+sansSel+'</b><span>Sans sélection</span></div>'+
      '<div class=metric><b>'+lstGen+'</b><span>Listes génériques</span></div>'+
      '<div class=metric><b>'+arb+'</b><span>À verrouiller</span></div>'+
      '</div></div>';
  }
  stamp=function(){let v=(window.L2M_MANIFEST&&window.L2M_MANIFEST.version)||'v47';stats.innerHTML='<div class=stat><b>'+O.length+'</b><span class=versionpill>'+v+'</span><div class=muted>Objets</div><div class=muted>Enregistré localement : '+new Date().toLocaleTimeString()+'</div></div>'+dashboard()}
  render=function(){
    grp.innerHTML='<option value="">Tous groupes</option>'+[...new Set(O.map(o=>o.g))].map(g=>'<option>'+g+'</option>').join('');
    let used=new Set(C.nets||[]);let html=GROUPS.map(([label,nets])=>{let b=nets.filter(n=>used.has(n));if(!b.length)return'';return '<div class=navgrp><h4>'+label+'</h4>'+b.map(n=>'<button class="'+(n==cur?'on':'')+'" data-n="'+n+'">'+n+'<br><span class=muted>'+(C.names[n]||n)+'</span></button>').join('')+'</div>'}).join('');
    let rest=[...(C.nets||[])].filter(n=>!GROUPS.some(g=>g[1].includes(n)));if(rest.length)html+='<div class=navgrp><h4>Non classés</h4>'+rest.map(n=>'<button class="'+(n==cur?'on':'')+'" data-n="'+n+'">'+n+'<br><span class=muted>'+(C.names[n]||n)+'</span></button>').join('')+'</div>';
    nav.innerHTML=html;$$('#nav button').forEach(b=>b.onclick=()=>{cur=b.dataset.n;draw()});stamp();draw();
  }
  draw=function(){
    let s=q.value.toLowerCase();let arr=O.filter(o=>o.n==cur&&(!grp.value||o.g==grp.value)&&(!dec.value||deci(o)==dec.value)&&(!s||[o.code,o.lib,o.sel,fileInfo(o).bloc_dwg,fileInfo(o).icone_palette,fileInfo(o).icone_bloc,status(o)].join(' ').toLowerCase().includes(s)));
    let by={};arr.forEach(o=>(by[o.g]??=[]).push(o));main.innerHTML='<div class=head><b>'+cur+' - '+(C.names[cur]||cur)+'</b> <small>'+arr.length+' objets affichés</small></div>'+Object.entries(by).map(([g,a])=>'<h3>'+g+' '+a.length+'</h3><div class=cards>'+a.map(card).join('')+'</div>').join('');
    $$('[data-open]').forEach(b=>b.onclick=()=>openPop(b.dataset.open));$$('[data-d]').forEach(b=>b.onclick=()=>setD(b.dataset.c,b.dataset.d));stamp();
  }
  card=function(o){
    let ar=aa(o),f=fileInfo(o),vis=ar.filter(x=>x.vis).length,fo=ar.filter(x=>x.fo).length,stt=status(o);
    let cls=deci(o)=='Valide'?'ready':deci(o)=='A corriger'?'todo':deci(o)=='Ignoré'?'bad':(stt==='Prêt'?'ready':(stt==='Incomplet'?'incomplete':''));
    let b=(txt,ok,kind)=>'<span class="badge '+(kind||(ok?'ok':'bad'))+'">'+txt+'</span>';
    let badges='<div class=badgebar>'+b(o.f=='troncon'?'Linéaire':'Ponctuel',true,'info')+b('Bloc '+(!needsBloc(o)?'non requis':(f.bloc_dwg||'manquant')),!needsBloc(o)||!!f.bloc_dwg)+b('Icône',!!(f.icone_palette||f.icone_bloc))+b('Sélection',!!o.sel)+b('Listes',listOK(o))+(ar.some(a=>a.c==='photo')?b('Photo',true,'info'):'')+(fo?b('Forcé '+fo,true,'info'):'')+b(stt,stt==='Prêt',stt==='Prêt'?'ok':'warn')+'</div>';
    return '<article class="card '+cls+'"><b>'+o.lib+'</b><div class=code>'+o.code+'</div>'+badges+'<span class=pill>'+o.f+'/'+o.t+'</span>'+(o.v?'<span class=pill>'+o.v+'</span>':'')+'<div class=mutedline>SEL '+o.sel+'<br>ATTR '+ar.length+' - visibles '+vis+' - forcés '+fo+'<br>DWG '+(f.bloc_dwg||'-')+'<br>ICO '+(f.icone_palette||f.icone_bloc||'-')+'</div><button data-d="Valide" data-c="'+o.code+'">Valider</button><button data-d="A corriger" data-c="'+o.code+'">Corriger</button><button data-d="Ignoré" data-c="'+o.code+'">Ignorer</button><button data-open="'+o.code+'">Attributs / listes</button></article>';
  }
})();