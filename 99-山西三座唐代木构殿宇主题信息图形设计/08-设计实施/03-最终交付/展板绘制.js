'use strict';

const halls = JSON.parse(document.getElementById('hall-data').textContent);
const $ = id => document.getElementById(id);
const svgNamespace = 'http://www.w3.org/2000/svg';
const tones = ['#8f3c30','#8b5c2d','#416661'];

function box(type,className='',content=''){
  const node=document.createElement(type);
  if(className)node.className=className;
  node.textContent=content;
  return node;
}
function svg(type,attributes={},content=''){
  const node=document.createElementNS(svgNamespace,type);
  for(const [name,value] of Object.entries(attributes))node.setAttribute(name,value);
  node.textContent=content;
  return node;
}
function line(x1,y1,x2,y2,stroke,attributes={}){
  return svg('line',{x1,y1,x2,y2,stroke,...attributes});
}
function txt(x,y,content,className,attributes={}){
  return svg('text',{x,y,class:className,...attributes},content);
}
function polygon(points,fill,stroke,attributes={}){
  return svg('polygon',{points:points.map(p=>p.join(',')).join(' '),fill,stroke,...attributes});
}

const first=halls[0].year_ce;
const last=halls.at(-1).year_ce;
$('yearSpan').textContent='公元 '+first+'—'+last+' 年，首末纪年相隔 '+(last-first)+' 年。';
const axis=$('timeline'), yOf=year=>72+(year-first)*2.78;
const xOf=year=>46-(year-first)*.43;
axis.append(svg('path',{d:'M46 72Q29 120 22 181T13.75 280.5l7 19',fill:'none',stroke:'#a34a30','stroke-width':'2'}));
axis.append(line(21,299,8,293,'#a34a30'),line(21,299,24,287,'#a34a30'));
for(const [i,hall] of halls.entries()){
  const tone=tones[i], at=yOf(hall.year_ce);
  const name=box('div');
  name.append(box('h3','',hall.building_name),box('p','',hall.county+' · '+hall.event_type),
    box('p','',hall.roof_type+' · '+hall.front_bays+' × '+hall.depth_bays+' 间'));
  $('item'+(i+1)).append(box('span','badge',hall.year_ce),name);
  const tx=xOf(hall.year_ce)+18;
  axis.append(svg('circle',{cx:xOf(hall.year_ce),cy:at,r:6,fill:'#a34a30',stroke:'#eddbc1','stroke-width':2}),
    txt(tx,at+5,hall.year_ce,'year'),txt(tx,at+25,hall.short_name+' · '+hall.event_type,'when'));
  if(i>0){
    const previous=halls[i-1].year_ce;
    axis.append(txt(tx+30,(at+yOf(previous))/2+12,(hall.year_ce-previous)+' 年','gap'));
  }

  const plan=box('article','count'), caption=box('div');
  plan.style.setProperty('--tone',tone);
  caption.append(box('h3','',hall.short_name),box('strong','',hall.front_bays+' × '+hall.depth_bays),
    box('p','','间数比 '+(hall.front_bays/hall.depth_bays).toFixed(2)));
  const grid=svg('svg',{viewBox:'0 0 134 76',role:'img','aria-label':hall.building_name+'间数网格'});
  drawGrid(grid,hall.front_bays,hall.depth_bays,tone);
  plan.append(caption,grid);
  $('plans').append(plan);

  const row=box('article','jump'), heading=box('h3','',hall.short_name), mark=box('div','tokens');
  row.style.setProperty('--tone',tone);
  heading.append(box('span','',hall.bracket_puzuo===7?'七铺作':'五铺作'));
  for(const [count,character,angled] of [[hall.horizontal_jumps,'抄',false],[hall.angled_jumps,'昂',true]]){
    for(let j=0;j<count;j++){
      const token=box('span',angled?'lower':'');
      const glyph=svg('svg',{viewBox:'0 0 27 13','aria-hidden':'true'});
      glyph.append(angled
        ? polygon([[3,2],[24,8],[20,11],[3,5]],'#c47e62','currentColor',{'stroke-width':'.8'})
        : polygon([[2,3],[25,3],[25,6],[21,8],[5,8],[2,6]],'#87a49a','currentColor',{'stroke-width':'.8'}));
      token.append(glyph,character);
      mark.append(token);
    }
  }
  mark.append(box('b','',(hall.horizontal_jumps+hall.angled_jumps)+' 跳'));
  row.append(heading,mark);
  $('jumps').append(row);


}

function drawGrid(sketch,front,depth,tone){
  const x=10,y=10,stepX=14,stepY=12;
  const width=front*stepX,height=depth*stepY;
  for(let row=0;row<depth;row++){
    for(let col=0;col<front;col++){
      sketch.append(svg('rect',{x:x+col*stepX,y:y+row*stepY,width:stepX,height:stepY,
        class:'cell',fill:row===depth-1?'#edc8ad':'#e7e4d3',stroke:'#637f74','stroke-width':'.72'}));
    }
  }
  sketch.append(line(x,y+height+7,x+width,y+height+7,tone),
    line(x,y+height+4,x,y+height+10,tone),line(x+width,y+height+4,x+width,y+height+10,tone),
    line(x+width+4,y,x+width+4,y+height,'#8e967b'));
  for(let i=0;i<=front;i++)sketch.append(line(x+i*stepX,y+height+4,x+i*stepX,y+height+10,tone,{'stroke-width':'.55'}));
}

function drawRoof(id,gabled){
  const roof=$(id);
  const p=([x,y,z])=>[20+x*10-y*5.25,50+x*3+y*6-z*20];
  const point=(x,y,z)=>p([x,y,z]);
  const hx=gabled?1:2, tx=gabled?7:6;
  const a=point(0,0,0),b=point(8,0,0),c=point(8,3.3,0),d=point(0,3.3,0);
  const ridge1=point(hx,1.65,1.7),ridge2=point(tx,1.65,1.7);
  const edge='#866750';
  roof.append(polygon([a,b,ridge2,ridge1],'#d4c7a9',edge));
  if(gabled){
    const lf=point(1,2.9,.55),rf=point(7,2.9,.55),rt=point(7,.4,.55);
    roof.append(polygon([d,c,rf,ridge2,ridge1,lf],'#cbd0b9',edge),
      polygon([b,c,rf,rt],'#d4bca0',edge),polygon([rf,rt,ridge2],'#bf775c',edge));
  }else{
    roof.append(polygon([d,c,ridge2,ridge1],'#cbd0b9',edge),polygon([b,c,ridge2],'#bf775c',edge));
  }
  for(let i=1;i<13;i++){
    const weight=i/13;
    const e=point(8*weight,3.3,0),r=point(hx+(tx-hx)*weight,1.65,1.7);
    roof.append(line(...e,...r,'#69776c',{'stroke-width':'.53','opacity':'.73'}));
  }
  roof.append(line(...ridge1,...ridge2,'#9a5944',{'stroke-width':'1.2'}),
    line(...d,...c,edge,{'stroke-width':'1.2'}),line(...c,...b,edge,{'stroke-width':'1.2'}));
}
drawRoof('gable',true);
drawRoof('hip',false);

const heightChart=$('measure'),base=129,unit=46;
const pair=halls.filter(hall=>hall.vertical_source_id);
$('delta').textContent=Math.abs(pair[1].roof_to_column-pair[0].roof_to_column).toFixed(2);
heightChart.append(line(32,base,1061,base,'#9b8770'),line(32,base-unit,1061,base-unit,'#6f8979',{'stroke-dasharray':'3 6'}),
  txt(29,base-5,'0.00','measure-tick',{'text-anchor':'end'}),txt(29,base-unit-5,'1.00','measure-tick',{'text-anchor':'end'}));
for(const [i,hall] of pair.entries()){
  const x=200+i*512, half=113, column=base-unit;
  const bracket=column-hall.bracket_to_column*unit, ridge=bracket-hall.roof_to_column*unit;
  const colors=['#486e5d','#856236','#943e2b'];
  for(const post of [x-half+21,x+half-21]){
    heightChart.append(polygon([[post-9,base],[post+9,base],[post+7,column],[post-7,column]],'#a3b4a1','#647f6e'),
      line(post,base-6,post,column+3,'#647f6e',{'stroke-width':'.55'}));
  }
  heightChart.append(polygon([[x-half+13,column],[x+half-13,column],[x+half-8,bracket],[x-half+8,bracket]],'#d9b77d','#a08052'),
    polygon([[x-half,bracket],[x,ridge],[x+half,bracket]],'#bf7a65','#966354'),
    line(x,ridge,x,bracket,'#986450'));
  for(const fraction of [.24,.45,.68,.86]){
    const y=ridge+(bracket-ridge)*fraction;
    heightChart.append(line(x-half*fraction,y,x+half*fraction,y,'#8c583e',{'stroke-width':'.68','opacity':'.7'}));
  }
  for(let k=1;k<5;k++){
    const from=x-half+8+(2*half-16)*k/5;
    heightChart.append(line(from,bracket+1,from,column-1,'#a28657',{'stroke-width':'.60'}));
  }
  const spans=[[base,column,1,'柱高'],[column,bracket,hall.bracket_to_column,'铺作高'],[bracket,ridge,hall.roof_to_column,'屋架高']];
  for(const [k,[lower,upper,value,name]] of spans.entries()){
    const dx=x+half+23,cy=(lower+upper)/2,tone=colors[k];
    heightChart.append(line(dx,upper,dx,lower,tone),line(dx-4,upper,dx+4,upper,tone),line(dx-4,lower,dx+4,lower,tone),
      txt(dx+13,cy+7,value.toFixed(2),'height-num',{fill:tone}),txt(dx+79,cy+6,name,'height-label',{fill:tone}));
  }
  heightChart.append(txt(x,base+30,hall.building_name,'height-name',{'text-anchor':'middle'}));
}

const ridge=$('chiwen');
ridge.append(svg('path',{d:'M22 81Q25 70 49 66 L60 65Q47 53 51 34Q54 19 71 12Q88 7 95 21Q95 35 82 37Q82 50 72 61L82 64Q96 65 98 73L98 88H23Z',
  fill:'#dcc6a2',stroke:'#96643d','stroke-width':'1.3'}));
ridge.append(svg('path',{d:'M62 62Q51 47 60 31Q66 21 80 19Q90 23 84 28Q69 27 66 37Q61 50 68 61 M25 73H92 M25 78H96 M25 83H96',
  fill:'none',stroke:'#96643d','stroke-width':'1'}));
for(let i=0;i<9;i++){
  ridge.append(line(57+i*3.6,24-i*.9,63+i*3.3,34-i*.32,'#a0744a',{'stroke-width':'.75'}));
}
const tile=$('tileDisk');
const tileCenter=[60,53];
for(const [radius,fill] of [[41,'#d9c39c'],[37,'none'],[30,'none'],[13,'none'],[8,'none']]){
  tile.append(svg('circle',{cx:tileCenter[0],cy:tileCenter[1],r:radius,fill,stroke:'#956343','stroke-width':'1.05'}));
}
for(let i=0;i<8;i++){
  const degrees=i*45;
  tile.append(svg('path',{d:'M60 42Q44 24 60 23Q76 24 60 42Z',fill:'none',stroke:'#916241',
    'stroke-width':'1',transform:'rotate('+degrees+' 60 53)'}));
}

function fit(){
  if(!new URLSearchParams(location.search).has('print'))$('board').style.zoom=Math.min(1,innerWidth/1600);
}
fit();
addEventListener('resize',fit);
document.documentElement.dataset.ready='yes';
