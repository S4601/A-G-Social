<script>
    import { db } from "$lib/firebase/firebase.client";
    import { collection, query, where, getDocs, documentId, orderBy, count } from "firebase/firestore";
    import { writable } from "svelte/store";

    const followersStore = writable([]);
    export let showModal = false;
    export let usersList = [];
    export let title = "";    

    const getUsers = async () => {
        followersStore.update(() => {
            return [];
        });

        if(usersList.length != 0) {
            const q =  query(collection(db, "Users"), where("email", "in", usersList), orderBy("email", "asc"));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                console.log(doc.id, "=>", doc.data());
                let follower = { id: doc.id, email: doc.data().email, username: doc.data().username };
                
                followersStore.update((currentFollowers) => {
                    return [...currentFollowers, follower];
                });                        
            }); 
        } else {
            console.log(`There is no ${title}`);
        }
           
    }

    $: if(showModal) {        
        getUsers();
    }    
</script>

{#if showModal}    
    <div class="backdrop" on:click|self>
        <div class="commentModal">
            <h1>{title}</h1>

            <div class="users">
                {#if $followersStore.length != 0 }
                    {#each $followersStore as user}
                        <div class="user">
                            <h3>{user.username}</h3>
                            <h4>{user.email}</h4>
                        </div>
                    {/each}
                {:else}
                    <h3>Все още няма {title.toLowerCase()}</h3>
                {/if}                                
            </div>

            <div class="actions">
                <button on:click|self class="btn">Назад</button>                
            </div>
        </div>        
    </div>
{/if}

<style>
    .backdrop{
        width: 100%;
        height: 100%;
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        top: 0;
        left:0;
        z-index: 999;
        display: grid;        
    }
    .commentModal{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 10px;
        margin: auto;
        border-radius: 10px;
        max-width: 400px;
        z-index: 1000;
        aspect-ratio: 4/5;
        text-align: center;
        background: white;
        align-self: center;
        width: inherit;
    }
    h1{
        text-align: left;
        padding-left: 5%;
    }

    .actions{
        text-align: right;
        padding: 7px;
    }
    .users {
        margin-block: 5%;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 70%;
    }
    .user {
        background-color: #d9d9d9;
        margin-inline: 5%;
        margin-block: 3%;
        padding: 3%;
        text-align: left;
    }

</style>