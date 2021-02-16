var doc=document,win=window,SZ,nums,temp;
var abs=Math.abs,rnd=Math.random,round=Math.round,max=Math.max,min=Math.min;
var ceil=Math.ceil,floor=Math.floor,sin=Math.sin,cos=Math.cos,PI=Math.PI;
var CVS=doc.querySelector("#comp1"),CVS2=doc.querySelector("#comp2");
var C=CVS.getContext("2d"),C2=CVS2.getContext("2d");
function normInt(s){ return parseInt(s,32)-SZ }
function d2r(n){ return n*PI/180 }
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function clear( C ){ C.clearRect(0,0,SZ,SZ) }
function getNums2(){
	var hashSingles=[],seed,rvs,i=0;
	seed = parseInt( tokenData.hash.slice(0,16), 16 );
	for(i=0;i<64;i++) hashPairs.push(tokenData.hash.charAt(i));
	rvs = hashPairs.map(n=>parseInt(n,16));
	return rvs;
}
function getNums(){
	var hashPairs=[],seed,rvs,i=0;
	seed = parseInt( tokenData.hash.slice(0,16), 16 );
	for(i=0;i<32;i++){
		hashPairs.push(
			tokenData.hash.slice( 2+(i*2),4+(i*2) )
		);
	}
	rvs = hashPairs.map(n=>parseInt(n,16));
	return rvs;
}
function xhrIsReady( xhr ){ return xhr.readyState === 4 && xhr.status === 200; }
function xhrPOST( url, callback ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if ( xhrIsReady(xhr) ){
			callback( xhr.response );
		}
	}
	xhr.open( "POST", url );
	xhr.send();
}
function canvasAction( callback ){
	C.save();
	C2.save();
	C.beginPath();
	callback( [].slice.call(arguments,1) );
	C.restore()
	C2.restore();
}
function addShape(shape, s, o, C){
	var vs = shape.verts;
	var l = vs.length;
	var is = shape.ins || null;
	var os = shape.outs || null;
	var x = (o?o[0]:0), y = (o?o[1]:0);
	var ax, ay, bx, by, cx, cy;
	var i,j,k;
	C.beginPath();
	C.moveTo( x+vs[l-1][0]*s[0], y+vs[l-1][1]*s[1] );
	for( i=l; i<=l*2+(0); i++ ){
		j = (i-1)%l, k = i%l;
		os ? ax = x+(vs[j][0]+os[j][0])*s[0]:null;
		os ? ay = y+(vs[j][1]+os[j][1])*s[1]:null;
		is ? bx = x+(vs[k][0]+is[k][0])*s[0]:null;
		is ? by = y+(vs[k][1]+is[k][1])*s[1]:null;
		cx = x+vs[k][0]*s[0];
		cy = y+vs[k][1]*s[1];
		if ( is && os ){
			C.bezierCurveTo( ax, ay, bx, by, cx, cy );
		} else {
			C.lineTo( cx, cy );
		}
	}
}
function renderLayer( layer, s, o, C ){
	var shape,path,p,q;
	for( p in layer ){
		shape = layer[p];
		for( q in shape ){
			if ( !q.match(/stroke|fill/) ){
				addShape( shape[q], s, o, C );
				C.lineJoin = "round";
				C.fillStyle = shape.fill;
				if ( shape.stroke ){
					C.lineWidth = shape.stroke.w;
					C.strokeStyle = shape.stroke.style;
				}
				C.fill();
				C.stroke();
			}
		}
	}
}
function transWithAnchor( x, y, C, callback ){
	C.translate( x, y );
	callback( [].slice.call(arguments,3) );
	C.translate( x*-1, y*-1 );
}
function drawBranch( n, x, y ){
	var px, py, cx, cy, i, n;
	var sz = 100;
	C.strokeStyle = "#000";
	C.lineCap = "round";
	for( i=0; i<n; i++ ){
		cx = px ? px + to1N(nums[n+i%32])*sz : x;
		cy = py ? py + to1(nums[n+i*2%32])*sz*-1 : y;
		C.beginPath();
		C.moveTo( px, py );
		C.lineTo( px, py );
		C.lineTo( cx, cy );
		C.lineWidth = n-i;
		C.stroke();
		drawBranch( n-i-1, cx, cy );
		px = cx, py = cy;
	}
}
function init(){
	CVS.width = 800;
	CVS.height = 800;
	nums = getNums();
}
function handleKeyPress(){}
function render(){
	drawBranch( 10, 400, 600 );
}
function main(){
	init();
	render();
}
main();
