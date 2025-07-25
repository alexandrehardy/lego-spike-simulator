<script lang="ts">
    import { boundaryStore } from '$lib/spike/scene';
    import { onDestroy, onMount } from 'svelte';
    import { WebGL, type MapTexture } from '$lib/ldraw/gl';
    import { brickColour, type Quad } from '$lib/ldraw/components';
    import { type SceneStore, type SceneObject } from '$lib/spike/scene';
    import * as m4 from '$lib/ldraw/m4';

    export let id: string;
    export let scene: SceneStore;
    export let enabled = true;
    export let select: string | undefined = undefined;
    export let camera: 'top' | 'left' | 'right' | 'front' | 'back' | 'adaptive';
    export let robotFocus = false;
    export let tilt = true;
    export let rotate = false;
    export let unresolved: string[] = [];
    export let dimMap = false;

    let canRender = false;
    let gl: WebGL | undefined;
    let droppedFrames = 0;
    let lastFrame: number = 0;
    let angle = 0;
    let mapTexture: MapTexture | null = null;
    let brown = brickColour('86');
    let red = brickColour('4');

    function doRender(timestamp: number) {
        const frameTime = timestamp - lastFrame;
        // Aim for 30 fps
        const frames = Math.round(frameTime / 33);
        if (frames > 1 && lastFrame > 0) {
            droppedFrames++;
            // TODO: Drop the model detail
        }
        lastFrame = timestamp;
        renderScene();
        if (canRender && enabled) {
            requestAnimationFrame(doRender);
        } else {
            lastFrame = 0;
        }
    }

    function queueRender() {
        if (!canRender) {
            return;
        }
        requestAnimationFrame(doRender);
    }

    function renderScene() {
        if (!gl) {
            return;
        }

        let leftBarrierHit = false;
        let rightBarrierHit = false;
        let bottomBarrierHit = false;
        let topBarrierHit = false;
        gl.resizeToFit();
        gl.setModelIdentity();
        gl.clearColour(0.0, 0.0, 0.0);
        gl.clear();
        if (robotFocus) {
            gl.translate(0, 0, -3);
        } else {
            gl.translate(0, 0, -30);
        }
        // Make unit meters
        gl.scale(0.01);

        if (tilt) {
            if (robotFocus) {
                gl.rotate(30, 1.0, 0.0, 0.0);
            } else {
                gl.rotate(45, 1.0, 0.0, 0.0);
            }
        }
        if (camera == 'adaptive') {
            if (gl.getCanvasAspect() >= 1.0) {
                gl.rotate(0, 0.0, 1.0, 0.0);
            } else {
                gl.rotate(90, 0.0, 1.0, 0.0);
            }
        } else if (camera == 'top') {
            gl.rotate(90, 1.0, 0.0, 0.0);
        } else if (camera == 'left') {
            gl.rotate(90, 0.0, 1.0, 0.0);
        } else if (camera == 'right') {
            gl.rotate(-90, 0.0, 1.0, 0.0);
        } else if (camera == 'front') {
            gl.rotate(0, 0.0, 1.0, 0.0);
        } else if (camera == 'back') {
            gl.rotate(180, 0.0, 1.0, 0.0);
        }
        if (rotate) {
            gl.rotate(angle, 0.0, 1.0, 0.0);
        }
        if (scene.robot && scene.robot.compiled && mapTexture) {
            const w = mapTexture.width / 2;
            const h = mapTexture.height / 2;
            const obj = scene.robot;
            const bbox = scene.robot.compiled.bbox;
            let sphereIntersect = false;
            const cx = 0.5 * (bbox.min.x + bbox.max.x);
            const cy = 0.5 * (bbox.min.y + bbox.max.y);
            const cz = 0.5 * (bbox.min.z + bbox.max.z);
            let matrix = m4.identity();
            if (obj.position) {
                matrix = m4.translate(matrix, obj.position.x, obj.position.y, obj.position.z);
            }
            if (obj.rotation) {
                //matrix = m4.axisRotate(matrix, [0.0, 1.0, 0.0], obj.rotation);
            }

            // Check bounding sphere first
            const c = m4.transformVector(matrix, [cx, cy, cz, 1.0]);
            if ((c[0] + w) * (c[0] + w) < bbox.radius) {
                sphereIntersect = true;
                // check bbox, left
            } else if ((c[0] - w) * (c[0] - w) < bbox.radius) {
                sphereIntersect = true;
                // check bbox, right
            } else if ((c[2] + h) * (c[2] + h) < bbox.radius) {
                sphereIntersect = true;
                // check bbox, bottom
            } else if ((c[2] - h) * (c[2] - h) < bbox.radius) {
                sphereIntersect = true;
                // check bbox, top
            }

            if (sphereIntersect) {
                // Do a quick check on min and max
                const p1 = [bbox.min.x, bbox.min.y, bbox.min.z, 1.0];
                const p2 = [bbox.max.x, bbox.min.y, bbox.min.z, 1.0];
                const p3 = [bbox.min.x, bbox.min.y, bbox.max.z, 1.0];
                const p4 = [bbox.max.x, bbox.min.y, bbox.max.z, 1.0];
                for (const p of [p1, p2, p3, p4]) {
                    const pt = m4.transformVector(matrix, p);
                    if (pt[0] < -w) {
                        leftBarrierHit = true;
                    }
                    if (pt[0] > w) {
                        rightBarrierHit = true;
                    }
                    if (pt[2] < -h) {
                        bottomBarrierHit = true;
                    }
                    if (pt[2] > h) {
                        topBarrierHit = true;
                    }
                }
            }
        }
        if (robotFocus) {
            if (scene.robot) {
                const obj = scene.robot;
                if (obj.rotation) {
                    gl.rotate(-obj.rotation, 0.0, 1.0, 0.0);
                }
                if (obj.position) {
                    gl.translate(-obj.position.x, -obj.position.y, -obj.position.z);
                }
            }
        }
        if (mapTexture) {
            const w = mapTexture.width / 2;
            const h = mapTexture.height / 2;
            if (dimMap) {
                gl.setBrightness(0.5);
            } else {
                if (select === '#map' || select === '#all') {
                    gl.setBrightness(1.0);
                } else {
                    gl.setBrightness(0.3);
                }
            }
            gl.pushMatrix();
            gl.drawTexturedQuad(mapTexture);
            gl.popMatrix();
            if (bottomBarrierHit || topBarrierHit || leftBarrierHit || rightBarrierHit) {
                gl.setBrightness(1.0);
            }
            if ($boundaryStore.draw || $boundaryStore.collisions) {
                const quads: Quad[] = [];
                const size = 50.0 * $boundaryStore.scale;
                if (bottomBarrierHit || $boundaryStore.draw) {
                    quads.push({
                        colour: bottomBarrierHit ? red : brown,
                        p1: { x: -w, y: 0.0, z: -h },
                        p2: { x: -w, y: size, z: -h },
                        p3: { x: w, y: size, z: -h },
                        p4: { x: w, y: 0.0, z: -h }
                    });
                }
                if (topBarrierHit || $boundaryStore.draw) {
                    quads.push({
                        colour: topBarrierHit ? red : brown,
                        p1: { x: -w, y: 0.0, z: h },
                        p2: { x: -w, y: size, z: h },
                        p3: { x: w, y: size, z: h },
                        p4: { x: w, y: 0.0, z: h }
                    });
                }
                if (rightBarrierHit || $boundaryStore.draw) {
                    quads.push({
                        colour: rightBarrierHit ? red : brown,
                        p1: { x: w, y: 0.0, z: -h },
                        p2: { x: w, y: size, z: -h },
                        p3: { x: w, y: size, z: h },
                        p4: { x: w, y: 0.0, z: h }
                    });
                }
                if (leftBarrierHit || $boundaryStore.draw) {
                    quads.push({
                        colour: leftBarrierHit ? red : brown,
                        p1: { x: -w, y: 0.0, z: -h },
                        p2: { x: -w, y: size, z: -h },
                        p3: { x: -w, y: size, z: h },
                        p4: { x: -w, y: 0.0, z: h }
                    });
                }
                gl.drawQuads(quads);
            }
            gl.setBrightness(1.0);
        }
        gl.translate(0, 0, 0);
        for (const obj of scene.objects) {
            if (select === obj.name || select === '#all') {
                gl.setBrightness(1.0);
            } else {
                gl.setBrightness(0.3);
            }
            gl.pushMatrix();
            if (obj.position) {
                gl.translate(obj.position.x, obj.position.y, obj.position.z);
            }
            if (obj.rotation) {
                gl.rotate(obj.rotation, 0.0, 1.0, 0.0);
            }
            if (obj.compiled) {
                gl.drawCompiled(obj.compiled);
            } else {
                gl.drawBox(100, 100, 100);
            }
            gl.popMatrix();
            gl.setBrightness(1.0);
        }

        if (scene.robot) {
            const obj = scene.robot;
            if (select === '#robot' || select === '#all') {
                gl.setBrightness(1.0);
            } else {
                gl.setBrightness(0.3);
            }
            gl.pushMatrix();
            if (obj.position) {
                gl.translate(obj.position.x, obj.position.y, obj.position.z);
            }
            if (obj.rotation) {
                gl.rotate(obj.rotation, 0.0, 1.0, 0.0);
            }
            if (obj.compiled) {
                gl.drawCompiled(obj.compiled);
            } else {
                gl.drawBox(100, 100, 100);
            }
            gl.popMatrix();
            gl.setBrightness(1.0);
        }

        gl.flush();
        if (rotate) {
            angle = angle + 5 * 0.1;
            if (angle > 360) {
                angle = angle - 360;
            }
        } else {
            angle = 0;
        }
    }

    function checkEnabled(enabled: boolean) {
        if (enabled) {
            queueRender();
        }
    }

    async function loadMapTexture(map: Blob | undefined) {
        if (!gl) {
            mapTexture = null;
            return;
        }
        if (mapTexture) {
            gl.deleteTexture(mapTexture.texture);
        }
        if (!map) {
            mapTexture = null;
            return;
        }
        mapTexture = await gl.loadTexture(map);
        // We could get the size from the texture.
        // But better not, since it isn't real units.
        // mapWidth = mapTexture.width;
        // mapHeight = mapTexture.height;
        if (mapTexture) {
            mapTexture.width = scene.mapWidth;
            mapTexture.height = scene.mapHeight;
        }
    }

    function loadRobot(robot: SceneObject, forceCompile: boolean, unresolved: string[]) {
        if (!gl) {
            return;
        }
        if (unresolved.length > 0) {
            return;
        }
        const obj = robot;
        if (obj.bricks) {
            if (!obj.compiled || forceCompile) {
                obj.compiled = gl.compileModel(obj.bricks, { rescale: false });
            }
        }
        if (!obj.position && obj.compiled) {
            obj.position = { x: 0.0, y: -obj.compiled.bbox.min.y, z: 0.0 };
        } else if (obj.compiled && obj.position) {
            obj.position = { x: obj.position.x, y: -obj.compiled.bbox.min.y, z: obj.position.z };
        } else if (obj.compiled) {
            obj.position = { x: 0.0, y: -obj.compiled.bbox.min.y, z: 0.0 };
        }
    }

    function loadSceneItems(objects: SceneObject[], forceCompile: boolean, unresolved: string[]) {
        if (!gl) {
            return;
        }
        if (unresolved.length > 0) {
            return;
        }
        for (const obj of objects) {
            if (obj.bricks) {
                if (!obj.compiled || forceCompile) {
                    obj.compiled = gl.compileModel(obj.bricks, { rescale: false });
                }
            }
            if (!obj.position && obj.compiled) {
                obj.position = { x: 0.0, y: -obj.compiled.bbox.min.y, z: 0.0 };
            }
        }
    }

    onMount(() => {
        const canvas = document.getElementById(id);
        if (canvas) {
            gl = WebGL.create(canvas as HTMLCanvasElement);
            if (gl) {
                loadSceneItems(scene.objects, false, unresolved);
                loadRobot(scene.robot, false, unresolved);
                loadMapTexture(scene.map);
            }
            canRender = true;
            queueRender();
        } else {
            console.log('No WebGL available');
        }
    });

    onDestroy(() => {
        canRender = false;
        if (mapTexture && gl) {
            gl.deleteTexture(mapTexture.texture);
            mapTexture = null;
        }
    });

    function setMapSize(scene: SceneStore) {
        if (mapTexture) {
            mapTexture.width = scene.mapWidth;
            mapTexture.height = scene.mapHeight;
        }
    }

    $: checkEnabled(enabled);
    $: loadMapTexture(scene.map);
    $: setMapSize(scene);
    $: loadSceneItems(scene.objects, false, unresolved);
    $: loadRobot(scene.robot, false, unresolved);
</script>

<canvas {id} class={$$props.class}></canvas>
