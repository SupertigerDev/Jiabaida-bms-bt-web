(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))c(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&c(o)}).observe(document,{childList:!0,subtree:!0});function n(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(a){if(a.ep)return;a.ep=!0;const r=n(a);fetch(a.href,r)}})();function D(e,t){const n=new DataView(new ArrayBuffer(2));return n.setUint8(0,e),n.setUint8(1,t),n.getInt16(0,!1)}function T(e,t){const n=new DataView(new ArrayBuffer(2));return n.setUint8(0,e),n.setUint8(1,t),n.getUint16(0,!0)}function V(e,t,n,c){return n=n??1,parseFloat(D(e,t)*n).toFixed(2)}function $(e,t){return T(e,t).toString(2).padStart(16,"0")}function H(e){const t=[];for(let n=0;n<e.byteLength;n++){const c=e.getUint8(n);t.push(c)}return t}function S(e){const t=new ArrayBuffer(e.length),n=new DataView(t);return e.forEach((c,a)=>{const r=c<<24>>24;n.setInt8(a,r)}),n}function M(e){const t=Math.floor(e/3600),n=Math.floor(e%3600/60);return`${t}h ${n}m`}function A(){let e=0,t=performance.now();function n(a){const r=performance.now(),s=(r-t)/36e5,l=a*s;e+=l,t=r}function c(){return e}return{update:n,getWattHours:c}}const b="0000ff00-0000-1000-8000-00805f9b34fb",B="0000ff02-0000-1000-8000-00805f9b34fb",U="0000ff01-0000-1000-8000-00805f9b34fb",w=S([221,165,3,0,255,253,119]),q=S([221,165,4,0,255,252,119]),P=()=>{let e,t;return{onData:a=>{e=a},scanAndConnect:async()=>{if(t||(t=await navigator.bluetooth.requestDevice({filters:[{services:[b]}]}).catch(d=>alert(d)),!t))return;console.log(`Connecting to ${t.name}...`);const a=await t.gatt.connect();console.log("Getting Service..");const r=await a.getPrimaryService(b);console.log("Getting Characteristic..");const o=await r.getCharacteristic(U),s=await r.getCharacteristic(B);console.log("Starting notifications.."),await o.startNotifications();let l=0,i=[],f="battery-info",v,p;o.addEventListener("characteristicvaluechanged",d=>{let u=H(d.target.value);if(i.length===0&&(l=u[3],u[0]!==221)){console.log("Invalid response");return}i=[...i,...u],i.length===l+7&&(f==="battery-info"?(f="cell-info",v=W(i),s.writeValueWithoutResponse(q)):(f="battery-info",p=F(i),v.name=t.name,e({batteryInfo:v,cellVolts:p}),setTimeout(async()=>{await s.writeValueWithoutResponse(w)},1e3)),l=0,i=[])}),setTimeout(async()=>{await s.writeValueWithoutResponse(w)},1e3)}}};function R(e,t,n){return $(e,t).split("").slice(0,n).reverse().map(a=>!!parseInt(a))}function W(e){const t=(e[4]*256+e[5])/100,n=Number(V(e[6],e[7],.01)),c=(e[8]*256+e[9])/100,a=(e[10]*256+e[11])/100,r=e[12]*256+e[13],o=e[23],s=e[25],l=(e[24]&1)===1,i=(e[24]&2)===2,f=R(e[16],e[17],s),v=e[26],p=[];for(let y=0;y<v;y++){const h=(e[27+y*2]*256+e[28+y*2]-2731)/10;p.push(h)}const d=n>0,u=n<0;let m;d?m=(a-c)/Math.abs(n)*3600:u&&(m=c/Math.abs(n)*3600);const g=M(m);return{charging:d,discharging:u,secondsRemaining:m,HHMMRemaining:g,totalVolts:t,remainingCapacityAh:c,current:n,remainingPercentSoc:o,nominalCapacityAh:a,totalCycles:r,bmsNumberOfCells:s,mosfetCharge:l,mosfetDischarge:i,balanceStatus:f,temperatures:p}}function F(e){const t=[],n=e[3]/2;for(let c=0;c<n;c++){const r=(e[4+2*c]*256+e[5+2*c])/1e3;t.push(r)}return t}const I=P(),x=A(),C=document.getElementById("root");scan.addEventListener("click",()=>{I.scanAndConnect()});const O=()=>{const e=document.createElement("div");return e.classList.add("pane","battery-status-pane"),e.innerHTML=`
    <h3>Temperature Sensors</h3>
      <div class="cards"></div>
    </div>
  `,C.appendChild(e),{updateInfo:({temperatures:n})=>{const c=e.querySelector(".cards");n.forEach((a,r)=>{const o=e.querySelector(`.temp-${r}`)?.parentElement,s=o||document.createElement("div");s.classList.add("card"),s.innerHTML=`
        <div class="card-title">Sensor ${r+1}</div>
        <div class="card-value temp-${r}">${a.toFixed(1)} C</div>
      `,o||c.appendChild(s)})}}},N=()=>{const e=document.createElement("div");return e.classList.add("pane","battery-status-pane"),e.innerHTML=`
    <h3>Cell Status</h3>
      <div class="cards"></div>
    </div>
  `,C.appendChild(e),{updateInfo:({cellVolts:n})=>{const c=e.querySelector(".cards");n.forEach((a,r)=>{const o=e.querySelector(`.cell-${r}`)?.parentElement,s=o||document.createElement("div");s.classList.add("card"),s.innerHTML=`
        <div class="card-title">Cell ${r+1}</div>
        <div class="card-value cell-${r}">${a.toFixed(3)} V</div>
      `,o||c.appendChild(s)})}}},_=()=>{const e=document.createElement("div");return e.classList.add("pane","battery-status-pane"),e.innerHTML=`
    <h3>Battery Status</h3>
    <div class="battery-info-container">
      <div class="battery-info">
        <div class="battery-icon">
          <div class="battery-level"></div>
        </div>
        <div class="battery-details">
          <div class="battery-level-percentage"></div>
          <div class="battery-state"></div>
        </div>
      </div>

      <div class="last-updated-container">
        <div class="last-updated-title">Last Updated</div>
        <div class="last-updated-time"></div>
      </div>
    </div>


    <div class="cards">
      <div class="card">
        <div class="card-title">Capacity</div>
        <div class="card-value capacity">0 Ah</div>
      </div>
      <div class="card">
        <div class="card-title">Voltage</div>
        <div class="card-value voltage">0 V</div>
      </div>
      <div class="card">
        <div class="card-title">Current</div>
        <div class="card-value current">0 A</div>
      </div>
      <div class="card">
        <div class="card-title">Power</div>
        <div class="card-value power">0 W</div>
      </div>
      <div class="card">
        <div class="card-title">Watt-hours</div>
        <div class="card-value wh">0 Wh</div>
      </div>
      <div class="card">
        <div class="card-title">Cycle Count</div>
        <div class="card-value cycle-count">0</div>
      </div>


    </div>

  
  
  `,C.appendChild(e),{updateInfo:({percent:n,charging:c,hhmmRemaining:a,current:r,capacity:o,voltage:s,power:l,wh:i,cycleCount:f})=>{const v=e.querySelector(".battery-info .battery-level");v.style.width=`${n}%`;const p=e.querySelector(".battery-info .battery-level-percentage");p.textContent=`${n}%`;const d=e.querySelector(".battery-info .battery-state");r!==0?d.textContent=`${c?"Charged in":"Discharging in"} ${a}`:d.textContent="Idle";const u=e.querySelector(".last-updated-container .last-updated-time");u.textContent=new Intl.DateTimeFormat("en-GB",{dateStyle:"short",timeStyle:"medium"}).format(new Date).split(",")[1];const m=e.querySelector(".card-value.capacity");m.textContent=`${o.toFixed(2)} Ah`;const g=e.querySelector(".card-value.voltage");g.textContent=`${s.toFixed(2)} V`;const y=e.querySelector(".card-value.current");y.textContent=`${r.toFixed(2)} A`;const h=e.querySelector(".card-value.power");h.textContent=`${l.toFixed(2)} W`;const E=e.querySelector(".card-value.wh");E.textContent=`${i.toFixed(2)} Wh`;const L=e.querySelector(".card-value.cycle-count");L.textContent=f}}},G=_(),K=N(),j=O();I.onData(e=>{const{batteryInfo:t,cellVolts:n}=e;x.update(-(t.current*t.totalVolts)),G.updateInfo({percent:t.remainingPercentSoc,charging:t.charging,current:t.current,hhmmRemaining:t.HHMMRemaining,capacity:t.remainingCapacityAh,voltage:t.totalVolts,power:t.current*t.totalVolts,wh:x.getWattHours(),cycleCount:t.totalCycles}),K.updateInfo({cellVolts:n}),j.updateInfo({temperatures:t.temperatures})});
//# sourceMappingURL=index-DYMQBigI.js.map
