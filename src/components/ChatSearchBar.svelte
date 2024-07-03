<script>    
    import { db } from "$lib/firebase/firebase.client";
    import { getDocs, getDoc, query, collection, where, setDoc, doc} from "firebase/firestore";
    import { searchResultsStore } from "../stores/searchResultsStore";
    import { authStore } from "../stores/authStore";
    import { chatRoomsStore } from "../stores/chatRoomsStore";
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    export let showModal = false;
    export let addCommentToPostId = null;

    let textForSearching = '';
    let debounceTimer;
    let backdropRef;

    function debounce(func, delay) {
        return function() {
            const context = this;
            const args = arguments;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    const debouncedSearch = debounce(search, 300);

    function handleInput() {
        debouncedSearch();
    }

    function search() {        
        searchResultsStore.update(currUsers => {
            return [];
        });
        const usersCollection = collection(db, 'Users');

        const q = query(usersCollection, where('email', '>=', textForSearching), where('email', '<', textForSearching + '\uf8ff'), where('email', '!=', $authStore.currentUser.email));
        getDocs(q)
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {                
                console.log('User:', doc.id, '=>', doc.data());
                // Access other fields as needed: doc.data().bio, doc.data().username, etc.
                let user = {id: doc.id, ...doc.data()};
                searchResultsStore.update(currUsers => {                    
                    return [...currUsers, user];
                });                
            });
            
        })
        .catch(error => {
            console.error('Error getting users:', error);
        });
    }

    async function newChatToUser(user) {        
        const chatRoomId = `${user.id}_${$authStore.currentUser.uid}`;

        const docRef = doc(db, "chat_rooms", chatRoomId);
        const docSnap = await getDoc(docRef);

        const exists = $chatRoomsStore.find(room => room.chatRoomId === chatRoomId) !== undefined;

        if (docSnap.exists() && exists) { //Tuk ima greshka nqkakva
            console.log("There is already chatroom with that person!");
            dispatch("openTheExistingChatRoom", chatRoomId);
            backdropRef.click();
        } else {
            await setDoc(doc(db, "chat_rooms", chatRoomId), {});   
        
            chatRoomsStore.update(currRooms => {
                return [...currRooms, { chatRoomId: chatRoomId, receiverId: user.id, receiverName: user.username, receiverEmail: user.email, senderId: $authStore.currentUser.uid, senderEmail: $authStore.currentUser.email}];
            });
            console.log($chatRoomsStore);
            backdropRef.click();
        }        
    }
</script>

{#if showModal}
    <div class="backdrop" bind:this={backdropRef} on:click|self>
        <div class="searchModal">
            <h2>Търсене на потребител</h2>
            <input type="text" class="w-100" bind:value={textForSearching} on:input={handleInput} placeholder="Имейл на потребител...">

            <div class="availableUsers">
                {#each $searchResultsStore as user}
                    <div class="user" on:click={() => newChatToUser(user)}>
                        <h2>{user.email}</h2>
                        <h3>{user.username}</h3>
                    </div>
                {/each}
            </div>
            <div class="actions">
                <button on:click|self class="btn">Отказ</button>                
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
    }
    .searchModal{
        display: block;
        padding: 10px;
        margin: 10% auto;
        border-radius: 10px;
        max-width: 600px;
        z-index: 1000;
        aspect-ratio: 5/2;
        text-align: center;
        background: white;
    }
    h1{
        text-align: left;
        padding-left: 5%;
    }
    
    input{
        margin-block: 5%;        
        width: 90%;
        height: 20%;
    }
    .actions{
        text-align: right;
        padding: 7px;
    }
    .availableUsers {
        max-height: 85%;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }
    .user {
        background-color: #d9d9d9;
    }
</style>