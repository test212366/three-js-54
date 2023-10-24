uniform float time;
uniform float progress;
uniform sampler2D canvas;

uniform sampler2D chars;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;
 

void main() {
	vec4 mchammer = texture2D(canvas, vUv);
	if(step(vUv.x, 0.5)>0.5) discard;
	gl_FragColor = vec4(.4,.4,mchammer, 1.);
	// gl_FragColor = vec4(vScale,vScale,vScale,1.);
}