<script lang="ts">
    import { Checkbox, Dropdown, DropdownItem, Radio } from 'flowbite-svelte';
    import { type MenuAction } from '$components/Menu.svelte';
    export let actions: MenuAction[];
    export let placement: 'bottom-start' | 'right' = 'bottom-start';
    export let name: string;
</script>

<Dropdown {placement} rounded={false} class="bg-blue-100" offset={0}>
    {#each actions as action}
        {#if action.radio !== undefined}
            <li class="font-medium py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                <Radio
                    {name}
                    value={action.name}
                    on:change={() => action.action()}
                    checked={action.radio}>{action.name}</Radio
                >
            </li>
        {:else if action.checkbox !== undefined}
            <li class="font-medium py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                <Checkbox on:change={() => action.action()} checked={action.checkbox}
                    >{action.name}</Checkbox
                >
            </li>
        {:else}
            <DropdownItem on:click={() => action.action()}>
                <div class="flex flex-row gap-2">
                    {#if action.icon}
                        <svelte:component this={action.icon} />
                    {/if}
                    {action.name}
                </div>
            </DropdownItem>
        {/if}
        {#if action.submenu}
            <svelte:self name={action.name} actions={action.submenu.actions} placement="right" />
        {/if}
    {/each}
</Dropdown>
