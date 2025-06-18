import React, { useState, useEffect } from 'react';
import Game from '../components/Game';

export default function WhackAMole() {
  const [moleDataOk, setMoleDataOk] = useState(true);
  useEffect(() => {
    fetch('/moles.json').then(r=>{
      if (!r.ok) setMoleDataOk(false);
      else r.json().then(data=>{ if (!Array.isArray(data) || data.length === 0) setMoleDataOk(false); });
    }).catch(()=>setMoleDataOk(false));
  }, []);
  if (!moleDataOk) return <div style={{padding:40,textAlign:'center',color:'#b00',fontWeight:900,fontSize:24}}>地鼠資料載入失敗，請聯絡管理員！</div>;
  return <Game />;
} 