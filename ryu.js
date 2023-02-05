var ryu = '127.0.0.1';
var controls = {};

setFlow('udp_reflection',
 {keys:'ipdestination,udpsourceport',value:'frames'});
setThreshold('udp_reflection_attack',
 {metric:'udp_reflection',value:100,byFlow:true,timeout:2});

setEventHandler(function(evt) {
 // don't consider inter-switch links
 var link = topologyInterfaceToLink(evt.agent,evt.dataSource);
 if(link) return;

 // get port information
 var port = topologyInterfaceToPort(evt.agent,evt.dataSource);
 if(!port) return;

 // need OpenFlow info to create Ryu filtering rule
 if(!port.dpid || !port.ofport) return;

 // we already have a control for this flow
 if(controls[evt.flowKey]) return;

 var [ipdestination,udpsourceport] = evt.flowKey.split(',');
 var msg = {
  priority:40000,
  dpid:parseInt(port.dpid,16),
  match: {
   in_port:port.ofport,
   dl_type:0x800,
   nw_dst:ipdestination+'/32',
   nw_proto:17,
   tp_src:udpsourceport 
  }
 };

 var resp = http2({
  url:'http://'+ryu+':8080/stats/flowentry/add',
  headers:{'Content-Type':'application/json','Accept':'application/json'},
  operation:'post',
  body: JSON.stringify(msg)
 });

 controls[evt.flowKey] = {
  time:Date.now(),
  threshold:evt.thresholdID,
  agent:evt.agent,
  metric:evt.dataSource+'.'+evt.metric,
  msg:msg
 };

 logInfo("blocking " + evt.flowKey);
},['udp_reflection_attack']);

setIntervalHandler(function() {
 var now = Date.now();
 for(var key in controls) {
  let rec = controls[key];

  // keep control for at least 10 seconds
  if(now - rec.time < 10000) continue;
  // keep control if threshold still triggered
  if(thresholdTriggered(rec.threshold,rec.agent,rec.metric,key)) continue;

  var resp = http2({
   url:'http://'+ryu+':8080/stats/flowentry/delete',
   headers:{'Content-Type':'application/json','Accept':'application/json'},
   operation:'post',
   body: JSON.stringify(rec.msg)
  });

  delete controls[key];

  logInfo("unblocking " + key);
 }
});