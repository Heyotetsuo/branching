// abbreviations
var m=Math;d=document;w=window;
var abs=m.abs,rnd=m.random,round=m.round,max=m.max,min=m.min,sqrt=m.sqrt,ceil=m.ceil,floor=m.floor,sin=m.sin,cos=m.cos,tan=m.tan,pow=m.pow,PI=m.PI;

// globals
var SZ,nums,nums2,temp,bidx,count, obj,objs,uniLoc,mat,projMat,finMat,T;
var vbuff,cbuff;
var CVS=d.querySelector("#comp1"),CVS2=d.querySelector("#comp2"),C,C2,AB,SD;
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
function doMouseDown(){ CVS.addEventListener("mousemove",doMouseMove) }
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
function rotate(x,y){
	if ( typeof me !== "undefined" ){
		x = me.movementX/100;
		y = me.movementY/100;
	}
	rotateY( mat, x );
	rotateX( mat, y );
	finMat = multiplyMat( projMat, mat );
	C.uniformMatrix4fv( uniLoc.matrix, false, finMat );
	renderTree( objs );
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
function getColors(mat){
	var a=[],i;
	for (i=0;i<mat.length/3;i++){ a = a.concat([rnd(),rnd(),rnd()]) }
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
function arrDiff(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-c[2]] }
function crossMult(a,b){
	return [
		a[0]*b[1] - a[2]*b[1],
		a[0]*b[2] - a[2]*b[0],
		a[0]*b[1] - a[1]*b[0]
	];
}
function getNorm( verts ){
	var a, b, c;
	a = verts.slice(0,3);
	b = verts.slice(3,6);
	c = verts.slice(6,9);
	return crossMult( arrDiff(b,a), arrDiff(c,a) );
}
function getNorms( verts ){
	var a=[], i;
	for(i=0;i<verts.length;i+=6){
		a = a.concat( getNorm(verts.slice(i,9)) );
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
function getRndP(p,m){
	var x = rand()*m;
	var y = rand()*m;
	var z = rand()*m;
	return [x,y,z];
}
function getBranch( a, b, n ){
	// initialize emptry array ARR, set STEP to be (A-B)/N.
	var arr=[], c=a, d=a, i;
	arr = arr.concat( c );

	// do for N segments.
	for(i=1;i<n;i++){
		d = getRegP(a,b,n,i+1);
		d[1] += i;

		// pick a random point C
		c = getRndP( d, 1 );

		// set C[x,y,z] each to be averaged against B.
		c = avgArrays( c, d );

		// append C to ARR (flatly, using concat)
		arr = arr.concat( c );
	}

	// return flat array [A, C, B]
	return arr;
}
function buildTree( a, b, n ){
	var i,j;
	var branch = getBranch( a, b, n );
	var root = branch;
	var len = branch.length/3, len2;
	var branches = [ branch ];

	// build main branches
	for(i=1;i<len;i++){
		a = root.slice(i*3,i*3+3);
		b = getRndP( b, 3 );
		branch = getBranch( a, b, n/2 );
		branches.push( branch );
	}

	// build secondary branches
	len = branches.length;
	for(i=1;i<len;i++){
		branch = branches[i];
		len2 = branches[i].length/3;
		for(j=1;j<len2;j++){
			a = branch.slice(j*3,j*3+3);
			b = getRndP(a,1);
			branch = getBranch(a,b,n/10);
			branches.push( branch );
		}
	}
	
	// lathe the branches
	branches[0] = lathe(branches[0],0.1);
	for(i=1;i<branches.length;i++){
		branches[i] = lathe(branches[i],0.05);
	}
	return branches;
}
function lathe( skel, rad ){
	console.log( "lathing..." );
	var obj = {verts:[],faces:[],norms:[]};
	var npts=4, inc, mult, a,b,c, i,j;
	var n = skel.length/3;
	for( i=0; i<n-1; i++ ){
		a = skel.slice( i*3, i*3+3 );
		b = skel.slice( (i+1)*3, (i+1)*3+3 );
		for( j=0; j<=npts; j++ ){
			inc = j/npts*PI*2;
			mult = rad - (i/n) * rad;
			obj.verts = obj.verts.concat([
				a[0]+sin(inc)*mult,
				a[1]+cos(inc)*mult,
				a[2]+cos(inc)*mult
			]);
			obj.verts = obj.verts.concat([
				b[0]+sin(inc)*mult,
				b[1]+cos(inc)*mult,
				b[2]+cos(inc)*mult
			]);
		}
	}
	obj.faces = getFaces( obj.verts );
	obj.norms = getNorms( obj.verts );
	return obj;
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
	return {verts:vmat,faces:a,norms:n}
}
function render(){
	var vShdr,fShdr,prog,pLoc,cLoc,x,y,o,i;
	
	objs = buildTree( [0,-1,0], [0,1,0], randuint()%10+3 );
	for(i=0;i<objs.length;i++){
		objs[i] = parseObj( objs[i] );
		objs[i].clr = getColors( objs[i].verts );
	}
	obj = objs[0];

	vShdr = C.createShader(C.VERTEX_SHADER);
	C.shaderSource(vShdr, `
		precision mediump float;
		attribute vec3 position;
		attribute vec3 color;
		varying vec3 vColor;
		uniform mat4 matrix;
		void main(){
			vColor = color;
			gl_Position = matrix * vec4(position,1);
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
	C.bufferData(AB, new Float32Array(obj.verts), SD);
	C.bindBuffer(AB, cBuff);
	C.bufferData(AB, new Float32Array(obj.clr), SD);

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
	rotate(0,0);

	C.uniformMatrix4fv( uniLoc.matrix, false, finMat );
	C.drawArrays(C.TRIANGLES,0,obj.verts.length/3);

	renderTree( objs );

	CVS.addEventListener( "mousedown", doMouseDown );
	CVS.addEventListener( "mouseup", function(){
		CVS.removeEventListener( "mousemove", doMouseMove );
	});
}
function renderTree(objs){
	var o,i;
	for(i=0;i<objs.length;i++){
		o = objs[i];
		C.bindBuffer(AB, vBuff);
		C.bufferData(AB, new Float32Array(o.verts), SD);
		C.bindBuffer(AB, cBuff);
		C.bufferData(AB, new Float32Array(o.clr), SD);
		C.drawArrays(C.TRIANGLES,0,o.verts.length/3);
	}
}
function init(){
	SZ = 800;
	seed = parseInt( "0x" + tokenData.hash.slice(2,16) );
	CVS.width = SZ, CVS.height = SZ;
	CVS2.width = SZ, CVS2.height = SZ;
	C=CVS.getContext("webgl"),C2=CVS2.getContext("2d");
	AB=C.ARRAY_BUFFER, SD=C.STATIC_DRAW;
	nums = getNums();
	bidx = 0;
}
function main(){
	init();
	render();
}
main();
