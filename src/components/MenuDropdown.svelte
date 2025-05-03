<script lang="ts">
    import { twMerge } from 'tailwind-merge';
    import { Checkbox, Dropdown, DropdownItem, Radio, Toggle } from 'flowbite-svelte';
    import { type MenuAction } from '$components/Menu.svelte';
    export let actions: MenuAction[];
    export let placement: 'bottom-start' | 'right' = 'bottom-start';
    export let name: string;
    export let rounded = false;
</script>

<Dropdown {placement} {rounded} class={twMerge('bg-blue-100', $$props.class)} offset={0}>
    {#each actions as action}
        {#if action.radio !== undefined}
            <li
                class={twMerge(
                    'font-medium py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600',
                    $$props.itemClass
                )}
            >
                <Radio
                    {name}
                    value={action.name}
                    on:change={() => action.action()}
                    checked={action.radio}>{action.name}</Radio
                >
            </li>
        {:else if action.checkbox !== undefined}
            <li
                class={twMerge(
                    'font-medium py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600',
                    $$props.itemClass
                )}
            >
                <Checkbox on:change={() => action.action()} checked={action.checkbox}
                    >{action.name}</Checkbox
                >
            </li>
        {:else if action.toggle !== undefined}
            <li
                class={twMerge(
                    'font-medium py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600',
                    $$props.itemClass
                )}
            >
                <Toggle size="small" on:change={() => action.action()} checked={action.toggle}
                    >{action.name}</Toggle
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
