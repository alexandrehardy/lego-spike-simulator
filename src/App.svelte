<script>
    import BlocklyPage from '$pages/BlocklyPage.svelte';
</script>

<svelte:head>
    <title>Lego Spike Simulator</title>
    <meta name="description" content="Lego Spike Simulator" />
</svelte:head>

<!-- print display -->
<svg
    id="printSvg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="print-renderer spike-theme blocklyWorkspace"
    width="0px"
    height="0px"
>
</svg>

<section id="blockly-ui" class="h-dvh w-dvw overflow-hidden">
    <BlocklyPage />
</section>
