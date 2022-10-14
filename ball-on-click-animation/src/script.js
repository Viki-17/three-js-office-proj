import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import { MeshLambertMaterial } from 'three'

const renderer = new THREE.WebGLRenderer({antialias: true, alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0xFF0000 ,0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

const light = new THREE.AmbientLight(0x33333)
scene.add(light)

// Sets a 12 by 12 gird helper
// const gridHelper = new THREE.GridHelper(12, 12);
// scene.add(gridHelper);

//====================================================

//Cannon world creation

const world = new CANNON.World({gravity: new CANNON.Vec3(0,-9.81,0)})
const planeGeo = new THREE.PlaneGeometry(10,10)

const planeMat = new THREE.MeshStandardMaterial({
    color:0xFFFFFF,
    side:THREE.DoubleSide
})

const planeMesh = new THREE.Mesh(planeGeo,planeMat)
scene.add(planeMesh)

const planeBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(5,5,0.001))

})
planeBody.quaternion.setFromEuler(-Math.PI/2,0,0)
world.addBody(planeBody)

//Raycaster

const mouse = new THREE.Vector2();
const intersectionPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove', function(e){
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
    raycaster.setFromCamera(mouse, camera)
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    
})

//Sphere Geomentry

const meshes = []
const bodies = []

window.addEventListener('click', function(e){
    const sphereGeo = new THREE.SphereGeometry(0.125,30,30)
    const sphereMat = new THREE.MeshStandardMaterial({
        color:new THREE.Color(0xff0000),
        metalness:0,
        roughness:0
    })

    const sphereMesh = new THREE.Mesh(sphereGeo,sphereMat)
    scene.add(sphereMesh)
    //sphereMesh.position.copy(intersectionPoint)

    const sphereBody = new CANNON.Body({
        mass:0.3,
        shape: new CANNON.Sphere(0.125),
        position: new CANNON.Vec3(intersectionPoint.x , intersectionPoint.y, intersectionPoint.z)
    })
    world.addBody(sphereBody)

    meshes.push(sphereMesh)
    bodies.push(sphereBody)
})

//animation

const timestep = 1/60

function animate(){
    world.step(timestep)

    planeMesh.position.copy(planeBody.position)
    planeMesh.quaternion.copy(planeBody.quaternion)

    for(let i=0 ; i<meshes.length; i++){
        meshes[i].position.copy(bodies[i].position)
        meshes[i].quaternion.copy(bodies[i].quaternion)
    }
    renderer.render(scene,camera)
}
renderer.setAnimationLoop(animate)

// Sets the x, y, and z axes with each having a length of 4
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);



window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});