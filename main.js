// abbreviations
var abs=Math.abs,rnd=Math.random,round=Math.round,max=Math.max,min=Math.min,sqrt=Math.sqrt,ceil=Math.ceil,floor=Math.floor,sin=Math.sin,cos=Math.cos,tan=Math.tan,PI=Math.PI;

// globals
var doc=document,win=window,SZ,nums,nums2,temp,bidx,count;
var obj,uniLoc,mat,projMat,finMat;
var CVS=doc.querySelector("#comp1"),CVS2=doc.querySelector("#comp2"),C,C2,AB,SD;
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
	C.drawArrays(C.TRIANGLES,0,obj.verts.length/3);
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
function buildTree( x, y, n ){
}
function getColors(mat){
	var a=[],i;
	for (i=0;i<mat.length/3;i++){ arrConcat(a, [rnd(),rnd(),rnd()]) }
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
function arrConcat(a,b){
	for (var i=0; i<b.length; i++){
		a.push(b[i]);
	}
	return a;
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
		a = arrConcat( a, getNorm(verts.slice(i,9)) );
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
function drawBranch( p1, p2, s1, s2, n ){
	v=[],f=[],i,j;
}
function buildObj(){
	var obj={verts:[],faces:[],norms:[]}, i, j;
	var a=[0,0,-1], b=[0,0,1], rad=rnd()*0.5+0.25, n=round(rnd()*8)+4;
	for(j=0;j<=n;j++){
		arrConcat( obj.verts, [
			a[0] + sin(j/n*PI*2)*rad,
			a[1] + cos(j/n*PI*2)*rad,
			a[2]
		]);
		arrConcat( obj.verts, [
			b[0] + sin(j/n*PI*2)*rad,
			b[1] + cos(j/n*PI*2)*rad,
			b[2]
		]);
	}
	obj.faces = getFaces( obj.verts );
	obj.norms = getNorms( obj.verts );
	return obj;
}
function parseObj(obj){
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
			arrConcat( vmat, v.slice(idx*3, idx*3+3) );
		}
	}
	return {verts:vmat,faces:a,norms:n}
}
function render(){
	var vBuff,cBuff,vShdr,fShdr,prog,pLoc,cLoc,x,y;
	bcount = round( to1(nums[0])*6 ) + 6;
	
	obj = buildObj();
	obj = parseObj( obj );
	obj.clr = getColors( obj.verts );

	vBuff = C.createBuffer();
	C.bindBuffer(AB, vBuff);
	C.bufferData(AB, new Float32Array(obj.verts), SD);
	cBuff = C.createBuffer();
	C.bindBuffer(AB, cBuff);
	C.bufferData(AB, new Float32Array(obj.clr), SD);

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

	C.compileShader(vShdr);
	C.compileShader(fShdr);

	prog = C.createProgram();
	C.attachShader(prog, vShdr);
	C.attachShader(prog, fShdr);
	C.linkProgram(prog);
	
	pLoc = C.getAttribLocation(prog,`position`);
	C.enableVertexAttribArray(pLoc);
	C.bindBuffer(AB, vBuff);
	C.vertexAttribPointer(pLoc,3,C.FLOAT,false,0,0);

	cLoc = C.getAttribLocation(prog,`color`);
	C.enableVertexAttribArray(cLoc);
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
	rotate(45,0);
	C.uniformMatrix4fv( uniLoc.matrix, false, finMat );
	C.drawArrays(C.TRIANGLES,0,obj.verts.length/3);

	CVS.addEventListener( "mousedown", doMouseDown );
	CVS.addEventListener( "mouseup", function(){
		CVS.removeEventListener( "mousemove", doMouseMove );
	});
}
function init(){
	SZ = 800;
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
