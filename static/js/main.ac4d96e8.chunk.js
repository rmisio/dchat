(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{1147:function(e,t){},1186:function(e,t){},1229:function(e,t){},1265:function(e,t){},1472:function(e,t){},1519:function(e,t){},1543:function(e,t){},1578:function(e,t){},1605:function(e,t){},1635:function(e,t){},1647:function(e,t){},1649:function(e,t){},1660:function(e,t){},1693:function(e,t){},1730:function(e,t){},1764:function(e,t){},1794:function(e,t){},1853:function(e,t){},1882:function(e,t){},1925:function(e,t){},1936:function(e,t){},1938:function(e,t){},1966:function(e,t){},1981:function(e,t){},2014:function(e,t){},2068:function(e,t){},2099:function(e,t,a){},2101:function(e,t,a){},2108:function(e,t,a){},2110:function(e,t,a){},2112:function(e,t,a){},2114:function(e,t,a){},2117:function(e,t,a){"use strict";a.r(t);var n=a(4),r=a.n(n),s=a(861),i=a.n(s),c=(a(880),a(882),a(68)),o=a(69),l=a(71),u=a(70),d=a(72),h=a(2118),p=a(862),g=function(e){function t(){return Object(c.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(o.a)(t,[{key:"render",value:function(){return r.a.createElement(h.a,{basename:"/dchat"},r.a.createElement(p.a,null))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(r.a.createElement(g,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},440:function(e,t,a){"use strict";a.d(t,"a",function(){return m}),a.d(t,"b",function(){return v});var n=a(441),r=a.n(n),s=a(73),i=a(865),c=a(442),o=a.n(c),l=a(866),u=a.n(l),d=a(67),h=a(63),p=a.n(h),g=a(443),f=a.n(g);function m(e){return new Promise(function(t,a){e||(e=o.a.generateMnemonic());var n=o.a.mnemonicToSeed(e,"da-bears-da-champs"),r=u.a.hmac.create("fat-ass-seed");r.update(n);var s=new Uint8Array(r.array());d.keys.generateKeyPairFromSeed("ed25519",s,function(a,n){p.a.createFromPubKey(d.keys.marshalPublicKey(n.public),function(a,n){t({mnemonic:e,peerId:n._idB58String})})})})}var y=function(){var e=Object(i.a)(r.a.mark(function e(t){var a,n,i=arguments;return r.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return a=i.length>1&&void 0!==i[1]?i[1]:{},n=Object(s.a)({hash:"SHA256",hmacSeed:"ob-hash"},a),e.abrupt("return",new Promise(function(e,a){d.hmac.create(n.hash,f.a.decodeUTF8(n.hmacSeed),function(n,r){n?a(n):r.digest(f.a.decodeUTF8(t),function(t,n){t?a(t):e(n)})})}));case 3:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}();function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:4096;return new Promise(function(a,n){y(e,{hmacSeed:"ob-identity"}).then(function(e){d.keys.generateKeyPairFromSeed("ed25519",e,t,function(e,t){e?n(e):p.a.createFromPubKey(d.keys.marshalPublicKey(t.public),function(e,n){a({peerId:n.toBytes(),publicKey:t.public.bytes,privateKey:t.bytes})})})},function(e){return n(e)})})}},444:function(e,t,a){"use strict";var n=a(79),r=a(68),s=a(69),i=a(71),c=a(70),o=a(72),l=a(36),u=a(4),d=a.n(u),h=a(227),p=(a(859),a(860),a(2108),function(e){function t(e){var a;return Object(r.a)(this,t),(a=Object(i.a)(this,Object(c.a)(t).call(this,e))).state={seed:""},a.handleInputChange=a.handleInputChange.bind(Object(l.a)(Object(l.a)(a))),a}return Object(o.a)(t,e),Object(s.a)(t,[{key:"handleInputChange",value:function(e){var t=e.target,a="checkbox"===t.type?t.checked:t.value,r=t.name;this.setState(Object(n.a)({},r,a))}},{key:"render",value:function(){var e=this;return d.a.createElement("div",{className:"Login"},d.a.createElement("h1",{className:"rowLg txRt"},"Who be you?"),d.a.createElement("input",{type:"text",placeholder:"Enter your seed",className:"width100 rowMd",name:"seed",onChange:this.handleInputChange}),d.a.createElement("div",{className:"flexVCent"},d.a.createElement("div",{className:"flexNoShrink"},d.a.createElement(h.a,{to:"/register"},"I don't have a seed \ud83d\ude1e")),d.a.createElement("div",{className:"flexHRight"},d.a.createElement("button",{onClick:function(){return e.props.onLogin(e.state.seed)}},"Login"))))}}]),t}(u.Component));t.a=p},560:function(e,t){},609:function(e,t){},859:function(e,t,a){},860:function(e,t,a){},862:function(e,t,a){"use strict";(function(e){var n=a(79),r=a(445),s=a(73),i=a(68),c=a(69),o=a(71),l=a(70),u=a(72),d=a(36),h=a(4),p=a.n(h),g=a(140),f=a(874),m=a(2119),y=a(225),v=a.n(y),b=a(226),E=a.n(b),O=a(863),j=a.n(O),C=a(864),I=a.n(C),S=a(63),k=a(439),N=a(14),w=a.n(N),R=a(10),T=a.n(R),P=a(440),x=a(867),L=(a(2099),a(868)),D=a(444),A=a(869),_=a(870),M=a(871),F=function(t){function a(e){var t;return Object(i.a)(this,a),(t=Object(o.a)(this,Object(l.a)(a).call(this,e))).state={registerSeed:null,registerSeedError:null,userId:null,chats:{}},t.handleLogin=t.handleLogin.bind(Object(d.a)(Object(d.a)(t))),t.handleRegenerate=t.handleRegenerate.bind(Object(d.a)(Object(d.a)(t))),t.handleStartChat=t.handleStartChat.bind(Object(d.a)(Object(d.a)(t))),t.handleChatSend=t.handleChatSend.bind(Object(d.a)(Object(d.a)(t))),t.generateRegisterSeed(),t}return Object(u.a)(a,t),Object(c.a)(a,[{key:"getIpfsNodeInitOpts",value:function(e,t){if("string"!==typeof e)throw new Error("Please provide a peerId as a string.");if("string"!==typeof t)throw new Error("Please provide a privateKey as a string.");return{EXPERIMENTAL:{pubsub:!0},relay:{enabled:!0,hop:{enabled:!0}},repo:"./ipfs/".concat(e),init:{privateKey:t}}}},{key:"handleLogin",value:function(e){var t=this;e&&"string"===typeof e||alert("I'm gonna need a seed slick willy!"),Object(P.b)(e).then(function(a){var i=Object(S.createFromBytes)(a.peerId).toB58String(),c=Object(k.fromByteArray)(a.privateKey);console.log('A seed of "'.concat(e.slice(0,25),'\u2026" gets you this peerId: ').concat(i));var o=t.getIpfsNodeInitOpts(i,c),l=new I.a(o);l.on("ready",function(){l.libp2p.start(function(){t.node=l,t.setState({userId:i}),console.log("connecting to the relay peer at ".concat(t.ipfsRelayPeer)),l.swarm.connect(t.ipfsRelayPeer,function(e){if(e)throw e;console.log("connected to relay peer")}),l._libp2pNode.handle("dabears/1",function(e,a){console.log("pulling in incoming message"),T()(a,T.a.collect(function(e,a){if(e)return console.error("There was an error pulling in an incoming chat message:",e);var i=JSON.parse(a[0]);console.dir(i);var c=t.state.chats[i.peerId]||t.defaultChat,o=Object(s.a)({},c,{messages:Object(r.a)(c.messages).concat([{id:i.messageId,outgoing:!1,msg:i.message,sending:!1,failed:!1}])});t.setState({chats:Object(s.a)({},t.state.chats,Object(n.a)({},i.peerId,o))}),console.dir({chats:Object(s.a)({},t.state.chats,Object(n.a)({},i.peerId,o))})}))})})})}).catch(function(e){alert("There was an error generating your peerId: ".concat(e.message))})}},{key:"handleRegenerate",value:function(){this.generateRegisterSeed()}},{key:"handleStartChat",value:function(e){"string"===typeof e&&e.startsWith("Qm")?e===this.state.userId?alert("We cannot condone chatting with yourself. Please try again."):this.props.history.push("/chat/".concat(e)):alert("Please provide a valid peer id.")}},{key:"getChatPayload",value:function(t){if("string"!==typeof t)throw new Error("Please provide a message as a string.");var a=new Date,n="".concat("","!").concat(a.toISOString()),r=E.a.createHash("sha256").update(n).digest(),s=new Uint8Array(r),i=new e(s.buffer),c=w.a.encode(i,18);return{messageId:w.a.toB58String(c),subject:"",message:t,timestamp:{seconds:Math.floor(a/1e3),nanos:0},flag:0}}},{key:"handleChatSend",value:function(e,t){var a=this;if("string"!==typeof e||!e.startsWith("Qm"))throw new Error("I need a peerId to send to.");if("string"===typeof t&&t){var i=this.state.chats[e];if(i){var c=v()(),o=this.state.userId;this.setState({chats:Object(s.a)({},this.state.chats,Object(n.a)({},e,Object(s.a)({},i,{messages:Object(r.a)(i.messages).concat([{id:c,outgoing:!0,msg:t,sending:!0}])})))});var l=function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];a.setState({chats:Object(s.a)({},a.state.chats,Object(n.a)({},e,Object(s.a)({},a.state.chats[e],{messages:a.state.chats[e].messages.map(function(e){return e.id===c?Object(s.a)({},e,{failed:t,sending:!1}):e})})))})},u="/p2p-circuit/ipfs/".concat(e);console.log("will send to ".concat(e," at ").concat(u)),this.node.swarm.connect(u,function(n){if(n)return l(!0),console.error(n);console.log("connected to ".concat(e)),a.node._libp2pNode.dialProtocol(u,"dabears/1",function(e,n){if(e)return l(!0),console.error(e);var r=a.getChatPayload(t),i=JSON.stringify(Object(s.a)({},r,{peerId:o}));console.log("pushing outgoing message"),T()(T.a.once(i),n,T.a.collect(function(e,t){if(e)return console.error(e);console.log("received echo:",t.toString())})),l()})})}}else alert("Please provide a message.")}},{key:"generateRegisterSeed",value:function(){var e=this;Object(P.a)().then(function(t){return e.setState({registerSeed:t.mnemonic,registerSeedError:null})},function(t){e.setState({registerSeed:null,registerSeedError:t}),console.error("There was an error generating the register seed.",t)})}},{key:"requiresLogin",value:function(e,t){var a=this;return function(n){var r=Object(s.a)({},n,t);return a.isLoggedIn?p.a.createElement(e,r):p.a.createElement(D.a,{onLogin:a.handleLogin})}}},{key:"render",value:function(){var e=this,t=this.isLoggedIn?"/start-chat/":"/login/",a=this.state.chats;return p.a.createElement("div",{className:"App"},p.a.createElement(L.a,{chats:Object.keys(a)}),p.a.createElement("div",{className:"mainContent"},p.a.createElement(g.a,{path:"/",exact:!0,render:function(){return p.a.createElement(f.a,{to:t})}}),p.a.createElement(g.a,{path:"/login/",exact:!0,render:function(){return e.isLoggedIn?p.a.createElement(f.a,{to:"/start-chat/"}):p.a.createElement(D.a,{onLogin:e.handleLogin})}}),p.a.createElement(g.a,{path:"/register/",exact:!0,render:function(t){return p.a.createElement(A.a,{seed:e.state.registerSeed,onRegenerate:e.handleRegenerate})}}),p.a.createElement(g.a,{path:"/start-chat/",exact:!0,render:this.requiresLogin(_.a,{onStartChat:this.handleStartChat})}),p.a.createElement(g.a,{path:"/chat/:receiver",exact:!0,render:function(t){var a=t.match.params.receiver,n=e.state.chats[a]=e.state.chats[a]||e.defaultChat;return e.requiresLogin(M.a,Object(s.a)({},t,n,{receiver:a,onChatSend:e.handleChatSend}))(t)}})))}},{key:"ipfsRelayPeer",get:function(){return"/ip4/127.0.0.1/tcp/4003/ws/ipfs/QmSykrDTzsUy7SMvKaZwg6gewrd2mFkbmqH5AWprAzy2HJ"}},{key:"root",get:function(){return this._rootPB||(this._rootPB=j.a.Root.fromJSON(x)),this._rootPB}},{key:"ChatPB",get:function(){return this._ChatPB||(this._ChatPB=this.root.lookupType("Chat")),this._ChatPB}},{key:"isLoggedIn",get:function(){return!!this.state.userId}},{key:"defaultChat",get:function(){return{isTyping:!1,messages:[]}}}]),a}(h.Component);t.a=Object(m.a)(F)}).call(this,a(0).Buffer)},867:function(e){e.exports={options:{go_package:"pb"},nested:{Message:{fields:{messageType:{type:"MessageType",id:1},payload:{type:"google.protobuf.Any",id:2},requestId:{type:"int32",id:3},isResponse:{type:"bool",id:4}},nested:{MessageType:{values:{PING:0,CHAT:1,FOLLOW:2,UNFOLLOW:3,ORDER:4,ORDER_REJECT:5,ORDER_CANCEL:6,ORDER_CONFIRMATION:7,ORDER_FULFILLMENT:8,ORDER_COMPLETION:9,DISPUTE_OPEN:10,DISPUTE_UPDATE:11,DISPUTE_CLOSE:12,REFUND:13,OFFLINE_ACK:14,OFFLINE_RELAY:15,MODERATOR_ADD:16,MODERATOR_REMOVE:17,STORE:18,BLOCK:19,VENDOR_FINALIZED_PAYMENT:20,ERROR:500}}}},Envelope:{fields:{message:{type:"Message",id:1},pubkey:{type:"bytes",id:2},signature:{type:"bytes",id:3}}},Chat:{fields:{messageId:{type:"string",id:1},subject:{type:"string",id:2},message:{type:"string",id:3},timestamp:{type:"google.protobuf.Timestamp",id:4},flag:{type:"Flag",id:5}},nested:{Flag:{values:{MESSAGE:0,TYPING:1,READ:2}}}},SignedData:{fields:{senderPubkey:{type:"bytes",id:1},serializedData:{type:"bytes",id:2},signature:{type:"bytes",id:3}},nested:{Command:{fields:{peerID:{type:"string",id:1},type:{type:"Message.MessageType",id:2},timestamp:{type:"google.protobuf.Timestamp",id:3}}}}},CidList:{fields:{cids:{rule:"repeated",type:"string",id:1,options:{packed:!0}}}},Block:{fields:{rawData:{type:"bytes",id:1},cid:{type:"string",id:2}}},Error:{fields:{code:{type:"uint32",id:1},errorMessage:{type:"string",id:2},orderID:{type:"string",id:3}}},google:{nested:{protobuf:{nested:{Any:{fields:{type_url:{type:"string",id:1},value:{type:"bytes",id:2}}},Timestamp:{fields:{seconds:{type:"int64",id:1},nanos:{type:"int32",id:2}}}}}}}}}},868:function(e,t,a){"use strict";var n=a(68),r=a(69),s=a(71),i=a(70),c=a(72),o=a(4),l=a.n(o),u=a(873),d=(a(2101),function(e){function t(){return Object(n.a)(this,t),Object(s.a)(this,Object(i.a)(t).apply(this,arguments))}return Object(c.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return l.a.createElement("nav",{className:"SiteNav flexVCent gutterH"},l.a.createElement("div",{className:"logo"},l.a.createElement("div",null,"\ud83c\udde9"),"CHAT")," :",l.a.createElement("div",null,l.a.createElement(u.a,{to:"/start-chat/",activeClassName:"active"},"\ud83d\udcac New Chat")),this.props.chats.map(function(e){return l.a.createElement("div",{key:e},l.a.createElement(u.a,{to:"/chat/".concat(e),activeClassName:"active"},e.slice(0,10),"\u2026"))}))}}]),t}(o.Component));t.a=d},869:function(e,t,a){"use strict";var n=a(68),r=a(69),s=a(71),i=a(70),c=a(72),o=a(4),l=a.n(o),u=a(227),d=(a(859),a(860),a(2110),function(e){function t(){return Object(n.a)(this,t),Object(s.a)(this,Object(i.a)(t).apply(this,arguments))}return Object(c.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this,t=this.props.seed;return t||(t=l.a.createElement("div",{className:"center"},"Generating\u2026")),l.a.createElement("div",{className:"Register"},l.a.createElement("h1",{className:"rowLg txRt"},"You do now!"),l.a.createElement("div",{className:"border seed rowMd"},t),l.a.createElement("div",{className:"flexVCent"},l.a.createElement("div",{className:"flexNoShrink"},l.a.createElement("a",{onClick:function(){return e.props.onRegenerate()}},"Re-generate")),l.a.createElement("div",{className:"flexHRight"},l.a.createElement(u.a,{to:"/login/"},"\u2b05\ufe0fBack"))))}}]),t}(o.Component));t.a=d},870:function(e,t,a){"use strict";var n=a(79),r=a(68),s=a(69),i=a(71),c=a(70),o=a(72),l=a(36),u=a(4),d=a.n(u),h=(a(2112),function(e){function t(e){var a;return Object(r.a)(this,t),(a=Object(i.a)(this,Object(c.a)(t).call(this,e))).state={receiverPeerId:""},a.handleInputChange=a.handleInputChange.bind(Object(l.a)(Object(l.a)(a))),a}return Object(o.a)(t,e),Object(s.a)(t,[{key:"handleInputChange",value:function(e){var t=e.target,a="checkbox"===t.type?t.checked:t.value,r=t.name;this.setState(Object(n.a)({},r,a))}},{key:"render",value:function(){var e=this;return d.a.createElement("div",{className:"StartConvo"},d.a.createElement("h1",{className:"rowLg txRt"},"Who ya wanna chat with?"),d.a.createElement("input",{type:"text",placeholder:"Enter a peerId",className:"width100 rowMd",name:"receiverPeerId",onChange:this.handleInputChange}),d.a.createElement("div",{className:"flex"},d.a.createElement("div",{className:"flexHRight"},d.a.createElement("button",{onClick:function(){return e.props.onStartChat(e.state.receiverPeerId)}},"Chat"))))}}]),t}(u.Component));t.a=h},871:function(e,t,a){"use strict";var n=a(79),r=a(68),s=a(69),i=a(71),c=a(70),o=a(72),l=a(36),u=a(4),d=a.n(u),h=(a(2114),function(e){function t(e){var a;return Object(r.a)(this,t),(a=Object(i.a)(this,Object(c.a)(t).call(this,e))).state={chatText:""},a.handleInputChange=a.handleInputChange.bind(Object(l.a)(Object(l.a)(a))),a.handleChatTextKeyUp=a.handleChatTextKeyUp.bind(Object(l.a)(Object(l.a)(a))),a.messagesRef=d.a.createRef(),a}return Object(o.a)(t,e),Object(s.a)(t,[{key:"handleInputChange",value:function(e){var t=e.target,a="checkbox"===t.type?t.checked:t.value,r=t.name;this.setState(Object(n.a)({},r,a))}},{key:"handleChatTextKeyUp",value:function(e){13===e.keyCode&&(this.setState({chatText:""}),this.props.onChatSend(this.props.receiver,this.state.chatText))}},{key:"componentDidMount",value:function(){var e=this.messagesRef.current;e.scrollTop=e.scrollHeight}},{key:"componentWillReceiveProps",value:function(e){var t=this.messagesRef.current,a=this.props.messages[this.props.messages.length-1],n=e.messages[e.messages.length-1];n&&(!a||a.id!==n.id)&&t.scrollTop>=t.scrollHeight-t.offsetHeight-15&&(this.scrollTo=t.scrollHeight)}},{key:"componentDidUpdate",value:function(){var e=this.messagesRef.current;"number"===typeof this.scrollTo&&(e.scrollTop=this.scrollTo),this.scrollTo=null}},{key:"render",value:function(){var e=this,t=this.props.messages.find(function(e){return e.failed})?d.a.createElement("div",{className:"failedInfo"},d.a.createElement("a",{onClick:function(){return alert("The most likely reason in the person you are chatting with is offline. This app does not support offline messages at this time. If you are sure the other party is online, it's possible that both your ports are blocked and you are unable to connect to the relay server.")}},"Why have some of my messages failed?")):null;return d.a.createElement("div",{className:"Conversation"},d.a.createElement("div",{className:"chatContent rowLg"},d.a.createElement("h1",null,this.props.receiver.slice(0,20),this.props.receiver.length>20?"\u2026":""),d.a.createElement("ul",{className:"messages unstyled",ref:this.messagesRef},this.props.messages.map(function(e){var t=null;e.sending?t=d.a.createElement("span",null,"\ud83d\udce1"):e.failed&&(t=d.a.createElement("span",null,"\u274c"));var a=e.outgoing?"outgoing":"";return d.a.createElement("div",{className:a,key:e.id},d.a.createElement("div",{className:"status"},t),d.a.createElement("li",null,e.msg))})),d.a.createElement("div",{className:"flexVCent gutterH"},d.a.createElement("div",{className:"flexExpand"},d.a.createElement("input",{type:"text",className:"width100",placeholder:"Say something clever...",name:"chatText",value:this.state.chatText,onChange:this.handleInputChange,onKeyUp:this.handleChatTextKeyUp})),d.a.createElement("div",null,d.a.createElement("div",{className:"flexHRight"},d.a.createElement("button",{onClick:function(){e.setState({chatText:""}),e.props.onChatSend(e.props.receiver,e.state.chatText)}},"Send"))))),t)}}]),t}(u.Component));t.a=h},875:function(e,t,a){e.exports=a(2117)},882:function(e,t,a){},884:function(e,t){},886:function(e,t){},918:function(e,t){},919:function(e,t){}},[[875,2,1]]]);
//# sourceMappingURL=main.ac4d96e8.chunk.js.map