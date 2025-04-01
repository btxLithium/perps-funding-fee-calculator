(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();function T(e,t,o,r,n){const s={totalFee:0,rateCount:0,highestFee:null,highestFeeTime:null,lowestFee:null,lowestFeeTime:null};return e.forEach(a=>{const d=n?a.fundingTime:a.settleTime;if(!d)return;const i=new Date(parseInt(d));if(i>=t){const f=parseFloat(a.fundingRate);if(isNaN(f))return;const c=r*o*f;s.totalFee+=c,s.rateCount++,(s.highestFee===null||c>s.highestFee)&&(s.highestFee=c,s.highestFeeTime=i),(s.lowestFee===null||c<s.lowestFee)&&(s.lowestFee=c,s.lowestFeeTime=i)}}),s}function g(e){const t=document.getElementById(e);if(!t)throw new Error(`Element with ID '${e}' not found.`);return t}function F(e){const t=document.createElement("div");t.className="toast",t.innerHTML=`<span class="material-icons">info</span>${e}`,document.body.appendChild(t),t.offsetHeight,t.classList.add("show"),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>{document.body.removeChild(t)},300)},3e3)}function b(e,t){e.innerHTML=t}function $(e,t,o){e.innerHTML=t,e.disabled=o}function N(){const e=g("cryptocurrency"),t=g("startDate"),o=g("positionValue"),r=g("positionDirection");return{cryptocurrency:e.value,startDateInput:t.value,positionValue:parseFloat(o.value),positionDirection:r.value}}function P(){try{const e=g("startDate"),t=new Date;t.setDate(t.getDate()-30),e.value=v(t)}catch(e){console.error("Failed to set default start date:",e)}}async function R(e){const t=`data/${e.toLowerCase()}_funding_rates_binance.json`,o=`data/${e.toLowerCase()}_funding_rates_bitget.json`,[r,n]=await Promise.all([fetch(t),fetch(o)]);if(!r.ok)throw new Error(`Binance data fetch error: ${r.status} ${r.statusText}`);if(!n.ok)throw new Error(`Bitget data fetch error: ${n.status} ${n.statusText}`);const s=await r.json(),a=await n.json();return{binanceRates:s,bitgetRates:a}}function v(e){return e.toISOString().split("T")[0]}function m(e){return e===null?"N/A":parseFloat(e.toFixed(3)).toString()}function D(e){return e?new Date(e.getTime()+8*36e5).toISOString().replace("T"," ").substring(0,16):"N/A"}function A(e){const t=new Date,o=new Date(e.getFullYear(),e.getMonth(),e.getDate()),r=new Date(t.getFullYear(),t.getMonth(),t.getDate()),n=Math.abs(r.getTime()-o.getTime());return Math.ceil(n/(1e3*60*60*24))+1}function p(e){return e===null?"":e>=0?"fee-positive":"fee-negative"}function O(e){const{formattedDate:t,cryptocurrency:o,positionValue:r,positionDirection:n,daysDifference:s,binanceData:a,formattedBinanceFee:d,formattedBinanceHighest:i,formattedBinanceLowest:f,bitgetData:c,formattedBitgetFee:y,formattedBitgetHighest:w,formattedBitgetLowest:h}=e;return`
        <div class="result-card">
            <div class="result-header">Calculation Results</div>
            <div class="result-details">
                <p><strong>Start Date:</strong> ${t}</p>
                <p><strong>Cryptocurrency:</strong> ${o}</p>
                <p><strong>Position Value:</strong> ${r} USDT</p>
                <p><strong>Position Direction:</strong> ${n.charAt(0).toUpperCase()+n.slice(1)}</p>
                <p><strong>Calculation Period:</strong> ${s} days</p>

                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Exchange</th>
                            <th>Settled Funding Fee (USDT)</th>
                            <th>Highest Single Fee (Income/Expense)</th>
                            <th>Lowest Single Fee (Income/Expense)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="exchange-logo"><img src="assets/binance-icon-logo.png" alt="Binance" class="exchange-icon"> Binance</span></td>
                            <td class="fee-amount ${p(a.totalFee)}">${d}</td>
                            <td class="fee-amount ${p(a.highestFee)}">${i}</td>
                            <td class="fee-amount ${p(a.lowestFee)}">${f}</td>
                        </tr>
                        <tr>
                            <td><span class="exchange-logo"><img src="assets/bitget-icon-logo.png" alt="Bitget" class="exchange-icon"> Bitget</span></td>
                            <td class="fee-amount ${p(c.totalFee)}">${y}</td>
                            <td class="fee-amount ${p(c.highestFee)}">${w}</td>
                            <td class="fee-amount ${p(c.lowestFee)}">${h}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="fee-explanation" style="font-size: 13px; color: gray;">Note: Positive fees represent income received, negative fees represent expenses paid.</p>
            </div>
        </div>
    `}document.addEventListener("DOMContentLoaded",()=>{try{g("calcForm").addEventListener("submit",V),P()}catch(e){console.error("Initialization failed:",e);const t=document.getElementById("result");t&&(t.innerHTML='<div class="error-message">Initialization failed. Please check the console.</div>')}});async function V(e){e.preventDefault();const t=g("result"),o=e.target.querySelector('button[type="submit"]');if(!o){console.error("Submit button not found within the form."),F("An unexpected error occurred. Could not find the submit button.");return}const r=o.innerHTML;try{const{cryptocurrency:n,startDateInput:s,positionValue:a,positionDirection:d}=N();if(!s||isNaN(a)){F("Please enter a valid date and position value.");return}const i=new Date(s),f=new Date;if(f.setHours(0,0,0,0),new Date(i.getFullYear(),i.getMonth(),i.getDate())>=f){F("Start date must be before today. Please select a past date.");return}$(o,'<span class="material-icons spin">refresh</span> Calculating...',!0),b(t,'<div class="loading"><span class="material-icons spin">refresh</span> Loading data...</div>');const{binanceRates:y,bitgetRates:w}=await R(n),h=d==="long"?1:-1,l=T(y,i,a,h,!0),u=T(w,i,a,h,!1),L=v(i),B=m(l.totalFee),E=m(u.totalFee),S=l.highestFee!==null?`${m(l.highestFee)}<br>(${D(l.highestFeeTime)})`:"N/A",M=l.lowestFee!==null?`${m(l.lowestFee)}<br>(${D(l.lowestFeeTime)})`:"N/A",C=u.highestFee!==null?`${m(u.highestFee)}<br>(${D(u.highestFeeTime)})`:"N/A",x=u.lowestFee!==null?`${m(u.lowestFee)}<br>(${D(u.lowestFeeTime)})`:"N/A",H=A(i),I=O({formattedDate:L,cryptocurrency:n,positionValue:a,positionDirection:d,daysDifference:H,binanceData:l,formattedBinanceFee:B,formattedBinanceHighest:S,formattedBinanceLowest:M,bitgetData:u,formattedBitgetFee:E,formattedBitgetHighest:C,formattedBitgetLowest:x});b(t,I)}catch(n){console.error("Calculation failed:",n);const s=n instanceof Error?n.message:String(n);b(t,`
            <div class="error-message">
                <span class="material-icons">error</span>
                <p>Failed to calculate or load data. Please try again later.</p>
                <p class="error-details">Details: ${s}</p>
            </div>
        `),F(`Error: ${s}`)}finally{o&&$(o,r,!1)}}
