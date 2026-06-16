(function(){
  O=O.filter(function(o){return o.code!='BTA_APPUI'&&o.code!='HTA_APPUI'&&o.code!='AEP_COMPTEUR'&&o.code!='ARO_ELECTROVANNE'&&!(o.n=='ECL'&&o.t=='fourreau')&&!(o.n=='TEL'&&o.t=='fourreau')});
  if(C.lin&&C.lin.ECL)C.lin.ECL=C.lin.ECL.filter(function(x){return String(x).toUpperCase()!='FOURREAU'});
  if(C.lin&&C.lin.TEL)C.lin.TEL=C.lin.TEL.filter(function(x){return String(x).toUpperCase()!='FOURREAU'});
  if(C.pts&&C.pts.AEP){
    var aepPts=C.pts.AEP.split(/\s+/).filter(Boolean).filter(function(x){return x!='COMPTEUR'&&x!='PUITS'});
    ['ARMOIRE','POSTE_POMPAGE','RESERVOIR','STATION_TRAITEMENT','CAPTAGE'].forEach(function(x){if(aepPts.indexOf(x)<0)aepPts.push(x)});
    C.pts.AEP=aepPts.join(' ');
  }
  if(C.pts&&C.pts.ARO){
    C.pts.ARO=C.pts.ARO.split(/\s+/).filter(Boolean).filter(function(x){return x!='ELECTROVANNE'}).join(' ');
  }
  function exists(code){return O.some(function(o){return o.code==code})}
  if(!exists('AEP_ARMOIRE'))add('AEP','AEP_ARMOIRE','Equipements','equipement','armoire');
  if(!exists('AEP_POSTE_POMPAGE'))add('AEP','AEP_POSTE_POMPAGE','Ouvrages','ouvrage','poste_pompage');
  if(!exists('AEP_RESERVOIR'))add('AEP','AEP_RESERVOIR','Ouvrages','ouvrage','reservoir');
  if(!exists('AEP_STATION_TRAITEMENT'))add('AEP','AEP_STATION_TRAITEMENT','Ouvrages','ouvrage','station_traitement');
  if(!exists('AEP_CAPTAGE'))add('AEP','AEP_CAPTAGE','Ouvrages','ouvrage','captage');
  var vals=C.vals||{};
  Object.keys(vals).forEach(function(k){var nk=na(k);if(nk!==k){vals[nk]=vals[k];delete vals[k];}});
  vals.lst_sup_materiau=['Acier','Aluminium','Bois','Béton','Composite','Fonte','Inconnu'];
  vals.lst_type_point_lumineux=['LED','Halogène','Sodium','Iodure métallique','Fluorescent','Incandescent','Inconnu'];
  vals.lst_can_mat=['pvc','pvca','pehd','acier','be','inc'];
  vals.aep_captag=['forage','puits',"prise d'eau"];
  vals.lst_eqp_spec_aep=(vals.lst_eqp_spec_aep||[]).filter(function(v){return ['coffret'].indexOf(String(v).toLowerCase())<0});
  if(vals.lst_eqp_spec_aep.indexOf('compteur')<0)vals.lst_eqp_spec_aep.push('compteur');
  vals.lst_eqp_spec_aro=(vals.lst_eqp_spec_aro||[]).filter(function(v){return String(v).toLowerCase()!='electrovanne'});
  vals.lst_eqp_spec_aro.push('electrovanne');
  C.vals=vals;
  function has(o,c){return o.attrs.some(function(a){return a.c==na(c)})}
  function addAttr(o,a){if(!has(o,a.c))o.attrs.push(a)}
  O.forEach(function(o){
    o.attrs=o.attrs.map(function(a){a.c=na(a.c);a.li=a.li?na(a.li):'';return a});
    if(o.f=='support'){
      addAttr(o,A('sup_haut','Nombre','Hauteur support','','',true,false,false,true));
      addAttr(o,A('sup_mat','Liste','Matériau support','lst_sup_materiau','',true,false,false,true));
    }
    if(o.t=='candelabre_multiple'){
      addAttr(o,A('nb_pl','Nombre','Nombre de points lumineux','','',true,false,false,true));
      addAttr(o,A('typ_pl','Liste','Type de point lumineux','lst_type_point_lumineux','',true,false,false,true));
    }
    if(o.n=='AEP'&&o.t=='canalisation'){
      addAttr(o,A('trc_mat','Liste','Matériau canalisation','lst_can_mat','',true,false,true,true));
    }
    if(o.code=='AEP_COFFRET'){
      addAttr(o,A('pt_livr','Booléen','Point de livraison','','',true,false,false,true));
    }
    if(o.code=='AEP_CAPTAGE'){
      addAttr(o,A('ouv_captag','Liste','Type de captage','aep_captag','',true,false,true,true));
    }
    if(o.t=='armoire'||o.t=='coffret'||String(o.t).indexOf('regard_')==0){
      addAttr(o,A('photo','Photo','Photo','','',true,false,false,true));
    }
  });
})();
var extraBlocks1={AEP_CHAMBRE:'REGARD_RECTANGULAIRE',AEP_ARMOIRE:'ARMOIRE',DEI_BOUCHE_INCENDIE_BI:'REGARD_RECTANGULAIRE',EUS_BOITE_BRANCHEMENT:'REGARD_RECTANGULAIRE',EUS_POSTE_RELEVAGE:'REGARD_CIRCULAIRE',EPL_BOITE_BRANCHEMENT:'REGARD_RECTANGULAIRE',EPL_POSTE_RELEVAGE:'REGARD_CIRCULAIRE',EPL_EXUTOIRE:'NOEUD',EPL_BASSIN_RETENTION:'NOEUD',EPL_PUISARD:'PUITS',EPL_TETE_BUSE:'AQUEDUC',EPL_AVALOIR:'AVALOIR_TAMPON',EPL_GRILLE_AVALOIR:'AVALOIR_GRILLE'};
var _ffiles_noeud=ffiles;
ffiles=function(o){
  var r=_ffiles_noeud(o);
  if(o&&extraBlocks1[o.code])r.bloc_dwg=extraBlocks1[o.code];
  if(o && String(o.code||'').endsWith('_EQUIPEMENT_SPECIFIQUE')) r.bloc_dwg='NOEUD';
  return r;
};
function expJSON(){deliver('land2map_validation_v41.json',JSON.stringify({version:'v41',date:new Date().toISOString(),objets:O.map(patch)},null,2))}