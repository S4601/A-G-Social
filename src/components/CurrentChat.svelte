<script>
    import { onMount } from "svelte";
    import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
    import { db } from "$lib/firebase/firebase.client";
	import { chatRoomsStore } from "../stores/chatRoomsStore";
    import { authStore } from "../stores/authStore";
	import { writable } from "svelte/store";

    const messages = writable([]);
    let newMessage = '';
    export let chatRoomId;

    let messagesQuery = query(
        collection(db, `chat_rooms/${chatRoomId}/messages`),
        orderBy('timestamp')
    );

    $: {
        if(chatRoomId == null) {
            console.log("Chatroom id - initial");
        } else {
            console.log("Chatroom id - changes");
            messagesQuery = query(
                collection(db, `chat_rooms/${chatRoomId}/messages`),
                orderBy('timestamp')
            );
            onSnapshot(messagesQuery, (snapshot) => {
                console.log("aasasdasdasdasdasdasds", chatRoomId);
                const receivedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                console.log(receivedMessages);
                messages.set(receivedMessages);
            });
        }
    }
    $: console.log("messages", $messages);
    $: chatRoomIndex = $chatRoomsStore.findIndex(room => room.chatRoomId === chatRoomId);
    

    async function sendMessage() {
        if (newMessage.trim() !== '') {
            await addDoc(collection(db, `chat_rooms/${chatRoomId}/messages`), {
                message: newMessage,
                receiverId: $chatRoomsStore[chatRoomIndex].receiverId,
                senderEmail: $authStore.currentUser.email,
                senderId: $authStore.currentUser.uid,
                timestamp: Timestamp.now()            
            });
            newMessage = '';
        }
    }
</script>

<div class="container p-0 h-100 d-flex flex-column">
    {#if chatRoomId == null}
        <div class="noChatsYet text-center d-flex flex-column justify-content-center h-100">
            <h1><i class="bi bi-chat-left-fill"></i></h1>
            <h1><b>Твоите съобщения</b></h1>
            <h2>Използвай <svg aria-label="New message" class="x1lliihq x1n2onr6 x5n08af"
                fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                <title>New message</title><path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952"
                fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2"></path><path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z"
                fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2"></path><line fill="none" stroke="black" stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153"></line>
            </svg> за да започнеш нов чат</h2>
        </div>
    {:else}
        <div class="profileSection bg-secondary text-light w-100 px-4 py-2">
            <h2>{$chatRoomsStore[chatRoomIndex]?.receiverName}</h2>
            <h5>{$chatRoomsStore[chatRoomIndex]?.receiverEmail}</h5>
        </div>
        <div class="chat text-dark flex-grow-1">
            <ul class="messages p-3">
                {#each $messages as message}
                <li class="message my-1">
                    <div class="messageContent px-2 py-1 rounded {message.senderEmail == $authStore.currentUser.email ? "ms-auto myMessages" : "me-auto otherUserMessages"}">
                        {message.message}
                    </div>
                </li>
                {/each}
            </ul>
        </div>
        <div class="messageSection">
            <div class="form d-flex mx-3 mt-3 mb-2">
                <input class="w-100" type="text" bind:value={newMessage} placeholder="Ново съобщение">
                <button class="btn" on:click|preventDefault={sendMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                    </svg>
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .chat {
        background: white;
        position: relative;
    }

    .message {
        background: white;        
    }

    .myMessages {
        background: blue;
    }

    .otherUserMessages {
        background: gray;
    }

    .messages {
        list-style-type: none;
        overflow-y: auto;
        position: absolute;
        height: 100%;
        width: 100%;
    }

    .messageContent {
        width: fit-content;
        /*background: gray;*/
        color: white;
    }
</style>