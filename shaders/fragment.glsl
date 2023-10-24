uniform float time;
uniform float progress;

uniform sampler2D chars;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;
varying float vScale;

void main() {
	float size = 66.;
	vec2 newUV = vUv;
	newUV.x = vUv.x/size + floor(vScale * size) / size;
	vec4 charsMap = texture2D(chars, newUV);
	gl_FragColor = charsMap;
	// gl_FragColor = vec4(vScale,vScale,vScale,1.);
}