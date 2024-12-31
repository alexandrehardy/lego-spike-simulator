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
    bricks: Model;
    position: Vector;
    name: string;
    compiled?: CompiledModel;
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

// FLL table is 2434mm x 1145mm
// Mat is 2360mm x 1140mm
