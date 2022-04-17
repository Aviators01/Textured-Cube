/*
Timothy Queva
CS3110 Lab8
December 9, 2020
*/

/*
For this lab, we draw a cube in which all four faces have a texture.
Camera rotation functionality is also provided. We're using a perspective view.

Open this in Firefox with strict_origin_policy toggled to false
file:///C:/Users/tqttb/Documents/University/GPRC%20(2019-)/2020-2021/CS3110/CS3110%20Labs/Lab7/Four3DShapes.html
*/

var VSHADER_SOURCE =
	'attribute vec4 a_position;\n' +
	'attribute vec2 a_TexCoord;\n' +
	'varying vec2 v_TexCoord;\n' +
	'uniform mat4 u_modelMatrix;\n' +
	'uniform mat4 u_ProjMatrix;\n' +
	'uniform mat4 u_viewMatrix;\n' +
	'void main(){ \n' +
	'	gl_Position = u_ProjMatrix * u_viewMatrix * u_modelMatrix * a_position;\n' +
	'	v_TexCoord = a_TexCoord;\n' +
	'}\n';

var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform sampler2D u_sampler;\n' +
	'varying vec2 v_TexCoord;\n' +
	'void main() {\n' +
	'	gl_FragColor = texture2D(u_sampler, v_TexCoord);\n' +
	'}\n';

function main(){
	//Gets the canvas
	var canvas = document.getElementById('Lab');
	
	//Gets the WebGL rendering context in order for us to use the webgl system
	var gl = getWebGLContext(canvas);
	
	//This initializes the shaders. Parameters are (rendering context,vshader,fshader)
	var stat = initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE);
	if(!stat) console.log("Shaders failed to initialize");
	
	//This code section gets the memory location of the WebGL variables we specified earlier(a_position,u_FragColor)
	//Parameters are (program,name)
	var a_position = gl.getAttribLocation(gl.program,'a_position');
	var a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');
	var u_sampler = gl.getUniformLocation(gl.program, 'u_sampler');
	var u_viewMatrix = gl.getUniformLocation(gl.program,'u_viewMatrix');
	var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
	var u_modelMatrix = gl.getUniformLocation(gl.program,'u_modelMatrix');
	
	//Clears the canvas. ie. cleans the drawing area.
	gl.clearColor(0.0,0.0,0.0,0.5);	//This specifies the color
	gl.clear(gl.COLOR_BUFFER_BIT);	//This actually cleans the canvas with the specified color
	
	//Creates view matrix and sets eyepoint/lookat/up direction
	var viewMat=new Matrix4();
	viewMat.setLookAt(0,0,7,0,0,0,0,1,0);
	gl.uniformMatrix4fv(u_viewMatrix,false,viewMat.elements);
	
	//Create projection matrix and pass to u_ProjMatrix
	var projMatrix=new Matrix4();
	projMatrix.setPerspective(30, 1, 1, 100);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	
	//Enable depth test and make WebGL process deepest z-coord first
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.DEPTH_BUFFER_BIT);
	
	//Draws the four shapes with their associated textures
	cube(gl,a_position,u_sampler,a_TexCoord,u_modelMatrix);
}

function cube(gl,position,u_sampler,a_TexCoord,u_modelMatrix){
	//1. Create the buffer object
	var vertexBuffer = gl.createBuffer();
	var indexBuffer = gl.createBuffer();
	var texBuffer = gl.createBuffer();
	
	//2. Bind the buffer object to a target
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER,texBuffer);
	
	//3. Write data to the buffer object
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3

	var vertices = new Float32Array([   // Vertex coordinates
		1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
		1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
		1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
		-1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
		-1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
		1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
	]);
	
	var indices = new Uint8Array([       // Indices of the vertices
		0, 1, 2,   0, 2, 3,    // front
		4, 5, 6,   4, 6, 7,    // right
		8, 9,10,   8,10,11,    // up
		12,13,14,  12,14,15,    // left
		16,17,18,  16,18,19,    // down
		20,21,22,  20,22,23     // back
	]);
	/*
	var TexCoord = new Float32Array([	//How do I fix this?
		1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // const=Z v0-v1-v2-v3 front(blue)
		1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // const=x v0-v3-v4-v5 right(green)
		1.0, 1.0,   1.0, 0.0,   0.0, 0.0,   0.0, 1.0,  // const=y v0-v5-v6-v1 up(red)
		1.0, 1.0,   1.0, 0.0,   0.0, 0.0,   0.0, 1.0,  // const=x v1-v6-v7-v2 left
		0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,  // const=y v7-v4-v3-v2 down
		1.0, 0.0,   0.0, 0.0,   0.0, 1.0,   1.0, 1.0   // const=z v4-v7-v6-v5 back
	]);
	*/
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	//gl.bufferData(gl.ARRAY_BUFFER,TexCoord,gl.STATIC_DRAW);
	
	//4. Assign the buffer object to an attribute variable
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
	gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,0,0);
	
	//5. Enable the assignment
	gl.enableVertexAttribArray(position);
	gl.enableVertexAttribArray(a_TexCoord);
	
	//Sets model matrix for rotating and transfers to WebGL system
	var modelMat=new Matrix4();
	modelMat.setIdentity();
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMat.elements);
	
	
	//*********Texture part*********
	//Create texure and image object
	var image=new Image();
	image.src = 'Concrete.jpg';		//image source location
	
	//event handler called when image loaded
	image.onload = function(){
		//Flips image's y-axis because .jpg file has y-axis going down instead of up
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
		
		//Activates texture unit 0 (8 textures units available)
		gl.activeTexture(gl.TEXTURE0);
		
		//Creates and binds texture object to target
		var texture=gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,texture);
		
		//Sets texture parameters (ie. how texture image processed when texture image mapped to shape)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		
		/******
		After processing texture image, we now need to assign it to the texture object
		******/
		//Assigns image to texture object
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
		
		//Sends texture image (gl.TEXTURE0) to fragment shader (u_sampler0)
		gl.uniform1i(u_sampler,0);

		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		
		//Draws the shape
		gl.drawArrays(gl.TRIANGLE_FAN,0,24);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
		
		document.onkeydown = function(ev){ keydown(ev, gl, indices.length,u_modelMatrix, modelMat); };
	};
}

var xAngle=0;
var yAngle=0;
function keydown(ev, gl, n,u_modelMatrix, modelMat){
    if(ev.keyCode == 39){		//The right arrow key was pressed
		yAngle=3;
		modelMat.rotate(yAngle,0,1,0);
	}
	else if(ev.keyCode == 37){	//The left arrow key was pressed
		yAngle=-3;	
		modelMat.rotate(yAngle,0,1,0);
	}
	else if(ev.keyCode == 38){	//The up arrow key was pressed
		xAngle=-3;
		modelMat.rotate(xAngle,1,0,0);
	}
	else if(ev.keyCode == 40){	//The down arrow key was pressed
		xAngle=3;
		modelMat.rotate(xAngle,1,0,0);
	}
	else return;
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMat.elements);
	
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}