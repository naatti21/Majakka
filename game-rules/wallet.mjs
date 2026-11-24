// Gate 1 PR-02 candidate wallet. Pure values only; trusted server time required.
import config from './balance-config.json' with { type: 'json' };
const P = config.parameters;
const HOUR = 3600000;
const DAY = 24 * HOUR;
function amount(n){if(!Number.isSafeInteger(n)||n<0)throw new TypeError('Lumen amount must be a nonnegative safe integer');return n;}
function time(n){if(!Number.isSafeInteger(n)||n<0)throw new TypeError('Trusted UTC milliseconds required');return n;}
export function createWallet(balance=P.wallet_start){
 amount(balance);
 if(balance>P.wallet_cap)throw new RangeError('Wallet exceeds capacity');
 return {balance,earned:[],lastChannelAtMs:null};
}
export function spendLumen(wallet,cost){
 const n=amount(cost);
 if(!wallet||!Number.isSafeInteger(wallet.balance)||wallet.balance<0||wallet.balance>P.wallet_cap)throw new TypeError('Invalid wallet');
 if(wallet.balance<n)return {ok:false,reason:'INSUFFICIENT_LUMEN',wallet};
 return {ok:true,spent:n,wallet:{...wallet,balance:wallet.balance-n}};
}
// This is personal earned income, NOT a claim that a physical grain was verified.
export function grantEarnedLumen(wallet,requested,atMs){
 const n=amount(requested),now=time(atMs);
 if(!wallet||!Array.isArray(wallet.earned)||!Number.isSafeInteger(wallet.balance)||wallet.balance<0||wallet.balance>P.wallet_cap)throw new TypeError('Invalid wallet');
 for(const x of wallet.earned){
  if(!x||!Number.isSafeInteger(x.atMs)||!Number.isSafeInteger(x.amount)||x.amount<=0||x.atMs>now)throw new TypeError('Invalid or future earned Lumen record');
 }
 const window=wallet.earned.filter(x=>now-x.atMs<DAY);
 const earned=window.reduce((sum,x)=>sum+x.amount,0);
 const actual=Math.max(0,Math.min(n,P.wallet_cap-wallet.balance,P.earned_cap_rolling_24h-earned));
 if(actual===0)return {ok:false,reason:'NO_EARNING_CAPACITY',granted:0,wallet};
 return {ok:true,granted:actual,wallet:{...wallet,balance:wallet.balance+actual,earned:[...window,{atMs:now,amount:actual}]}};
}
// Channel does not require GPS. Neither an unsuccessful grant nor a failed
// request consumes the next channel opportunity. The total 24h cap includes
// any separately server-validated physical grain grants.
export function channelLumen(wallet,atMs){
 const now=time(atMs);
 if(wallet.lastChannelAtMs!==null&&wallet.lastChannelAtMs!==undefined){
  time(wallet.lastChannelAtMs);
  if(now<wallet.lastChannelAtMs)throw new RangeError('Clock moved backwards');
  if(now-wallet.lastChannelAtMs<P.channel_cooldown_hours*HOUR)
   return {ok:false,reason:'CHANNEL_COOLDOWN',granted:0,wallet,
    availableAtMs:wallet.lastChannelAtMs+P.channel_cooldown_hours*HOUR};
 }
 const credit=grantEarnedLumen(wallet,P.channel_grant,now);
 if(!credit.ok)return credit;
 return {...credit,wallet:{...credit.wallet,lastChannelAtMs:now}};
}
export const WALLET_LIMITS=Object.freeze({
 start:P.wallet_start,cap:P.wallet_cap,channel:P.channel_grant,
 channelCooldownHours:P.channel_cooldown_hours,earnedRolling24h:P.earned_cap_rolling_24h
});
