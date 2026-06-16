(function(){
  if(!window.L2M_CAT||!window.O)return;
  C.vals=C.vals||{};
  function uniq(a){return Array.from(new Set((a||[]).filter(Boolean)))}
  function has(o,c){return o.attrs&&o.attrs.some(function(a){return a.c===na(c)})}
  function ad(o,a){if(o&&o.attrs&&!has(o,a.c))o.attrs.push(a)}
  C.vals.lst_ano_reseau=['aep','aro','chi','hyd','tel','cfa','gaz','chu','ecl','sgn','bta','hta','htb','epl','eus','uni','dei','nde','frv','mlt','multi_reseaux','reseau_indetermine','hors_reseau','fond_de_plan','autre'];
  C.vals.lst_ano_detail_annotation=['information_terrain','precision_geometrique','precision_attributaire','demande_controle','observation_generale','autre'];
  C.vals.lst_ano_detail_detection=['perte_signal','signal_faible','signal_instable','reseau_non_detecte','reseau_detecte_non_representable','profondeur_non_mesurable','doute_detection','interference','autre'];
  C.vals.lst_ano_detail_incoherence=['incoherence_plan_terrain','trace_incoherent','profondeur_incoherente','affleurant_non_aligne','reseau_absent_du_plan','reseau_present_non_repertorie','classe_precision_douteuse','diametre_incoherent','materiau_incoherent','autre'];
  C.vals.lst_ano_detail_acces=['element_bloque','element_non_ouvrable','element_introuvable','zone_inaccessible','stationnement_gene','vegetation','cloture_portail','propriete_privee','acces_securise_impossible','autre'];
  C.vals.lst_ano_detail_contrainte=['danger_immediat','circulation','travaux_en_cours','hauteur_limitee','espace_confine','eau_effluent','sol_instable','meteo','coactivite','autre'];
  O=O.filter(function(o){return ['GEN_ANNOTATION_TERRAIN','GEN_ANOMALIE_DETECTION','GEN_INCOHERENCE_RESEAU','GEN_ACCES_IMPOSSIBLE','GEN_CONTRAINTE_CHANTIER'].indexOf(String(o.code||''))<0 && !/^[A-Z0-9]+_ANOMALIE_DETECTION$/.test(String(o.code||''))});
  if(!C.nets.includes('GEN'))C.nets.unshift('GEN');
  function make(code,lib,type,li){
    add('GEN',code,'Anomalies terrain','equipement','anomalie_'+type);
    var o=O.find(function(x){return x.code===code});if(!o)return;
    o.lib=lib;o.g='Anomalies terrain';o.f='equipement';o.t='anomalie_'+type;o.sel=code.toLowerCase()+'_sel';
    o.files=o.files||{};o.files.bloc_dwg='NOEUD';o.files.icone_palette='Icone/equipement_specifique.png';
    o.attrs=o.attrs||[];
    ad(o,A('ano_type','Texte','Type anomalie','',type,false,true,true,true));
    ad(o,A('ano_reseau','Liste','Reseau concerne','lst_ano_reseau','',true,false,true,true));
    ad(o,A('ano_detail','Liste','Detail anomalie',li,'',true,false,true,true));
    ad(o,A('ano_desc','Texte','Description terrain','','',true,false,true,true));
    ad(o,A('photo','Photo','Photo','','',true,false,false,true));
    o.attrs=o.attrs.filter(function(a){return a.c!=='ano_grav'&&a.c!=='ano_stat'&&a.c!=='ano_type_1'});
    (o.attrs||[]).forEach(function(a){if(a.c==='calque')a.val='ECA_GEN_ANNOTATION';if(a.c==='eqp_type')a.val='anomalie_'+type});
  }
  make('GEN_ANNOTATION_TERRAIN','Annotation terrain','annotation','lst_ano_detail_annotation');
  make('GEN_ANOMALIE_DETECTION','Probleme de detection','detection','lst_ano_detail_detection');
  make('GEN_INCOHERENCE_RESEAU','Incoherence reseau plan','incoherence','lst_ano_detail_incoherence');
  make('GEN_ACCES_IMPOSSIBLE','Acces impossible non leve','acces','lst_ano_detail_acces');
  make('GEN_CONTRAINTE_CHANTIER','Securite contrainte chantier','contrainte','lst_ano_detail_contrainte');
})();