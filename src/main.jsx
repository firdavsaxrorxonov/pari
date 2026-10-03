import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {AnimatePresence,motion} from "framer-motion";
import {Lock,Unlock,Heart,ArrowRight,RotateCcw,Volume2,VolumeX,Terminal,ShieldCheck,FileHeart} from "lucide-react";
import "./styles.css";

const AUDIO_FILES={intro:"/audio/intro.mp3",file:"/audio/file.mp3",final:"/audio/final.mp3"};

function Sound({enabled,src}) {
 const ref=useRef(null);
 useEffect(()=>{if(src&&enabled){ref.current?.pause();ref.current=new Audio(src);ref.current.volume=.9;ref.current.play().catch(()=>{});}return()=>ref.current?.pause()},[src,enabled]);
 return null;
}
function useSfx(){
 return (kind)=>{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   const c=new AC(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);
   const t=c.currentTime;
   let f=kind==="success"?[440,660,880]:kind==="error"?[130,100]:kind==="open"?[300,520]:[220];
   o.frequency.setValueAtTime(f[0],t);
   f.slice(1).forEach((x,i)=>o.frequency.exponentialRampToValueAtTime(x,t+.12*(i+1)));
   o.type=kind==="success"?"sine":"triangle";g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.38);o.start(t);o.stop(t+.4);
 }
}

const files=[
 {id:"SMILE.EXE",type:"MEMORY",text:"Siz Kulganizda hamma gam tashvishlarni butkul unutaman jonm❤️",icon:"01"},
 {id:"VOICE.WAV",type:"SIGNAL",text:"Bazi ovozlar eshitilmaydi. Ular esda qoladi.",icon:"02"},
 {id:"MOMENTS.DAT",type:"MEMORY",text:"Eng qimmat xotiralar kopincha rejalashtirilmagan boladi.",icon:"03"},
 {id:"SECRET.KEY",type:"ACCESS",text:"Bu faylni ochish uchun bitta javob kerak.",icon:"04"}
];

function Stars(){return <div className="stars">{Array.from({length:60},(_,i)=><i key={i} style={{left:`${(i*47)%100}%`,top:`${(i*73)%100}%`,animationDelay:`${i%7*.4}s`}}/>)}</div>}

function App(){
 const [screen,setScreen]=useState("boot"),[sound,setSound]=useState(false),[activeAudio,setActiveAudio]=useState(null),[unlocked,setUnlocked]=useState([]),[selected,setSelected]=useState(null),[secret,setSecret]=useState(""),[error,setError]=useState(false);
 const sfx=useSfx();

 const begin=()=>{sfx("open");setSound(true);setActiveAudio("intro");setScreen("scan")};
 const openFile=(id)=>{
   sfx("open");setSelected(id);
   setUnlocked(u=>u.includes(id)?u:[...u,id]);
 };
 const submit=()=>{
   if(secret.trim().toLowerCase()==="pari"){sfx("success");setError(false);setScreen("final");setActiveAudio("final")}
   else {sfx("error");setError(true);setTimeout(()=>setError(false),900)}
 };

 return <div className="app">
  <AnimatePresence mode="wait">
   {screen==="boot"&&<Boot key="boot" onBegin={begin}/>}
   {screen==="scan"&&<Scan key="scan" onDone={()=>{setActiveAudio("file");setScreen("vault")}}/>}
   {screen==="vault"&&<Vault key="vault" files={files} unlocked={unlocked} openFile={openFile} selected={selected} setSelected={setSelected} secret={secret} setSecret={setSecret} submit={submit} error={error}/>}
   {screen==="final"&&<Final key="final" reset={()=>{setScreen("boot");setUnlocked([]);setSelected(null);setSecret("");setActiveAudio(null)}}/>}
  </AnimatePresence>
  {sound&&<Sound enabled={sound} src={activeAudio?AUDIO_FILES[activeAudio]:null}/>}
  <button className="sound" onClick={()=>setSound(x=>!x)}>{sound?<Volume2/>:<VolumeX/>}</button>
 </div>
}

function Boot({onBegin}){
 return <motion.section className="screen boot" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <Stars/><div className="terminal">
   <div className="topbar"><span><b/> <b/> <b/></span><em>PRIVATE SESSION</em></div>
   <div className="terminal-body">
    <div className="sys">SYSTEM / PRIVATE</div>
    <div className="line"><span>connecting</span><i>........</i><b>OK</b></div>
    <div className="line"><span>searching subject</span><i>.......</i><b>FOUND</b></div>
    <div className="line"><span>access level</span><i>..........</i><b>001</b></div>
    <div className="bigcode">PARI<span className="blink">_</span></div>
    <div className="warning">SIZ UCHUN YARATILGAN MAXSUS FAYL TOPILDI.</div>
    <button className="enter" onClick={onBegin}>KIRISH <ArrowRight/></button>
    <small>Bu tajriba ovoz va teginish bilan ishlaydi.</small>
   </div>
  </div>
 </motion.section>
}

function Scan({onDone}){
 const [p,setP]=useState(0);
 useEffect(()=>{
   const a=setInterval(()=>setP(x=>Math.min(100,x+Math.ceil(Math.random()*9))),180);
   return()=>clearInterval(a)
 },[]);
 useEffect(()=>{if(p>=100){const t=setTimeout(onDone,850);return()=>clearTimeout(t)}},[p]);
 return <motion.section className="screen scan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <Stars/><div className="scanbox">
   <div className="lock"><Lock/></div>
   <div className="scan-title">MAXSUS FAYL</div>
   <h1>PARI // 001</h1>
   <p>shaxsiy ma'lumotlar qayta tiklanmoqda...</p>
   <div className="bar"><span style={{width:p+"%"}}/></div>
   <div className="percent">{p}%</div>
   <div className="scanlines"><span>identity</span><b>encrypted</b><span>memories</span><b>encrypted</b><span>access</span><b>waiting</b></div>
  </div>
 </motion.section>
}

function Vault({files,unlocked,openFile,selected,setSelected,secret,setSecret,submit,error}){
 return <motion.section className="screen vault" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <Stars/>
  <header><div><span>PRIVATE ARCHIVE</span><strong>PARI // 001</strong></div><div className="status"><ShieldCheck/> SECURE</div></header>
  <div className="vault-intro"><span>FAYLLAR</span><h2>Uning haqida<br/><b>bilishingiz kerak bo'lgan narsalar.</b></h2></div>
  <div className="file-grid">
   {files.map(f=><motion.button key={f.id} className={"file "+(unlocked.includes(f.id)?"unlocked":"")} onClick={()=>openFile(f.id)} whileTap={{scale:.97}}>
    <div className="file-icon">{unlocked.includes(f.id)?<Unlock/>:<Lock/>}</div><div><small>{f.type}</small><strong>{f.id}</strong></div><span>{f.icon}</span>
   </motion.button>)}
  </div>
  <AnimatePresence>
   {selected&&<FileModal file={files.find(x=>x.id===selected)} close={()=>setSelected(null)}/>}
  </AnimatePresence>
  {unlocked.length>=3&&<motion.div className="secret" initial={{y:30,opacity:0}} animate={{y:0,opacity:1}}>
    <div className="secret-head"><FileHeart/> SO'NGGI FAYL</div>
    <p>Bu fayl parol bilan himoyalangan.</p>
    <div className={"password "+(error?"bad":"")}><input autoComplete="off" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="parolni kiriting"/><button onClick={submit}><ArrowRight/></button></div>
    <small>ishora: bu sahifaning bosh qahramoni kim?</small>
  </motion.div>}
  <div className="counter">{unlocked.length}/4 fayl ochildi</div>
 </motion.section>
}

function FileModal({file,close}){
 return <motion.div className="modal-wrap" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <motion.div className="modal" initial={{y:35,scale:.94}} animate={{y:0,scale:1}}>
   <button className="close" onClick={close}>×</button>
   <span>{file.type} / {file.icon}</span><div className="modal-icon">{file.icon}</div>
   <h3>{file.id.replace(".EXE","").replace(".WAV","").replace(".DAT","").replace(".KEY","")}</h3>
   <p>{file.text}</p>
   <div className="decoded">FILE DECODED <Unlock/></div>
  </motion.div>
 </motion.div>
}

function Final({reset}){
 return <motion.section className="screen final" initial={{opacity:0}} animate={{opacity:1}}>
  <Stars/><div className="final-core"><motion.div animate={{scale:[1,1.1,1]}} transition={{duration:1.5,repeat:Infinity}}><Heart fill="currentColor"/></motion.div></div>
  <div className="final-copy">
   <span>FILE 001 / DECRYPTED</span>
   <h1>PARI</h1>
   <p className="reveal">Men sizga oddiy sayt yasashim mumkin edi.</p>
   <p className="reveal delay">Lekin oddiy narsa sizga yarashmaydi.</p>
   <div className="rule"/>
   <p className="main-msg">Shuning uchun men kod, vaqt va yuragimdan<br/><b>siz uchun kichkina bir olam qurdim.</b></p>
  </div>
  <button className="reset" onClick={reset}><RotateCcw/> qayta ko'rish</button>
 </motion.section>
}
createRoot(document.getElementById("root")).render(<App/>);
