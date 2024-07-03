<script>
    import { db } from "$lib/firebase/firebase.client";
    import { addDoc, collection, setDoc, doc } from "firebase/firestore";
    import { authStore } from "../stores/authStore";
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    export let showModal = false;
    export let username = "";
    export let bio = "";    
    export let followers = [];
    export let following = [];
    export let modalTitle = "";
    export let inputData = "";
    export let modalType = true;
    let errorMessage = "";
    let newDetails;
    let changeButton;

    const changeUsernameOrBio = async (event) => {                
        if(username != "") {                       
            if(modalType) {
                console.log("inputData", inputData);
                const response = await (
                    await fetch('/api/usernameExists/', {
                        method: 'POST',
                        body: JSON.stringify({ "username": inputData }),
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                ).json();
                
                const { exist } = await response;        
                    
                if(!exist) {
                    console.log("Потребител с това потребителско име не съществува.");
                    newDetails = { username: inputData, bio: bio, followers: followers, following: following };
                    errorMessage = "";
                    
                    dispatch('hideModal', {
                        hide: true
                    });
                } else {                        
                    console.log("Потребителското име е заето!");
                    errorMessage = "Потребителското име е заето!";
                    return;
                }
                
            } else {
                newDetails = { username: username, bio: inputData, followers: followers, following: following };
            }
            
            await setDoc(doc(db, "Users", $authStore.currentUser.uid), newDetails);       
        } else {
            console.log("There is username!");
        }
    }

    $: if(inputData == "Все още няма биография") {
        inputData = "";
    }

    function triggerChangeButton() {
        if (changeButton) {
            changeButton.click();
        }
    }

</script>

{#if showModal}
    <div class="backdrop" on:click|self>
        <div class="commentModal">
            <h1>{modalTitle}</h1>
            <h2 class="text-center">{errorMessage}</h2>
            <input type="text form-control" bind:value={inputData}>

            <div class="actions">
                <button on:click|self class="btn">Отказ</button>
                <button on:click={changeUsernameOrBio} bind:this={changeButton} class="btn">Промени</button>
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
    .commentModal{
        display: block;
        padding: 10px;
        margin: 10% auto;
        border-radius: 10px;
        max-width: 400px;
        z-index: 1000;
        aspect-ratio: 4/2;
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
</style>