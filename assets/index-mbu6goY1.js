(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const c of document.querySelectorAll('link[rel="modulepreload"]'))r(c);new MutationObserver(c=>{for(const a of c)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(c){const a={};return c.integrity&&(a.integrity=c.integrity),c.referrerPolicy&&(a.referrerPolicy=c.referrerPolicy),c.crossOrigin==="use-credentials"?a.credentials="include":c.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(c){if(c.ep)return;c.ep=!0;const a=n(c);fetch(c.href,a)}})();function $(e,t){const n=new DataView(new ArrayBuffer(2));return n.setUint8(0,e),n.setUint8(1,t),n.getInt16(0,!1)}function B(e,t){const n=new DataView(new ArrayBuffer(2));return n.setUint8(0,e),n.setUint8(1,t),n.getUint16(0,!0)}function D(e,t,n,r){return n=n??1,parseFloat($(e,t)*n).toFixed(2)}function T(e,t){return B(e,t).toString(2).padStart(16,"0")}function V(e){const t=[];for(let n=0;n<e.byteLength;n++){const r=e.getUint8(n);t.push(r)}return t}function H(e){const t=new ArrayBuffer(e.length),n=new DataView(t);return e.forEach((r,c)=>{const a=r<<24>>24;n.setInt8(c,a)}),n}function S(e){const t=Math.floor(e/3600),n=Math.floor(e%3600/60);return`${t}h ${n}m`}function A(){let e=0,t=performance.now();function n(c){const a=performance.now(),o=(a-t)/36e5,d=c*o;e-=d,t=a}function r(){return e}return{update:n,getWattHours:r}}const E="0000ff00-0000-1000-8000-00805f9b34fb",F="0000ff02-0000-1000-8000-00805f9b34fb",R="0000ff01-0000-1000-8000-00805f9b34fb",I=H([221,165,3,0,255,253,119]),q=H([221,165,4,0,255,252,119]),P=()=>{let e,t;return{onData:c=>{e=c},scanAndConnect:async()=>{if(t||(t=await navigator.bluetooth.requestDevice({filters:[{services:[E]}]}).catch(u=>alert(u)),!t))return;console.log(`Connecting to ${t.name}...`);const c=await t.gatt.connect();console.log("Getting Service..");const a=await c.getPrimaryService(E);console.log("Getting Characteristic..");const s=await a.getCharacteristic(R),o=await a.getCharacteristic(F);console.log("Starting notifications.."),await s.startNotifications();let d=0,i=[],f="battery-info",v,m;s.addEventListener("characteristicvaluechanged",u=>{let l=V(u.target.value);if(i.length===0&&(d=l[3],l[0]!==221)){console.log("Invalid response");return}i=[...i,...l],i.length===d+7&&(f==="battery-info"?(f="cell-info",v=W(i),o.writeValueWithoutResponse(q)):(f="battery-info",m=O(i),v.name=t.name,e({batteryInfo:v,cellVolts:m}),setTimeout(async()=>{await o.writeValueWithoutResponse(I)},1e3)),d=0,i=[])}),setTimeout(async()=>{await o.writeValueWithoutResponse(I)},1e3)}}};function U(e,t,n){return T(e,t).split("").slice(0,n).reverse().map(c=>!!parseInt(c))}function W(e){const t=(e[4]*256+e[5])/100,n=Number(D(e[6],e[7],.01)),r=(e[8]*256+e[9])/100,c=(e[10]*256+e[11])/100,a=e[12]*256+e[13],s=e[23],o=e[25],d=(e[24]&1)===1,i=(e[24]&2)===2,f=U(e[16],e[17],o),v=e[26],m=[];for(let y=0;y<v;y++){const x=(e[27+y*2]*256+e[28+y*2]-2731)/10;m.push(x)}const u=n>0,l=n<0;let p;u?p=(c-r)/Math.abs(n)*3600:l&&(p=r/Math.abs(n)*3600);const h=c*80/100;let g;u?g=(c-h)/Math.abs(n)*3600:l&&(g=h/Math.abs(n)*3600);const b=S(p),C=S(g);return{charging:u,discharging:l,secondsRemaining:p,HHMMRemaining:b,HHMMRemaining80:C,totalVolts:t,remainingCapacityAh:r,current:n,remainingPercentSoc:s,nominalCapacityAh:c,totalCycles:a,bmsNumberOfCells:o,mosfetCharge:d,mosfetDischarge:i,balanceStatus:f,temperatures:m}}function O(e){const t=[],n=e[3]/2;for(let r=0;r<n;r++){const a=(e[4+2*r]*256+e[5+2*r])/1e3;t.push(a)}return t}const L=P(),M=A(),w=document.getElementById("root");scan.addEventListener("click",()=>{L.scanAndConnect()});const N=()=>{const e=document.createElement("div");return e.classList.add("pane","battery-status-pane"),e.innerHTML=`
    <h3>Temperature Sensors</h3>
      <div class="cards"></div>
    </div>
  `,w.appendChild(e),{updateInfo:({temperatures:n})=>{const r=e.querySelector(".cards");n.forEach((c,a)=>{const s=e.querySelector(`.temp-${a}`)?.parentElement,o=s||document.createElement("div");o.classList.add("card"),o.innerHTML=`
        <div class="card-title">Sensor ${a+1}</div>
        <div class="card-value temp-${a}">${c.toFixed(1)} C</div>
      `,s||r.appendChild(o)})}}},_=()=>{const e=document.createElement("div");return e.classList.add("pane","battery-status-pane"),e.innerHTML=`
    <h3>Cell Status</h3>
      <div class="cards"></div>
    </div>
  `,w.appendChild(e),{updateInfo:({cellVolts:n})=>{const r=e.querySelector(".cards");n.forEach((c,a)=>{const s=e.querySelector(`.cell-${a}`)?.parentElement,o=s||document.createElement("div");o.classList.add("card"),o.innerHTML=`
        <div class="card-title">Cell ${a+1}</div>
        <div class="card-value cell-${a}">${c.toFixed(3)} V</div>
      `,s||r.appendChild(o)})}}},G=()=>{const e=document.createElement("div");return e.classList.add("pane","battery-status-pane"),e.innerHTML=`
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

  
  
  `,w.appendChild(e),{updateInfo:({percent:n,charging:r,hhmmRemaining:c,HHMMRemaining80:a,current:s,capacity:o,voltage:d,power:i,wh:f,cycleCount:v})=>{const m=e.querySelector(".battery-info .battery-level");m.style.width=`${n}%`;const u=e.querySelector(".battery-info .battery-level-percentage");u.textContent=`${n}%`;const l=e.querySelector(".battery-info .battery-state");s!==0?r?l.textContent=`100% in ${c}
80% in ${a}`:l.textContent=`"Discharging in ${c}`:l.textContent="Idle";const p=e.querySelector(".last-updated-container .last-updated-time");p.textContent=new Intl.DateTimeFormat("en-GB",{dateStyle:"short",timeStyle:"medium"}).format(new Date).split(",")[1];const h=e.querySelector(".card-value.capacity");h.textContent=`${o.toFixed(2)} Ah`;const g=e.querySelector(".card-value.voltage");g.textContent=`${d.toFixed(2)} V`;const b=e.querySelector(".card-value.current");b.textContent=`${s.toFixed(2)} A`;const C=e.querySelector(".card-value.power");C.textContent=`${i.toFixed(2)} W`;const y=e.querySelector(".card-value.wh");y.textContent=`${f.toFixed(2)} Wh`;const x=e.querySelector(".card-value.cycle-count");x.textContent=v}}},K=()=>{const e=document.getElementById("fullscreen-button");e.id="fullscreen-button",e.textContent="Fullscreen",document.onfullscreenchange=()=>{document.fullscreenElement?e.style.display="none":e.style.display="block"},e.addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()})},j=G(),k=_(),z=N();K();L.onData(e=>{const{batteryInfo:t,cellVolts:n}=e;M.update(-(t.current*t.totalVolts)),j.updateInfo({percent:t.remainingPercentSoc,charging:t.charging,current:t.current,hhmmRemaining:t.HHMMRemaining,HHMMRemaining80:t.HHMMRemaining80,capacity:t.remainingCapacityAh,voltage:t.totalVolts,power:t.current*t.totalVolts,wh:M.getWattHours(),cycleCount:t.totalCycles}),k.updateInfo({cellVolts:n}),z.updateInfo({temperatures:t.temperatures})});
//# sourceMappingURL=index-mbu6goY1.js.map
