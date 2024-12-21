import { type Model } from '$lib/ldraw/components';
import { writable } from 'svelte/store';

export interface Vector {
    x: number;
    y: number;
    z: number;
}

export interface SceneObject {
    anchored: boolean;
    bricks: Model;
    position: Vector;
    name: string;
}

export interface SceneStore {
    robot: SceneObject | undefined;
    objects: SceneObject[];
    map: File | undefined;
    mapWidth: number;
    mapHeight: number;
}

export const sceneStore = writable<SceneStore>({
    robot: undefined,
    objects: [],
    map: undefined,
    mapWidth: 0,
    mapHeight: 0
});
