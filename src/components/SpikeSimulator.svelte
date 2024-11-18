<script lang="ts">
    import { Button, Input } from 'flowbite-svelte';

    export let modalOpen = false;
    let numberOfLoads = 0;
    let partData = '';
    let partLines: string[] = [];

    function loadRobot() {}
    function loadLibrary() {}
</script>

{#key numberOfLoads}
    <input type="file" id="load_robot" class="hidden" accept=".ldr" on:change={loadRobot} />
    <input type="file" id="load_library" class="hidden" accept=".zip" on:change={loadLibrary} />
{/key}
