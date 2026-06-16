var _ffiles_noeud=ffiles;
ffiles=function(o){
  var r=_ffiles_noeud(o);
  if(o && String(o.code||'').endsWith('_EQUIPEMENT_SPECIFIQUE')) r.bloc_dwg='NOEUD';
  return r;
};
function expJSON(){deliver('land2map_validation_v23.json',JSON.stringify({version:'v37',date:new Date().toISOString(),objets:O.map(patch)},null,2))}
