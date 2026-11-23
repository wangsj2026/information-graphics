'use strict';

const $ = selector => document.querySelector(selector);
const halls = JSON.parse($('#hall-data').textContent);
const study = halls.find(hall => hall.building_id === 'SX03');
const minYear = 780;
const maxYear = 860;
const modelWidth = 1462;
const modelHeight = 645;

function canvasContext(canvas, width, height) {
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext('2d');
  context.scale(2, 2);
  context.lineJoin = 'round';
  context.lineCap = 'round';
  return context;
}

function point(context, x, y, radius, fill) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
}

function segment(context, a, b, color, width = 1) {
  context.beginPath();
  context.moveTo(...a);
  context.lineTo(...b);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function polygon(context, points, fill, outline, width = 1) {
  context.beginPath();
  context.moveTo(...points[0]);
  for (const p of points.slice(1)) context.lineTo(...p);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  if (outline) {
    context.strokeStyle = outline;
    context.lineWidth = width;
    context.stroke();
  }
}

function drawExplodedModel(spread) {
  const ctx = modelContext;
  ctx.clearRect(0, 0, modelWidth, modelHeight);
  const front = study.front_bays;
  const depth = study.depth_bays;
  const originX = 670;
  const originY = 324;
  const roofZ = 2.86 + spread * 1.78;
  const deckZ = 1.96 + spread * .68;
  const columnBase = .22 + spread * .28;
  const columnTop = 1.57 + spread * .34;
  const metal = '#9e8869';
  const gold = '#dbc294';
  const white = '#f2d9aa';
  const project = ([x, y, z]) => [originX + x * 74 - y * 49, originY + x * 22 + y * 25 - z * 61];
  const line = (a, b, color, width) => segment(ctx, project(a), project(b), color, width);
  const face = (corners, fill, border = metal, width) => polygon(ctx, corners.map(project), fill, border, width);

  // Near-facing faces are painted last so rails and columns overlap cleanly.
  function box(x1, y1, z1, x2, y2, z2, top, frontFace, sideFace, stroke = metal) {
    face([[x1,y1,z2],[x2,y1,z2],[x2,y2,z2],[x1,y2,z2]], top, stroke);
    face([[x1,y2,z2],[x2,y2,z2],[x2,y2,z1],[x1,y2,z1]], frontFace, stroke);
    face([[x2,y1,z2],[x2,y2,z2],[x2,y2,z1],[x2,y1,z1]], sideFace, stroke);
  }

  const supportCorners = [[0,0],[front,0],[0,depth],[front,depth]];
  ctx.setLineDash([4,6]);
  for (const [x,y] of supportCorners) line([x,y,-.35],[x,y,roofZ+.24],'#d6b38982');
  line([0,depth+.56,-.23],[front,depth+.56,-.23],'#d0b385a0');
  line([front+.47,0,-.30],[front+.47,depth,-.30],'#d0b385a0');
  ctx.setLineDash([]);

  box(-.29,-.28,-.29,front+.29,depth+.28,-.13,'#3b504e','#182e32','#24383b','#6b807b');
  box(-.07,-.07,-.13,front+.07,depth+.07,0,'#304b4b','#294145','#25383a','#94afa3');
  for (let x=0; x <= front; x += 1) {
    line([x,0,.015],[x,depth,.015],'#9ab6a9a0');
    line([x,depth+.44,-.23],[x,depth+.66,-.23],'#c7b48cad');
    if (x !== front) {
      const p = project([x+.5,depth+.76,-.24]);
      ctx.fillStyle='#c9b992'; ctx.font='12px Consolas'; ctx.fillText(String(x+1),p[0],p[1]+5);
    }
  }
  for (let y=0; y <= depth; y += 1) {
    line([0,y,.015],[front,y,.015],'#9ab6a9a0');
    line([front+.30,y,-.30],[front+.63,y,-.30],'#c7b48cad');
  }

  const positions = [];
  for (let x=0; x<=front; x++) {
    for (let y=0; y<=depth; y++) {
      if (x===0 || x===front || y===0 || y===depth) positions.push([x,y]);
    }
  }
  positions.sort(([x,y],[nx,ny])=>x+y-nx-ny);
  for (const [x,y] of positions) {
    const isNear = y === depth || x === front;
    const skin = isNear ? ['#866747','#614738','#463931'] : ['#526461','#374742','#2c3c3b'];
    const border = isNear ? '#9b805d' : '#68827a';
    box(x-.103,y-.103,columnBase-.08,x+.103,y+.103,columnBase+.03,'#9a8f73','#4b4c42','#42443c',border);
    box(x-.068,y-.068,columnBase,x+.068,y+.068,columnTop,...skin,border);
    box(x-.104,y-.104,columnTop-.06,x+.104,y+.104,columnTop+.035,...skin,border);
  }
  box(-.15,depth-.12,columnTop,front+.15,depth+.12,columnTop+.13,'#b09c74','#776047','#67553e',gold);
  box(front-.11,-.14,columnTop,front+.11,depth-.13,columnTop+.13,'#a28e6b','#705940','#65583e',gold);

  // The joinery layer locates bracket sets. These simplified markers do not encode the actual joinery geometry.
  box(-.12,-.10,deckZ-.13,front+.12,.10,deckZ,'#6f7359','#394340','#3b4941','#8b896a');
  box(-.10,-.12,deckZ-.13,.10,depth+.10,deckZ,'#6f7359','#394340','#3b4941','#8b896a');
  const bracketColor = ['#c2a774','#92794e','#67563b'];
  for (const [x,y] of positions) {
    const onFront = y === depth;
    if (!onFront && x !== front) continue;
    box(x-.08,y-.08,deckZ-.24,x+.08,y+.08,deckZ-.12,'#ad9164','#846b47','#59533d',gold);
    box(x-(onFront?.21:.135),y-(onFront?.135:.21),deckZ-.12,x+(onFront?.21:.135),y+(onFront?.135:.21),deckZ-.02,...bracketColor);
    box(x-(onFront?.155:.255),y-(onFront?.255:.155),deckZ-.02,x+(onFront?.155:.255),y+(onFront?.255:.155),deckZ+.08,...bracketColor);
    box(x-.115,y-.115,deckZ+.075,x+.115,y+.115,deckZ+.16,...bracketColor);
  }
  box(-.14,depth-.08,deckZ+.14,front+.14,depth+.08,deckZ+.23,'#bd9c69','#836846','#6b5d40',gold);
  box(front-.08,-.12,deckZ+.14,front+.08,depth-.09,deckZ+.23,'#ad9362','#765f43','#61543c',gold);

  const a=[-.52,-.58,roofZ], b=[front+.52,-.58,roofZ];
  const c=[front+.52,depth+.58,roofZ], d=[-.52,depth+.58,roofZ];
  const r0=[1.4,depth/2,roofZ+1.25], r1=[front-1.4,depth/2,roofZ+1.25];
  const mix=(p,q,t)=>p.map((value,index)=>value+(q[index]-value)*t);
  const lower=(p,f)=>[p[0],p[1],p[2]-f];
  function roofSurface(e0,e1,p0,p1,fill,ribs) {
    const at=(u,v)=>{
      const e=mix(e0,e1,u), r=mix(p0,p1,u);
      const t=mix(e,r,v);
      t[2] -= .18 * Math.sin(Math.PI*v);
      t[2] += .115 * Math.pow(Math.abs(2*u-1),5) * Math.pow(1-v,2);
      return t;
    };
    const coordinate = (u,v)=>project(at(u,v));
    const row = (v,forward)=>Array.from({length:25},(_,i)=>coordinate((forward?i:24-i)/24,v));
    const seam = (u,forward)=>Array.from({length:13},(_,i)=>coordinate(u,(forward?i:12-i)/12));
    const edges = row(0,true).concat(seam(1,true),row(1,false),seam(0,false));
    polygon(ctx,edges,fill,'#8c8c75');
    function drawLine(points,color,width) {
      ctx.beginPath(); ctx.moveTo(...points[0]);
      points.slice(1).forEach(p=>ctx.lineTo(...p));
      ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
    }
    for (let n=1;n<ribs;n++) {
      drawLine(seam(n/ribs,true),n%5===0?'#d7c39a9e':'#aaa58a63',n%5===0?1.05:.72);
    }
    for (const v of [.22,.46,.7]) drawLine(row(v,true),'#c6bd9a55',.8);
    drawLine(row(0,true),gold,1.6);
    drawLine(seam(0,true),'#d4c093',1.3);
    drawLine(seam(1,true),'#d4c093',1.3);
  }
  const roofBottom = roofZ - .15;
  face([d,c,lower(c,.15),lower(d,.15)],'#5a4733',gold);
  face([b,c,lower(c,.15),lower(b,.15)],'#493e31',gold);
  roofSurface(a,b,r0,r1,'#344c4a',68);
  roofSurface(a,d,r0,r0,'#3f514b',37);
  roofSurface(d,c,r0,r1,'#4c5b4d',68);
  roofSurface(b,c,r1,r1,'#7b6546',38);
  line(r0,r1,'#534435',6);
  line(r0,r1,white,2);
  for (const [tip,dir] of [[r0,-1],[r1,1]]) {
    line(tip,[tip[0]+dir*.18,tip[1],tip[2]+.12],white,2.7);
    line([tip[0]+dir*.18,tip[1],tip[2]+.12],[tip[0]+dir*.11,tip[1],tip[2]+.25],white,2.5);
  }
  for (let i=0; i<=front*6; i++) {
    const x = -.48 + (front+.96)*i/(front*6);
    line([x,depth+.58,roofBottom+.02],[x,depth+.58,roofBottom+.085],'#cfb685',1);
  }

  const anchors = [
    {tag:'A', position:[front-.44,depth/2+.29,roofZ+.70], x:1256, y:126, label:'单檐庑殿'},
    {tag:'B', position:[front,depth-.84,deckZ+.12], x:1290, y:311, label:'外檐铺作'},
    {tag:'C', position:[front,depth-1.0,columnBase+.51], x:1283, y:437, label:'外柱列'},
    {tag:'D', position:[.43,depth,.013], x:371, y:527, label:'面阔计数基面', left:true}
  ];
  for (const {tag,position,x,y,label,left} of anchors) {
    const anchor=project(position);
    const stemX=left?x+28:x-18;
    segment(ctx,anchor,[stemX,y], '#f0bd809c');
    if (!left) segment(ctx,[stemX,y],[x,y],'#f0bd809c');
    point(ctx,anchor[0],anchor[1],3.4,white);
    ctx.fillStyle='#253337';
    ctx.fillRect(x,y-12,24,24);
    ctx.strokeStyle='#bb976a';
    ctx.strokeRect(x,y-12,24,24);
    ctx.font='15px Consolas'; ctx.fillStyle=white; ctx.fillText(tag,x+8,y+5);
    ctx.font='15px Microsoft YaHei'; ctx.fillStyle='#d5c4a7';
    if (left) ctx.fillText(label,x-6,y+29);
    else ctx.fillText(label,x+33,y+6);
  }
}

const modelContext = canvasContext($('#model'), modelWidth, modelHeight);
drawExplodedModel(1);
const slider = $('#explode');
slider.addEventListener('input', () => drawExplodedModel(Number(slider.value)));
$('#reset').addEventListener('click', () => {
  slider.value = 1;
  drawExplodedModel(1);
});
if (!new URLSearchParams(location.search).has('print')) $('.sheet').classList.add('interactive');

const firstYear = halls[0].year_ce;
const lastYear = halls.at(-1).year_ce;
$('#range').textContent = firstYear + ' / ' + lastYear;
const archive=$('#archive');
const plans=$('#plans');
const joints=$('#joints');
const axis=$('#axis');
const axisPosition=year=>100*(year-minYear)/(maxYear-minYear);
for(let year=minYear; year<=maxYear; year+=10){
  const tick=document.createElement('div');
  tick.className='tick';
  tick.textContent=year;
  tick.style.left=axisPosition(year)+'%';
  axis.append(tick);
}
for(const [i,hall] of halls.entries()){
  const plate=document.createElement('figure');
  plate.innerHTML='<img><figcaption><p class="date mono"></p><h3></h3><p class="place"></p></figcaption>';
  const img=plate.querySelector('img');
  img.src=hall.photo;
  img.alt=hall.building_name+'实景';
  plate.querySelector('.date').textContent=hall.building_id+' / '+hall.year_ce;
  plate.querySelector('h3').textContent=hall.building_name;
  plate.querySelector('.place').textContent=hall.county+' · '+hall.roof_type;
  archive.append(plate);

  const x=axisPosition(hall.year_ce);
  if(i>0){
    const previous=halls[i-1].year_ce;
    const interval=document.createElement('div');
    const value=document.createElement('span');
    interval.className='interval';
    interval.style.left=axisPosition(previous)+'%';
    interval.style.width=(x-axisPosition(previous))+'%';
    value.textContent=(hall.year_ce-previous)+' 年';
    interval.append(value); axis.append(interval);
  }
  const marker=document.createElement('div');
  marker.className='marker';
  marker.style.left=x+'%';
  const event=document.createElement('div');
  event.className='event'+(i===0?' first':i===halls.length-1?' last':'');
  event.style.left=x+'%';
  event.innerHTML='<strong></strong><span></span>';
  event.querySelector('strong').textContent=hall.year_ce;
  event.querySelector('span').textContent=hall.building_name+' · '+hall.event_type;
  axis.append(marker,event);

  const plan=document.createElement('article');
  plan.className='plandata';
  plan.innerHTML='<div><h3></h3><p class="planmetric"></p><p class="submetric"></p></div><canvas class="plan"></canvas>';
  plan.querySelector('h3').textContent=hall.building_name;
  plan.querySelector('.planmetric').textContent=hall.front_bays+' × '+hall.depth_bays;
  plan.querySelector('.submetric').textContent='间数比 '+(hall.front_bays/hall.depth_bays).toFixed(2);
  const planCanvas=plan.querySelector('canvas');
  planCanvas.setAttribute('aria-label',hall.front_bays+'间面阔，'+hall.depth_bays+'间进深');
  plans.append(plan);
  drawCountPlan(planCanvas,hall.front_bays,hall.depth_bays);
  plan.dataset.cells=String(hall.front_bays*hall.depth_bays);

  const row=document.createElement('tr');
  row.innerHTML='<th scope="row"></th><td class="spec"></td><td><div class="tokens"></div></td><td class="mono"></td>';
  row.querySelector('th').textContent=hall.short_name;
  row.querySelector('.spec').textContent=hall.bracket_puzuo===7?'七铺作':'五铺作';
  const tokens=row.querySelector('.tokens');
  for(const [count,glyph,angled] of [[hall.horizontal_jumps,'抄',false],[hall.angled_jumps,'昂',true]]){
    for(let n=0;n<count;n++){
      const token=document.createElement('span');
      token.className='token'+(angled?' angled':'');
      token.textContent=glyph;
      tokens.append(token);
    }
  }
  row.lastElementChild.textContent=(hall.horizontal_jumps+hall.angled_jumps)+' 跳';
  joints.append(row);
}

function drawCountPlan(canvas, front, depth){
  const ctx=canvasContext(canvas,209,113);
  const x0=16, y0=12, stepX=22, stepY=16;
  ctx.lineWidth=.8;
  for(let x=0;x<front;x++){
    for(let y=0;y<depth;y++){
      const px=x0+x*stepX, py=y0+y*stepY;
      ctx.fillStyle=y===depth-1?'#dbbdae':'#eeeadc';
      ctx.fillRect(px,py,stepX,stepY);
      ctx.strokeStyle='#75837b';
      ctx.strokeRect(px,py,stepX,stepY);
    }
  }
  const width=front*stepX, height=depth*stepY;
  ctx.fillStyle='#475a54'; ctx.font='11px Consolas';
  for(let x=0;x<front;x++)ctx.fillText(String(x+1),x0+x*stepX+7,y0+height+15);
  for(let y=0;y<depth;y++)ctx.fillText(String.fromCharCode(65+y),x0+width+7,y0+y*stepY+12);
  segment(ctx,[x0,y0+height+23],[x0+width,y0+height+23],'#aa4e3d');
  for (const end of [x0,x0+width]) segment(ctx,[end,y0+height+20],[end,y0+height+26],'#aa4e3d');
}

function drawRoofEnd(canvas, gable){
  const ctx=canvasContext(canvas,255,105);
  const outline='#556d66', near='#c5765e', paper='#dcded0';
  const x=128, baseY=89, span=88, topY=17;
  const e0=[x-span,baseY], e1=[x+span,baseY], r=[x,topY];
  segment(ctx,[x-101,baseY+10],[x+101,baseY+10],'#a29c89');
  ctx.setLineDash([3,4]); segment(ctx,[x,9],[x,baseY+13],'#9e9f90'); ctx.setLineDash([]);
  if(gable){
    const lf=[x-50,59], rf=[x+50,59];
    polygon(ctx,[e0,lf,rf,e1],paper,outline);
    polygon(ctx,[lf,r,rf],'#cc8b72',outline);
    for(let i=1;i<11;i++) {
      const t=i/11;
      segment(ctx,[lf[0]+100*t,59],[e0[0]+176*t,baseY],'#82958a',.8);
    }
  }else{
    polygon(ctx,[e0,r,e1],'#c79a80',outline);
    for(let i=1;i<17;i++){
      const end=[e0[0]+176*i/17,baseY];
      segment(ctx,[x,topY+3],end,'#a77561',.7);
    }
  }
  segment(ctx,e0,e1,near,2);
  point(ctx,r[0],r[1],2.8,'#943c30');
}
drawRoofEnd($('#hipGable'),true);
drawRoofEnd($('#hip'),false);
function drawProportions(canvas, cases) {
  const ctx=canvasContext(canvas,1060,250);
  const zero=216, unit=74;
  const columnFill='#a6b7ae', bracketFill='#d6aa72', roofFill='#bd7866';
  ctx.setLineDash([4,4]);
  segment(ctx,[19,zero-unit],[1030,zero-unit],'#647f7488');
  ctx.setLineDash([]);
  segment(ctx,[19,zero],[1030,zero],'#9a9c89');
  ctx.font='12px Consolas'; ctx.fillStyle='#3f5651';
  ctx.fillText('1.00',18,zero-unit-6);
  ctx.fillText('0.00',18,zero-6);

  for (const [index,hall] of cases.entries()) {
    const cx=204+index*496, half=106;
    const columnTop=zero-unit;
    const bracketTop=columnTop-hall.bracket_to_column*unit;
    const ridge=bracketTop-hall.roof_to_column*unit;
    const rootColor='#4b625a', brown='#806140';
    const alignment=ctx.textBaseline;
    function dimension(y0,y1,label,value,color){
      const x=cx+half+23;
      segment(ctx,[x,y0],[x,y1],color);
      for(const y of [y0,y1]) segment(ctx,[x-4,y],[x+4,y],color);
      ctx.fillStyle=color; ctx.font='18px Consolas'; ctx.textBaseline='middle';
      ctx.fillText(value.toFixed(2),x+13,(y0+y1)/2);
      ctx.font='14px Microsoft YaHei';
      ctx.fillText(label,x+67,(y0+y1)/2);
      ctx.textBaseline=alignment;
    }
    for (const x of [cx-half+18,cx+half-18]) {
      polygon(ctx,[[x-8,zero],[x+8,zero],[x+8,columnTop],[x-8,columnTop]],columnFill,rootColor);
    }
    polygon(ctx,[[cx-half+8,columnTop],[cx+half-8,columnTop],[cx+half-4,bracketTop],[cx-half+4,bracketTop]],
      bracketFill,brown);
    for (let i=1;i<3;i++){
      const y=bracketTop+i*(columnTop-bracketTop)/3;
      segment(ctx,[cx-half+9,y],[cx+half-9,y],'#9d805a80');
    }
    polygon(ctx,[[cx-half,bracketTop],[cx,ridge],[cx+half,bracketTop]],roofFill,'#935141');
    segment(ctx,[cx,ridge],[cx,bracketTop],'#9a5147');
    for (const fraction of [.27,.55,.78]){
      const y=ridge+(bracketTop-ridge)*fraction;
      segment(ctx,[cx-half*fraction,y],[cx+half*fraction,y],'#9a514794');
    }
    dimension(zero,columnTop,'柱高',1,'#33544b');
    dimension(columnTop,bracketTop,'铺作高',hall.bracket_to_column,'#77502b');
    dimension(bracketTop,ridge,'屋架高',hall.roof_to_column,'#893c31');
    ctx.fillStyle='#21372f'; ctx.font='19px STZhongsong, SimSun, serif';
    ctx.fillText(hall.building_name,cx-half+5,242);
  }
}
drawProportions($('#measure'),halls.filter(hall=>hall.vertical_source_id));
const sheet = $('.sheet');
function fitWidth() {
  sheet.style.zoom = Math.min(1, window.innerWidth / 1600);
}
fitWidth();
window.addEventListener('resize',fitWidth);
