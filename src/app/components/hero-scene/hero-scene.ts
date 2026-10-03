import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import type * as THREE from 'three';

@Component({
  selector: 'app-hero-scene',
  templateUrl: './hero-scene.html',
  styleUrl: './hero-scene.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroScene implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLCanvasElement>;

  private animationFrame = 0;
  private resizeObserver?: ResizeObserver;
  private visibilityObserver?: IntersectionObserver;
  private scene?: import('three').Scene;
  private camera?: import('three').PerspectiveCamera;
  private renderer?: import('three').WebGLRenderer;
  private group?: import('three').Group;
  private dataPackets: import('three').Mesh[] = [];
  private packetPaths: number[][] = [];
  private nodePositions: number[][] = [];
  private geometries: import('three').BufferGeometry[] = [];
  private materials: import('three').Material[] = [];
  private visible = false;
  private reducedMotion = false;
  private pointerX = 0;
  private pointerY = 0;
  private lastFrame = 0;
  private destroyed = false;

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const bounds = this.canvas.nativeElement.getBoundingClientRect();
    this.pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    this.pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.pause();
    } else if (this.visible && !this.reducedMotion) {
      this.resume();
    } else if (this.visible) {
      this.render();
    }
  };

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || typeof WebGLRenderingContext === 'undefined') {
      return;
    }

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    void this.initializeScene();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.pause();
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    this.canvas.nativeElement.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    for (const geometry of this.geometries) {
      geometry.dispose();
    }
    for (const material of this.materials) {
      material.dispose();
    }
    this.renderer?.dispose();
  }

  private async initializeScene(): Promise<void> {
    const THREE = await import('three');
    if (this.destroyed) {
      return;
    }

    const canvas = this.canvas.nativeElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);
    this.scene = scene;
    this.camera = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (error) {
      console.warn('The optional hero WebGL effect could not be initialized.', error);
      return;
    }

    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    this.group = group;
    scene.add(group);

    this.nodePositions = [
      [-1.75, 0.25, -0.25], [-1.3, 0.9, 0.25], [-1.25, -0.55, -0.7],
      [-0.85, 0.05, 0.65], [-0.55, 1.05, -0.2], [-0.5, -0.95, 0.3],
      [-0.1, 0.55, 0.75], [0.05, -0.3, -0.65], [0.3, 1.05, 0.05],
      [0.55, -0.85, -0.4], [0.8, 0.15, 0.55], [1.15, 0.8, -0.45],
      [1.25, -0.35, 0.7], [1.75, 0.25, -0.05], [0.75, -0.35, -0.85],
      [-1.25, -1.05, 0.2],
    ];
    const edges = [
      [0, 1], [0, 2], [0, 3], [1, 3], [1, 4], [2, 3], [2, 15],
      [3, 4], [3, 5], [3, 6], [4, 6], [4, 8], [5, 7], [5, 15],
      [6, 7], [6, 8], [6, 10], [7, 9], [7, 10], [7, 14], [8, 10],
      [8, 11], [9, 10], [9, 12], [9, 14], [10, 11], [10, 12],
      [11, 13], [11, 12], [12, 13], [12, 14],
    ];
    const linePositions = new Float32Array(edges.length * 6);
    edges.forEach(([start, end], index) => {
      const startNode = this.nodePositions[start]!;
      const endNode = this.nodePositions[end]!;
      linePositions.set(startNode, index * 6);
      linePositions.set(endNode, index * 6 + 3);
    });
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x9282ed,
      transparent: true,
      opacity: 0.34,
    });
    this.geometries.push(linesGeometry);
    this.materials.push(linesMaterial);
    group.add(new THREE.LineSegments(linesGeometry, linesMaterial));

    const pointsGeometry = new THREE.BufferGeometry();
    const pointPositions = new Float32Array(this.nodePositions.flat());
    const pointColors = new Float32Array(this.nodePositions.length * 3);
    this.nodePositions.forEach((_, index) => {
      const color = new THREE.Color(index === 6 || index === 10 ? 0x8de1ec : 0xc0b6ff);
      color.toArray(pointColors, index * 3);
    });
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
    });
    this.geometries.push(pointsGeometry);
    this.materials.push(pointsMaterial);
    group.add(new THREE.Points(pointsGeometry, pointsMaterial));

    const coreGeometry = new THREE.OctahedronGeometry(0.46, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x9a8aff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    this.geometries.push(coreGeometry);
    this.materials.push(coreMaterial);
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0.05, 0.15, 0.02);
    group.add(core);

    this.packetPaths = [[0, 3, 6, 10, 12, 13], [15, 5, 7, 9, 14, 12], [1, 4, 8, 11, 13]];
    const packetGeometry = new THREE.SphereGeometry(0.035, 8, 8);
    const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xa8f0f2 });
    this.geometries.push(packetGeometry);
    this.materials.push(packetMaterial);
    this.packetPaths.forEach((path, index) => {
      const packet = new THREE.Mesh(packetGeometry, packetMaterial);
      const start = this.nodePositions[path[0]!]!;
      packet.position.set(start[0]!, start[1]!, start[2]!);
      this.dataPackets.push(packet);
      group.add(packet);
    });

    const resize = (): void => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      this.render();
    };

    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(canvas);
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting ?? false;
      if (this.visible && !document.hidden && !this.reducedMotion) {
        this.resume();
      } else {
        this.pause();
        if (this.visible) {
          this.render();
        }
      }
    });
    this.visibilityObserver.observe(canvas);
    canvas.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.reducedMotion) {
      this.render();
    }
  }

  private resume(): void {
    if (!this.animationFrame && this.renderer) {
      this.lastFrame = 0;
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  }

  private pause(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  private readonly animate = (timestamp: number): void => {
    if (!this.visible || document.hidden || this.destroyed || !this.renderer || !this.group) {
      this.animationFrame = 0;
      return;
    }

    this.animationFrame = requestAnimationFrame(this.animate);
    if (timestamp - this.lastFrame < 1000 / 30) {
      return;
    }
    this.lastFrame = timestamp;

    const elapsed = timestamp * 0.00012;
    const scrollInfluence = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    this.group.rotation.y = elapsed + this.pointerX * 0.1 + scrollInfluence * 0.08;
    this.group.rotation.x = this.pointerY * 0.07 + Math.sin(elapsed * 0.7) * 0.018;
    this.group.position.y = Math.sin(elapsed) * 0.035 - scrollInfluence * 0.08;
    this.dataPackets.forEach((packet, index) => {
      const path = this.packetPaths[index]!;
      const progress = (timestamp * 0.00012 + index / this.dataPackets.length) % 1;
      const pathPosition = progress * (path.length - 1);
      const segment = Math.floor(pathPosition);
      const fraction = pathPosition - segment;
      const start = this.nodePositions[path[segment]!]!;
      const end = this.nodePositions[path[Math.min(segment + 1, path.length - 1)]!]!;
      packet.position.set(
        start[0]! + (end[0]! - start[0]!) * fraction,
        start[1]! + (end[1]! - start[1]!) * fraction,
        start[2]! + (end[2]! - start[2]!) * fraction,
      );
    });
    this.render();
  };

  private render(): void {
    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
