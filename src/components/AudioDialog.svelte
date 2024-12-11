<script lang="ts">
    import { Modal } from 'flowbite-svelte';
    import { CirclePlusOutline, PlaySolid, TrashBinOutline } from 'flowbite-svelte-icons';
    import {
        type LibraryItem,
        SoundLibrary,
        removeAudio,
        selectedAudio,
        selectAudio
    } from '$lib/blockly/audio';

    export let modalOpen = false;
    let library = [...SoundLibrary].map(([name, value]) => ({ name: name, id: value }));

    function play(item: LibraryItem) {
        const audio = new Audio(`https://spike.legoeducation.com/sounds/${item.id}.mp3`);
        audio.play();
    }

    function remove(item: LibraryItem) {
        removeAudio(item.name);
        library = library;
    }

    function add(item: LibraryItem) {
        selectAudio(item.name);
        library = library;
    }

    function isSelected(item: LibraryItem) {
        return selectedAudio.find((x) => x.name === item.name);
    }
</script>

<Modal
    backdropClass="fixed inset-0 z-[80] bg-gray-900 bg-opacity-50 dark:bg-opacity-80"
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-[90] w-full p-4 flex"
    title="Sound Library"
    size="xl"
    bind:open={modalOpen}
>
    <div class="flex flex-col">
        <div class="grid grid-cols-8 gap-4">
            {#each library as item}
                <div
                    class="flex flex-col rounded-xl border h-40 items-center justify-center w-full gap-4 px-3 {isSelected(
                        item
                    )
                        ? 'bg-green-200'
                        : ''}"
                >
                    {item.name}
                    <div class="flex flex-row gap-4">
                        <button on:click={() => play(item)}>
                            <PlaySolid size="xl" />
                        </button>
                        {#if isSelected(item)}
                            <button on:click={() => remove(item)}>
                                <TrashBinOutline size="xl" />
                            </button>
                        {:else}
                            <button on:click={() => add(item)}>
                                <CirclePlusOutline size="xl" />
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</Modal>
