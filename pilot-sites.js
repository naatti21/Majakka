/* Majakka Place-First: sourced pilot catalogue, October 2026.
 * These are real OpenStreetMap object IDs and approximate OSM feature centres,
 * NOT invented point-of-interest IDs or claims about physical access.
 * Provenance: OpenStreetMap features listed in Mapcarta / Wikidata.
 * Region: Tampere + Nokia pilot. World expansion uses live OSM source.
 */
(function(root){
'use strict';
const raw=[
 {sourceId:'way/23704451',name:'Museokeskus Vapriikki',lat:61.50297,lng:23.76029,atlasType:'culture',tags:{tourism:'museum'}},
 {sourceId:'way/88874701',name:'Tampereen tuomiokirkko',lat:61.50249,lng:23.76985,atlasType:'history',tags:{}},
 {sourceId:'way/680725378',name:'Näsinneula',lat:61.50496,lng:23.74329,atlasType:'history',tags:{}},
 {sourceId:'way/88360590',name:'Sara Hildénin taidemuseo',lat:61.50516,lng:23.74078,atlasType:'art',tags:{tourism:'gallery'}},
 {sourceId:'node/4868406530',name:'Muumimuseo',lat:61.49607,lng:23.78290,atlasType:'culture',tags:{tourism:'museum'}},
 {sourceId:'node/10087202868',name:'Hatanpään kartano',lat:61.48339,lng:23.75085,atlasType:'history',tags:{historic:'manor'}},
 {sourceId:'way/87736814',name:'Nokian kirkko',lat:61.47981,lng:23.53205,atlasType:'history',tags:{}},
 {sourceId:'way/1336202931',name:'Hinttalan kotiseutumuseo',lat:61.48050,lng:23.52848,atlasType:'culture',tags:{tourism:'museum'}}
];
const A=root.MajakkaAtlasCore;
const entries=Object.freeze(raw.map(o=>Object.freeze({...o,source:'osm',kind:'atlas-real'})));
root.MajakkaPilotSites={
 entries,
 normalized:()=>A?entries.map(p=>A.normalize(p)).filter(Boolean):[],
 nearby:(center,radius=20000)=>A?entries.map(p=>A.normalize(p)).filter(p=>p&&A.meters(p,center)<=radius):[]
};
})(globalThis);
