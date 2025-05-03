<script lang="ts" context="module">
    import { type ComponentType } from 'svelte';

    export interface MenuAction {
        name: string;
        icon?: ComponentType;
        action: () => void;
        submenu?: MenuEntry;
        radio?: boolean;
        checkbox?: boolean;
        toggle?: boolean;
    }

    export interface MenuEntry {
        name: string;
        actions: MenuAction[];
    }
</script>

<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import MenuDropdown from '$components/MenuDropdown.svelte';

    export let menu: MenuEntry[];
</script>

<div class="flex flex-row {$$props.class}">
    {#each menu as item}
        <Button color="blue" class="rounded-none py-1">{item.name}</Button>
        <MenuDropdown name={item.name} actions={item.actions} />
    {/each}
</div>
