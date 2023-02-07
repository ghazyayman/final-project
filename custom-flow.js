var ryu = '127.0.0.1';
var controls = {};

setFlow('udp_reflection', {keys:'ipdestination,udpsourceport',value:'frames'});
setThreshold('udp_reflection_attack', {metric:'udp_reflection',value:100,byFlow:true,timeout:2});

setFlow('icmp_reflection', {keys:'ipdestination,icmptype',value:'frames'});
setThreshold('icmp_reflection_attack', {metric:'icmp_reflection',value:100,byFlow:true,timeout:2});

setFlow('tcp_reflection', {keys:'ipdestination,tcpsourceport',value:'frames'});
setThreshold('tcp_reflection_attack', {metric:'tcp_reflection',value:100,byFlow:true,timeout:2});

setEventHandler(function(evt) {
if(link) return;

// get port information
var port = topologyInterfaceToPort(evt.agent,evt.dataSource);
if(!port) return;

// need OpenFlow info to create Ryu filtering rule
if(!port.dpid || !port.ofport) return;

// we already have a control for this flow
if(controls[evt.flowKey]) return;

var flowKeyData = evt.flowKey.split(',');
var msg = {
priority:40000,
dpid:parseInt(port.dpid,16),
match: {
in_port:port.ofport
}
};

if(evt.metric === 'udp_reflection') {
msg.match.dl_type = 0x800;
msg.match.nw_dst = flowKeyData[0] + '/32';
msg.match.nw_proto = 17;
msg.match.tp_src = flowKeyData[1];
} else if(evt.metric === 'icmp_reflection') {
msg.match.dl_type = 0x800;
msg.match.nw_dst = flowKeyData[0] + '/32';
msg.match.nw_proto = 1;
msg.match.nw_tos = flowKeyData[1];
} else if(evt.metric === 'tcp_reflection') {
msg.match.dl_type = 0x800;
msg.match.nw_dst = flowKeyData[0] + '/32';
msg.match.nw_proto = 6;
msg.match.tp_src = flowKeyData[1];
}

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
},['udp_reflection_attack', 'icmp_reflection_attack', 'tcp_reflection_attack']);