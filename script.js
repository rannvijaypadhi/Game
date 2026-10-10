"use strict";

const companyData = {
  AAPL:{name:"Apple",sector:"Technology",volatility:.25,deathYear:null,events:{},prices:{},currentPrice:100},
  MSFT:{name:"Microsoft",sector:"Technology",volatility:.20,deathYear:null,events:{},prices:{},currentPrice:100},
  JPM:{name:"JPMorgan",sector:"Finance",volatility:.22,deathYear:null,events:{},prices:{},currentPrice:100},
  GOOG:{name:"Google",sector:"Technology",volatility:.25,deathYear:null,events:{},prices:{},currentPrice:100},
  DODGE:{name:"Dodge Motors",sector:"Automotive",volatility:.28,deathYear:null,events:{},prices:{},currentPrice:100},
  NFLX:{name:"Netflix",sector:"Entertainment",volatility:.30,deathYear:null,events:{},prices:{},currentPrice:100},
  WMT:{name:"Walmart",sector:"Retail",volatility:.10,deathYear:null,events:{},prices:{},currentPrice:100},
  GHOSTBUSTERS:{name:"Ghostbusters Inc.",sector:"Entertainment",volatility:.20,deathYear:1999,events:{},prices:{},currentPrice:100},
  TSLA:{name:"Tesla",sector:"Automotive",volatility:.30,deathYear:null,events:{},prices:{},currentPrice:100},
  EXON:{name:"ExxonMobil",sector:"Energy",volatility:.15,deathYear:null,events:{},prices:{},currentPrice:100},
  LKO:{name:"Lockheed Martin",sector:"Aerospace",volatility:.25,deathYear:null,events:{},prices:{},currentPrice:100},
  AMZN:{name:"Amazon",sector:"E-commerce",volatility:.25,deathYear:null,events:{},prices:{},currentPrice:100},
  DLTA:{name:"Delta Airlines",sector:"Airlines",volatility:.20,deathYear:null,events:{},prices:{},currentPrice:100},
  DIS:{name:"Disney",sector:"Entertainment",volatility:.18,deathYear:null,events:{},prices:{},currentPrice:100},
  BA:{name:"Boeing",sector:"Aerospace",volatility:.25,deathYear:null,events:{},prices:{},currentPrice:100},
  XOM:{name:"ExxonMobil",sector:"Energy",volatility:.15,deathYear:null,events:{},prices:{},currentPrice:100},
  SP500:{name:"S&P 500 Index",sector:"Index",volatility:.12,deathYear:null,events:{},prices:{},currentPrice:100}
};

let simYear=2000;
let simMonth=1;

function getSimKey(){
  return simYear+"-"+String(simMonth).padStart(2,"0");
}

function advanceSimTime(){
  simMonth++;
  if(simMonth>12){
    simMonth=1;
    simYear++;
  }
}

const marketGeneratorAI={
  mood:"neutral",
  decideMood(){
    const r=Math.random();
    if(r<.10)this.mood="panic";
    else if(r<.30)this.mood="bearish";
    else if(r<.70)this.mood="neutral";
    else if(r<.90)this.mood="bullish";
    else this.mood="euphoria";
  },
  getTrend(){
    if(this.mood==="panic")return-.15;
    if(this.mood==="bearish")return-.05;
    if(this.mood==="neutral")return 0;
    if(this.mood==="bullish")return .05;
    if(this.mood==="euphoria")return .12;
    return 0;
  },
  writeMonth(){
    const key=getSimKey();
    const trend=this.getTrend();
    for(let ticker in companyData){
      const d=companyData[ticker];
      if(d.deathYear&&simYear>=d.deathYear){
        d.currentPrice=0;
        d.prices[key]=0;
        d.events[key]=d.name+" has collapsed.";
        continue;
      }
      const swing=(Math.random()*(d.volatility*2))-d.volatility;
      d.currentPrice=Math.max(0,d.currentPrice*(1+trend+swing));
      d.prices[key]=Number(d.currentPrice.toFixed(2));
    }
  },
  maybeCreateEvent(){
    const key=getSimKey();
    const r=Math.random();
    if(r<.05){
      companyData.SP500.events[key]="Global shock: market selloff.";
      logEvent("AI Market Event: Global shock — SP500 drops.");
    } else if(r<.10){
      companyData.AAPL.events[key]="Apple hype event.";
      logEvent("AI Market Event: Apple hype — AAPL rises.");
    } else if(r<.15){
      companyData.JPM.events[key]="Banking scare.";
      logEvent("AI Market Event: Banking scare — JPM falls.");
    }
  },
  tick(){
    this.decideMood();
    this.writeMonth();
    this.maybeCreateEvent();
    advanceSimTime();
  }
};

const investments={
  savings:{name:"Savings Account",risk:"Low",baseReturn:.01,volatility:0,special:"Always grows"},
  indexFund:{name:"Index Fund",risk:"Medium",baseReturn:.03,volatility:.02,special:"Stable long term"},
  individualStocks:{name:"Individual Stocks",risk:"High",baseReturn:.06,volatility:.10,special:"Events may cause rises or crashes"},
  jewelry:{name:"Jewelry",risk:"Very High",baseReturn:.15,volatility:.30,special:"High risk"},
  realEstate:{name:"Real Estate",risk:"Medium",baseReturn:.04,volatility:.05,lockTurns:3,special:"Can't sell for 5 turns"},
  crypto:{name:"Crypto",risk:"Very High",baseReturn:.10,volatility:.25,crashChance:.10,special:"Can crash randomly"},
  gold:{name:"Gold",risk:"Medium",baseReturn:.04,volatility:.03,special:"Opposite of index fund"}
};

let game={
  turn:1,
  cash:10000,
  portfolio:{
    savings:0,
    indexFund:0,
    individualStocks:0,
    jewelry:0,
    realEstate:0,
    crypto:0,
    gold:0
  },
  realEstateBoughtTurn:null
};

if(!game.portfolio.individualStocks)game.portfolio.individualStocks=0;

const turnDisplay=document.getElementById("turn");
const cashDisplay=document.getElementById("cash");
const portfolioValueDisplay=document.getElementById("portfolioValue");
const eventLog=document.getElementById("eventLog");

function updateUI(){
  turnDisplay.textContent=game.turn;
  cashDisplay.textContent="$"+game.cash.toLocaleString();
  let total=0;
  for(let k in game.portfolio)total+=game.portfolio[k];
  portfolioValueDisplay.textContent="$"+total.toLocaleString();
  for(let k in game.portfolio){
    const el=document.getElementById("alloc-"+k);
    if(el)el.textContent="$"+game.portfolio[k].toLocaleString();
  }
}

function logEvent(t){
  const p=document.createElement("p");
  p.textContent=t;
  eventLog.appendChild(p);
  eventLog.scrollTop=eventLog.scrollHeight;
}

function invest(key,amt){
  if(amt<=0)return;
  if(amt>game.cash)return;
  game.cash-=amt;
  game.portfolio[key]+=amt;
  if(key==="realEstate")game.realEstateBoughtTurn=game.turn;
  updateUI();
}

function sell(key,amt){
  if(amt<=0)return;
  if(amt>game.portfolio[key])return;
  if(key==="realEstate"){
    if(game.turn-game.realEstateBoughtTurn<5)return;
  }
  game.portfolio[key]-=amt;
  game.cash+=amt;
  updateUI();
}

function applyReturns(){
  for(let key in game.portfolio){
    if(!investments[key])continue;
    const inv=investments[key];
    let base=inv.baseReturn;
    let vol=inv.volatility;
    let amt=game.portfolio[key];
    let swing=(Math.random()*(vol*2))-vol;
    let growth=amt*(base+swing);
    if(key==="crypto"){
      if(Math.random()<inv.crashChance){
        growth=amt*-0.5;
        logEvent("Crypto crashed -50%");
      }
    }
    if(key==="individualStocks"){
      if(Math.random()<.15){
        let spike=amt*.3;
        game.portfolio[key]+=spike;
        logEvent("Individual stocks surged +30%");
      }
      if(Math.random()<.15){
        let drop=amt*-0.3;
        game.portfolio[key]+=drop;
        logEvent("Individual stocks dropped -30%");
      }
    }
    game.portfolio[key]+=growth;
  }
}

function nextTurn(){
  game.turn++;
  applyReturns();
  updateUI();
}

function updatePhoneTime(){
  const now=new Date();
  let h=now.getHours();
  let m=now.getMinutes();
  if(m<10)m="0"+m;
  document.getElementById("phoneTime").textContent=h+":"+m;
}

setInterval(updatePhoneTime,1000);

function randomEvent(){
  const r=Math.random();
  if(r<.10){
    game.portfolio.individualStocks*=1.20;
    logEvent("Breaking News: Individual stocks jumped +20%");
  } else if(r<.20){
    game.portfolio.crypto*=.70;
    logEvent("Crypto panic: Prices fell -30%");
  } else if(r<.25){
    game.portfolio.indexFund*=1.05;
    logEvent("Market optimism: Index Fund +5%");
  } else if(r<.30){
    game.portfolio.techStock*=.80;
    logEvent("Tech sector slump: Tech Stock -20%");
  } else if(r<.35){
    game.portfolio.realEstate*=1.10;
    logEvent("Real Estate boom: Real Estate +10%");
  } else if(r<.40){
    game.portfolio.savings*=1.02;
    logEvent("Interest rate increase: Savings +2%");
  } else if(r<.45){
    game.portfolio.crypto*=1.15;
    logEvent("Crypto rally: Crypto +15%");
  } else if(r<.50){
    game.portfolio.individualStocks*=.85;
    logEvent("Individual stocks dip: -15%");
  } else if(r<.55){
    game.portfolio.indexFund*=.90;
    logEvent("Index Fund correction: -10%");
  } else if(r<.60){
    game.portfolio.techStock*=1.25;
    logEvent("Tech sector surge: Tech Stock +25%");
  } else if(r<.65){
    game.portfolio.realEstate*=.95;
    logEvent("Real Estate slowdown: Real Estate -5%");
  } else if(r<.70){
    game.portfolio.savings*=1.01;
    logEvent("Savings interest: +1%");
  } else if(r<.75){
    game.portfolio.crypto*=.80;
    logEvent("Crypto crash: -20%");
  } else if(r<.80){
    game.portfolio.individualStocks*=1.10;
    logEvent("Individual stocks rise: +10%");
  } else if(r<.85){
    game.portfolio.indexFund*=1.15;
    logEvent("Index Fund rally: +15%");
  } else if(r<.90){
    game.portfolio.techStock*=.90;
    logEvent("Tech sector dip: Tech Stock -10%");
  } else if(r<.95){
    game.portfolio.realEstate*=1.05;
    logEvent("Real Estate growth: +5%");
  } else {
    game.portfolio.savings*=1.03;
    logEvent("Savings interest: +3%");
  }
  updateUI();
}

setInterval(randomEvent,5000);

document.getElementById("openStocksBtn").addEventListener("click",()=>{
  document.getElementById("stocksPanel").classList.remove("hidden");
  renderStocksList();
});

document.getElementById("closeStocksBtn").addEventListener("click",()=>{
  document.getElementById("stocksPanel").classList.add("hidden");
});

document.getElementById("stockSearch").addEventListener("input",renderStocksList);
document.getElementById("stockFilter").addEventListener("change",renderStocksList);

function renderStocksList(){
  const list=document.getElementById("stocksList");
  const search=document.getElementById("stockSearch").value.toLowerCase();
  const filter=document.getElementById("stockFilter").value;
  list.innerHTML="";
  for(let ticker in companyData){
    const c=companyData[ticker];
    if(filter!=="all"&&c.sector!==filter)continue;
    if(!c.name.toLowerCase().includes(search)&&!ticker.toLowerCase().includes(search))continue;
    const div=document.createElement("div");
    div.className="stock-item";
    div.innerHTML=`
      <h3>${ticker} — ${c.name}</h3>
      <small>Sector: ${c.sector}</small><br>
      <small>Volatility: ${c.volatility}</small><br>
      <small>Current Price: $${c.currentPrice.toFixed(2)}</small>
    `;
    div.addEventListener("click",()=>{
      let amt=Number(prompt("How much do you want to invest in "+ticker+"?"));
      if(!isNaN(amt)&&amt>0&&amt<=game.cash){
        game.cash-=amt;
        game.portfolio[ticker]=(game.portfolio[ticker]||0)+amt;
        updateUI();
        logEvent("Invested $"+amt+" into "+ticker);
      }
    });
    list.appendChild(div);
  }
}

let gameSeconds=0;
let gameDuration=20*60;

function updateGameTimer(){
  gameSeconds++;
  const minutes=Math.floor(gameSeconds/60);
  const seconds=gameSeconds%60;
  document.getElementById("turn").textContent=minutes+":"+(seconds<10?"0"+seconds:seconds);
  if(gameSeconds%10===0){
    applyReturns();
    updateUI();
    logEvent("Market updated.");
  }
  if(gameSeconds>=gameDuration){
    logEvent("GAME OVER — 20 minutes completed!");
    clearInterval(gameTimerInterval);
  }
}

const gameTimerInterval=setInterval(updateGameTimer,1000);

setInterval(()=>{marketGeneratorAI.tick();},3000);

updateUI();
