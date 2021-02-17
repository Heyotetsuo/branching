var doc=document,win=window,SZ,nums,nums2,temp,bidx,count;
var abs=Math.abs,rnd=Math.random,round=Math.round,max=Math.max,min=Math.min;
var sqrt=Math.sqrt,ceil=Math.ceil,floor=Math.floor;
var sin=Math.sin,cos=Math.cos,PI=Math.PI;
var CVS=doc.querySelector("#comp1"),CVS2=doc.querySelector("#comp2");
var C=CVS.getContext("2d"),C2=CVS2.getContext("2d");
function normInt(s){ return parseInt(s,32)-SZ }
function d2r(n){ return n*PI/180 }
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function getNums(){
	var hashPairs=[],seed,rvs,i=0,j=0;
	var hash = tokenData.hash.slice(2);
	for(i=0;i<64;i++){
		for(j=0;j<64;j++){
			hashPairs.push( parseInt(
				"0x" + hash.charAt(j) +
				hash.charAt((j+i)%64)
			));
		}
	}
	return hashPairs;
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
function boxBlurT(src,tgt,w,h,r,H){
	var iarr=1/(r+r+1),i,j,ti,li,ri,fv,lv,val;
	for(i=0; i<w; i++){
		ti=i, li=ti, ri=ti+r*w, fv=src[ti], lv=src[ti+w*(h-1)], val=(r+1)*fv;
		for(j=0; j<r; j++) val += src[ti+j*w];
		for(j=0; j<=r; j++){
			val += src[ri] - fv;
			tgt[ti] = round( val*iarr ), ri+=w, ti+=w;
		}
		for( j=r+1; j<h-r; j++ ){
			val += src[ri] - src[li];
			tgt[ti] = round(val*iarr), li+=w, ri+=w, ti+=w;
		}
		for( j=h-r; j<h; j++ ){
			val += lv - src[li];
			tgt[ti] = round(val*iarr), li+=w, ti+=w;
		}
	}
}
function boxBlurH(src,tgt,w,h,r){
	var iarr=1/(r+r+1),i,j,ti,li,ri,fv,lv,val;
	for( i=0; i<h; i++) {
		ti=i*w, li=ti, ri=ti+r, fv=src[ti], lv=src[ti+w-1], val=(r+1)*fv;
		for( j=0; j<r; j++) val += src[ti+j];
		for( j=0; j<=r; j++){
			val += src[ri++] - fv;
			tgt[ti++] = round(val*iarr);
		}
		for( j=r+1; j<w-r; j++){
			val += src[ri++] - src[li++];
			tgt[ti++] = round(val*iarr);
		}
		for( j=w-r; j<w; j++){
			val += lv - src[li++];
			tgt[ti++] = round(val*iarr);
		}
	}
}
function boxBlur(src,tgt,w,h,r){
	for(var i=0; i<src.length; i++) tgt[i]=src[i];
	boxBlurH(tgt,src,w,h,r);
	boxBlurT(src,tgt,w,h,r);
}
function boxesForGauss(sigma, n){
	var wIdeal,wl,wu,mIdeal,m,sizes=[],i;
	wIdeal = sqrt( (12*sigma*sigma/n)+1 );
	wl = floor(wIdeal);
	if(wl%2==0) wl--;
	wu = wl+2;
	mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
	m = round(mIdeal);
	for(i=0; i<n; i++) sizes.push(i<m?wl:wu);
	return sizes;
}
function gaussBlur(src,tgt,w,h,r){
	var bxs=boxesForGauss(r,3);
	boxBlur(src,tgt,w,h,(bxs[0]-1)/2);
	boxBlur(tgt,src,w,h,(bxs[1]-1)/2);
	boxBlur(src,tgt,w,h,(bxs[2]-1)/2);
	boxBlur(src,tgt,w,h,(bxs[3]-1)/2);
}
function fastBlur( amount, C ){
	var w=h=SZ,c=[],i,j, d=C.getImageData(0,0,w,h);
	for(i=0; i<4; i++){
		c.push( new Uint8ClampedArray(d.data.length/4) );
	}
	for(i=0; i<d.data.length; i+=4){
		for( j=0; j<c.length; j++ ){
			c[j][i/4] = (d.data[i+j]);
		}
	}
	for(i=0; i<c.length; i++){
		gaussBlur(c[i],c[i],w,h,amount);
	}
	for(i=0; i<d.data.length; i+=4){
		for( j=0; j<c.length; j++ ){
			d.data[i+j] = c[j][i/4];
		}
	}
	C.putImageData(d,0,0);
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
function drawTrunk( args ){
	var x = args[0], y = args[1], C = args[2];
	C.lineWidth = bcount + bcount/2;
	C.strokeStyle = "#000";
	C.lineCap = "round";
	C.beginPath();
	C.moveTo( SZ/2, SZ*0.9 );
	C.lineTo( x, y );
	C.stroke();
}
function drawBranch( args ){
	var n = args[0], x = args[1], y = args[2], C = args[3];
	var sz=500/(bcount/2)*0.9, px, py, cx, cy, i, n;
	C.strokeStyle = "#000";
	C.lineCap = "round";
	for( i=0; i<n; i++ ){
		bidx++;
		cx = px ? px + to1N(nums[(i+bidx)%32])*sz : x;
		cy = py ? py + to1(nums[(i*2+bidx)%32])*sz*-1 : y;
		C.beginPath();
		C.moveTo( px, py );
		C.lineTo( px, py );
		C.lineTo( cx, cy );
		C.lineWidth = n-i;
		C.stroke();
		drawBranch( [n-i-1, cx, cy, C] );
		px = cx, py = cy;
	}
}
function scratch( args ){
	var a = args[0], b = args[1], n = args[2];
	var px, py, cx, cy;
	var vec = [ a[0]-b[0], a[1]-b[1] ], i, j;
	var step = [ vec[0]/n, vec[1]/n ];
	C.lineWidth = 1;
	C.strokeStyle = "#000";
	for(i=1;i<n.length;i++){
		for(j=1;j<n.length;j++){
			cx = a[0]+step[0]*j;
			cy = a[1]+step[1]*j;
			C.moveTo( px||a[0], py||a[1] );
			C.lineTo( cx, cy );
			px = cx, py = cy;
		}
	}
	C.stroke();
}
function init(){
	SZ = 800;
	CVS.width = SZ;
	CVS.height = SZ;
	CVS2.width = SZ;
	CVS2.height = SZ;
	nums = getNums();
	bidx = 0;
}
function drawFloor(){ C.fillStyle = "#eee" }
function invert(){
	C.globalCompositeOperation = "difference";
	C.fillStyle = "#fff";
	C.fillRect( 0, 0, SZ, SZ );
}
function drawBG(){
	var grad = C.createRadialGradient( SZ/2, SZ/2, 1, 0, 0, SZ );
	grad.addColorStop( 0, "#eee" );
	grad.addColorStop( 1, "#ddd" );
	C.fillStyle = grad;
	C.fillRect( 0, 0, SZ, SZ );
	C.globalCompositeOperation = "multiply";
	C.fillRect( 0, SZ*0.8, SZ, SZ );
}
function electrify(){
	C.drawImage( CVS2, 0, 0 );
	fastBlur( 20, C2 );
	C2.globalCompositeOperation = "destination-out";
	C2.fillStyle = "#ffffff80";
	C2.fillRect( 0, 0, SZ, SZ );
	C.drawImage( CVS2, 0, 0 );
	canvasAction( invert );
}
function handleKeyPress(){}
function render(){
	bcount = round( to1(nums[0])*6 ) + 6;
	canvasAction( drawBG );
	var x = to1N(nums[5])*(SZ/10) + SZ/2, y = SZ*0.6;
	canvasAction( drawTrunk, x, y, C2 );
	canvasAction( drawBranch, bcount, x, y, C2 );
	if ( nums[9] > 127 ){
		electrify();
	} else {
		C.drawImage( CVS2, 0, 0 );
	}
	C2.clearRect( 0, 0, SZ, SZ );
}
function main(){
	init();
	render();
}
main();
