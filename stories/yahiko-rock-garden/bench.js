// Match v24 bridgeVisitors: two distinct near-black silhouettes, leaning together, hands hidden.
function restingCouple(x,y,s){
 g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#080e15';g.strokeStyle='#080e15';g.lineCap='round';g.lineJoin='round';
 g.beginPath();g.ellipse(-10,-65,7.2,9,.25,0,TAU);g.fill();g.beginPath();g.ellipse(11,-61,7,8.5,-.35,0,TAU);g.fill();
 g.beginPath();g.moveTo(-18,-56);g.quadraticCurveTo(-6,-61,0,-46);g.lineTo(4,-2);g.quadraticCurveTo(-8,3,-24,-2);g.lineTo(-23,-40);g.closePath();g.fill();
 g.beginPath();g.moveTo(10,-52);g.quadraticCurveTo(21,-60,26,-46);g.lineTo(30,-3);g.quadraticCurveTo(17,3,3,-2);g.lineTo(2,-39);g.closePath();g.fill();
 g.lineWidth=6;g.beginPath();g.moveTo(-19,-49);g.quadraticCurveTo(-31,-27,19,-31);g.moveTo(23,-48);g.quadraticCurveTo(4,-64,-15,-49);g.stroke();
 g.lineWidth=5.5;g.beginPath();g.moveTo(-17,-1);g.lineTo(-23,10);g.lineTo(-21,33);g.moveTo(-6,-1);g.lineTo(-9,10);g.lineTo(-6,33);g.moveTo(13,-1);g.lineTo(13,10);g.lineTo(17,30);g.moveTo(24,-2);g.lineTo(29,9);g.lineTo(32,30);g.stroke();
 ellipse(-18,34,6,2.5,'#080e15');ellipse(-3,34,6,2.5,'#080e15');ellipse(20,31,6,2.5,'#080e15');ellipse(35,31,6,2.5,'#080e15');g.restore();
}
function gardenBench(x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 const gy=u=>-u*.105;
 ellipse(148,7,170,20,'rgba(11,27,31,.25)');
 // Backrest and rear supports first; bodies and knees are in front of the backrest.
 for(const u of [18,267]){line([[u,gy(u)-88],[u,gy(u)+2]],'#3b4942',7);line([[u+2,gy(u)-88],[u+2,gy(u)+2]],'#8b8464',1);}
 for(let k=0;k<3;k++){const yy=-88+k*13;poly([[10,yy],[278,yy+gy(278)],[278,yy+gy(278)+10],[10,yy+10]],'#9f865f');line([[11,yy],[277,yy+gy(277)]],'#ccb187',1);}
 for(const u of [22,263]){line([[u+5,gy(u)-38],[u+9,gy(u)+8]],'#36443d',8);line([[u-4,gy(u)-49],[u-7,gy(u)-4]],'#475144',6);}
 poly([[0,-46],[282,-76],[302,-60],[17,-29]],'#b59a70');poly([[17,-29],[302,-60],[302,-53],[17,-22]],'#7e6c51');
 for(let k=0;k<3;k++)line([[4+k*5,-43+k*5],[286+k*5,-73+k*5]],'rgba(78,64,42,.45)',1);
 restingCouple(137,gy(137)-43,1.25);
 for(const u of [4,282]){line([[u,gy(u)-42],[u-1,gy(u)-66]],'#74694c',5);line([[u-9,gy(u)-66],[u+17,gy(u)-61]],'#c2a57a',5);}
 poly([[320,-14],[344,-19],[348,12],[322,19]],'#806748');line([[326,-16],[326,-26],[337,-28],[340,-19]],'#b39c75',2);
 g.restore();
}
