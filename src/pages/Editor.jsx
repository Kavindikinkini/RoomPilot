import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import * as THREE from 'three'

// ─── Furniture catalog ────────────────────────────────────────────────────────
const FLIST = [
  { id:'sofa',      label:'Sofa',           w:2.2,  d:0.9,  h:0.85 },
  { id:'chair',     label:'Armchair',       w:0.8,  d:0.8,  h:0.95 },
  { id:'dining',    label:'Dining Table',   w:1.6,  d:0.9,  h:0.75 },
  { id:'sidetable', label:'Side Table',     w:0.5,  d:0.5,  h:0.55 },
  { id:'counter',   label:'Kitchen Counter',w:1.2,  d:0.6,  h:0.9  },
  { id:'island',    label:'Kitchen Island', w:1.5,  d:0.8,  h:0.9  },
  { id:'stool',     label:'Bar Stool',      w:0.45, d:0.45, h:1.0  },
  { id:'bed',       label:'King Bed',       w:1.8,  d:2.1,  h:0.55 },
  { id:'wardrobe',  label:'Wardrobe',       w:1.6,  d:0.6,  h:2.1  },
  { id:'desk',      label:'Writing Desk',   w:1.4,  d:0.7,  h:0.76 },
  { id:'bookshelf', label:'Bookshelf',      w:0.9,  d:0.35, h:1.8  },
  { id:'tv',        label:'TV Stand',       w:1.4,  d:0.45, h:0.5  },
  { id:'lamp',      label:'Floor Lamp',     w:0.4,  d:0.4,  h:1.7  },
  { id:'plant',     label:'Plant',          w:0.45, d:0.45, h:1.2  },
  { id:'rug',       label:'Area Rug',       w:2.0,  d:1.5,  h:0.02 },
]

const EMOJI = {
  sofa:'🛋️', chair:'🪑', dining:'🍽️', sidetable:'🪵',
  counter:'🍳', island:'🏝️', stool:'🪑',
  bed:'🛏️', wardrobe:'🚪', desk:'🖥️', bookshelf:'📚',
  tv:'📺', lamp:'💡', plant:'🪴', rug:'🟫',
}

const TEMPLATES = {
  'Living Room':  { width:'5.0', length:'6.0', height:'2.8', wallColor:'#EDE9E3', floorColor:'#C4A882' },
  'Bed Room':     { width:'4.0', length:'5.0', height:'2.8', wallColor:'#E8E0F0', floorColor:'#B8A090' },
  'Office':       { width:'4.0', length:'5.0', height:'2.8', wallColor:'#E0EAF0', floorColor:'#A0B0B8' },
  'Dining Area':  { width:'4.5', length:'5.0', height:'2.8', wallColor:'#F0E8DC', floorColor:'#C0A070' },
  'Kitchen Area': { width:'4.0', length:'5.0', height:'2.8', wallColor:'#F5F2EA', floorColor:'#C8C0A0' },
}

// PRESETS: [id, x, y, rotY_deg, color]
const PRESETS = {
  'Living Room Set': [
    ['rug',       0.9, 1.3,   0, '#8B6A40'],
    ['sofa',      0.3, 0.3,   0, '#9B7D60'],
    ['tv',        1.5, 0.2, 180, '#5C4030'],
    ['sidetable', 0.2, 1.3,   0, '#8B6040'],
    ['chair',     3.2, 1.2,  90, '#7A6050'],
    ['lamp',      3.6, 0.3,   0, '#B08060'],
    ['plant',     4.3, 0.2,   0, '#5A8A40'],
  ],
  'Bed Room Set': [
    ['bed',       0.9, 0.3,   0, '#9080A0'],
    ['wardrobe',  3.0, 0.2,   0, '#6B5040'],
    ['sidetable', 0.2, 0.4,   0, '#8B6040'],
    ['sidetable', 2.7, 0.4,   0, '#8B6040'],
    ['lamp',      3.5, 2.0,   0, '#B09060'],
    ['plant',     0.1, 4.0,   0, '#5A8A40'],
    ['rug',       0.5, 1.5,   0, '#907090'],
  ],
  'Office Set': [
    ['desk',      0.3, 0.3,   0, '#7B6040'],
    ['chair',     0.6, 1.1, 180, '#5C4A38'],
    ['bookshelf', 3.2, 0.2,   0, '#8B6030'],
    ['bookshelf', 2.2, 0.2,   0, '#7B5020'],
    ['lamp',      0.3, 2.5,   0, '#A08060'],
    ['plant',     3.6, 4.0,   0, '#5A8A40'],
    ['sidetable', 3.5, 2.5,   0, '#8B6040'],
  ],
  'Dining Set': [
    ['rug',       0.5, 0.8,   0, '#A08060'],
    ['dining',    1.0, 1.2,   0, '#8B6030'],
    ['chair',     1.0, 0.2,   0, '#7A5A30'],
    ['chair',     1.0, 2.4, 180, '#7A5A30'],
    ['chair',     0.1, 1.2,  90, '#7A5A30'],
    ['chair',     2.8, 1.2, 270, '#7A5A30'],
    ['lamp',      3.8, 0.2,   0, '#A08060'],
    ['plant',     3.8, 3.8,   0, '#5A8A40'],
  ],
  'Kitchen Set': [
    // L-shaped counters along two walls
    ['counter',   0.1, 0.1,   0, '#C8C0A8'],  // back-left counter
    ['counter',   1.4, 0.1,   0, '#C8C0A8'],  // back-mid counter
    ['counter',   2.7, 0.1,   0, '#C8C0A8'],  // back-right counter
    ['counter',   0.1, 0.2,  90, '#C8C0A8'],  // left wall counter (rotated)
    // Island in center
    ['island',    1.2, 1.8,   0, '#A09888'],
    // Stools at island
    ['stool',     1.2, 2.8,   0, '#7B5A3A'],
    ['stool',     1.9, 2.8,   0, '#7B5A3A'],
    ['stool',     2.6, 2.8,   0, '#7B5A3A'],
    // Dining nook
    ['sidetable', 2.8, 1.6,   0, '#8B6840'],
    ['chair',     2.8, 1.0,   0, '#6B5030'],
    ['chair',     2.8, 2.5, 180, '#6B5030'],
    // Decor
    ['plant',     3.6, 0.2,   0, '#5A8A40'],
    ['lamp',      3.6, 4.2,   0, '#C0A060'],
  ],
}

let UID = 1

// ─── Build realistic furniture mesh ──────────────────────────────────────────
function buildFurnitureMesh(item) {
  const group = new THREE.Group()
  const baseHex   = item.color || '#A08060'
  const color     = new THREE.Color(baseHex)
  const darkColor = color.clone().multiplyScalar(0.6)
  const lightColor= color.clone().multiplyScalar(1.3)

  const mat = (hexOrColor, rough = 0.8, metal = 0.0) => {
    const col = typeof hexOrColor === 'string' ? new THREE.Color(hexOrColor) : hexOrColor.clone()
    return new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal })
  }
  const box = (w, h, d, material, x=0, y=0, z=0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true
    group.add(m); return m
  }
  const cyl = (rt, rb, h, seg, material, x=0, y=0, z=0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material)
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true
    group.add(m); return m
  }

  const fw = item.w, fh = item.h, fd = item.d

  if (item.id === 'sofa') {
    const fab  = mat(baseHex, 0.9)
    const fabD = mat(darkColor, 0.95)
    const legM = mat('#5C3D1E', 0.4, 0.2)
    box(fw, 0.25, fd*0.55, fab, 0, 0.3, fd*0.1)
    box(fw, 0.55, 0.18, fabD, 0, 0.68, -fd*0.18)
    for (let i=-1;i<=1;i++) box(fw/3.2, 0.42, 0.15, mat(baseHex, 0.85), i*(fw/3.1), 0.72, -fd*0.16)
    for (let i=-0.5;i<=0.5;i++) box(fw/2.1, 0.12, fd*0.45, mat(lightColor, 0.85), i*(fw/2), 0.44, fd*0.12)
    box(0.18, 0.55, fd*0.6, fabD, -fw/2+0.09, 0.48, fd*0.05)
    box(0.18, 0.55, fd*0.6, fabD,  fw/2-0.09, 0.48, fd*0.05)
    const lx=fw/2-0.18, lz=fd/2-0.1
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>box(0.07,0.15,0.07,legM,x,0.075,z))

  } else if (item.id === 'chair') {
    const fab  = mat(baseHex, 0.85)
    const legM = mat('#4A3728', 0.35, 0.1)
    box(fw, 0.12, fd*0.7, fab, 0, 0.45, 0)
    box(fw, 0.6,  0.12, mat(baseHex, 0.9), 0, 0.78, -fd*0.27)
    box(0.08, 0.35, fd*0.65, mat(baseHex, 0.8), -fw/2+0.04, 0.62, 0)
    box(0.08, 0.35, fd*0.65, mat(baseHex, 0.8),  fw/2-0.04, 0.62, 0)
    box(fw*0.9, 0.08, fd*0.6, mat(lightColor, 0.8), 0, 0.52, 0.02)
    const lx=fw/2-0.08, lz=fd/2-0.08
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>box(0.05,0.45,0.05,legM,x,0.225,z))

  } else if (item.id === 'stool') {
    const seatM = mat(baseHex, 0.7)
    const legM  = mat('#707070', 0.3, 0.6)
    // Seat
    cyl(fw/2, fw/2*0.9, 0.06, 16, seatM, 0, fh-0.03, 0)
    // Pole
    cyl(0.025, 0.025, fh-0.12, 8, legM, 0, (fh-0.12)/2+0.06, 0)
    // Foot ring
    cyl(fw/2*0.6, fw/2*0.6, 0.02, 16, legM, 0, fh*0.35, 0)
    // Base legs (3)
    for (let i=0;i<3;i++) {
      const angle = (i/3)*Math.PI*2
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.08,8), legM)
      leg.position.set(Math.cos(angle)*fw/2*0.55, 0.04, Math.sin(angle)*fw/2*0.55)
      leg.castShadow = true; group.add(leg)
    }

  } else if (item.id === 'counter') {
    const bodyM   = mat(baseHex, 0.5, 0.05)
    const topM    = mat('#E8E8E0', 0.2, 0.15)   // stone/quartz top
    const handleM = mat('#808080', 0.2, 0.8)
    const darkM   = mat(darkColor, 0.7)
    // Cabinet body
    box(fw, fh*0.85, fd, bodyM, 0, fh*0.85/2, 0)
    // Countertop (overhangs slightly)
    box(fw+0.04, 0.05, fd+0.04, topM, 0, fh*0.85+0.025, 0)
    // Doors (2)
    box(fw/2-0.04, fh*0.7, 0.02, mat(baseHex, 0.4), -fw/4, fh*0.42, fd/2+0.01)
    box(fw/2-0.04, fh*0.7, 0.02, mat(baseHex, 0.4),  fw/4, fh*0.42, fd/2+0.01)
    // Door handles
    box(0.015, 0.1, 0.02, handleM, -fw/4+0.12, fh*0.42, fd/2+0.025)
    box(0.015, 0.1, 0.02, handleM,  fw/4-0.12, fh*0.42, fd/2+0.025)
    // Kick plate
    box(fw, 0.08, fd*0.6, darkM, 0, 0.04, fd*0.1)

  } else if (item.id === 'island') {
    const bodyM   = mat(baseHex, 0.5, 0.05)
    const topM    = mat('#DDDDD0', 0.15, 0.2)   // lighter stone top
    const handleM = mat('#909090', 0.2, 0.8)
    // Body
    box(fw, fh*0.88, fd, bodyM, 0, fh*0.88/2, 0)
    // Top
    box(fw+0.06, 0.06, fd+0.06, topM, 0, fh*0.88+0.03, 0)
    // Drawers (front)
    ;[[-fw/3, 0],[0, 0],[fw/3, 0]].forEach(([x]) => {
      box(fw/3-0.04, 0.12, 0.02, mat(baseHex, 0.35), x, fh*0.65, fd/2+0.01)
      box(0.08, 0.015, 0.02, handleM, x, fh*0.65, fd/2+0.025)
    })
    // Drawers (back)
    ;[[-fw/3, 0],[0, 0],[fw/3, 0]].forEach(([x]) => {
      box(fw/3-0.04, 0.12, 0.02, mat(baseHex, 0.35), x, fh*0.65, -fd/2-0.01)
      box(0.08, 0.015, 0.02, handleM, x, fh*0.65, -fd/2-0.025)
    })
    // Shelf (lower)
    box(fw-0.1, 0.03, fd-0.1, mat('#C8C8C0', 0.5), 0, fh*0.3, 0)

  } else if (item.id === 'dining') {
    const woodM = mat(baseHex, 0.6, 0.05)
    const darkW = mat(darkColor, 0.5, 0.1)
    box(fw, 0.06, fd, woodM, 0, 0.75, 0)
    box(fw-0.1, 0.08, 0.04, darkW, 0, 0.68, -fd/2+0.06)
    box(fw-0.1, 0.08, 0.04, darkW, 0, 0.68,  fd/2-0.06)
    box(0.04, 0.08, fd-0.1, darkW, -fw/2+0.06, 0.68, 0)
    box(0.04, 0.08, fd-0.1, darkW,  fw/2-0.06, 0.68, 0)
    const lx=fw/2-0.08, lz=fd/2-0.08
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>box(0.06,0.73,0.06,darkW,x,0.365,z))

  } else if (item.id === 'sidetable') {
    const woodM = mat(baseHex, 0.65, 0.05)
    const darkM = mat(darkColor, 0.5, 0.1)
    box(fw, 0.05, fd, woodM, 0, 0.53, 0)
    box(fw*0.85, 0.04, fd*0.85, mat(baseHex, 0.55), 0, 0.28, 0)
    const lx=fw/2-0.05, lz=fd/2-0.05
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>box(0.04,0.5,0.04,darkM,x,0.25,z))

  } else if (item.id === 'bed') {
    const frameM = mat(baseHex, 0.7, 0.05)
    const mattM  = mat('#F0EBE0', 0.95)
    const pillM  = mat('#FDFAF5', 0.95)
    const blankM = mat('#C8B8A0', 0.9)
    const legM   = mat(darkColor, 0.4, 0.1)
    box(fw, 0.15, fd, frameM, 0, 0.08, 0)
    box(fw, 0.7, 0.1, frameM, 0, 0.45, -fd/2+0.05)
    box(fw, 0.25, 0.08, frameM, 0, 0.22, fd/2-0.04)
    box(fw-0.1, 0.22, fd-0.15, mattM, 0, 0.27, 0.05)
    box(fw-0.12, 0.05, fd*0.55, blankM, 0, 0.39, fd*0.1)
    ;[-fw/4, fw/4].forEach(x=>box(fw/2-0.15, 0.12, 0.35, pillM, x, 0.42, -fd/2+0.35))
    const lx=fw/2-0.06, lz=fd/2-0.06
    ;[[-lx,lz],[-lx,-lz],[lx,lz],[lx,-lz]].forEach(([x,z])=>box(0.08,0.12,0.08,legM,x,0.06,z))

  } else if (item.id === 'wardrobe') {
    const woodM   = mat(baseHex, 0.65, 0.05)
    const darkM   = mat(darkColor, 0.4, 0.1)
    const mirrorM = new THREE.MeshStandardMaterial({ color:'#D0E8F0', roughness:0.05, metalness:0.9 })
    box(fw, fh, fd, woodM, 0, fh/2, 0)
    const mir1 = new THREE.Mesh(new THREE.BoxGeometry(fw/2-0.04, fh*0.85, 0.015), mirrorM)
    mir1.position.set(-fw/4, fh/2, fd/2+0.008); mir1.castShadow=true; group.add(mir1)
    const mir2 = new THREE.Mesh(new THREE.BoxGeometry(fw/2-0.04, fh*0.85, 0.015), mirrorM)
    mir2.position.set( fw/4, fh/2, fd/2+0.008); mir2.castShadow=true; group.add(mir2)
    box(0.025, fh, 0.02, darkM, 0, fh/2, fd/2+0.01)
    ;[-fw/4, fw/4].forEach(x=>box(0.02, 0.12, 0.025, mat('#B0B0B0', 0.2, 0.9), x+(x<0?0.12:-0.12), fh/2, fd/2+0.025))
    box(fw+0.04, 0.04, fd+0.02, darkM, 0, fh+0.02, 0)

  } else if (item.id === 'desk') {
    const woodM  = mat(baseHex, 0.6, 0.05)
    const darkM  = mat(darkColor, 0.5, 0.1)
    const metalM = mat('#888888', 0.3, 0.8)
    box(fw, 0.04, fd, woodM, 0, 0.76, 0)
    box(fw*0.35, 0.65, fd*0.85, darkM, -fw/2+fw*0.18, 0.325, 0)
    ;[0.1,0.28,0.46,0.62].forEach(y=>box(fw*0.3, 0.09, 0.01, mat(baseHex, 0.5), -fw/2+fw*0.18, y, fd/2+0.005))
    ;[0.1,0.28,0.46,0.62].forEach(y=>box(0.1, 0.015, 0.015, metalM, -fw/2+fw*0.18, y, fd/2+0.015))
    box(0.05, 0.73, 0.05, darkM, fw/2-0.05, 0.365, 0)
    box(0.6, 0.38, 0.03, mat('#111111', 0.3, 0.5), fw*0.1, 0.98, -fd/2+0.15)
    box(0.1, 0.02, 0.15, metalM, fw*0.1, 0.78, -fd/2+0.16)
    const screenM = new THREE.MeshStandardMaterial({ color:'#1A3A5C', roughness:0.1, emissive:'#0A1F35', emissiveIntensity:0.3 })
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.32, 0.01), screenM)
    scr.position.set(fw*0.1, 0.99, -fd/2+0.14); scr.castShadow=true; group.add(scr)

  } else if (item.id === 'bookshelf') {
    const woodM = mat(baseHex, 0.65, 0.05)
    const darkM = mat(darkColor, 0.6, 0.05)
    box(0.04, fh, fd, darkM, -fw/2+0.02, fh/2, 0)
    box(0.04, fh, fd, darkM,  fw/2-0.02, fh/2, 0)
    box(fw, 0.03, fd, woodM, 0, 0.015, 0)
    box(fw, 0.03, fd, woodM, 0, fh-0.015, 0)
    const sN = 4
    for (let s=1; s<sN; s++) box(fw-0.04, 0.025, fd, woodM, 0, (fh/sN)*s, 0)
    const bkC = ['#C0392B','#2980B9','#27AE60','#E67E22','#8E44AD','#D35400','#16A085','#F1C40F']
    for (let s=0; s<sN; s++) {
      const shY=(fh/sN)*s+0.05; let bx=-fw/2+0.06
      for (let b=0; b<Math.floor(fw/0.08); b++) {
        const bw=0.05+Math.random()*0.04, bh=0.08+Math.random()*0.06
        box(bw, bh, fd*0.8, mat(bkC[(s*7+b)%bkC.length], 0.8), bx+bw/2, shY+bh/2, 0)
        bx+=bw+0.005; if (bx>fw/2-0.08) break
      }
    }
    const backM = new THREE.Mesh(new THREE.BoxGeometry(fw-0.04, fh, 0.01), darkM)
    backM.position.set(0, fh/2, -fd/2+0.01); backM.castShadow=true; group.add(backM)

  } else if (item.id === 'tv') {
    const standM  = mat(baseHex, 0.5, 0.1)
    const darkM   = mat(darkColor, 0.4, 0.2)
    const metalM  = mat('#707070', 0.2, 0.8)
    box(fw, 0.5, fd, standM, 0, 0.25, 0)
    box(fw/2-0.03, 0.38, 0.01, darkM, -fw/4, 0.25, fd/2+0.005)
    box(fw/2-0.03, 0.38, 0.01, darkM,  fw/4, 0.25, fd/2+0.005)
    box(0.02, 0.38, 0.015, metalM, 0, 0.25, fd/2+0.01)
    ;[-fw/2+0.1, fw/2-0.1].forEach(x=>box(0.08, 0.08, fd-0.1, metalM, x, 0.04, 0))
    const tvW=fw*0.92, tvH=tvW*0.56
    box(tvW, tvH, 0.06, mat('#111', 0.1, 0.3), 0, 0.5+tvH/2+0.05, 0)
    const screenM = new THREE.MeshStandardMaterial({ color:'#0A1525', roughness:0.05, emissive:'#050D18', emissiveIntensity:0.4 })
    const scr = new THREE.Mesh(new THREE.BoxGeometry(tvW-0.04, tvH-0.04, 0.01), screenM)
    scr.position.set(0, 0.5+tvH/2+0.05, 0.031); group.add(scr)
    box(0.12, 0.25, 0.15, metalM, 0, 0.5+0.13, 0.05)

  } else if (item.id === 'lamp') {
    const baseM  = mat('#888888', 0.2, 0.7)
    const poleM  = mat('#999999', 0.15, 0.8)
    const shadeM = new THREE.MeshStandardMaterial({ color:'#F5E6A0', roughness:0.7, emissive:'#F5E6A0', emissiveIntensity:0.15, side:THREE.DoubleSide })
    cyl(0.18, 0.22, 0.06, 16, baseM, 0, 0.03, 0)
    cyl(0.025, 0.025, fh-0.35, 8, poleM, 0, (fh-0.35)/2+0.06, 0)
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.38, 16, 1, true), shadeM)
    shade.position.set(0, fh-0.15, 0); shade.castShadow=true; group.add(shade)
    cyl(0.05, 0.18, 0.02, 12, mat('#E8D870', 0.4), 0, fh-0.335, 0)
    const bulb = new THREE.PointLight('#FFE9A0', 1.5, 3)
    bulb.position.set(0, fh-0.2, 0); group.add(bulb)

  } else if (item.id === 'plant') {
    const potM   = mat('#8B5E3C', 0.9)
    const soilM  = mat('#3D2B1F', 0.95)
    const leafM  = new THREE.MeshStandardMaterial({ color:'#2D6A4F', roughness:0.8, side:THREE.DoubleSide })
    const stalkM = mat('#5D4037', 0.85)
    cyl(0.16, 0.12, 0.28, 12, potM, 0, 0.14, 0)
    cyl(0.16, 0.16, 0.02, 12, mat('#7A5230', 0.8), 0, 0.28, 0)
    cyl(0.14, 0.14, 0.02, 12, soilM, 0, 0.285, 0)
    cyl(0.025, 0.035, fh-0.35, 8, stalkM, 0, (fh-0.35)/2+0.3, 0)
    ;[[0,fh-0.15,0],[0.2,fh-0.3,0.1],[-0.2,fh-0.3,-0.1],[0.1,fh-0.4,0.2],[-0.1,fh-0.25,-0.2]].forEach(([x,y,z],i)=>{
      const lf = new THREE.Mesh(new THREE.SphereGeometry(0.18+i*0.02, 8, 6), leafM)
      lf.position.set(x, y, z); lf.castShadow=true; group.add(lf)
    })

  } else if (item.id === 'rug') {
    const rugM = new THREE.MeshStandardMaterial({ color:new THREE.Color(baseHex), roughness:1.0 })
    const rug  = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.015, fd), rugM)
    rug.position.y = 0.008; rug.receiveShadow = true; group.add(rug)
    const borderM = new THREE.MeshStandardMaterial({ color:new THREE.Color(baseHex).multiplyScalar(0.7), roughness:1.0 })
    // Border strips — create mesh separately, add to group explicitly
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.016, fd-0.24), borderM)
    b1.position.set(-fw/2+0.12, 0.008, 0); group.add(b1)
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.016, fd-0.24), borderM)
    b2.position.set( fw/2-0.12, 0.008, 0); group.add(b2)
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(fw-0.24, 0.016, 0.04), borderM)
    b3.position.set(0, 0.008, -fd/2+0.12); group.add(b3)
    const b4 = new THREE.Mesh(new THREE.BoxGeometry(fw-0.24, 0.016, 0.04), borderM)
    b4.position.set(0, 0.008,  fd/2-0.12); group.add(b4)

  } else {
    // Fallback
    const defM = mat(baseHex)
    const fb = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), defM)
    fb.position.y = fh/2; fb.castShadow=true; group.add(fb)
  }

  return group
}

// ─── Room3D Component ─────────────────────────────────────────────────────────
function Room3D({ items, wallColor, floorColor, roomW, roomD, roomH, selUid, onSel, onMove3D }) {
  const mountRef   = useRef(null)
  const sceneRef   = useRef(null)
  const cameraRef  = useRef(null)
  const animRef    = useRef(null)
  const meshesRef  = useRef({})
  const itemsRef   = useRef(items)
  const roomRef    = useRef({ W: roomW, D: roomD })
  const ctrl       = useRef({ orbit:false, lm:{x:0,y:0}, theta:0.6, phi:0.85,
    radius: Math.max(roomW,roomD)*1.6,
    target: new THREE.Vector3(roomW/2, roomH*0.4, roomD/2) })
  const dragRef    = useRef(null)
  const rcRef      = useRef(new THREE.Raycaster())
  const floorPl    = useRef(new THREE.Plane(new THREE.Vector3(0,1,0), 0))

  // keep refs current
  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => { roomRef.current = { W:roomW, D:roomD } }, [roomW, roomD])

  // ── helpers (defined outside effects so they're stable) ──────────────────
  function addFurniture(scene, item) {
    if (!item?.uid || !item.w || !item.d) return
    const g = buildFurnitureMesh(item)
    g.position.set(item.x + item.w/2, 0, item.y + item.d/2)
    g.rotation.y = ((item.rotY||0) * Math.PI) / 180
    g.userData = { uid: item.uid, isFurniture: true }
    meshesRef.current[item.uid] = g
    scene.add(g)
  }

  function syncItems(scene, list) {
    const ex  = meshesRef.current
    const ids = new Set(list.map(i => i.uid))
    Object.keys(ex).forEach(k => {
      if (!ids.has(Number(k))) { scene.remove(ex[k]); delete ex[k] }
    })
    list.forEach(item => {
      if (!item?.uid || !item.w || !item.d) return
      const rot = ((item.rotY||0)*Math.PI)/180
      if (ex[item.uid]) {
        ex[item.uid].position.set(item.x+item.w/2, 0, item.y+item.d/2)
        ex[item.uid].rotation.y = rot
      } else {
        addFurniture(scene, item)
      }
    })
  }

  function buildRoom(scene) {
    scene.children.filter(c=>c.userData.isRoom).forEach(c=>scene.remove(c))
    const add = (geo, mat) => {
      const m = new THREE.Mesh(geo, mat)
      m.receiveShadow = true; m.userData = {isRoom:true}; scene.add(m); return m
    }
    const wMat = new THREE.MeshStandardMaterial({color:new THREE.Color(wallColor),  roughness:0.85})
    const fMat = new THREE.MeshStandardMaterial({color:new THREE.Color(floorColor), roughness:0.75, metalness:0.05})
    const cMat = new THREE.MeshStandardMaterial({color:new THREE.Color(wallColor).multiplyScalar(1.05), roughness:0.9})
    const bMat = new THREE.MeshStandardMaterial({color:new THREE.Color(wallColor).multiplyScalar(0.8),  roughness:0.7})
    const pMat = new THREE.MeshStandardMaterial({color:new THREE.Color(floorColor).multiplyScalar(0.95),roughness:0.8})
    const HW=roomW/2, HD=roomD/2
    add(new THREE.BoxGeometry(roomW,0.04,roomD), fMat).position.set(HW,-0.02,HD)
    add(new THREE.BoxGeometry(roomW,0.04,roomD), cMat).position.set(HW,roomH+0.02,HD)
    add(new THREE.BoxGeometry(roomW,roomH,0.06), wMat).position.set(HW,roomH/2,0)
    add(new THREE.BoxGeometry(0.06,roomH,roomD), wMat).position.set(0,roomH/2,HD)
    add(new THREE.BoxGeometry(0.06,roomH,roomD), wMat).position.set(roomW,roomH/2,HD)
    add(new THREE.BoxGeometry(roomW,0.08,0.04),  bMat).position.set(HW,0.04,0.02)
    add(new THREE.BoxGeometry(0.04,0.08,roomD),  bMat).position.set(0.02,0.04,HD)
    for(let i=0;i<Math.ceil(roomW/0.15);i++){
      const pl=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.005,roomD),pMat)
      pl.position.set(i*0.15+0.06,0.022,HD); pl.userData={isRoom:true}; pl.receiveShadow=true; scene.add(pl)
    }
    const fixM=new THREE.MeshStandardMaterial({color:'#F0F0F0',roughness:0.3,metalness:0.5,emissive:'#FFFFF0',emissiveIntensity:0.3})
    const fix=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.18,0.06,16),fixM)
    fix.position.set(HW,roomH-0.05,HD); fix.userData={isRoom:true}; scene.add(fix)
    const cl=new THREE.PointLight('#FFF5DC',1.2,Math.max(roomW,roomD)*1.5)
    cl.position.set(HW,roomH-0.1,HD); cl.userData={isRoom:true}; scene.add(cl)
  }

  // ── ONE effect: build everything synchronously in correct order ───────────
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return
    const W = mount.clientWidth||800, H = mount.clientHeight||600

    // Set camera target FIRST using actual room dimensions
    ctrl.current.target.set(roomW/2, roomH*0.4, roomD/2)
    ctrl.current.radius = Math.max(roomW,roomD)*1.6

    const renderer = new THREE.WebGLRenderer({antialias:true})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.setSize(W,H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFShadowMap
    renderer.toneMapping       = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace  = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#D6C9B8')
    scene.fog = new THREE.FogExp2('#C8BAA8',0.018)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45,W/H,0.1,100)
    cameraRef.current = camera

    // Lights
    scene.add(new THREE.AmbientLight('#FFF8F0',0.65))
    const sun=new THREE.DirectionalLight('#FFFAEE',2.0)
    sun.position.set(8,12,5); sun.castShadow=true
    sun.shadow.mapSize.set(2048,2048)
    sun.shadow.camera.left=-15; sun.shadow.camera.right=15
    sun.shadow.camera.top=15;   sun.shadow.camera.bottom=-15
    sun.shadow.bias=-0.001; scene.add(sun)
    const fill=new THREE.DirectionalLight('#C8D8E8',0.55)
    fill.position.set(-5,8,-2); scene.add(fill)
    scene.add(new THREE.HemisphereLight('#E8EEF5','#D4C4A8',0.35))

    // Build room geometry FIRST
    buildRoom(scene)

    // Build furniture SECOND (items are in itemsRef from prop)
    syncItems(scene, itemsRef.current)

    // Render loop
    const animate = () => {
      animRef.current = requestAnimationFrame(animate)
      const c=ctrl.current
      camera.position.set(
        c.target.x + c.radius*Math.sin(c.phi)*Math.sin(c.theta),
        c.target.y + c.radius*Math.cos(c.phi),
        c.target.z + c.radius*Math.sin(c.phi)*Math.cos(c.theta)
      )
      camera.lookAt(c.target)
      renderer.render(scene,camera)
    }
    animate()

    const onResize=()=>{
      const w=mount.clientWidth,h=mount.clientHeight
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h)
    }
    window.addEventListener('resize',onResize)
    const onWheel=(e)=>{ e.preventDefault(); ctrl.current.radius=Math.max(2,Math.min(22,ctrl.current.radius+e.deltaY*0.01)) }
    mount.addEventListener('wheel',onWheel,{passive:false})

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize',onResize)
      mount.removeEventListener('wheel',onWheel)
      renderer.dispose()
      if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      sceneRef.current=null; meshesRef.current={}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // ^ runs once on mount. key={room3DKey} in parent forces remount for new designs

  // ── Rebuild room when colors/dims change (without remounting) ─────────────
  useEffect(() => {
    if (!sceneRef.current) return
    buildRoom(sceneRef.current)
    ctrl.current.target.set(roomW/2, roomH*0.4, roomD/2)
    ctrl.current.radius = Math.max(roomW,roomD)*1.6
  }, [wallColor, floorColor, roomW, roomD, roomH]) // eslint-disable-line

  // ── Sync furniture when items change ─────────────────────────────────────
  useEffect(() => {
    if (sceneRef.current) syncItems(sceneRef.current, items)
  }, [items]) // eslint-disable-line

  // ── Selection highlight ───────────────────────────────────────────────────
  useEffect(() => {
    Object.values(meshesRef.current).forEach(mesh => {
      const sel = mesh.userData.uid === selUid
      mesh.traverse(c => {
        if (c.isMesh && c.material?.emissive) {
          c.material.emissive.set(sel ? '#2A1F10' : '#000000')
          c.material.emissiveIntensity = sel ? 0.5 : 0
        }
      })
    })
  }, [selUid])

  // ── Pointer events ────────────────────────────────────────────────────────
  const getNDC = (e) => {
    const r=mountRef.current.getBoundingClientRect()
    return new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1)
  }
  const hitTest = (v) => {
    if (!cameraRef.current) return null
    rcRef.current.setFromCamera(v,cameraRef.current)
    const meshes=[]
    Object.values(meshesRef.current).forEach(g=>g.traverse(c=>{if(c.isMesh)meshes.push(c)}))
    const hits=rcRef.current.intersectObjects(meshes); if(!hits.length) return null
    let o=hits[0].object
    while(o&&!o.userData.isFurniture) o=o.parent
    return o?.userData?.isFurniture ? o : null
  }

  const onPointerDown = useCallback((e) => {
    const hit=hitTest(getNDC(e))
    if(hit){ onSel(hit.userData.uid); dragRef.current={uid:hit.userData.uid,sx:e.clientX,sy:e.clientY,moved:false} }
    else   { onSel(null); ctrl.current.orbit=true; ctrl.current.lm={x:e.clientX,y:e.clientY} }
  },[onSel]) // eslint-disable-line

  const onPointerMove = useCallback((e) => {
    const c=ctrl.current
    if(c.orbit){
      c.theta-=(e.clientX-c.lm.x)*0.008
      c.phi=Math.max(0.15,Math.min(1.45,c.phi+(e.clientY-c.lm.y)*0.008))
      c.lm={x:e.clientX,y:e.clientY}; return
    }
    if(dragRef.current){
      if(Math.abs(e.clientX-dragRef.current.sx)>5||Math.abs(e.clientY-dragRef.current.sy)>5) dragRef.current.moved=true
      if(!dragRef.current.moved) return
      if(!cameraRef.current) return
      rcRef.current.setFromCamera(getNDC(e),cameraRef.current)
      const pt=new THREE.Vector3()
      if(!rcRef.current.ray.intersectPlane(floorPl.current,pt)) return
      const item=itemsRef.current.find(i=>i.uid===dragRef.current.uid); if(!item) return
      const r=roomRef.current
      onMove3D(dragRef.current.uid,Math.max(0,Math.min(pt.x-item.w/2,r.W-item.w)),Math.max(0,Math.min(pt.z-item.d/2,r.D-item.d)))
    }
  },[onMove3D]) // eslint-disable-line

  const onPointerUp=useCallback(()=>{ ctrl.current.orbit=false; dragRef.current=null },[])

  return (
    <div ref={mountRef} style={{width:'100%',height:'100%',touchAction:'none',cursor:'grab'}}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerLeave={onPointerUp}/>
  )
}

// ─── 2D Floor Plan ────────────────────────────────────────────────────────────
function FloorPlan({ items, wallColor, floorColor, roomW, roomD, selUid, onSel, onMove2D }) {
  const scale=80, W=roomW*scale, H=roomD*scale
  const dragRef=useRef(null), svgRef=useRef(null)
  const onMD=(e,uid)=>{
    e.preventDefault(); e.stopPropagation()
    const r=svgRef.current.getBoundingClientRect(), it=items.find(i=>i.uid===uid)
    dragRef.current={uid, ox:e.clientX-r.left-it.x*scale, oy:e.clientY-r.top-it.y*scale}; onSel(uid)
  }
  const onMM=(e)=>{
    if(!dragRef.current) return
    const r=svgRef.current.getBoundingClientRect(), {uid,ox,oy}=dragRef.current
    const it=items.find(i=>i.uid===uid); if(!it) return
    onMove2D(uid,
      Math.max(0,Math.min((e.clientX-r.left-ox)/scale, roomW-it.w)),
      Math.max(0,Math.min((e.clientY-r.top-oy)/scale,  roomD-it.d))
    )
  }
  return (
    <div style={{overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>
      <svg ref={svgRef} width={W} height={H}
        style={{border:`3px solid ${wallColor}`,background:`${floorColor}22`,cursor:'default',maxWidth:'90%',maxHeight:'90%'}}
        onMouseMove={onMM} onMouseUp={()=>{dragRef.current=null}} onMouseLeave={()=>{dragRef.current=null}}
        onClick={()=>onSel(null)}>
        {Array.from({length:Math.ceil(roomW)}).map((_,i)=><line key={`v${i}`} x1={(i+1)*scale} y1={0} x2={(i+1)*scale} y2={H} stroke={`${floorColor}66`} strokeWidth={1}/>)}
        {Array.from({length:Math.ceil(roomD)}).map((_,i)=><line key={`h${i}`} x1={0} y1={(i+1)*scale} x2={W} y2={(i+1)*scale} stroke={`${floorColor}66`} strokeWidth={1}/>)}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke={wallColor} strokeWidth={10}/>
        {items.map(it=>{
          const cx=(it.x+it.w/2)*scale, cy=(it.y+it.d/2)*scale
          return (
            <g key={it.uid} style={{cursor:'grab'}}
              onClick={e=>{e.stopPropagation();onSel(it.uid)}}
              onMouseDown={e=>onMD(e,it.uid)}
              transform={`rotate(${it.rotY||0} ${cx} ${cy})`}>
              <rect x={it.x*scale} y={it.y*scale} width={it.w*scale} height={it.d*scale}
                fill={it.color+'BB'} stroke={selUid===it.uid?'#4E4034':'#00000033'}
                strokeWidth={selUid===it.uid?3:1} rx={4}/>
              <text x={cx} y={cy-4} textAnchor="middle" fontSize={13} fill="#4E4034">{EMOJI[it.id]}</text>
              <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill="#4E4034" fontFamily="Jost,sans-serif">{it.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function Editor() {
  const navigate=useNavigate(), location=useLocation()
  const prev=useRef(null)

  const [width,     setWidth]     = useState('5.0')
  const [depth,     setDepth]     = useState('6.0')
  const [height,    setHeight]    = useState('2.8')
  const [wallColor, setWallColor] = useState('#EDE9E3')
  const [floorColor,setFloorColor]= useState('#C4A882')
  const [created,   setCreated]   = useState(false)
  const [selFur,    setSelFur]    = useState(FLIST[0].id)
  const [furClr,    setFurClr]    = useState('#A08060')
  const [items,     setItems]     = useState([])
  const [selUid,    setSelUid]    = useState(null)
  const [viewMode,  setViewMode]  = useState('3D')
  const [dname,     setDname]     = useState('')
  const [editId,    setEditId]    = useState(null)
  const [room3DKey, setRoom3DKey] = useState('init')

  const RW=parseFloat(width)||5, RD=parseFloat(depth)||6, RH=parseFloat(height)||2.8
  const selItem=items.find(i=>i.uid===selUid)

  // ── Load design / template / preset from navigation state ────────────────
  useEffect(() => {
    const s = location.state; if (!s) return
    const key = JSON.stringify({ id: s.editDesign?.id, tpl: s.template, pre: s.preset, ts: s.ts })
    if (prev.current === key) return
    prev.current = key

    const { template, preset, editDesign, templateDesign } = s

    if (templateDesign) {
      const d = templateDesign
      setWidth(String(d.width  || '5.0'))
      setDepth(String(d.depth  || d.length || '6.0'))
      setHeight(String(d.height || '2.8'))
      setWallColor(d.wallColor  || '#EDE9E3')
      setFloorColor(d.floorColor || '#C4A882')
      setDname(d.name || '')
      setEditId(null)   // ← KEY: no editId, so Save always creates NEW design

      const raw = d.items || []
      const converted = raw.map(item => {
        const cat = FLIST.find(f => f.id === item.id)
        return {
          ...(cat || {}), ...item,
          uid:   UID++,
          rotY:  item.rotY  || 0,
          color: item.color || '#A08060',
          w: item.w || cat?.w || 1,
          d: item.d || cat?.d || 1,
          h: cat?.h || item.h || 0.8,
          x: item.x || 0,
          y: item.y || 0,
        }
      })
      setItems(converted)
      setCreated(true)
      setViewMode('3D')
      setSelUid(null)
      setRoom3DKey(`template-${Date.now()}`)
      return
    }

    if (editDesign) {
      const d = editDesign
      setWidth(String(d.width  || '5.0'))
      setDepth(String(d.depth  || d.length || '6.0'))
      setHeight(String(d.height || '2.8'))
      setWallColor(d.wallColor  || '#EDE9E3')
      setFloorColor(d.floorColor || '#C4A882')
      setDname(d.name || '')
      setEditId(d.id || null)

      const raw = d.items || []
      const needsConv = raw.length > 0 && (raw[0].w > 10 || raw[0].h > 10)
      const converted = raw.map(item => {
        const cat = FLIST.find(f => f.id === item.id)
        if (needsConv) {
          const P = 90
          return {
            ...(cat || {}), ...item, uid: UID++, rotY: item.rotY||0, color: item.color||'#A08060',
            w: cat ? cat.w : Math.round(item.w/P*10)/10,
            d: cat ? cat.d : Math.round((item.h||item.d||P)/P*10)/10,
            h: cat?.h || 0.8,
            x: Math.round((item.x||0)/P*10)/10,
            y: Math.round((item.y||0)/P*10)/10,
          }
        }
        return {
          ...(cat||{}), ...item, uid: UID++, rotY: item.rotY||0, color: item.color||'#A08060',
          w: item.w || cat?.w || 1, d: item.d || cat?.d || 1, h: cat?.h || item.h || 0.8,
          x: item.x||0, y: item.y||0,
        }
      })

      // Set all state in one batch, THEN change the key so Room3D mounts fresh
      setItems(converted); setCreated(true); setViewMode('3D'); setSelUid(null)
      setRoom3DKey(`edit-${d.id}-${Date.now()}`)
      return
    }

    if (template && TEMPLATES[template]) {
      const t = TEMPLATES[template]
      setWidth(t.width); setDepth(t.length); setHeight(t.height)
      setWallColor(t.wallColor); setFloorColor(t.floorColor)
      setCreated(true); setDname(template); setItems([]); setEditId(null)
      setRoom3DKey(`tpl-${Date.now()}`)
    }

    if (preset) {
      const pk = Object.keys(PRESETS).find(k => k === preset)
               || Object.keys(PRESETS).find(k => k.toLowerCase().startsWith(preset.toLowerCase().split(' ')[0]))
      if (pk) {
        const tk = Object.keys(TEMPLATES).find(k => k.toLowerCase().includes(pk.toLowerCase().split(' ')[0]))
        if (tk) {
          const t = TEMPLATES[tk]
          setWidth(t.width); setDepth(t.length); setHeight(t.height)
          setWallColor(t.wallColor); setFloorColor(t.floorColor)
          setDname(pk.replace(' Set', ''))
        }
        const presetItems = PRESETS[pk].map(([id, px, py, rotY, color]) => {
          const m = FLIST.find(f => f.id === id) || { id, label:id, w:1, d:1, h:1 }
          return { uid: UID++, ...m, x: px, y: py, rotY: rotY||0, color: color||'#A08060' }
        })
        setItems(presetItems); setCreated(true); setViewMode('3D'); setEditId(null)
        setRoom3DKey(`preset-${pk}-${Date.now()}`)
      }
    }
  }, [location.state])

  const handleAdd = () => {
    if (!created) { alert('Please create a room first!'); return }
    const m = FLIST.find(f => f.id === selFur)
    setItems(p => [...p, { uid:UID++, ...m, x:0.3+Math.random()*(RW-m.w-0.6), y:0.3+Math.random()*(RD-m.d-0.6), rotY:0, color:furClr }])
  }

  const handleSave = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
  if (!user) { navigate('/signin'); return }

  const name = dname.trim() || 'My Design'
  const all  = JSON.parse(localStorage.getItem('designs') || '[]')

  // Only treat as UPDATE if editId actually exists in localStorage
  const existingInStorage = editId
    ? all.find(d => d.id === editId || d.id === Number(editId))
    : null

  if (existingInStorage) {
    // ── UPDATE existing saved design ────────────────────────────────────────
    const updated = all.map(d =>
      (d.id === editId || d.id === Number(editId))
        ? {
            ...d,
            name,
            width,
            depth,
            length:     depth,
            height,
            wallColor,
            floorColor,
            items,
            date:   new Date().toLocaleDateString('en-GB'),
            userId: existingInStorage.userId ?? user.id,
            code:   existingInStorage.code,
          }
        : d
    )
    localStorage.setItem('designs', JSON.stringify(updated))
    alert(`✅ Design "${name}" updated!`)
  } else {
    // ── SAVE brand-new design (fresh room OR from template) ─────────────────
    const newId  = Date.now()
    const code   = 'DR' + Math.floor(100 + Math.random() * 900)
    const design = {
      id:         newId,
      userId:     user.id,
      code,
      name,
      date:       new Date().toLocaleDateString('en-GB'),
      width,
      depth,
      length:     depth,
      height,
      wallColor,
      floorColor,
      items,
    }
    localStorage.setItem('designs', JSON.stringify([...all, design]))
    setEditId(newId)
    alert(`✅ Design "${name}" saved!\nCode: ${code}`)
  }
}

  const handleNew = () => {
    if ((items.length>0||created) && !window.confirm('Start a new design? Unsaved changes will be lost.')) return
    setWidth('5.0'); setDepth('6.0'); setHeight('2.8')
    setWallColor('#EDE9E3'); setFloorColor('#C4A882')
    setItems([]); setSelUid(null); setDname(''); setCreated(false); setViewMode('3D'); setEditId(null)
    setRoom3DKey(`new-${Date.now()}`)
  }

  const updateColor  = (uid, color) => setItems(p => p.map(i => i.uid===uid ? {...i,color} : i))
  const rotateItem   = (uid, delta) => setItems(p => p.map(i => i.uid===uid ? {...i, rotY:((i.rotY||0)+delta+360)%360} : i))
  const on2DMove     = useCallback((uid,nx,nz) => setItems(p => p.map(i => i.uid===uid ? {...i,x:nx,y:nz} : i)), [])
  const on3DMove     = useCallback((uid,nx,nz) => setItems(p => p.map(i => i.uid===uid ? {...i,x:nx,y:nz} : i)), [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@200;300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#F7F4EE;--panel:#EFEBE4;--panel2:#E8E3DA;--border:#D8D0C4;--text:#3A2E24;--accent:#6B4F3A;--accent2:#8B6A50;--muted:#9B8878;--white:#FEFCFA;--gold:#C8A870}
        .ep{min-height:100vh;background:var(--bg);font-family:'Jost',sans-serif;display:flex;flex-direction:column;color:var(--text)}
        .eb{display:flex;flex:1;height:calc(100vh - 56px);overflow:hidden}
        .el{width:256px;flex-shrink:0;background:var(--panel);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
        .el-scroll{flex:1;overflow-y:auto;padding:20px 16px 16px}
        .el-scroll::-webkit-scrollbar{width:4px}
        .el-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        .sec-title{font-family:'Cormorant Garamond',serif;font-size:13px;font-weight:600;color:var(--accent);letter-spacing:1.5px;text-transform:uppercase;margin:18px 0 10px;display:flex;align-items:center;gap:8px}
        .sec-title::after{content:'';flex:1;height:1px;background:var(--border)}
        .sec-title:first-child{margin-top:0}
        .dim-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
        .dim-item{display:flex;flex-direction:column;gap:4px}
        .dim-label{font-size:9px;letter-spacing:1px;color:var(--muted);text-transform:uppercase;font-weight:500}
        .dim-input{padding:9px 6px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);font-family:'Jost',sans-serif;font-size:13px;color:var(--text);outline:none;text-align:center;width:100%;transition:border-color .2s}
        .dim-input:focus{border-color:var(--accent)}
        .btn-primary{width:100%;padding:12px;border-radius:10px;border:none;background:var(--accent);color:#FFF8F0;font-family:'Jost',sans-serif;font-size:10px;font-weight:600;letter-spacing:2px;cursor:pointer;margin-bottom:4px;transition:background .2s;text-transform:uppercase}
        .btn-primary:hover{background:#5A3E2C}
        .btn-save{width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--accent2);background:transparent;color:var(--accent);font-family:'Jost',sans-serif;font-size:10px;font-weight:600;letter-spacing:2px;cursor:pointer;transition:background .2s,color .2s;text-transform:uppercase}
        .btn-save:hover{background:var(--accent);color:#FFF8F0}
        .design-bar{background:var(--panel2);border-radius:10px;padding:10px 12px;margin-bottom:16px;border:1.5px solid var(--border)}
        .design-bar-name{font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dbar-btn{width:100%;padding:9px 10px;border-radius:8px;font-family:'Jost',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px;cursor:pointer;text-transform:uppercase;transition:all .2s;text-align:center;margin-bottom:6px;display:block}
        .dbar-btn:last-child{margin-bottom:0}
        .dbar-new{background:var(--accent);color:#FFF8F0;border:none}.dbar-new:hover{background:#5A3E2C}
        .dbar-clear{background:transparent;color:#B05050;border:1.5px solid #D4A0A0}.dbar-clear:hover{background:#FFF0F0;border-color:#C05050}
        .color-row{display:flex;gap:8px;margin-bottom:8px}
        .color-item{flex:1}
        .color-label{font-size:9px;letter-spacing:.8px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;font-weight:500}
        .color-picker{display:flex;align-items:center;gap:6px;background:var(--white);border:1.5px solid var(--border);border-radius:8px;padding:6px 8px;cursor:pointer;transition:border-color .2s;position:relative}
        .color-picker:hover{border-color:var(--accent2)}
        .color-swatch{width:16px;height:16px;border-radius:4px;border:1px solid var(--border);flex-shrink:0}
        .color-picker input[type=color]{border:none;background:transparent;cursor:pointer;width:0;height:0;opacity:0;position:absolute}
        .color-hex{font-size:9px;color:var(--muted);font-weight:500;letter-spacing:.5px}
        .fur-select{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);font-family:'Jost',sans-serif;font-size:13px;color:var(--text);outline:none;margin-bottom:10px;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M6 8L0 0h12z' fill='%239B8878'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;transition:border-color .2s}
        .fur-select:focus{border-color:var(--accent)}
        .fur-color-row{display:flex;align-items:center;gap:8px;background:var(--white);border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:12px;cursor:pointer;transition:border-color .2s}
        .fur-color-row:hover{border-color:var(--accent2)}
        .fur-color-row span{font-size:11px;color:var(--muted)}
        .fur-color-row input[type=color]{border:none;background:transparent;cursor:pointer;width:32px;height:22px;padding:0}
        .dname-input{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);font-family:'Jost',sans-serif;font-size:13px;color:var(--text);outline:none;margin-bottom:10px;transition:border-color .2s}
        .dname-input::placeholder{color:var(--border)}
        .dname-input:focus{border-color:var(--accent)}
        .fur-color-inline{display:flex;align-items:center;gap:6px;margin-top:8px;background:var(--white);border:1.5px solid var(--border);border-radius:8px;padding:6px 8px}
        .fur-color-inline span{font-size:10px;color:var(--muted)}
        .fur-color-inline input[type=color]{border:none;background:transparent;cursor:pointer;width:26px;height:18px;padding:0}
        .eca{flex:1;display:flex;align-items:stretch;justify-content:stretch;background:linear-gradient(160deg,#D8CFC4 0%,#C8BBA8 50%,#BFB09C 100%);position:relative;overflow:hidden}
        .empty-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(80,60,40,.45);text-align:center}
        .empty-icon{font-size:72px;opacity:.55;animation:float 3s ease-in-out infinite}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .empty-text{font-size:14px;font-family:'Cormorant Garamond',serif;font-style:italic;line-height:1.7;color:rgba(80,60,40,.55)}
        .hint-bar{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(80,60,40,.45);backdrop-filter:blur(12px);color:rgba(255,248,240,.9);font-size:11px;padding:6px 18px;border-radius:20px;pointer-events:none;white-space:nowrap;border:1px solid rgba(255,248,240,.15)}
        .sel-badge{position:absolute;top:16px;left:50%;transform:translateX(-50%);background:rgba(107,79,58,.82);backdrop-filter:blur(10px);color:#FFF8F0;font-size:11px;padding:5px 14px;border-radius:20px;pointer-events:none;font-family:'Jost',sans-serif;font-weight:500;border:1px solid rgba(200,168,112,.35)}
        .erp{width:130px;flex-shrink:0;background:var(--panel);border-left:1px solid var(--border);padding:16px 10px;display:flex;flex-direction:column;overflow-y:auto}
        .rp-section{margin-bottom:16px}
        .rp-title{font-family:'Cormorant Garamond',serif;font-size:12px;font-weight:700;color:var(--accent);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
        .rp-hr{border:none;border-top:1px solid var(--border);margin:14px -10px}
        .rp-btn-row{display:flex;gap:6px;margin-bottom:6px}
        .rp-btn{flex:1;height:40px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);font-size:16px;color:var(--accent);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s}
        .rp-btn:hover{background:var(--panel2);border-color:var(--accent2)}
        .view-btn{width:100%;padding:9px 4px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);font-family:'Jost',sans-serif;font-size:11px;font-weight:500;color:var(--text);cursor:pointer;margin-bottom:6px;transition:background .15s;letter-spacing:.5px}
        .view-btn.active{background:var(--accent);color:#FFF8F0;border-color:var(--accent)}
        .del-btn{width:100%;padding:9px 4px;border-radius:8px;border:1.5px solid #DDA0A0;background:var(--white);font-family:'Jost',sans-serif;font-size:10px;color:#C0392B;cursor:pointer;margin-top:6px;transition:background .15s}
        .del-btn:hover{background:#FFF0EE}
        .rot-label{font-size:9px;color:var(--muted);text-align:center;margin:4px 0}
        .tips{font-size:10px;color:var(--muted);line-height:1.7}
      `}</style>

      <div className="ep">
        <Navbar/>
        <div className="eb">

          {/* ── Left Panel ── */}
          <div className="el">
            <div className="el-scroll">

              <div className="design-bar">
                <div className="design-bar-name">
                  {dname
                    ? <><span style={{color:'#7CB87C',fontSize:8}}>●</span>{dname}</>
                    : <span style={{color:'var(--muted)',fontStyle:'italic'}}>No design open</span>}
                </div>
                <button className="dbar-btn dbar-new" onClick={handleNew}>+ New Design</button>
                {created && items.length > 0 && (
                  <button className="dbar-btn dbar-clear"
                    onClick={()=>{if(window.confirm('Remove all furniture?')){setItems([]);setSelUid(null)}}}>
                    ✕ Clear Furniture
                  </button>
                )}
              </div>

              <div className="sec-title">Room</div>
              <div className="dim-grid">
                <div className="dim-item"><span className="dim-label">Width m</span><input className="dim-input" value={width}  onChange={e=>setWidth(e.target.value)}/></div>
                <div className="dim-item"><span className="dim-label">Depth m</span><input className="dim-input" value={depth}  onChange={e=>setDepth(e.target.value)}/></div>
                <div className="dim-item"><span className="dim-label">Height m</span><input className="dim-input" value={height} onChange={e=>setHeight(e.target.value)}/></div>
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
                {FLIST.map(f=><option key={f.id} value={f.id}>{EMOJI[f.id]} {f.label}</option>)}
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
                  <div style={{fontSize:12,color:'var(--text)',marginBottom:8,fontWeight:500}}>{EMOJI[selItem.id]} {selItem.label}</div>
                  <label className="fur-color-inline">
                    <div className="color-swatch" style={{background:selItem.color}}/>
                    <input type="color" value={selItem.color} onChange={e=>updateColor(selItem.uid,e.target.value)}/>
                    <span>Change colour</span>
                  </label>
                </>
              )}

              <div className="sec-title">Save</div>
              <input className="dname-input" placeholder="Design name…" value={dname} onChange={e=>setDname(e.target.value)}/>
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
                  <span style={{fontSize:11,opacity:.6,display:'block',marginTop:6}}>or pick a template from the menu</span>
                </div>
              </div>
            ) : viewMode === '3D' ? (
              <>
                <Room3D
                  key={room3DKey}
                  items={items}
                  wallColor={wallColor} floorColor={floorColor}
                  roomW={RW} roomD={RD} roomH={RH}
                  selUid={selUid} onSel={setSelUid} onMove3D={on3DMove}
                />
                {selItem && <div className="sel-badge">{EMOJI[selItem.id]} {selItem.label} selected</div>}
                {items.length>0 && <div className="hint-bar">🖱 Drag empty space to orbit · Click furniture to select · Drag to move · Scroll to zoom</div>}
              </>
            ) : (
              <>
                <FloorPlan items={items} wallColor={wallColor} floorColor={floorColor}
                  roomW={RW} roomD={RD} selUid={selUid} onSel={setSelUid} onMove2D={on2DMove}/>
                {items.length>0 && <div className="hint-bar" style={{color:'rgba(0,0,0,.5)',background:'rgba(255,255,255,.7)'}}>🖱 Drag furniture to reposition</div>}
              </>
            )}
          </div>

          {/* ── Right Panel ── */}
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
                    <button className="rp-btn" onClick={()=>rotateItem(selUid,-45)}>↺</button>
                    <button className="rp-btn" onClick={()=>rotateItem(selUid, 45)}>↻</button>
                  </div>
                  <div className="rot-label">{selItem.rotY||0}°</div>
                  <button className="rp-btn" style={{width:'100%',height:30,fontSize:10,fontFamily:'Jost,sans-serif',marginTop:4}}
                    onClick={()=>rotateItem(selUid,-(selItem.rotY||0))}>Reset</button>
                </div>
                <hr className="rp-hr"/>
                <div className="rp-section">
                  <div className="rp-title">Item</div>
                  <button className="del-btn" onClick={()=>{setItems(p=>p.filter(i=>i.uid!==selUid));setSelUid(null)}}>🗑 Remove</button>
                </div>
                <hr className="rp-hr"/>
              </>
            )}
            <div className="rp-section">
              <div className="rp-title">Tips</div>
              <div className="tips">
                <p>Drag furniture in 3D to move</p>
                <p style={{marginTop:6}}>Drag empty space to orbit</p>
                <p style={{marginTop:6}}>Scroll to zoom</p>
                <p style={{marginTop:6}}>Click to select</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}