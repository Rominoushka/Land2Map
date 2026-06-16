(function(){
  if(!window.L2M_CAT||!window.O)return;
  C.vals=C.vals||{};
  function uniq(a){return Array.from(new Set((a||[]).filter(Boolean)))}
  function norm(v){return na(String(v||''))}
  function has(o,c){return o.attrs&&o.attrs.some(function(a){return a.c===na(c)})}
  function ad(o,a){if(o&&o.attrs&&!has(o,a.c))o.attrs.push(a)}
  function rm(o,c){if(o&&o.attrs)o.attrs=o.attrs.filter(function(a){return a.c!==na(c)})}
  function vals(k){return C.vals[k]||C.vals[String(k).toUpperCase()]||[]}
  C.vals.aep_captag=['forage','puits',"prise d'eau"];
  C.vals.lst_eqp_spec_aep=uniq(vals('lst_eqp_spec_aep').filter(function(v){return norm(v)!=='coffret'}).concat(['compteur']));
  C.vals.lst_eqp_spec_aro=uniq(vals('lst_eqp_spec_aro').concat(['electrovanne']));
  if(C.pts&&C.pts.AEP){C.pts.AEP=uniq(C.pts.AEP.split(/\s+/).filter(function(x){return x&&x!=='COMPTEUR'&&x!=='PUITS'}).concat(['POSTE_POMPAGE','RESERVOIR','STATION_TRAITEMENT','CAPTAGE'])).join(' ')}
  if(C.pts&&C.pts.ARO){C.pts.ARO=uniq(C.pts.ARO.split(/\s+/).filter(function(x){return x&&x!=='ELECTROVANNE'})).join(' ')}
  O=O.filter(function(o){return ['AEP_COMPTEUR','AEP_PUITS','ARO_ELECTROVANNE'].indexOf(o.code)<0});
  function ensure(code,lib,type){if(!O.some(function(o){return o.code===code})){add('AEP',code,'Ouvrages','ouvrage',type);let o=O.find(function(x){return x.code===code});if(o)o.lib=lib}}
  ensure('AEP_POSTE_POMPAGE','Poste de pompage','poste_pompage');
  ensure('AEP_RESERVOIR','Reservoir','reservoir');
  ensure('AEP_STATION_TRAITEMENT','Station de traitement','station_traitement');
  ensure('AEP_CAPTAGE','Captage','captage');
  let cap=O.find(function(o){return o.code==='AEP_CAPTAGE'});rm(cap,'ouv_lst1');ad(cap,A('aep_captag','Liste','Type de captage','aep_captag','',true,false,false,true));
  let cof=O.find(function(o){return o.code==='AEP_COFFRET'});ad(cof,A('pt_livr','Booleen','Point de livraison','','',true,false,false,true));
  O.forEach(function(o){
    if(o.t==='equipement_specifique'||/_EQUIPEMENT_SPECIFIQUE$/.test(o.code||'')){
      let r=String(o.n||o.reseau||'').toLowerCase();
      let li='lst_eqp_spec_'+r;
      C.vals[li]=uniq(vals(li).concat(vals('lst_eqp_spec')));
      (o.attrs||[]).forEach(function(a){if(a.c==='eqp_spec')a.li=li});
    }
  });
  O.forEach(function(o){
    let t=String(o.t||'');let c=String(o.code||'');
    let need=(t==='armoire'||t==='coffret'||t.indexOf('regard_')===0||t.indexOf('chambre')>=0||t.indexOf('boite')>=0||t.indexOf('poste')>=0||t.indexOf('station')>=0||t.indexOf('reservoir')>=0||t.indexOf('captage')>=0||c.indexOf('_CHAMBRE')>=0||c.indexOf('_BOITE_BRANCHEMENT')>=0||c.indexOf('_POSTE_')>=0||c.indexOf('_STATION_')>=0||c.indexOf('_RESERVOIR')>=0||c.indexOf('_CAPTAGE')>=0);
    if(need)ad(o,A('photo','Photo','Photo','','',true,false,false,true));
  });
})();