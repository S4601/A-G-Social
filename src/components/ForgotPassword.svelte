<script>
    import { authHandlers, authStore } from "../stores/authStore"; 

    export let showModal = false;        
           
    let email;
    let message = "";

    async function handleForgotPassword() {        
        if(!email) {            
            return message = "Не сте въвели имейл"; //Missing email
        }
               
        return message = await authHandlers.resetPassword(email);
    }
</script>

{#if showModal}
    <div class="backdrop" on:click|self>
        <div class="commentModal">
            <h1>Възстановяване на парола</h1>
            <h2 class="text-center">{message}</h2>
            <input type="text form-control" bind:value={email} placeholder="Имейл">

            <div class="actions">
                <button on:click|self class="btn">Отказ</button>
                <button on:click={handleForgotPassword} class="btn">Възстанови</button>
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
        display: flex;
    }
    .commentModal{
        display: block;
        padding: 10px;
        margin: 10% auto;
        border-radius: 10px;
        max-width: 400px;
        max-height: 300px;
        z-index: 1000;
        aspect-ratio: 4/2;
        text-align: center;
        background: white;
        align-self: center;
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