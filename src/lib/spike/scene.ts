import { type Model } from '$lib/ldraw/components';
import { type CompiledModel } from '$lib/ldraw/gl';
import { writable } from 'svelte/store';

export interface Vector {
    x: number;
    y: number;
    z: number;
}

export interface SceneObject {
    anchored: boolean;
    bricks?: Model;
    position?: Vector;
    rotation?: number;
    name: string;
    compiled?: CompiledModel;
}

export interface SceneStore {
    robot: SceneObject;
    objects: SceneObject[];
    map: Blob | undefined;
    mapWidth: number;
    mapHeight: number;
}

export const sceneStore = writable<SceneStore>({
    robot: { anchored: false, name: 'Robot', position: { x: 0, y: 0, z: 0 } },
    objects: [],
    map: undefined,
    mapWidth: 2360,
    mapHeight: 1140
});

function copyObject(obj: SceneObject): SceneObject {
    return {
        anchored: obj.anchored,
        bricks: obj.bricks,
        position: obj.position ? { ...obj.position } : { x: 0, y: 0, z: 0 },
        rotation: obj.rotation ?? 0,
        name: obj.name
    };
}

export function copyScene(scene: SceneStore): SceneStore {
    return {
        robot: copyObject(scene.robot),
        objects: scene.objects.map((x) => copyObject(x)),
        map: scene.map,
        mapWidth: scene.mapWidth,
        mapHeight: scene.mapHeight
    };
}

// FLL table is 2434mm x 1145mm
// Mat is 2360mm x 1140mm
// Boundary is 50mm high

export interface Boundary {
    draw: boolean;
    scale: number;
    collisions: boolean;
}

export const boundaryStore = writable<Boundary>({
    draw: true,
    scale: 2.0,
    collisions: true
});
