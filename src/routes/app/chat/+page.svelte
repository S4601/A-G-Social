<script>
    import { authHandlers, authStore } from "../../../stores/authStore";
    import { db } from "$lib/firebase/firebase.client";
    import { getDocs, query, collection, where, doc, getDoc} from "firebase/firestore";
    import ChatSearchBar from "../../../components/ChatSearchBar.svelte";
	import { onMount } from "svelte";    
	import { searchResultsStore } from "../../../stores/searchResultsStore";
	import { chatRoomsStore } from "../../../stores/chatRoomsStore";
	import CurrentChat from "../../../components/CurrentChat.svelte";    

    $: console.log($searchResultsStore);

    let showAddCommentModal = false;
    let addCommentToPostId = null;    

    const toggleAddComentModal = () => {
		showAddCommentModal = !showAddCommentModal;
	}    
    
    const loadChatRooms = async () => {
        chatRoomsStore.update(() => {
            return [];
        });

        const chatroomsRef = collection(db, "chat_rooms");
        const chatroomSnap = await getDocs(chatroomsRef);
        
        if (!chatroomSnap.empty) {
            console.log("There is chatrooms");
            chatroomSnap.forEach((chatroomDoc) => {               
                if(chatroomDoc.id.includes($authStore.currentUser.uid)) {
                    let usersIds = chatroomDoc.id.split("_");
                    
                    usersIds.forEach(async (id) => {
                        if(id != $authStore.currentUser.uid) {
                            const receiverUserRef = doc(db, "Users", id);
                            let receiverUser = await getDoc(receiverUserRef);

                            if (receiverUser.exists()) {
                                console.log(receiverUser.data());
                                chatRoomsStore.update(currRooms => {
                                    return [...currRooms, { chatRoomId: chatroomDoc.id, receiverId: receiverUser.data().uid, receiverName: receiverUser.data().username, receiverEmail: receiverUser.data().email, senderId: $authStore.currentUser.uid, senderEmail: $authStore.currentUser.email}];
                                });
                            } else {
                                console.log("The receiver does not exists");
                            }
                        }
                    });
                    /*
                    chatRoomsStore.update(currRooms => {
                        return [...currRooms, { chatRoomId: doc.id, ...doc.data()}];
                    });
                    
                    */
                }
            });
            console.log("chatroom", $chatRoomsStore);
        } else {            
            console.log("There is no chatrooms!");
        }
    };

    $: showChatRoomId = null;
    const showChatRoom = (chatRoomId) => {
        showChatRoomId = chatRoomId;
    };

    const openTheExistingChatRoom = (event) => {        
        showChatRoom(event.detail);
    };

    onMount(() => {
        loadChatRooms();
    });
</script>

<ChatSearchBar showModal={showAddCommentModal} {addCommentToPostId} on:click={toggleAddComentModal} on:openTheExistingChatRoom={openTheExistingChatRoom}/>
<div class="chat w-100">
    <h2 class="py-3 text-center">Чат</h2>
    <div class="chatContainer row mx-0">
        <div class="chatsWithPeople col-sm-4 text-light">
            <button class="btn" on:click={toggleAddComentModal}>
                <svg aria-label="New message" class="x1lliihq x1n2onr6 x5n08af"
                    fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <title>New message</title><path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952"
                    fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"></path><path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z"
                    fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"></path><line fill="none" stroke="white" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153"></line>
                </svg>
            </button>

            <div class="chats d-flex gap-3 flex-column my-2">
                {#if $chatRoomsStore.length !== 0}
                    {#each $chatRoomsStore as chatRoom}
                        <div class="chat bg-light text-secondary p-3" on:click={() => {showChatRoom(chatRoom.chatRoomId)}}>
                            <h3>{chatRoom.receiverName}</h3>
                            <h6>{chatRoom.receiverEmail}</h6>
                        </div>
                    {/each}
                {:else}
                    <h3 class="text-center">Все още няма съобщения!</h3>
                {/if}
            </div>
        </div>
        <div class="currentChat col-sm-8 p-0">           
            <CurrentChat chatRoomId={showChatRoomId}/>
        </div>
    </div>
</div>


<!--
    <h2 class="py-3 text-center">Чат</h2>
    <div class="container w-100">
        <div class="chatContainer row w-100 mx-0">
            <div class="chatsWithPeople col-sm-4 bg-dark h-100">
                asd
            </div>
            <div class="currentChat col-sm-8 bg-primary">
                asd
            </div>
        </div>
    </div>
-->
<style>
.chat {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chatContainer {
    flex: 1; /* Expand to fill available space */
    display: flex;
}

.chatsWithPeople {
    flex: 1; /* Take up remaining space */
    background: #aeaeae;
}

.currentChat {
    flex: 2; /* Take up twice the space of chatsWithPeople */
    background: white;
}
</style>