<script lang="ts">
    import { Button, Input } from 'flowbite-svelte';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let partData = '';
    let partLines: string[] = [];

    function loadRobot() {}
    function loadLibrary() {}
</script>

Use LeoCad to create a model (<a href="https://www.leocad.org/">https://www.leocad.org/</a>). You
may need to upload the component library (complete.zip) to load your model (<a
    href="https://library.ldraw.org/updates?latest">https://library.ldraw.org/updates?latest</a
>).
{#key numberOfLoads}
    <input type="file" id="load_robot" class="hidden" accept=".ldr" on:change={loadRobot} />
    <input type="file" id="load_library" class="hidden" accept=".zip" on:change={loadLibrary} />
{/key}
