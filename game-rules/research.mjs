// Gate 1 PR-02: server-approved, genuinely distinct proof stages.
// This module never accepts a client's "correct:true" or arbitrary credit.
// Stage authoring and validation belong to Gate 2; the trusted server injects
// approved grant records into the state, never into the action request.
import config from './balance-config.json' with { type: 'json' };
const P=config.parameters;
export const RESEARCH_STAGES=Object.freeze(['survey','compare','interpret']);
export function researchKey(actorId,nodeId,stage){
 if(!RESEARCH_STAGES.includes(stage))throw new RangeError('Unknown node research stage');
 return JSON.stringify([actorId,nodeId,stage]);
}
export function verifiedResearchGrant(state,actorId,nodeId,stage){
 const key=researchKey(actorId,nodeId,stage);
 return state?.researchGrants?.[key]===true;
}
export function researchCreditUnits(){
 return Math.round(P.node_research_delta_each*10000);
}
export function researchCost(){return P.node_research_cost_each;}
export function validateResearchConfig(){
 if(RESEARCH_STAGES.length!==P.node_research_ways || RESEARCH_STAGES.length*P.node_research_delta_each>1)
  throw new RangeError('Research stage configuration violates contribution limits');
}
validateResearchConfig();
