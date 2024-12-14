<script lang="ts">
    import { AngleLeftOutline, AngleRightOutline } from 'flowbite-svelte-icons';
    import { onDestroy, onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    export let image: string = '0000000000000000000000000';
    export let selectedPort = '';
    let imageRows = splitImage(image);
    let pressed = '';
    const dispatch = createEventDispatcher();

    function splitImage(image: string) {
        const rows: string[][] = [];
        for (let r = 0; r < 5; r++) {
            rows.push([]);
        }
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                rows[r].push(image.charAt(r * 5 + c));
            }
        }
        return rows;
    }

    function handleRelease() {
        if (pressed == 'left') {
            dispatch('leftRelease');
        } else if (pressed == 'right') {
            dispatch('rightRelease');
        } else if (pressed == 'center') {
            dispatch('centerRelease');
        }
        pressed = '';
    }

    function handlePress(button: string) {
        pressed = button;
        if (button == 'left') {
            dispatch('leftPress');
        } else if (button == 'right') {
            dispatch('rightPress');
        } else if (button == 'center') {
            dispatch('centerPress');
        }
    }

    onMount(() => {
        window.addEventListener('mouseup', handleRelease);
    });

    onDestroy(() => {
        window.removeEventListener('mouseup', handleRelease);
    });

    const brightness: Record<string, string> = {
        '0': 'bg-transparent',
        '1': 'bg-yellow-900',
        '2': 'bg-yellow-800',
        '3': 'bg-yellow-700',
        '4': 'bg-yellow-600',
        '5': 'bg-yellow-500',
        '6': 'bg-yellow-400',
        '7': 'bg-yellow-300',
        '8': 'bg-yellow-200',
        '9': 'bg-yellow-100'
    };

    $: imageRows = splitImage(image);
</script>

<div
    class="w-[200px] h-[350px] border border-black rounded-3xl flex flex-col pt-10 pb-5 gap-4 bg-gray-300"
>
    <div class="flex flex-row justify-between">
        <div class="flex flex-col gap-4">
            <button
                on:click={() => dispatch('A')}
                class="border-t border-b border-r border-black rounded-r-xl px-3 py-5 {selectedPort ==
                'A'
                    ? 'bg-blue-200'
                    : 'bg-white'} hover:bg-blue-200"
            >
                A
            </button>
            <button
                on:click={() => dispatch('C')}
                class="border-t border-b border-r border-black rounded-r-xl px-3 py-5 {selectedPort ==
                'C'
                    ? 'bg-blue-200'
                    : 'bg-white'} hover:bg-blue-200"
            >
                C
            </button>
            <button
                on:click={() => dispatch('E')}
                class="border-t border-b border-r border-black rounded-r-xl px-3 py-5 {selectedPort ==
                'E'
                    ? 'bg-blue-200'
                    : 'bg-white'} hover:bg-blue-200"
            >
                E
            </button>
        </div>
        <div class="flex flex-col gap-1 self-center">
            {#each imageRows as row}
                <div class="flex flex-row gap-2">
                    {#each row as led}
                        <div class="{brightness[led]} w-4 h-5" />
                    {/each}
                </div>
            {/each}
        </div>
        <div class="flex flex-col gap-4">
            <button
                on:click={() => dispatch('B')}
                class="border-t border-b border-l border-black rounded-l-xl px-3 py-5 {selectedPort ==
                'B'
                    ? 'bg-blue-200'
                    : 'bg-white'} hover:bg-blue-200"
            >
                B
            </button>
            <button
                on:click={() => dispatch('D')}
                class="border-t border-b border-l border-black rounded-l-xl px-3 py-5 {selectedPort ==
                'D'
                    ? 'bg-blue-200'
                    : 'bg-white'} hover:bg-blue-200"
            >
                D
            </button>
            <button
                on:click={() => dispatch('F')}
                class="border-t border-b border-l border-black rounded-l-xl px-3 py-5 {selectedPort ==
                'F'
                    ? 'bg-blue-200'
                    : 'bg-white'} hover:bg-blue-200"
            >
                F
            </button>
        </div>
    </div>
    <div class="flex flex-row justify-around">
        <div class="flex flex-row items-center gap-1">
            <button on:mousedown={() => handlePress('left')}>
                <div
                    class="border border-black rounded-l-xl m-1 w-[40px] bg-white hover:bg-blue-200"
                >
                    <AngleLeftOutline class="ml-0.5" />
                </div>
            </button>
            <button on:mousedown={() => handlePress('center')}>
                <svg
                    class="w-10 h-10 text-white hover:text-blue-200"
                    viewBox="0 0 40 40"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle r="18" cx="20" cy="20" stroke="#000" fill="currentColor" />
                    <circle r="15" cx="20" cy="20" stroke="#000" fill="currentColor" />
                </svg>
            </button>
            <button on:mousedown={() => handlePress('right')}>
                <div
                    class="border border-black rounded-r-xl m-1 w-[40px] bg-white hover:bg-blue-200"
                >
                    <AngleRightOutline class="ml-4" />
                </div>
            </button>
        </div>
    </div>
</div>
