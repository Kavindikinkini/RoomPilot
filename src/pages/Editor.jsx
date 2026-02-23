import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import * as THREE from 'three'

// ─── Furniture catalog ────────────────────────────────────────────────────────
const FLIST = [
  { id:'sofa',      label:'Sofa',         w:2.2, d:0.9, h:0.85 },
  { id:'chair',     label:'Armchair',     w:0.8, d:0.8, h:0.95 },
  { id:'dining',    label:'Dining Table', w:1.6, d:0.9, h:0.75 },
  { id:'sidetable', label:'Side Table',   w:0.5, d:0.5, h:0.55 },
  { id:'bed',       label:'King Bed',     w:1.8, d:2.1, h:0.55 },
  { id:'wardrobe',  label:'Wardrobe',     w:1.6, d:0.6, h:2.1  },
  { id:'desk',      label:'Writing Desk', w:1.4, d:0.7, h:0.76 },
  { id:'bookshelf', label:'Bookshelf',    w:0.9, d:0.35,h:1.8  },
  { id:'tv',        label:'TV Stand',     w:1.4, d:0.45,h:0.5  },
  { id:'lamp',      label:'Floor Lamp',   w:0.4, d:0.4, h:1.7  },
  { id:'plant',     label:'Plant',        w:0.45,d:0.45,h:1.2  },
  { id:'rug',       label:'Area Rug',     w:2.0, d:1.5, h:0.02 },
]

const EMOJI = {
  sofa:'🛋️', chair:'🪑', dining:'🍽️', sidetable:'🪵',
  bed:'🛏️', wardrobe:'🚪', desk:'🖥️', bookshelf:'📚',
  tv:'📺', lamp:'💡', plant:'🪴', rug:'🟫',
}

const TEMPLATES = {
  'Living Room':  { width:'5.0', length:'6.0', height:'2.8', wallColor:'#EDE9E3', floorColor:'#C4A882' },
  'Bed Room':     { width:'4.0', length:'5.0', height:'2.8', wallColor:'#E8E0F0', floorColor:'#B8A090' },
  'Office':       { width:'4.0', length:'5.0', height:'2.8', wallColor:'#E0EAF0', floorColor:'#A0B0B8' },
  'Dining Area':  { width:'4.5', length:'5.0', height:'2.8', wallColor:'#F0E8DC', floorColor:'#C0A070' },
  'Kitchen Area': { width:'3.5', length:'4.5', height:'2.8', wallColor:'#F0F0E4', floorColor:'#C8C0A0' },
}

// Each preset entry: [id, x, y, rotY_degrees, color]
const PRESETS = {
  'Living Room Set': [
    ['rug',       1.0, 1.5,   0,   '#8B6A40'],
    ['sofa',      0.3, 0.3,   0,   '#9B7D60'],
    ['tv',        1.8, 0.2, 180,   '#5C4030'],
    ['sidetable', 0.2, 1.4,   0,   '#8B6040'],
    ['chair',     3.5, 1.2,  90,   '#7A6050'],
    ['lamp',      3.8, 0.3,   0,   '#B08060'],
  ],
  'Bed Room Set': [
    ['bed',       1.0, 0.3,   0,   '#9080A0'],
    ['wardrobe',  3.5, 0.2,   0,   '#6B5040'],
    ['sidetable', 0.3, 0.3,   0,   '#8B6040'],
    ['lamp',      3.5, 1.8,   0,   '#B09060'],
  ],
  'Office Set': [
    ['desk',      0.5, 0.3,   0,   '#7B6040'],
    ['chair',     0.8, 1.2, 180,   '#5C4A38'],
    ['bookshelf', 3.2, 0.2,   0,   '#8B6030'],
    ['lamp',      3.2, 1.8,   0,   '#A08060'],
  ],
  'Dining Set': [
    ['dining',    1.2, 1.2,   0,   '#8B6030'],
    ['chair',     1.2, 0.2,   0,   '#7A5A30'],
    ['chair',     1.2, 2.4, 180,   '#7A5A30'],
    ['chair',     0.2, 1.2,  90,   '#7A5A30'],
    ['chair',     2.9, 1.2, 270,   '#7A5A30'],
    ['lamp',      3.5, 0.3,   0,   '#A08060'],
  ],
}

let UID = 1

function hexToThree(hex) {
  return new THREE.Color(hex)
}

// ─── Build realistic furniture mesh ───────────────────────────────────────────
function buildFurnitureMesh(item, scene) {
  const group = new THREE.Group()
  const baseHex = item.color || '#A08060'
  const color = new THREE.Color(baseHex)
  const darkColor = color.clone().multiplyScalar(0.6)
  const lightColor = color.clone().multiplyScalar(1.3)

  const mat = (hex, rough=0.8, metal=0.0, emissive='#000') => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex || baseHex),
    roughness: rough,
    metalness: metal,
    emissive: new THREE.Color(emissive),
  })

  const box = (w,h,d,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat)
    m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true; m.receiveShadow=true
    return m
  }
  const cyl = (rt,rb,h,seg,mat,x=0,y=0,z=0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg), mat)
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true
    return m
  }

  const fw = item.w, fh = item.h, fd = item.d

  if (item.id === 'sofa') {
    const fabricMat = mat(baseHex, 0.9, 0.0)
    const darkFabric = mat(baseHex, 0.95, 0.0)
    darkFabric.color.multiplyScalar(0.7)
    const legMat = mat('#5C3D1E', 0.4, 0.2)
    // Seat base
    group.add(box(fw, 0.25, fd*0.55, fabricMat, 0, 0.3, fd*0.1))
    // Back
    group.add(box(fw, 0.55, 0.18, darkFabric, 0, 0.68, -fd*0.18))
    // Back cushions (3)
    for (let i=-1; i<=1; i++) {
      const cush = box(fw/3.2, 0.42, 0.15, mat(baseHex,0.85), i*(fw/3.1), 0.72, -fd*0.16)
      group.add(cush)
    }
    // Seat cushions (2)
    for (let i=-0.5; i<=0.5; i++) {
      group.add(box(fw/2.1, 0.12, fd*0.45, mat(lightColor.getStyle(),0.85), i*(fw/2), 0.44, fd*0.12))
    }
    // Arms
    group.add(box(0.18, 0.55, fd*0.6, darkFabric, -fw/2+0.09, 0.48, fd*0.05))
    group.add(box(0.18, 0.55, fd*0.6, darkFabric,  fw/2-0.09, 0.48, fd*0.05))
    // Legs (4)
    const lx = fw/2-0.18, lz = fd/2-0.1
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>
      group.add(box(0.07,0.15,0.07,legMat,x,0.075,z))
    )

  } else if (item.id === 'chair') {
    const fabricMat = mat(baseHex, 0.85)
    const legMat = mat('#4A3728', 0.35, 0.1)
    // Seat
    group.add(box(fw, 0.12, fd*0.7, fabricMat, 0, 0.45, 0))
    // Back
    group.add(box(fw, 0.6, 0.12, mat(baseHex,0.9), 0, 0.78, -fd*0.27))
    // Arms
    group.add(box(0.08, 0.35, fd*0.65, mat(baseHex,0.8), -fw/2+0.04, 0.62, 0))
    group.add(box(0.08, 0.35, fd*0.65, mat(baseHex,0.8),  fw/2-0.04, 0.62, 0))
    // Legs
    const lx=fw/2-0.08, lz=fd/2-0.08
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>
      group.add(box(0.05,0.45,0.05,legMat,x,0.225,z))
    )
    // Cushion
    group.add(box(fw*0.9,0.08,fd*0.6, mat(lightColor.getStyle(),0.8), 0, 0.52, 0.02))

  } else if (item.id === 'dining') {
    const woodMat = mat(baseHex, 0.6, 0.05)
    const darkWood = mat(darkColor.getStyle(), 0.5, 0.1)
    // Tabletop
    group.add(box(fw, 0.06, fd, woodMat, 0, 0.75, 0))
    // Apron
    group.add(box(fw-0.1, 0.08, 0.04, darkWood, 0, 0.68, -fd/2+0.06))
    group.add(box(fw-0.1, 0.08, 0.04, darkWood, 0, 0.68,  fd/2-0.06))
    group.add(box(0.04, 0.08, fd-0.1, darkWood, -fw/2+0.06, 0.68, 0))
    group.add(box(0.04, 0.08, fd-0.1, darkWood,  fw/2-0.06, 0.68, 0))
    // Legs
    const lx=fw/2-0.08, lz=fd/2-0.08
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>
      group.add(box(0.06,0.73,0.06,darkWood,x,0.365,z))
    )

  } else if (item.id === 'sidetable') {
    const woodMat = mat(baseHex, 0.65, 0.05)
    const darkMat = mat(darkColor.getStyle(), 0.5, 0.1)
    group.add(box(fw, 0.05, fd, woodMat, 0, 0.53, 0))
    group.add(box(fw*0.85, 0.04, fd*0.85, mat(baseHex,0.55), 0, 0.28, 0))
    const lx=fw/2-0.05, lz=fd/2-0.05
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>
      group.add(box(0.04,0.5,0.04,darkMat,x,0.25,z))
    )

  } else if (item.id === 'bed') {
    const frameMat = mat(baseHex, 0.7, 0.05)
    const mattressMat = mat('#F0EBE0', 0.95)
    const pillowMat = mat('#FDFAF5', 0.95)
    const blanketMat = mat('#C8B8A0', 0.9)
    const legMat = mat(darkColor.getStyle(), 0.4, 0.1)
    // Frame
    group.add(box(fw, 0.15, fd, frameMat, 0, 0.08, 0))
    // Headboard
    group.add(box(fw, 0.7, 0.1, frameMat, 0, 0.45, -fd/2+0.05))
    // Footboard
    group.add(box(fw, 0.25, 0.08, frameMat, 0, 0.22, fd/2-0.04))
    // Mattress
    group.add(box(fw-0.1, 0.22, fd-0.15, mattressMat, 0, 0.27, 0.05))
    // Blanket (covers half)
    group.add(box(fw-0.12, 0.05, fd*0.55, blanketMat, 0, 0.39, fd*0.1))
    // Pillows
    ;[-fw/4, fw/4].forEach(x => {
      group.add(box(fw/2-0.15, 0.12, 0.35, pillowMat, x, 0.42, -fd/2+0.35))
    })
    // Legs
    const lx=fw/2-0.06, lz=fd/2-0.06
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>
      group.add(box(0.08,0.12,0.08,legMat,x,0.06,z))
    )

  } else if (item.id === 'wardrobe') {
    const woodMat = mat(baseHex, 0.65, 0.05)
    const darkMat = mat(darkColor.getStyle(), 0.4, 0.1)
    const mirrorMat = new THREE.MeshStandardMaterial({color:'#D0E8F0',roughness:0.05,metalness:0.9,envMapIntensity:1})
    // Body
    group.add(box(fw, fh, fd, woodMat, 0, fh/2, 0))
    // Door panels (2 doors with mirror)
    group.add(box(fw/2-0.04, fh*0.85, 0.015, mirrorMat, -fw/4, fh/2, fd/2+0.008))
    group.add(box(fw/2-0.04, fh*0.85, 0.015, mirrorMat,  fw/4, fh/2, fd/2+0.008))
    // Door divider
    group.add(box(0.025, fh, 0.02, darkMat, 0, fh/2, fd/2+0.01))
    // Handles
    ;[-fw/4, fw/4].forEach(x => {
      group.add(box(0.02, 0.12, 0.025, mat('#B0B0B0',0.2,0.9), x+(x<0?0.12:-0.12), fh/2, fd/2+0.025))
    })
    // Top cornice
    group.add(box(fw+0.04, 0.04, fd+0.02, darkMat, 0, fh+0.02, 0))

  } else if (item.id === 'desk') {
    const woodMat = mat(baseHex, 0.6, 0.05)
    const darkMat = mat(darkColor.getStyle(), 0.5, 0.1)
    const metalMat = mat('#888888', 0.3, 0.8)
    // Tabletop
    group.add(box(fw, 0.04, fd, woodMat, 0, 0.76, 0))
    // Drawer unit (left)
    group.add(box(fw*0.35, 0.65, fd*0.85, darkMat, -fw/2+fw*0.18, 0.325, 0))
    // Drawers
    ;[0.1,0.28,0.46,0.62].forEach(y =>
      group.add(box(fw*0.3, 0.09, 0.01, mat(baseHex,0.5), -fw/2+fw*0.18, y, fd/2+0.005))
    )
    // Drawer handles
    ;[0.1,0.28,0.46,0.62].forEach(y =>
      group.add(box(0.1, 0.015, 0.015, metalMat, -fw/2+fw*0.18, y, fd/2+0.015))
    )
    // Right leg
    group.add(box(0.05, 0.73, 0.05, darkMat, fw/2-0.05, 0.365, 0))
    // Monitor
    group.add(box(0.6, 0.38, 0.03, mat('#111111',0.3,0.5), fw*0.1, 0.98, -fd/2+0.15))
    group.add(box(0.1, 0.02, 0.15, metalMat, fw*0.1, 0.78, -fd/2+0.16))
    // Screen glow
    const screenMat = new THREE.MeshStandardMaterial({color:'#1A3A5C',roughness:0.1,metalness:0.0,emissive:'#0A1F35',emissiveIntensity:0.3})
    group.add(box(0.54, 0.32, 0.01, screenMat, fw*0.1, 0.99, -fd/2+0.14))

  } else if (item.id === 'bookshelf') {
    const woodMat = mat(baseHex, 0.65, 0.05)
    const darkMat = mat(darkColor.getStyle(), 0.6, 0.05)
    // Sides
    group.add(box(0.04, fh, fd, darkMat, -fw/2+0.02, fh/2, 0))
    group.add(box(0.04, fh, fd, darkMat,  fw/2-0.02, fh/2, 0))
    // Top/bottom
    group.add(box(fw, 0.03, fd, woodMat, 0, 0.015, 0))
    group.add(box(fw, 0.03, fd, woodMat, 0, fh-0.015, 0))
    // Shelves
    const shelfCount = 4
    for (let s=1; s<shelfCount; s++) {
      group.add(box(fw-0.04, 0.025, fd, woodMat, 0, (fh/shelfCount)*s, 0))
    }
    // Books (colorful)
    const bookColors = ['#C0392B','#2980B9','#27AE60','#E67E22','#8E44AD','#D35400','#16A085','#F1C40F']
    for (let s=0; s<shelfCount; s++) {
      const shelfY = (fh/shelfCount)*s + 0.05
      let bx = -fw/2+0.06
      for (let b=0; b<Math.floor(fw/0.08); b++) {
        const bw = 0.05+Math.random()*0.04
        const bh = 0.08+Math.random()*0.06
        const bc = bookColors[(s*7+b)%bookColors.length]
        group.add(box(bw, bh, fd*0.8, mat(bc,0.8), bx+bw/2, shelfY+bh/2, 0))
        bx += bw + 0.005
        if (bx > fw/2-0.08) break
      }
    }
    // Back panel
    group.add(box(fw-0.04, fh, 0.01, darkMat, 0, fh/2, -fd/2+0.01))

  } else if (item.id === 'tv') {
    const standMat = mat(baseHex, 0.5, 0.1)
    const darkMat = mat(darkColor.getStyle(), 0.4, 0.2)
    const metalMat = mat('#707070', 0.2, 0.8)
    // Cabinet
    group.add(box(fw, 0.5, fd, standMat, 0, 0.25, 0))
    // Cabinet doors
    group.add(box(fw/2-0.03, 0.38, 0.01, darkMat, -fw/4, 0.25, fd/2+0.005))
    group.add(box(fw/2-0.03, 0.38, 0.01, darkMat,  fw/4, 0.25, fd/2+0.005))
    group.add(box(0.02, 0.38, 0.015, metalMat, 0, 0.25, fd/2+0.01))
    // Legs
    ;[-fw/2+0.1, fw/2-0.1].forEach(x =>
      group.add(box(0.08, 0.08, fd-0.1, metalMat, x, 0.04, 0))
    )
    // TV screen
    const tvW = fw*0.92, tvH = tvW*0.56
    group.add(box(tvW, tvH, 0.06, mat('#111',0.1,0.3), 0, 0.5+tvH/2+0.05, 0))
    const screenMat = new THREE.MeshStandardMaterial({color:'#0A1525',roughness:0.05,metalness:0.1,emissive:'#050D18',emissiveIntensity:0.4})
    group.add(box(tvW-0.04, tvH-0.04, 0.01, screenMat, 0, 0.5+tvH/2+0.05, 0.031))
    // TV stand
    group.add(box(0.12, 0.25, 0.15, metalMat, 0, 0.5+0.13, 0.05))

  } else if (item.id === 'lamp') {
    const baseMat = mat('#888888', 0.2, 0.7)
    const poleMat = mat('#999999', 0.15, 0.8)
    const shadeMat = new THREE.MeshStandardMaterial({color:'#F5E6A0',roughness:0.7,metalness:0.0,emissive:'#F5E6A0',emissiveIntensity:0.15,side:THREE.DoubleSide})
    // Base
    group.add(cyl(0.18, 0.22, 0.06, 16, baseMat, 0, 0.03, 0))
    // Pole (segmented)
    group.add(cyl(0.025, 0.025, fh-0.35, 8, poleMat, 0, (fh-0.35)/2+0.06, 0))
    // Shade
    const shadeGeo = new THREE.CylinderGeometry(0.18, 0.3, 0.38, 16, 1, true)
    const shade = new THREE.Mesh(shadeGeo, shadeMat)
    shade.position.set(0, fh-0.15, 0); shade.castShadow = true
    group.add(shade)
    // Shade top cap
    group.add(cyl(0.05, 0.18, 0.02, 12, mat('#E8D870',0.4), 0, fh-0.335, 0))
    // Light glow point
    const lightBulb = new THREE.PointLight('#FFE9A0', 1.5, 3)
    lightBulb.position.set(0, fh-0.2, 0)
    group.add(lightBulb)

  } else if (item.id === 'plant') {
    const potMat = mat('#8B5E3C', 0.9)
    const soilMat = mat('#3D2B1F', 0.95)
    const leafMat = new THREE.MeshStandardMaterial({color:'#2D6A4F',roughness:0.8,metalness:0.0,side:THREE.DoubleSide})
    const stalkMat = mat('#5D4037', 0.85)
    // Pot
    group.add(cyl(0.16, 0.12, 0.28, 12, potMat, 0, 0.14, 0))
    group.add(cyl(0.16, 0.16, 0.02, 12, mat('#7A5230',0.8), 0, 0.28, 0))
    // Soil
    group.add(cyl(0.14, 0.14, 0.02, 12, soilMat, 0, 0.285, 0))
    // Trunk
    group.add(cyl(0.025, 0.035, fh-0.35, 8, stalkMat, 0, (fh-0.35)/2+0.3, 0))
    // Leaves (spheres)
    const leafPositions = [[0,fh-0.15,0],[0.2,fh-0.3,0.1],[-0.2,fh-0.3,-0.1],[0.1,fh-0.4,0.2],[-0.1,fh-0.25,-0.2]]
    leafPositions.forEach(([x,y,z],i) => {
      const r = 0.18+i*0.02
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r,8,6), leafMat)
      leaf.position.set(x,y,z); leaf.castShadow=true
      group.add(leaf)
    })

  } else if (item.id === 'rug') {
    const rugMat = new THREE.MeshStandardMaterial({color: new THREE.Color(baseHex),roughness:1.0,metalness:0.0})
    const rug = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.015, fd), rugMat)
    rug.position.y = 0.008; rug.receiveShadow = true
    // Border
    const borderMat = new THREE.MeshStandardMaterial({color: new THREE.Color(baseHex).multiplyScalar(0.7),roughness:1.0})
    group.add(rug)
    // Pattern lines
    ;[-fw/2+0.12, fw/2-0.12].forEach(x =>
      group.add(box(0.04, 0.016, fd-0.24, borderMat, x, 0.008, 0))
    )
    ;[-fd/2+0.12, fd/2-0.12].forEach(z =>
      group.add(box(fw-0.24, 0.016, 0.04, borderMat, 0, 0.008, z))
    )

  } else {
    // Fallback box
    group.add(box(fw, fh, fd, mat(baseHex), 0, fh/2, 0))
  }

  return group
}

// ─── Three.js Room 3D ─────────────────────────────────────────────────────────
function Room3D({ items, wallColor, floorColor, roomW, roomD, roomH, selUid, onSel, onMove3D }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const furnitureMeshes = useRef({})
  const animFrameRef = useRef(null)
  const controlsRef = useRef({ isDragging:false, isOrbiting:false, lastMouse:{x:0,y:0}, theta:0.6, phi:0.9, radius:8, target:new THREE.Vector3(0,0,0) })
  const dragRef = useRef(null)
  const raycaster = useRef(new THREE.Raycaster())
  const floorPlane = useRef(new THREE.Plane(new THREE.Vector3(0,1,0), 0))

  // Init scene once
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth, H = mount.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene — calm warm daylight sky
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#D6C9B8')
    scene.fog = new THREE.FogExp2('#C8BAA8', 0.018)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100)
    cameraRef.current = camera

    // Lighting — soft natural daylight
    const ambient = new THREE.AmbientLight('#FFF8F0', 0.65)
    scene.add(ambient)

    // Warm key light (afternoon sun from window)
    const sun = new THREE.DirectionalLight('#FFFAEE', 2.0)
    sun.position.set(8, 12, 5)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 30
    sun.shadow.camera.left = -12
    sun.shadow.camera.right = 12
    sun.shadow.camera.top = 12
    sun.shadow.camera.bottom = -12
    sun.shadow.bias = -0.001
    scene.add(sun)

    // Cool sky fill from above-left
    const fill = new THREE.DirectionalLight('#C8D8E8', 0.55)
    fill.position.set(-5, 8, -2)
    scene.add(fill)

    // Warm bounce light from floor
    const bounce = new THREE.DirectionalLight('#E8D8C0', 0.3)
    bounce.position.set(0, -2, 5)
    scene.add(bounce)

    // Soft hemisphere sky/ground
    const hemi = new THREE.HemisphereLight('#E8EEF5', '#D4C4A8', 0.35)
    scene.add(hemi)

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      const ctrl = controlsRef.current
      const cam = cameraRef.current
      const camX = ctrl.target.x + ctrl.radius * Math.sin(ctrl.phi) * Math.sin(ctrl.theta)
      const camY = ctrl.target.y + ctrl.radius * Math.cos(ctrl.phi)
      const camZ = ctrl.target.z + ctrl.radius * Math.sin(ctrl.phi) * Math.cos(ctrl.theta)
      cam.position.set(camX, camY, camZ)
      cam.lookAt(ctrl.target)
      renderer.render(scene, cam)
    }
    animate()

    // Resize
    const handleResize = () => {
      const W2 = mount.clientWidth, H2 = mount.clientHeight
      camera.aspect = W2/H2; camera.updateProjectionMatrix()
      renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  // Build/update room geometry when dimensions or colors change
  useEffect(() => {
    const scene = sceneRef.current; if (!scene) return

    // Remove old room parts
    const toRemove = scene.children.filter(c => c.userData.isRoom)
    toRemove.forEach(c => scene.remove(c))

    const addRoom = (geo, mat, userData={}) => {
      const m = new THREE.Mesh(geo, mat)
      m.receiveShadow = true; m.castShadow = false
      m.userData = { isRoom: true, ...userData }
      scene.add(m); return m
    }

    const wMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(wallColor), roughness:0.85, metalness:0 })
    const fMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(floorColor), roughness:0.75, metalness:0.05 })
    const ceilMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(wallColor).multiplyScalar(1.05), roughness:0.9 })

    const HW = roomW/2, HD = roomD/2

    // Floor
    addRoom(new THREE.BoxGeometry(roomW, 0.04, roomD), fMat).position.set(HW, -0.02, HD)
    // Ceiling
    addRoom(new THREE.BoxGeometry(roomW, 0.04, roomD), ceilMat).position.set(HW, roomH+0.02, HD)
    // Back wall
    addRoom(new THREE.BoxGeometry(roomW, roomH, 0.06), wMat).position.set(HW, roomH/2, 0)
    // Left wall
    addRoom(new THREE.BoxGeometry(0.06, roomH, roomD), wMat).position.set(0, roomH/2, HD)
    // Right wall (partial – open for view)
    addRoom(new THREE.BoxGeometry(0.06, roomH, roomD), wMat).position.set(roomW, roomH/2, HD)
    // Front wall (open for viewing angle)

    // Floor grid / wood planks
    const plankMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(floorColor).multiplyScalar(0.95), roughness:0.8 })
    for (let i=0; i<Math.ceil(roomW/0.15); i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, roomD), plankMat)
      plank.position.set(i*0.15+0.06, 0.022, HD)
      plank.userData = { isRoom: true }
      scene.add(plank)
    }

    // Baseboard
    const boardMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(wallColor).multiplyScalar(0.8), roughness:0.7 })
    addRoom(new THREE.BoxGeometry(roomW, 0.08, 0.04), boardMat).position.set(HW, 0.04, 0.02) // back
    addRoom(new THREE.BoxGeometry(0.04, 0.08, roomD), boardMat).position.set(0.02, 0.04, HD) // left

    // Ceiling light fixture
    const fixtureMat = new THREE.MeshStandardMaterial({ color:'#F0F0F0', roughness:0.3, metalness:0.5, emissive:'#FFFFF0', emissiveIntensity:0.3 })
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.06, 16), fixtureMat)
    fixture.position.set(HW, roomH-0.05, HD); fixture.userData = { isRoom: true }
    scene.add(fixture)
    const ceilingLight = new THREE.PointLight('#FFF5DC', 1.2, Math.max(roomW,roomD)*1.5)
    ceilingLight.position.set(HW, roomH-0.1, HD); ceilingLight.userData = { isRoom: true }
    scene.add(ceilingLight)

    // Set orbit target to room center
    controlsRef.current.target.set(HW, roomH*0.4, HD)
    controlsRef.current.radius = Math.max(roomW, roomD) * 1.5

  }, [wallColor, floorColor, roomW, roomD, roomH])

  // Build/update furniture meshes
  useEffect(() => {
    const scene = sceneRef.current; if (!scene) return

    const existing = furnitureMeshes.current
    const itemIds = new Set(items.map(i => i.uid))

    // Remove deleted
    Object.keys(existing).forEach(uid => {
      if (!itemIds.has(parseInt(uid))) {
        scene.remove(existing[uid])
        delete existing[uid]
      }
    })

    // Add/update
    items.forEach(item => {
      const uid = item.uid
      const rotRad = ((item.rotY||0) * Math.PI) / 180
      if (existing[uid]) {
        // Update position and rotation
        existing[uid].position.set(item.x + item.w/2, 0, item.y + item.d/2)
        existing[uid].rotation.y = rotRad
        return
      }
      // Build new mesh
      const group = buildFurnitureMesh(item, scene)
      group.position.set(item.x + item.w/2, 0, item.y + item.d/2)
      group.rotation.y = rotRad
      group.userData.uid = uid
      group.userData.isFurniture = true
      existing[uid] = group
      scene.add(group)
    })

    // Update selection highlight
    items.forEach(item => {
      const mesh = existing[item.uid]
      if (!mesh) return
      mesh.traverse(child => {
        if (child.isMesh) {
          if (child.material && child.material.emissive) {
            child.material.emissive.set(item.uid === selUid ? '#2A1F10' : '#000000')
            child.material.emissiveIntensity = item.uid === selUid ? 0.4 : 0
          }
        }
      })
    })
  }, [items, selUid])

  // Update selection highlight separately
  useEffect(() => {
    const existing = furnitureMeshes.current
    Object.values(existing).forEach(mesh => {
      const uid = mesh.userData.uid
      mesh.traverse(child => {
        if (child.isMesh && child.material && child.material.emissive) {
          child.material.emissive.set(uid === selUid ? '#2A1F10' : '#000000')
          child.material.emissiveIntensity = uid === selUid ? 0.5 : 0
        }
      })
    })
  }, [selUid])

  // Pointer events for orbit + furniture drag
  const getMouseNDC = (e, mount) => {
    const rect = mount.getBoundingClientRect()
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
  }

  const hitFurniture = (ndc) => {
    const cam = cameraRef.current; if (!cam) return null
    raycaster.current.setFromCamera(ndc, cam)
    const meshes = []
    Object.values(furnitureMeshes.current).forEach(g => g.traverse(c => { if (c.isMesh) meshes.push(c) }))
    const hits = raycaster.current.intersectObjects(meshes)
    if (!hits.length) return null
    let obj = hits[0].object
    while (obj.parent && !obj.parent.userData.isFurniture) obj = obj.parent
    if (obj.userData.isFurniture) return { uid: obj.userData.uid, point: hits[0].point }
    if (obj.parent && obj.parent.userData.isFurniture) return { uid: obj.parent.userData.uid, point: hits[0].point }
    return null
  }

  const onPointerDown = useCallback((e) => {
    const mount = mountRef.current; if (!mount) return
    const ndc = getMouseNDC(e, mount)
    const hit = hitFurniture(ndc)
    if (hit) {
      onSel(hit.uid)
      dragRef.current = { uid: hit.uid, startX: e.clientX, startZ: e.clientY, moved: false }
    } else {
      onSel(null)
      controlsRef.current.isOrbiting = true
      controlsRef.current.lastMouse = { x: e.clientX, y: e.clientY }
    }
  }, [onSel])

  const onPointerMove = useCallback((e) => {
    const ctrl = controlsRef.current
    if (ctrl.isOrbiting) {
      const dx = e.clientX - ctrl.lastMouse.x
      const dy = e.clientY - ctrl.lastMouse.y
      ctrl.theta -= dx * 0.008
      ctrl.phi = Math.max(0.15, Math.min(1.45, ctrl.phi + dy * 0.008))
      ctrl.lastMouse = { x: e.clientX, y: e.clientY }
      return
    }
    if (dragRef.current) {
      const dx = Math.abs(e.clientX - dragRef.current.startX)
      const dz = Math.abs(e.clientY - dragRef.current.startZ)
      if (dx > 5 || dz > 5) dragRef.current.moved = true
      if (!dragRef.current.moved) return
      // Project onto floor
      const mount = mountRef.current; if (!mount) return
      const cam = cameraRef.current; if (!cam) return
      const ndc = getMouseNDC(e, mount)
      raycaster.current.setFromCamera(ndc, cam)
      const target = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(floorPlane.current, target)
      const uid = dragRef.current.uid
      const item = items.find(i => i.uid === uid)
      if (item && target) {
        const nx = Math.max(0, Math.min(target.x - item.w/2, roomW - item.w))
        const nz = Math.max(0, Math.min(target.z - item.d/2, roomD - item.d))
        onMove3D(uid, nx, nz)
      }
    }
  }, [items, roomW, roomD, onMove3D])

  const onPointerUp = useCallback(() => {
    controlsRef.current.isOrbiting = false
    dragRef.current = null
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    controlsRef.current.radius = Math.max(2, Math.min(20, controlsRef.current.radius + e.deltaY * 0.01))
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ width:'100%', height:'100%', touchAction:'none', cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    />
  )
}

// ─── 2D Floor plan ────────────────────────────────────────────────────────────
function FloorPlan({ items, wallColor, floorColor, roomW, roomD, selUid, onSel, onMove2D }) {
  const scale = 80
  const W = roomW * scale, H = roomD * scale
  const dragRef = useRef(null)
  const svgRef = useRef(null)

  const onMouseDown = (e, uid) => {
    e.preventDefault(); e.stopPropagation()
    const rect = svgRef.current.getBoundingClientRect()
    const item = items.find(i => i.uid === uid)
    dragRef.current = { uid, ox: e.clientX - rect.left - item.x*scale, oy: e.clientY - rect.top - item.y*scale }
    onSel(uid)
  }
  const onMouseMove = (e) => {
    if (!dragRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const { uid, ox, oy } = dragRef.current
    const item = items.find(i => i.uid === uid); if (!item) return
    const nx = Math.max(0, Math.min((e.clientX - rect.left - ox)/scale, roomW - item.w))
    const nz = Math.max(0, Math.min((e.clientY - rect.top - oy)/scale, roomD - item.d))
    onMove2D(uid, nx, nz)
  }
  const onMouseUp = () => { dragRef.current = null }

  return (
    <div style={{overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>
      <svg ref={svgRef} width={W} height={H} style={{border:`3px solid ${wallColor}`,background:`${floorColor}22`,cursor:'default',maxWidth:'90%',maxHeight:'90%'}}
        onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onClick={()=>onSel(null)}>
        {/* Floor grid */}
        {Array.from({length:Math.ceil(roomW)}).map((_,i)=>
          <line key={`v${i}`} x1={(i+1)*scale} y1={0} x2={(i+1)*scale} y2={H} stroke={`${floorColor}66`} strokeWidth={1}/>
        )}
        {Array.from({length:Math.ceil(roomD)}).map((_,i)=>
          <line key={`h${i}`} x1={0} y1={(i+1)*scale} x2={W} y2={(i+1)*scale} stroke={`${floorColor}66`} strokeWidth={1}/>
        )}
        {/* Walls */}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke={wallColor} strokeWidth={10}/>
        {/* Furniture */}
        {items.map(it => {
          const cx = (it.x + it.w/2)*scale
          const cy = (it.y + it.d/2)*scale
          return (
          <g key={it.uid} style={{cursor:'grab'}} onClick={e=>{e.stopPropagation();onSel(it.uid)}}
            onMouseDown={e=>onMouseDown(e,it.uid)}
            transform={`rotate(${it.rotY||0} ${cx} ${cy})`}>
            <rect x={it.x*scale} y={it.y*scale} width={it.w*scale} height={it.d*scale}
              fill={it.color+'BB'} stroke={selUid===it.uid ? '#4E4034' : '#00000033'}
              strokeWidth={selUid===it.uid?3:1} rx={4}/>
            <text x={cx} y={cy-6} textAnchor="middle" fontSize={13} fill="#4E4034">
              {EMOJI[it.id]}
            </text>
            <text x={cx} y={cy+9} textAnchor="middle" fontSize={9} fill="#4E4034" fontFamily="Jost,sans-serif">
              {it.label}
            </text>
          </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Main Editor ───────────────────────────────────────────────────────────────
export default function Editor() {
  const navigate = useNavigate(), location = useLocation()
  const prev = useRef(null)
  const [width, setWidth] = useState('5.0')
  const [depth, setDepth] = useState('6.0')
  const [height, setHeight] = useState('2.8')
  const [wallColor, setWallColor] = useState('#EDE9E3')
  const [floorColor, setFloorColor] = useState('#C4A882')
  const [created, setCreated] = useState(false)
  const [selFur, setSelFur] = useState(FLIST[0].id)
  const [furClr, setFurClr] = useState('#A08060')
  const [items, setItems] = useState([])
  const [selUid, setSelUid] = useState(null)
  const [viewMode, setViewMode] = useState('3D')
  const [dname, setDname] = useState('')

  const RW = parseFloat(width) || 5
  const RD = parseFloat(depth) || 6
  const RH = parseFloat(height) || 2.8

  const selItem = items.find(i => i.uid === selUid)

  useEffect(() => {
    const s = location.state
    if (!s || prev.current === s) return; prev.current = s
    const { template, preset, editDesign } = s
    if (editDesign) {
      const d = editDesign
      setWidth(d.width); setDepth(d.depth||d.length); setHeight(d.height)
      setWallColor(d.wallColor); setFloorColor(d.floorColor); setDname(d.name)
      setItems((d.items||[]).map(i=>({...i,uid:UID++}))); setCreated(true); return
    }
    if (template && TEMPLATES[template]) {
      const t = TEMPLATES[template]
      setWidth(t.width); setDepth(t.length); setHeight(t.height)
      setWallColor(t.wallColor); setFloorColor(t.floorColor)
      setCreated(true); setDname(template); setItems([])
    }
    if (preset && PRESETS[preset]) {
      setItems(PRESETS[preset].map(([id, px, py, rotY, color]) => {
        const m = FLIST.find(f => f.id === id)
        return { uid:UID++, ...m, x:px, y:py, rotY: rotY||0, color: color||'#A08060' }
      })); setCreated(true)
    }
  }, [location.state])

  const handleAdd = () => {
    if (!created) { alert('Please create a room first!'); return }
    const m = FLIST.find(f => f.id === selFur)
    setItems(p => [...p, { uid:UID++, ...m, x:0.5+Math.random()*(RW-m.w-1), y:0.5+Math.random()*(RD-m.d-1), rotY:0, color:furClr }])
  }

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem('currentUser')||'null')
    if (!user) { navigate('/signin'); return }
    const name = dname.trim() || 'My Design'
    const code = 'DR' + Math.floor(100+Math.random()*900)
    const design = { id:Date.now(), userId:user.id, code, name, date:new Date().toLocaleDateString('en-GB'), width, depth, height, wallColor, floorColor, items }
    localStorage.setItem('designs', JSON.stringify([...JSON.parse(localStorage.getItem('designs')||'[]'), design]))
    alert(`✅ Design "${name}" saved!\nCode: ${code}`)
  }

  const updateItemColor = (uid, color) => setItems(p => p.map(i => i.uid===uid ? {...i,color} : i))
  const rotateItem = (uid, deltaRot) => setItems(p => p.map(i => i.uid===uid ? {...i, rotY:((i.rotY||0)+deltaRot+360)%360} : i))

  const on2DMove = useCallback((uid, nx, nz) => {
    setItems(p => p.map(i => i.uid===uid ? {...i,x:nx,y:nz} : i))
  }, [])

  const on3DMove = useCallback((uid, nx, nz) => {
    setItems(p => p.map(i => i.uid===uid ? {...i,x:nx,y:nz} : i))
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@200;300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0 }
        :root {
          --bg: #F7F4EE;
          --panel: #EFEBE4;
          --panel2: #E8E3DA;
          --border: #D8D0C4;
          --text: #3A2E24;
          --accent: #6B4F3A;
          --accent2: #8B6A50;
          --muted: #9B8878;
          --white: #FEFCFA;
          --gold: #C8A870;
          --shadow: rgba(58,46,36,0.15);
        }
        .ep { min-height:100vh; background:var(--bg); font-family:'Jost',sans-serif; display:flex; flex-direction:column; color:var(--text) }
        .eb { display:flex; flex:1; height:calc(100vh - 56px); overflow:hidden }

        /* ─── Left panel ─── */
        .el {
          width:256px; flex-shrink:0; background:var(--panel);
          border-right:1px solid var(--border); display:flex; flex-direction:column;
          overflow:hidden;
        }
        .el-scroll { flex:1; overflow-y:auto; padding:20px 16px 16px; }
        .el-scroll::-webkit-scrollbar { width:4px }
        .el-scroll::-webkit-scrollbar-track { background:transparent }
        .el-scroll::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px }

        .sec-title {
          font-family:'Cormorant Garamond',serif; font-size:13px; font-weight:600;
          color:var(--accent); letter-spacing:1.5px; text-transform:uppercase;
          margin:18px 0 10px; display:flex; align-items:center; gap:8px;
        }
        .sec-title::after { content:''; flex:1; height:1px; background:var(--border) }
        .sec-title:first-child { margin-top:0 }

        .dim-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px }
        .dim-item { display:flex; flex-direction:column; gap:4px }
        .dim-label { font-size:9px; letter-spacing:1px; color:var(--muted); text-transform:uppercase; font-weight:500 }
        .dim-input {
          padding:9px 6px; border-radius:8px; border:1.5px solid var(--border);
          background:var(--white); font-family:'Jost',sans-serif; font-size:13px;
          color:var(--text); outline:none; text-align:center; width:100%;
          transition: border-color 0.2s;
        }
        .dim-input:focus { border-color:var(--accent) }

        .btn-primary {
          width:100%; padding:12px; border-radius:10px; border:none;
          background:var(--accent); color:#FFF8F0; font-family:'Jost',sans-serif;
          font-size:10px; font-weight:600; letter-spacing:2px; cursor:pointer;
          margin-bottom:4px; transition: background 0.2s, transform 0.1s;
          text-transform:uppercase;
        }
        .btn-primary:hover { background:#5A3E2C }
        .btn-primary:active { transform:scale(0.98) }
        .btn-save {
          width:100%; padding:12px; border-radius:10px; border:1.5px solid var(--accent2);
          background:transparent; color:var(--accent); font-family:'Jost',sans-serif;
          font-size:10px; font-weight:600; letter-spacing:2px; cursor:pointer;
          transition: background 0.2s, color 0.2s; text-transform:uppercase;
        }
        .btn-save:hover { background:var(--accent); color:#FFF8F0 }

        .color-row { display:flex; gap:8px; margin-bottom:8px }
        .color-item { flex:1 }
        .color-label { font-size:9px; letter-spacing:0.8px; color:var(--muted); margin-bottom:4px; text-transform:uppercase; font-weight:500 }
        .color-picker {
          display:flex; align-items:center; gap:6px;
          background:var(--white); border:1.5px solid var(--border);
          border-radius:8px; padding:6px 8px; cursor:pointer;
          transition: border-color 0.2s;
        }
        .color-picker:hover { border-color:var(--accent2) }
        .color-swatch { width:16px; height:16px; border-radius:4px; border:1px solid var(--border); flex-shrink:0 }
        .color-picker input[type=color] { border:none; background:transparent; cursor:pointer; width:0; height:0; opacity:0; position:absolute }
        .color-hex { font-size:9px; color:var(--muted); font-weight:500; letter-spacing:0.5px }

        .fur-select {
          width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid var(--border);
          background:var(--white); font-family:'Jost',sans-serif; font-size:13px;
          color:var(--text); outline:none; margin-bottom:10px; cursor:pointer;
          appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M6 8L0 0h12z' fill='%239B8878'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 12px center;
          transition: border-color 0.2s;
        }
        .fur-select:focus { border-color:var(--accent) }

        .fur-color-row {
          display:flex; align-items:center; gap:8px;
          background:var(--white); border:1.5px solid var(--border);
          border-radius:10px; padding:8px 12px; margin-bottom:12px;
          cursor:pointer; transition: border-color 0.2s;
        }
        .fur-color-row:hover { border-color:var(--accent2) }
        .fur-color-row span { font-size:11px; color:var(--muted) }
        .fur-color-row input[type=color] { border:none; background:transparent; cursor:pointer; width:32px; height:22px; padding:0 }

        .design-name-input {
          width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid var(--border);
          background:var(--white); font-family:'Jost',sans-serif; font-size:13px;
          color:var(--text); outline:none; margin-bottom:10px;
          transition: border-color 0.2s;
        }
        .design-name-input::placeholder { color:var(--border) }
        .design-name-input:focus { border-color:var(--accent) }

        /* ─── Canvas ─── */
        .eca {
          flex:1; display:flex; align-items:stretch; justify-content:stretch;
          background:linear-gradient(160deg, #D8CFC4 0%, #C8BBA8 50%, #BFB09C 100%);
          position:relative; overflow:hidden;
        }
        .empty-state {
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:16px;
          color:rgba(80,60,40,0.45); text-align:center;
        }
        .empty-icon { font-size:72px; opacity:0.55; animation: float 3s ease-in-out infinite }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .empty-text { font-size:14px; font-family:'Cormorant Garamond',serif; font-style:italic; line-height:1.7; color:rgba(80,60,40,0.55) }
        .hint-bar {
          position:absolute; bottom:20px; left:50%; transform:translateX(-50%);
          background:rgba(80,60,40,0.45); backdrop-filter:blur(12px);
          color:rgba(255,248,240,0.9); font-size:11px; padding:6px 18px;
          border-radius:20px; pointer-events:none; white-space:nowrap;
          border:1px solid rgba(255,248,240,0.15);
        }

        /* ─── Right panel ─── */
        .erp {
          width:130px; flex-shrink:0; background:var(--panel);
          border-left:1px solid var(--border); padding:16px 10px;
          display:flex; flex-direction:column; gap:0; overflow-y:auto;
        }
        .rp-section { margin-bottom:16px }
        .rp-title {
          font-family:'Cormorant Garamond',serif; font-size:12px; font-weight:700;
          color:var(--accent); letter-spacing:1px; text-transform:uppercase;
          margin-bottom:8px;
        }
        .rp-hr { border:none; border-top:1px solid var(--border); margin:14px -10px }
        .rp-btn-row { display:flex; gap:6px; margin-bottom:6px }
        .rp-btn {
          flex:1; height:40px; border-radius:8px; border:1.5px solid var(--border);
          background:var(--white); font-size:16px; color:var(--accent); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition: background 0.15s, border-color 0.15s;
        }
        .rp-btn:hover { background:var(--panel2); border-color:var(--accent2) }
        .rp-btn.active { background:var(--accent); color:#FFF8F0; border-color:var(--accent) }
        .view-btn {
          width:100%; padding:9px 4px; border-radius:8px; border:1.5px solid var(--border);
          background:var(--white); font-family:'Jost',sans-serif; font-size:11px;
          font-weight:500; color:var(--text); cursor:pointer; margin-bottom:6px;
          transition: background 0.15s; letter-spacing:0.5px;
        }
        .view-btn.active { background:var(--accent); color:#FFF8F0; border-color:var(--accent) }
        .del-btn {
          width:100%; padding:9px 4px; border-radius:8px; border:1.5px solid #DDA0A0;
          background:var(--white); font-family:'Jost',sans-serif; font-size:10px;
          color:#C0392B; cursor:pointer; margin-top:6px;
          transition: background 0.15s;
        }
        .del-btn:hover { background:#FFF0EE }
        .rot-label { font-size:9px; color:var(--muted); text-align:center; margin:4px 0 }

        /* ─── Selection badge ─── */
        .sel-badge {
          position:absolute; top:16px; left:50%; transform:translateX(-50%);
          background:rgba(107,79,58,0.82); backdrop-filter:blur(10px);
          color:#FFF8F0; font-size:11px; padding:5px 14px; border-radius:20px;
          pointer-events:none; font-family:'Jost',sans-serif; font-weight:500;
          border:1px solid rgba(200,168,112,0.35); box-shadow:0 2px 12px rgba(80,50,20,0.18);
        }
        .fur-color-inline {
          display:flex; align-items:center; gap:6px; margin-top:8px;
          background:var(--white); border:1.5px solid var(--border);
          border-radius:8px; padding:6px 8px;
        }
        .fur-color-inline span { font-size:10px; color:var(--muted) }
        .fur-color-inline input[type=color] { border:none; background:transparent; cursor:pointer; width:26px; height:18px; padding:0 }
      `}</style>

      <div className="ep">
        <Navbar />
        <div className="eb">

          {/* ── Left panel ── */}
          <div className="el">
            <div className="el-scroll">
              <div className="sec-title">Room</div>
              <div className="dim-grid">
                <div className="dim-item">
                  <span className="dim-label">Width m</span>
                  <input className="dim-input" value={width} onChange={e=>setWidth(e.target.value)}/>
                </div>
                <div className="dim-item">
                  <span className="dim-label">Depth m</span>
                  <input className="dim-input" value={depth} onChange={e=>setDepth(e.target.value)}/>
                </div>
                <div className="dim-item">
                  <span className="dim-label">Height m</span>
                  <input className="dim-input" value={height} onChange={e=>setHeight(e.target.value)}/>
                </div>
              </div>
              <button className="btn-primary" onClick={()=>setCreated(true)}>Create / Update Room</button>

              <div className="sec-title">Materials</div>
              <div className="color-row">
                <div className="color-item">
                  <div className="color-label">Wall</div>
                  <label className="color-picker">
                    <div className="color-swatch" style={{background:wallColor}}/>
                    <span className="color-hex">{wallColor.slice(1).toUpperCase()}</span>
                    <input type="color" value={wallColor} onChange={e=>setWallColor(e.target.value)}/>
                  </label>
                </div>
                <div className="color-item">
                  <div className="color-label">Floor</div>
                  <label className="color-picker">
                    <div className="color-swatch" style={{background:floorColor}}/>
                    <span className="color-hex">{floorColor.slice(1).toUpperCase()}</span>
                    <input type="color" value={floorColor} onChange={e=>setFloorColor(e.target.value)}/>
                  </label>
                </div>
              </div>

              <div className="sec-title">Furniture</div>
              <select className="fur-select" value={selFur} onChange={e=>setSelFur(e.target.value)}>
                {FLIST.map(f => <option key={f.id} value={f.id}>{EMOJI[f.id]} {f.label}</option>)}
              </select>
              <label className="fur-color-row">
                <div className="color-swatch" style={{background:furClr}}/>
                <input type="color" value={furClr} onChange={e=>setFurClr(e.target.value)}/>
                <span>Colour: {furClr.slice(1).toUpperCase()}</span>
              </label>
              <button className="btn-primary" onClick={handleAdd}>+ Add to Room</button>

              {selItem && (
                <>
                  <div className="sec-title">Selected</div>
                  <div style={{fontSize:12,color:'var(--text)',marginBottom:8,fontWeight:500}}>
                    {EMOJI[selItem.id]} {selItem.label}
                  </div>
                  <label className="fur-color-inline">
                    <div className="color-swatch" style={{background:selItem.color}}/>
                    <input type="color" value={selItem.color} onChange={e=>updateItemColor(selItem.uid,e.target.value)}/>
                    <span>Change colour</span>
                  </label>
                </>
              )}

              <div className="sec-title">Save</div>
              <input className="design-name-input" placeholder="Design name…" value={dname} onChange={e=>setDname(e.target.value)}/>
              <button className="btn-save" onClick={handleSave}>Save Design</button>
            </div>
          </div>

          {/* ── Canvas ── */}
          <div className="eca">
            {!created ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <div className="empty-text">
                  Enter your room dimensions<br/>and click <strong>Create Room</strong><br/>
                  <span style={{fontSize:11,opacity:0.6,display:'block',marginTop:6}}>or pick a template from the menu</span>
                </div>
              </div>
            ) : viewMode === '3D' ? (
              <>
                <Room3D
                  items={items} wallColor={wallColor} floorColor={floorColor}
                  roomW={RW} roomD={RD} roomH={RH}
                  selUid={selUid} onSel={setSelUid} onMove3D={on3DMove}
                />
                {selItem && <div className="sel-badge">{EMOJI[selItem.id]} {selItem.label} selected</div>}
                {items.length > 0 && <div className="hint-bar">🖱 Drag to orbit · Click furniture to select · Drag furniture to move · Scroll to zoom</div>}
              </>
            ) : (
              <>
                <FloorPlan
                  items={items} wallColor={wallColor} floorColor={floorColor}
                  roomW={RW} roomD={RD}
                  selUid={selUid} onSel={setSelUid} onMove2D={on2DMove}
                />
                {items.length > 0 && <div className="hint-bar" style={{color:'rgba(0,0,0,0.5)',background:'rgba(255,255,255,0.7)'}}>🖱 Drag furniture to reposition</div>}
              </>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="erp">
            <div className="rp-section">
              <div className="rp-title">View</div>
              <button className={`view-btn${viewMode==='3D'?' active':''}`} onClick={()=>setViewMode('3D')}>3D View</button>
              <button className={`view-btn${viewMode==='2D'?' active':''}`} onClick={()=>setViewMode('2D')}>2D Plan</button>
            </div>
            <hr className="rp-hr"/>
            {selItem && (
              <>
                <div className="rp-section">
                  <div className="rp-title">Rotate</div>
                  <div className="rp-btn-row">
                    <button className="rp-btn" title="Rotate left 45°"  onClick={()=>rotateItem(selUid, -45)}>↺</button>
                    <button className="rp-btn" title="Rotate right 45°" onClick={()=>rotateItem(selUid,  45)}>↻</button>
                  </div>
                  <div className="rot-label">{selItem.rotY||0}°</div>
                  <button className="rp-btn" style={{width:'100%',height:30,fontSize:10,fontFamily:'Jost,sans-serif',marginTop:4,letterSpacing:'0.5px'}}
                    onClick={()=>rotateItem(selUid, -(selItem.rotY||0))}>Reset</button>
                </div>
                <hr className="rp-hr"/>
                <div className="rp-section">
                  <div className="rp-title">Item</div>
                  <button className="del-btn" onClick={()=>{setItems(p=>p.filter(i=>i.uid!==selUid));setSelUid(null)}}>
                    🗑 Remove
                  </button>
                </div>
                <hr className="rp-hr"/>
              </>
            )}
            <div className="rp-section" style={{fontSize:10,color:'var(--muted)',lineHeight:1.6}}>
              <div className="rp-title">Tips</div>
              <p>Drag furniture in 3D to reposition</p>
              <p style={{marginTop:6}}>Orbit: drag empty space</p>
              <p style={{marginTop:6}}>Zoom: scroll wheel</p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}