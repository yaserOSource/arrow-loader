import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useFrame} = metaversefile;

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

const q90 = new THREE.Quaternion()
  .setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0)
  );

export default () => {
  const app = useApp();
  
  const size = 0.5;

  const geometry = new THREE.PlaneBufferGeometry(size, size)
	  .applyMatrix4(
		  new THREE.Matrix4()
			  .makeRotationFromQuaternion(
				  new THREE.Quaternion()
					  .setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
			  )
	  );

  // console.log('got bounding box', boundingBox);

	const u = `${import.meta.url.replace(/(\/)[^\/]*$/, '$1')}_Down Tap Note 16x16.png`;
  (async () => {
    const img = await new Promise((accept, reject) => {
      const img = new Image();
      img.onload = () => {
        accept(img);
      };
      img.onerror = reject;
      img.crossOrigin = 'Anonymous';
      img.src = u;
    });
    tex.image = img;
    tex.needsUpdate = true;
  })();
	const tex = new THREE.Texture();
	// tex.minFilter = THREE.NearestFilter;
	tex.magFilter = THREE.NearestFilter;

	const material = new THREE.ShaderMaterial({
    uniforms: {
      tex: {
        type: 't',
        value: tex,
        needsUpdate: true,
      },
			uTime: {
        type: 'f',
        value: 0,
        needsUpdate: true,
      },
    },
    vertexShader: `\
      precision highp float;
      precision highp int;
      varying vec2 vUv;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
				
				vUv = uv;
      }
    `,
    fragmentShader: `\
      precision highp float;
      precision highp int;
      #define PI 3.1415926535897932384626433832795
      uniform sampler2D tex;
			uniform float uTime;
      varying vec2 vUv;
      void main() {
				float t = floor(uTime * 16. * 16.);
				float x = mod(t, 16.);
				// float y = floor((uTime - x) / 16.);
				float y = 0.;
				vec2 uv = (vUv / 16.0) + vec2(x, y)/16.;
        gl_FragColor = texture2D(tex, uv);
				if (gl_FragColor.a < 0.9) {
				  discard;
				}
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    // polygonOffset: true,
    // polygonOffsetFactor: -1,
    // polygonOffsetUnits: 1,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(0.3);
  mesh.frustumCulled = false;
  // mesh.visible = false;
  // console.log('got bounding box', boundingBox);
  app.add(mesh);

  const tailMesh = (() => {
    const width = 0.47;
    const height = width*1245/576;
    const geometry = new THREE.PlaneBufferGeometry(width, height);
    
    const u = `${import.meta.url.replace(/(\/)[^\/]*$/, '$1')}tail.png`;
    (async () => {
      const img = await new Promise((accept, reject) => {
        const img = new Image();
        img.onload = () => {
          // document.body.appendChild(img);
          accept(img);
        };
        img.onerror = reject;
        img.crossOrigin = 'Anonymous';
        img.src = u;
      });
      tex.image = img;
      tex.needsUpdate = true;
    })();
    const tex = new THREE.Texture();
    // tex.minFilter = THREE.NearestFilter;
    // tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tex: {
          type: 't',
          value: tex,
          needsUpdate: true,
        },
        uTime: {
          type: 'f',
          value: 0,
          needsUpdate: true,
        },
      },
      vertexShader: `\
        precision highp float;
        precision highp int;
        varying vec2 vUv;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          vUv = uv;
        }
      `,
      fragmentShader: `\
        precision highp float;
        precision highp int;
        #define PI 3.1415926535897932384626433832795
        uniform sampler2D tex;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          // gl_FragColor = vec4(1., 0., 0., 1.);
          gl_FragColor = texture2D(tex, vec2(vUv.x, vUv.y + uTime));
          // gl_FragColor.rgb *= 1. + vUv.y;
          // gl_FragColor.a = pow(vUv.y, 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -height/2;
    mesh.frustumCulled = false;
    return mesh;
  })();
  mesh.add(tailMesh);

  // const angle = new THREE.Euler(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2, 'YXZ');
  // const direction = new THREE.Euler(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2, 'YXZ');
  let azimuth = Math.PI/2;
  let inclination = 1;
  const r = 0.3;
  let da = 0;
  let di = 0.1;
  const lastPosition = new THREE.Vector3(0, 0, 1);
  useFrame(() => {
    mesh.position.set(
      r * Math.cos(azimuth) * Math.sin(inclination),
      r * Math.sin(azimuth) * Math.sin(inclination),
      r * Math.cos(inclination)
    );
    mesh.quaternion.setFromRotationMatrix(
      localMatrix.lookAt(
        lastPosition,
        mesh.position,
        localVector3.copy(mesh.position)
          .multiplyScalar(-1)
      )
    ).multiply(q90);
    lastPosition.copy(mesh.position);
    azimuth += da;
    azimuth %= Math.PI*2;
    inclination += di;
    inclination %= Math.PI*2;
    /* mesh.quaternion.setFromEuler(angle);
    mesh.position.set(0, 0, -1).applyQuaternion(mesh.quaternion);
    angle.x += direction.x * 0.01;
    angle.y += direction.y * 0.01;
    angle.z += direction.z * 0.01; */
    
	  mesh.material.uniforms.uTime.value = (Date.now() % 30000) / 30000;
    mesh.material.uniforms.uTime.needsUpdate = true;
	  tailMesh.material.uniforms.uTime.value = (Date.now() % 1000) / 1000;
    tailMesh.material.uniforms.uTime.needsUpdate = true;
	});

  return app;
};