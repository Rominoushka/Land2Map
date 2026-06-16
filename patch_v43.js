(function(){
  if(!window.L2M_CAT||!window.O)return;
  C.vals=C.vals||{};
  function uniq(a){return Array.from(new Set((a||[]).filter(Boolean)))}
  function has(o,c){return o.attrs&&o.attrs.some(function(a){return a.c===na(c)})}
  function ad(o,a){if(o&&o.attrs&&!has(o,a.c))o.attrs.push(a)}
  C.vals.lst_ano_detec=['annotation','anomalie_chantier','anomalie_reseau','perte_signal','reseau_non_detecte','incoherence_plan_terrain','acces_impossible','doute_geometrie','doute_profondeur','autre'];
  C.vals.lst_ano_grav=['faible','moyenne','forte','bloquante'];
  C.vals.lst_ano_stat=['a_traiter','transmis','resolu'];
  (C.nets||[]).forEach(function(n){
    var code=n+'_ANOMALIE_DETECTION';
    if(!O.some(function(o){return o.code===code})){
      add(n,code,'Annotations','equipement','anomalie_detection');
    }
    var o=O.find(function(x){return x.code===code});
    if(!o)return;
    o.lib='Anomalie detection';
    o.g='Annotations';
    o.f='equipement';
    o.t='anomalie_detection';
    o.sel=String(n).toLowerCase()+'_anomalie_detection_sel';
    o.files=o.files||{};
    o.files.bloc_dwg='NOEUD';
    o.files.icone_palette='Icone/'+String(n).toLowerCase()+'_equipement_specifique.png';
    o.attrs=o.attrs||[];
    ad(o,A('ano_type','Liste','Type anomalie','lst_ano_detec','',true,false,true,true));
    ad(o,A('ano_desc','Texte','Description terrain','','',true,false,true,true));
    ad(o,A('ano_grav','Liste','Gravite','lst_ano_grav','',true,false,false,true));
    ad(o,A('ano_stat','Liste','Statut','lst_ano_stat','a_traiter',true,false,false,true));
    ad(o,A('photo','Photo','Photo','','',true,false,false,true));
    (o.attrs||[]).forEach(function(a){if(a.c==='calque')a.val='ECA_RSX_'+n+'_ANOMALIE_DETECTION';if(a.c==='eqp_type')a.val='anomalie_detection'});
  });
})();