import React, {useEffect, useState} from 'react';
import logo from './ns9.gif';
import bl from './bubbleLeft.png';
import bm from './bubbleMid.png';
import br from './bubbleRight.png';
import './App.css';
const { LiveWS } = require('bilibili-live-ws');


const live=new LiveWS(parseInt(new URL(window.location.href).searchParams.get("room"))||21669084);

function App() {
  const [giftQueue,setGiftQueue]=useState([]);
  const [lastmsg,setLastmsg]=useState("");
  const [transDuration,setTransDuration]=useState(0.3);
  const [showBubble,setShowBubble]=useState(false);
  const [queueTimer,setQueueTimer]=useState(undefined);

  const log=(msg)=>{
    //console.log(msg);
    setGiftQueue((giftQueue)=>giftQueue.indexOf(msg)===-1?[...giftQueue,msg]:giftQueue);
  };

  useEffect(()=>{
    console.log(giftQueue);
    if(!queueTimer&&!giftQueue.length){
      setTransDuration(1);
      setShowBubble(false);
    }
    if(!queueTimer&&giftQueue.length){
      console.log(giftQueue[0]);
      setLastmsg(giftQueue[0]);
      setTransDuration(0.3);
      setShowBubble(true);
      setQueueTimer(setTimeout(()=>{
        setQueueTimer(undefined);
        if(giftQueue.length>0)setGiftQueue(giftQueue=>giftQueue.slice(1));
      },giftQueue.length?10000/giftQueue.length:10000));
    }
  },[giftQueue]);

  useEffect(()=>{
    console.log("connecting...");
    live.on('open', () => log('已连接到直播间'));
// Connection is established
    live.on('live', () => {
      //live.on('heartbeat', console.log)
      //live.on('DANMU_MSG', ({info})=>console.log(info[1]));
      //live.on('SEND_GIFT', ({data})=>(data.coin_type==="gold")&&log(data.uname,data.action,data.giftName,data.num));//(data.coin_type==="gold")&&
      live.on('SEND_GIFT', ({data})=> (data.coin_type==="gold"||new URL(window.location.href).searchParams.get("silver"))&&log(`感谢${data.uname}前辈的${data.giftName}`));
      //live.on('GUARD_BUY', ({data}) =>log(data.username,data.gift_name));
      live.on('GUARD_BUY', ({data}) =>log(`感谢${data.username}前辈的${data.giftName}`));
      //live.on('SUPER_CHAT_MESSAGE', ({data}) =>log(data.user_info.uname,data.message,data.price));
      live.on('SUPER_CHAT_MESSAGE', ({data}) =>log(`感谢${data.user_info.uname}前辈的SC`));

      // live.on('error', console.error);
      // live.on('msg', console.log);
    })
    return ()=>live.close();
  },[]);
  return (
    <div className="App">
      <header className="App-header">
        <div className='last-img' style={{transition:`all ${transDuration}s`,opacity:showBubble?1:0}}>
          <img src={bl}/>
          <div className="last-msg text" style={{backgroundImage:"url("+bm+")"}}>
            {lastmsg}
          </div>
          <img src={br}/>
        </div>
        <img src={logo} className="App-logo" alt="logo" />

      </header>
    </div>
  );
}

export default App;
