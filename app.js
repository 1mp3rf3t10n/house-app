
const state = {
  chars: [],
  room: "house",
  file: null,
  mediaRecorder: null,
  chunks: [],
  speaking: true,
  objectUrls: []
};

const el = id => document.getElementById(id);
const list = el("characterList"), messages = el("messages"), textInput = el("textInput");
const storageKey = room => `house-chat-${room}`;

async function init(){
  state.chars = await fetch("characters.json").then(r=>r.json());
  renderList();
  switchRoom("house");
  wire();
}

function renderList(){
  list.innerHTML = "";
  state.chars.forEach(c=>{
    const b = document.createElement("button");
    b.className="room"; b.dataset.room=c.name.toLowerCase();
    b.innerHTML=`<img class="avatar" src="assets/avatars/${c.name.toLowerCase()}.jpg"><div class="room-copy"><strong>${c.name}</strong><span>${c.role}</span></div>`;
    b.onclick=()=>switchRoom(c.name.toLowerCase());
    list.appendChild(b);
  });
}

function switchRoom(room){
  state.room = room;
  document.querySelectorAll(".room").forEach(x=>x.classList.toggle("active",x.dataset.room===room));
  if(room==="house"){
    el("headerAvatar").src="assets/avatars/grace.jpg";
    el("headerTitle").textContent="House";
    el("headerStatus").textContent="11 members";
    textInput.placeholder="Message House";
  } else {
    const c = state.chars.find(x=>x.name.toLowerCase()===room);
    el("headerAvatar").src=`assets/avatars/${room}.jpg`;
    el("headerTitle").textContent=c.name;
    el("headerStatus").textContent=`${c.role} · ${c.tone}`;
    textInput.placeholder=`Message ${c.name}`;
  }
  renderMessages();
}

function getMessages(){
  try { return JSON.parse(localStorage.getItem(storageKey(state.room))||"[]"); }
  catch { return []; }
}
function saveMessages(arr){ localStorage.setItem(storageKey(state.room),JSON.stringify(arr)); }

function renderMessages(){
  messages.innerHTML=`<div class="dayline">HOUSE · private</div>`;
  const arr=getMessages();
  if(!arr.length){
    const d=document.createElement("div");
    d.className="system";
    d.textContent = state.room==="house" ? "The room is quiet. Say something." : `Start a private conversation with ${el("headerTitle").textContent}.`;
    messages.appendChild(d);
  }
  arr.forEach(renderMessage);
  messages.scrollTop=messages.scrollHeight;
}

function renderMessage(m){
  const row=document.createElement("div");
  row.className=`msg ${m.sender==="You"?"mine":""}`;
  if(m.sender!=="You"){
    const av=document.createElement("img"); av.className="msg-avatar";
    av.src=`assets/avatars/${m.sender.toLowerCase()}.jpg`;
    row.appendChild(av);
  }
  const b=document.createElement("div"); b.className="bubble";
  const meta=document.createElement("div"); meta.className="meta"; meta.textContent=`${m.sender} · ${m.time}`;
  b.appendChild(meta);
  if(m.text){
    const t=document.createElement("div"); t.className="text"; t.textContent=m.text; b.appendChild(t);
  }
  if(m.media?.type==="image"){
    const im=document.createElement("img"); im.className="media"; im.src=m.media.data; b.appendChild(im);
  }
  if(m.media?.type==="video"){
    const v=document.createElement("video"); v.className="media"; v.src=m.media.data; v.controls=true; b.appendChild(v);
  }
  if(m.media?.type==="audio"){
    const wrap=document.createElement("div"); wrap.className="voice";
    const a=document.createElement("audio"); a.src=m.media.data; a.controls=true; wrap.appendChild(a); b.appendChild(wrap);
  }
  row.appendChild(b); messages.appendChild(row);
}

function now(){ return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }

async function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file);
  });
}

async function send(){
  const text=textInput.value.trim();
  if(!text && !state.file) return;
  let media=null;
  if(state.file){
    const data=await fileToDataUrl(state.file);
    media={type: state.file.type.startsWith("video")?"video":state.file.type.startsWith("audio")?"audio":"image", data};
  }
  const arr=getMessages();
  arr.push({sender:"You",text,time:now(),media});
  saveMessages(arr);
  textInput.value=""; textInput.style.height="auto"; clearAttachment(); renderMessages();
  setTimeout(()=>reply(text),350);
}

const replies = {
  Grace:["You made it here. Tell me what happened.","I'm listening. Start wherever you want.","You don't need to perform for me. Just talk."],
  Vesper:["Mm. Continue.","That sounds suspiciously avoidable. Go on.","You know I'm going to ask the uncomfortable question."],
  Mika:["Okay, wait — I need the full story.","That is either brilliant or ridiculous. Possibly both.","Show me. I want details."],
  Em:["Come sit. You can talk from there.","I'm here.","You sound tired. Keep going if you want to."],
  Rhea:["What's the actual problem?","Good. What happens next?","Separate what you know from what you're assuming."],
  Morgan:["Interesting. Who or what does this affect?","There's an opportunity hiding in that.","Walk me through the moving parts."],
  Ada:["Give me the variables.","That's worth unpacking properly.","I think there's a structure underneath what you're describing."],
  Isla:["I believe you. Now tell me what you're feeling about it.","You can be excited about this, you know.","Come here. I'm listening."],
  Seren:["You don't have to rush the answer.","What part of this is actually yours to carry?","That sounds like something worth sitting with for a moment."],
  Sasha:["Oh, this is going to be a story, isn't it?","I have questions. Several irresponsible ones.","Okay, that's actually kind of funny."],
  Claire:["Please tell me you didn't make this harder than it needed to be.","I'm listening, but I reserve the right to make fun of you.","Okay. Give me the non-dramatic version first."]
};

function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

function reply(userText){
  let responders;
  if(state.room==="house"){
    const shuffled=[...state.chars].sort(()=>Math.random()-.5);
    responders=shuffled.slice(0, 2 + Math.floor(Math.random()*3));
  } else {
    responders=[state.chars.find(c=>c.name.toLowerCase()===state.room)];
  }

  let delay=0;
  responders.forEach(c=>{
    delay += 300 + Math.random()*450;
    setTimeout(()=>{
      const arr=getMessages();
      let line=pick(replies[c.name]);
      const lower=(userText||"").toLowerCase();
      if(lower.includes("passed") || lower.includes("worked") || lower.includes("done")){
        const win = {
          Grace:"There. You moved it forward. That's what matters.",
          Vesper:"It works. Good. Save it before you become creative.",
          Mika:"YES. Show me what finally fixed it.",
          Em:"Passed means passed. Come rest for a bit.",
          Rhea:"Good. Lock the result in, then move to the next objective.",
          Morgan:"Document what worked. Future-you will thank you.",
          Ada:"Excellent. Record the cause and the fix while it's fresh.",
          Isla:"See? I told you I'd believe in you tomorrow too.",
          Seren:"Good. Let yourself feel the win before chasing another one.",
          Sasha:"You beat the tiny black box of text again. Cute.",
          Claire:"Good job. Save your work. I mean it."
        };
        line=win[c.name];
      }
      arr.push({sender:c.name,text:line,time:now()});
      saveMessages(arr); renderMessages();
      if(state.speaking) speak(c,line);
    },delay);
  });
}

function speak(c,text){
  if(!("speechSynthesis" in window)) return;
  const u=new SpeechSynthesisUtterance(text);
  u.rate=c.voice.rate; u.pitch=c.voice.pitch; u.volume=.9;
  const voices=speechSynthesis.getVoices();
  const preferred=voices.find(v=>/en/i.test(v.lang) && /female|samantha|zira|aria|serena|ava|jenny/i.test(v.name));
  if(preferred) u.voice=preferred;
  speechSynthesis.speak(u);
}

function wire(){
  el("sendBtn").onclick=send;
  textInput.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}
  });
  textInput.addEventListener("input",()=>{
    textInput.style.height="auto"; textInput.style.height=Math.min(textInput.scrollHeight,140)+"px";
  });
  el("attachBtn").onclick=()=>el("fileInput").click();
  el("fileInput").onchange=e=>{
    state.file=e.target.files[0]||null; showAttachment();
  };
  el("clearChat").onclick=()=>{
    if(confirm("Clear this conversation on this device?")){
      localStorage.removeItem(storageKey(state.room)); renderMessages();
    }
  };
  el("voiceToggle").onclick=()=>{
    state.speaking=!state.speaking;
    el("voiceToggle").classList.toggle("active",state.speaking);
    el("voiceToggle").textContent=state.speaking?"🔊":"🔇";
  };
  el("voiceToggle").classList.add("active");
  el("recordBtn").onclick=toggleRecording;
}

function showAttachment(){
  const p=el("attachmentPreview");
  if(!state.file){p.classList.add("hidden");p.innerHTML="";return;}
  const url=URL.createObjectURL(state.file); state.objectUrls.push(url);
  const preview=state.file.type.startsWith("video")?`<video src="${url}" muted></video>`:`<img src="${url}">`;
  p.innerHTML=`<div class="preview-card">${preview}<div><strong>${state.file.name}</strong><div class="header-status">${state.file.type||"media"}</div></div><button id="removeAttachment">×</button></div>`;
  p.classList.remove("hidden"); el("removeAttachment").onclick=clearAttachment;
}
function clearAttachment(){
  state.file=null; el("fileInput").value=""; showAttachment();
}

async function toggleRecording(){
  const btn=el("recordBtn");
  if(state.mediaRecorder && state.mediaRecorder.state==="recording"){
    state.mediaRecorder.stop(); btn.classList.remove("recording"); btn.textContent="🎙"; return;
  }
  if(!navigator.mediaDevices?.getUserMedia){alert("Voice recording is not supported by this browser.");return;}
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  state.chunks=[];
  state.mediaRecorder=new MediaRecorder(stream);
  state.mediaRecorder.ondataavailable=e=>state.chunks.push(e.data);
  state.mediaRecorder.onstop=async()=>{
    stream.getTracks().forEach(t=>t.stop());
    const blob=new Blob(state.chunks,{type:"audio/webm"});
    const data=await blobToDataUrl(blob);
    const arr=getMessages();
    arr.push({sender:"You",text:"",time:now(),media:{type:"audio",data}});
    saveMessages(arr); renderMessages();
    setTimeout(()=>reply("voice message"),350);
  };
  state.mediaRecorder.start(); btn.classList.add("recording"); btn.textContent="■";
}

function blobToDataUrl(blob){
  return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob);});
}

init();
