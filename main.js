// abbreviations
var C,C2,AB,DD,m=Math;d=document;w=window, abs=m.abs,rnd=m.random,round=m.round,max=m.max,min=m.min,sqrt=m.sqrt,ceil=m.ceil,floor=m.floor,sin=m.sin,cos=m.cos,tan=m.tan,pow=m.pow,PI=m.PI;

// globals
var SZ,obj,objs,mode,uniLoc,mat,projMat,finMat,finVerts,finClrs,px,py,baseclr,rloop,vec;
var CVS=d.querySelector("#comp1"),CVS2=d.querySelector("#comp2");
var CV=d.querySelector("#wrap").children[0];
function normInt(s){ return parseInt(s,32)-SZ }
function d2r(n){ return n*PI/180 }
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function randint(){
	seed ^= seed << 13;
	seed ^= seed >> 17;
	seed ^= seed << 5;
	return seed;
}
function randuint(){
	return abs(randint());
}
function urand(){
	var seed = randint();
	return ( (seed<0?~seed+1:seed)%1024) / 1024;
}
function rand(){
	return urand()*2-1;
}
function vardump( o ){
	var s = "", p;
	for( p in o ){
		s += p + ", ";
	}
	return s;
}
function doMouseDown(){
	this.addEventListener("mousemove",doMouseMove);
}
function doMouseMove(){
	me = event;
	requestAnimationFrame( rotate )
}
function mat4Create(){
	var a = new Float32Array(16),i;
	for(i=0;i<16;i++) a[i]=(i%5?0:1);
	return a;
}
function projPersp( fov, rat, near, far ){
	var a = mat4Create(),i;
	var f = 1.0/tan(fov/2);
	for(i=0;i<a.length;i++) a[i]=0
	a[0] = f/rat;
	a[5] = f;
	a[11] = -1;
	if ( far !== null && far !== Infinity ){
		var nf = 1/(near-far);
		a[10] = (far+near)*nf;
		a[14] = 2*far*near*nf;
	} else {
		a[10] = -1;
		a[14] = -2 * -near;
	}
	return a;
}
function rotateX(m, angle){
	var c=cos(angle), s=sin(angle), i;
	for(i=0;i<m.length;i+=3){
	}
	var mv1=m[1], mv5=m[5], mv9=m[9];
	m[1] = m[1]*c-m[2]*s;
	m[5] = m[5]*c-m[6]*s;
	m[9] = m[9]*c-m[10]*s;
	m[2] = m[2]*c+mv1*s;
	m[6] = m[6]*c+mv5*s;
	m[10] = m[10]*c+mv9*s;
}
function rotateY(m,angle){
	var c = Math.cos(angle);
	var s = Math.sin(angle);
	var mv0=m[0], mv4=m[4], mv8=m[8];
	m[0] = c*m[0]+s*m[2];
	m[4] = c*m[4]+s*m[6];
	m[8] = c*m[8]+s*m[10];
	m[2] = c*m[2]-s*mv0;
	m[6] = c*m[6]-s*mv4;
	m[10] = c*m[10]-s*mv8;
}
function setVec(x,y){
	px = px || 0;
	py = py || 0;
	var vx = (x-px)/100;
	var vy = (y-py)/100;
	px = x, py = y;
	return [vx, vy];
}
function rotate(x,y){
	var x=x, y=y, vx, vy, va, udf = "undefined";
	if ( typeof x === udf || typeof y === udf ) {
		if ( typeof me === udf ){
			va = setVec( 0, 0 );
			vx = va[0], vy = va[1]
		} else if ( me instanceof MouseEvent ){
			vx = me.movementX/100;
			vy = me.movementY/100;
		} else if ( me instanceof TouchEvent ){
			x = me.touches[0].clientX;
			y = me.touches[0].clientY;
			va = setVec( x, y );
			vx = va[0], vy = va[1];
		}
	} else {
		vx = x, vy = y;
	}
	rotateY( mat, vx );
	rotateX( mat, vy );
	finMat = multiplyMat( projMat, mat );
	C.uniformMatrix4fv( uniLoc.matrix, false, finMat );
	if ( mode !== 1 && !finVerts ) flattenScene( objs );
	if ( mode === 2 ){
		renderTree( objs );
	} else {
		drawScene( objs );
	}
}
function stopDrift(){ clearTimeout(rloop) }
function drift(){
	var amp = ( mode===2 ? 0.1 : 0.01 );
	var freq = ( mode===2 ? 60 : 30 );
	rloop = setInterval( function(){
		rotate(vec[0]*amp,vec[1]*amp);
		if ( mode > 1 ){
			renderTree( objs );
		} else {
			drawScene( objs );
		}
	}, 1000/30 );
}
function translate(a, v) {
	var out=a;
	var x=v[0], y=v[1], z=v[2];
	var a00, a01, a02, a03;
	var a10, a11, a12, a13;
	var a20, a21, a22, a23;
	if (a === out) {
		out[12]=a[0] * x + a[4] * y + a[8] * z + a[12];
		out[13]=a[1] * x + a[5] * y + a[9] * z + a[13];
		out[14]=a[2] * x + a[6] * y + a[10] * z + a[14];
		out[15]=a[3] * x + a[7] * y + a[11] * z + a[15];
	} else {
		a00=a[0], a01=a[1], a02=a[2], a03=a[3];
		a10=a[4], a11=a[5], a12=a[6], a13=a[7];
		a20=a[8], a21=a[9], a22=a[10], a23=a[11];
		out[0]=a00, out[1]=a01, out[2]=a02, out[3]=a03;
		out[4]=a10, out[5]=a11, out[6]=a12, out[7]=a13;
		out[8]=a20, out[9]=a21, out[10]=a22, out[11]=a23;
		out[12]=a00 * x + a10 * y + a20 * z + a[12];
		out[13]=a01 * x + a11 * y + a21 * z + a[13];
		out[14]=a02 * x + a12 * y + a22 * z + a[14];
		out[15]=a03 * x + a13 * y + a23 * z + a[15];
	}
	return out;
}
function scale(out,mat,n){
	for(i=0;i<mat.length;i++){ out[i] = mat[i]*n }
	return out
}
function getColors(arg1){
	var mat,n,c,a=[],i,j;
	var v = urand();
	mat = arg1;
	for( i=0; i<mat.length/3; i++ ){
		a = a.concat( [
			baseclr[0] + urand()*v,
			baseclr[1] + urand()*v,
			baseclr[2] + urand()*v
		] );
	}
	return a;
}
function multiplyMat(a, b){
	var out = new Float32Array(16);
	var a00=a[0], a01=a[1], a02=a[2], a03=a[3];
	var a10=a[4], a11=a[5], a12=a[6], a13=a[7];
	var a20=a[8], a21=a[9], a22=a[10], a23=a[11];
	var a30=a[12], a31=a[13], a32=a[14], a33=a[15];

	// Cache only the current line of the second matrix
	var b0=b[0], b1=b[1], b2=b[2], b3=b[3];
	out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0=b[4], b1=b[5], b2=b[6], b3=b[7];
	out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0=b[8], b1=b[9], b2=b[10], b3=b[11];
	out[8]=b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[9]=b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[10]=b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[11]=b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0=b[12], b1=b[13], b2=b[14], b3=b[15];
	out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
}
function arrDiff(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]] }
function dot(a,b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
function crossMult(a,b){
	return [
		a[0]*b[1] - a[2]*b[1],
		a[0]*b[2] - a[2]*b[0],
		a[0]*b[1] - a[1]*b[0]
	];
}
function getVec( tri ){
	var u, v, x, y, z;
	u = arrDiff( tri.slice(3,6), tri.slice(0,3) );
	v = arrDiff( tri.slice(6,9), tri.slice(0,3) );
	x = u[1]*v[2] - u[2]*v[1];
	y = u[2]*v[0] - u[0]*v[2];
	z = u[0]*v[1] - u[1]*v[0];
	return [x,y,z];
}
function normalizeVec( a ){
	var x=a[0], y=a[1], z=a[2];
	var len = x*x + y*y + z*z;
	if (len>0){
		len = 1/sqrt(len);
	}
	return [ a[0]*len, a[1]*len, a[2]*len ];
}
function getDiffuse( norm, light ){
	var cosAng = dot( norm, light );
	return max(min(cosAng,1),0);
}
function getNorm( verts ){
	var a, b, c;
	a = verts.slice(0,3);
	b = verts.slice(3,3);
	c = verts.slice(6,9);
	return crossMult( arrDiff(b,a), arrDiff(c,a) );
}
function getNorms( verts ){
	var a=[], nm, vec, g, i, j;
	if ( mode === 2 ){
		for(i=0;i<verts.length;i+=6){
			a = a.concat( getNorm(verts.slice(i,9)) );
		}
	} else {
		for(i=0;i<verts.length;i+=9){
			vec = getVec( verts.slice(i,i+9) );
			nm = normalizeVec( vec );
			g = getDiffuse( nm, [-1,0,0] );
			for( j=0; j<3; j++ ) a = a.concat( [0,g,.25] );
		}
	}
	return a;
}
function getFaces( mat ){
	var max=mat.length/3, a=[], i, j;
	for(i=0;i<max;i++){
		j = i+1;
		a.push([j,j+1,(j+2)%(max+1)]);
	}
	return a;
}
function avgArrays(a,b){
	return [
		(a[0]+b[0])/2,
		(a[1]+b[1])/2,
		(a[2]+b[2])/2
	];
}
function getRegP(a,b,tot,n){
	var x = (b[0]-a[0])/tot;
	var y = (b[1]-a[1])/tot;
	var z = (b[2]-a[2])/tot;
	return [ a[0]+x*n, a[1]+y*n, a[2]+z*n ];
}
function getRndP(arg1, arg2){
	var p=arg1,m=arg2,x,y,z;
	if ( mode === 1 ){
		x=p[0]+rand()*m;
		y=p[1]+rand()*m;
		z=p[2]+rand()*m;
	} else {
		x=rand()*m;
		y=rand()*m;
		z=rand()*m;
	}
	return [x,y,z];
}
function lathe( skel, rad ){
	var obj = {verts:[],faces:[],norms:[]};
	var npts=12, inc, mult, nmult, a,b,c, i,j;
	var max = (mode===2?npts+1:npts);
	var n = skel.length/3;
	for( i=0; i<n-1; i++ ){
		a = skel.slice( i*3, i*3+3 );
		b = skel.slice( (i+1)*3, (i+1)*3+3 );
		if ( mode !== 2 ){
			obj.verts = obj.verts.concat( a );
		}
		for( j=0; j<max; j++ ){
			inc = j/npts*PI*2;
			mult = rad - (i/n) * rad;
			nmult = rad - ((i+1)/n) * rad;
			if ( mode === 2 ) nmult = mult;
			obj.verts = obj.verts.concat([
				a[0]+sin(inc)*mult,
				( mode>1 ? a[1]+cos(inc)*mult : a[1] ),
				a[2]+cos(inc)*mult
			]);
			obj.verts = obj.verts.concat([
				b[0]+sin(inc)*nmult,
				( mode>1 ? b[1]+cos(inc)*mult : b[1] ),
				b[2]+cos(inc)*nmult
			]);
			nmult = mult;
		}
	}
	obj.faces = getFaces( obj.verts );
	obj.norms = getNorms( obj.verts );
	return obj;
}
function getBranch( a, b, n ){
	// initialize emptry array ARR, set STEP to be (A-B)/N.
	var arr=[], c=a, d=a, i,j;
	arr = arr.concat( c );

	// do for N segments.
	for(i=1;i<n;i++){
		d = getRegP(a,b,n,i+1);
		d[1] += i/PI;

		// pick a random point C
		if ( mode > 1 ){
			c = getRndP( d, 1 );
		} else {
			c = getRndP( null, 1 );
		}

		// set C[x,y,z] each to be averaged against B.
		for(j=0;j<3;j++){
			c = avgArrays( c, d );
		}

		// append C to ARR (flatly, using concat)
		arr = arr.concat( c );
	}

	// return flat array [A, C, B]
	return arr;
}
function buildSkeleton(p,n,a){
	if (typeof a === "undefined"){
		a = (p).concat(getRndP(p,urand()/2) );
	}
	for(var i=0;i<n;i++){
		a = a.concat( getRndP(p,urand()/2) );
	}
	return a;
}
function getTrunk( a, b, n ){
	var arr=[],i;
	for(i=0;i<n;i++){
		arr = arr.concat( getRegP(a,b,n,i) );
	}
	return arr;
}
function buildTree( arg1, arg2, arg3 ){
	var i,j;
	if ( mode === 1 ){
		var p = arg1, n = arg2;
		var skel = buildSkeleton(p,n);
		var obj = {verts:[],faces:[],norms:[]};
		var rad = 1;
		for( i=0; i<=n; i++ ){
			obj.verts = obj.verts.concat([
				skel[i] + sin(i/n*PI*2)*rad,
				skel[i+1] + cos(i/n*PI*2)*rad,
				skel[i+2]
			]);
			obj.verts = obj.verts.concat([
				skel[i+3] + sin(i/n*PI*2)*rad,
				skel[i+4] + cos(i/n*PI*2)*rad,
				skel[i+5]
			]);
		}
		obj.faces = getFaces( obj.verts );
		obj.norms = getNorms( obj.verts );
		return obj;
	} else {
		var a=arg1, b=arg2, n=arg3;
		var branch = getTrunk( a, b, n );
		var root = branch;
		var len = branch.length/3;
		var branches = [ branch ];

		// build main branches
		for ( i=1; i<len; i++ ){
			a = root.slice( i*3, i*3+3 );
			if ( mode === 3 ) a = getRndP( a, PI );
			for ( j=0; j<3; j++ ){
				if ( mode > 1 ){
					b = getRndP( b, PI );
				} else {
					b = getRndP( null, PI );
				}
				branch = getBranch( a, b, 12 );
				branches.push( branch );
			}
		}
		if ( mode === 3 ) branches.shift();

		// lathe branches
		if ( mode === 3 ){
			branches[0] = lathe( branches[0],0.1 );
		} else {
			branches[0] = lathe( branches[0],0.05 );
		}
		for( i=1; i<branches.length; i++ ){
			branches[i] = lathe(branches[i],0.025);
		}

		return branches;
	}
}
function parseObj( obj ){
	var vmat=[],nmat=[],a=[],v=obj.verts,f=obj.faces,n=obj.norms,i,j,idx;
	for(i=0;i<f.length;i++){ // triangulate faces
		if ( f[i].length > 4 ) throw( "Ngons not allowed" );
		if ( f[i].length < 3 ) throw( "Not enough points to make a face" );
		if ( f[i].length === 3 ){
			a.push( f[i] );
		} else if ( f[i].length === 4 ){
			a.push( f[i].slice(0,3) );
			a.push( [f[i][2],f[i][3],f[i][0]] );
		}
	}
	f=a;
	for(i=0;i<f.length;i++){ // triangulate verts
		for(j=0;j<f[i].length;j++){
			idx = f[i][j]-1;
			vmat = vmat.concat( v.slice(idx*3, idx*3+3) );
		}
	}
	return { verts: vmat, faces: (mode>1?a:f), norms: n };
}
function setupEvents(){
	var a=[CVS,CVS2],i;
	for( i=0; i<2; i++ ){
		a[i].addEventListener( "touchmove", doMouseMove );
		a[i].addEventListener( "mousedown", doMouseDown );
		a[i].addEventListener( "mouseup", function(){
			this.removeEventListener( "mousemove", doMouseMove );
		});
	}
}
function render(){
	var vShdr,fShdr,prog,pLoc,cLoc,x,y,o,i;
	
	if ( mode === 1 ){
		obj = buildTree( [0,0.8,0], randuint()%100+1 );
		obj = parseObj( obj );
		obj.clr = getColors( obj.verts );
	} else if ( mode === 3 ) {
		objs = buildTree( [0,-1,0], [0,1,0], randuint()%20+10 );
		for(i=0;i<objs.length;i++){
			objs[i] = parseObj( objs[i] );
			objs[i].clr = getColors( objs[i].verts );
		}
		obj = objs[0];
	} else {
		if ( mode === 2 ){
			objs = buildTree( [0,-1,0], [0,1,0], randuint()%3+3 );
		} else {
			objs = buildTree( [0,-1,0], [0,1,0], randuint()%10+3 );
		}
		for(i=0;i<objs.length;i++){
			objs[i] = parseObj( objs[i] );
			if ( mode === 2 ){
				objs[i].clr = getColors( objs[i].verts );
			} else {
				objs[i].clr = getColors( objs[i].verts );
			}
		}
		obj = objs[0];
	}

	vShdr = C.createShader(C.VERTEX_SHADER);
	C.shaderSource(vShdr, `
		precision highp float;
		attribute vec3 position;
		attribute vec3 color;
		varying vec3 vColor;
		uniform mat4 matrix;
		void main(){
			vColor = color;
			gl_Position = matrix * vec4(position,1);
			gl_PointSize = 10.0;
		}
	`);
	fShdr = C.createShader(C.FRAGMENT_SHADER);
	C.shaderSource(fShdr,`
		precision mediump float;
		varying vec3 vColor;
		void main(){
			gl_FragColor = vec4(vColor,1);
		}
	`);

	vBuff = C.createBuffer(), cBuff = C.createBuffer();
	C.bindBuffer(AB, vBuff);
	C.bufferData(AB, new Float32Array(obj.verts), DD);
	C.bindBuffer(AB, cBuff);
	C.bufferData(AB, new Float32Array(obj.clr), DD);

	prog = C.createProgram();
	C.compileShader(vShdr);
	C.compileShader(fShdr);
	C.attachShader(prog, vShdr);
	C.attachShader(prog, fShdr);
	C.linkProgram(prog);
	
	pLoc = C.getAttribLocation(prog,`position`);
	cLoc = C.getAttribLocation(prog,`color`);
	C.enableVertexAttribArray(pLoc);
	C.enableVertexAttribArray(cLoc);

	C.bindBuffer(AB, vBuff);
	C.vertexAttribPointer(pLoc,3,C.FLOAT,false,0,0);
	C.bindBuffer(AB, cBuff);
	C.vertexAttribPointer(cLoc,3,C.FLOAT,false,0,0);

	C.useProgram(prog);
	C.enable(C.DEPTH_TEST);

	uniLoc = { matrix: C.getUniformLocation(prog,`matrix`) }
	mat = mat4Create(), projMat = mat4Create(), finMat = mat4Create();
	projMat = projPersp( 75*PI/180, 1, 1e-4, 1e4 );
	finMat = multiplyMat( projMat, mat );
	mat = scale( mat, 0.1 );
	mat = translate( mat, [0,0,-2] );
	rotate();

	C.uniformMatrix4fv( uniLoc.matrix, false, finMat );

	if ( mode > 1 ){
		renderTree( objs );
	} else {
		drawScene( objs );
	}

	setupEvents();
}
function flattenScene( objs ){
	finVerts=[], finClrs=[];
	for(i=0;i<objs.length;i++){
		finVerts = finVerts.concat( objs[i].verts )
		finClrs = finClrs.concat( objs[i].clr );
	}
}
function comp(){
	C2.clearRect( 0, 0, SZ, SZ );
	C2.drawImage( CVS, 0, 0 );
}
function drawBuff(verts, clr){
	C.bindBuffer(AB, vBuff);
	C.bufferData(AB, new Float32Array(verts),DD);
	C.bindBuffer(AB, cBuff);
	C.bufferData(AB, new Float32Array(clr),DD);
	C.drawArrays( C.TRIANGLES, 0, verts.length/3 );
}
function renderTree(objs){
	var verts=[], clr=[], o,i;
	if ( mode === 3 ){
		for( i=0; i<objs.length; i++ ){
			verts = verts.concat( objs[i].verts );
			clr = clr.concat( objs[i].clr );
		}
		drawBuff(verts,clr);
	} else {
 		for( i=0; i<objs.length; i++ ){
			o = objs[i];
			drawBuff( o.verts, o.clr );
			comp();
		}
	}
}
function drawScene(objs){
	finVerts = finVerts || obj.verts;
	finClrs = finClrs || obj.clr;
	C.bindBuffer(AB, vBuff);
	C.bufferData(AB, new Float32Array(finVerts), DD);
	C.bindBuffer(AB, cBuff);
	C.bufferData(AB, new Float32Array(finClrs), DD);
	C.drawArrays( C.TRIANGLES,0, finVerts.length/3 );
}
function getHexClr(){
	var r = floor(urand()*16).toString(16);
	var g = floor(urand()*16).toString(16);
	var b = floor(urand()*16).toString(16);
	return "#"+r+g+b;
}
function darken(hex){
	var newHex = "#", i;
	for( i=1; i<hex.length; i++ ){
		newHex += floor( parseInt("0x"+hex[i])/2 ).toString(16);
	}
	return newHex;
}
function setBG( bg ){
	if ( !bg ){
		var c1,c2,bg;
		c1 = getHexClr();
		c2 = darken(c1);
		bg = "radial-gradient("+c1+","+c2+")";
	}
	CVS.style.backgroundImage = bg;
	CVS2.style.backgroundImage = bg;
}
function swapCanvas(){
	var p1, p2;
	p1=CVS.parentElement, p2=CVS2.parentElement;
	p1.appendChild( p2.removeChild(p2.children[0]) );
	p2.appendChild( p1.removeChild(p1.children[0]) );
	C2.clearRect( 0, 0, SZ, SZ );
	CV = d.querySelector("#wrap").children[0];
}
function init(){
	SZ=800, finVerts=undefined, finClrs=undefined;
	seed = parseInt( "0x" + tokenData.hash.slice(2,16) );
	CVS.width = CVS.height = CVS2.width = CVS2.height = SZ;
	C=CVS.getContext("webgl"); C2=CVS2.getContext("2d");
	baseclr = [ urand(), urand(), urand() ];
	vec = [ rand(), rand() ];

	setBG();

	if (typeof mode === "undefined"){
		mode = randuint()%4;
	}
	if ( mode === 2 ){
		swapCanvas();
	} else if ( CVS.parentElement !== d.querySelector("#wrap") ) {
		swapCanvas();
	}
	AB=C.ARRAY_BUFFER, DD=C.DYNAMIC_DRAW;
}
function main(){
	init();
	render();
	drift();
}
main();
