(function(){
  O=O.filter(function(o){return o.code!='BTA_APPUI'&&o.code!='HTA_APPUI'&&!(o.n=='ECL'&&o.t=='fourreau')});
  if(C.lin&&C.lin.ECL)C.lin.ECL=C.lin.ECL.filter(function(x){return String(x).toUpperCase()!='FOURREAU'});
  var vals=C.vals||{};
  Object.keys(vals).forEach(function(k){var nk=na(k);if(nk!==k){vals[nk]=vals[k];delete vals[k];}});
  vals.lst_sup_materiau=['Acier','Aluminium','Bois','Béton','Composite','Fonte','Inconnu'];
  vals.lst_type_point_lumineux=['LED','Halogène','Sodium','Iodure métallique','Fluorescent','Incandescent','Inconnu'];
  C.vals=vals;
  function has(o,c){return o.attrs.some(function(a){return a.c==na(c)})}
  function add(o,a){if(!has(o,a.c))o.attrs.push(a)}
  O.forEach(function(o){
    o.attrs=o.attrs.map(function(a){a.c=na(a.c);a.li=a.li?na(a.li):'';return a});
    if(o.f=='support'){
      add(o,A('sup_haut','Nombre','Hauteur support','','',true,false,false,true));
      add(o,A('sup_mat','Liste','Matériau support','lst_sup_materiau','',true,false,false,true));
    }
    if(o.t=='candelabre_multiple'){
      add(o,A('nb_pl','Nombre','Nombre de points lumineux','','',true,false,false,true));
      add(o,A('typ_pl','Liste','Type de point lumineux','lst_type_point_lumineux','',true,false,false,true));
    }
  });
})();
var _ffiles_noeud=ffiles;
ffiles=function(o){
  var r=_ffiles_noeud(o);
  if(o && String(o.code||'').endsWith('_EQUIPEMENT_SPECIFIQUE')) r.bloc_dwg='NOEUD';
  return r;
};
function expJSON(){deliver('land2map_validation_v37.json',JSON.stringify({version:'v37',date:new Date().toISOString(),objets:O.map(patch)},null,2))}
