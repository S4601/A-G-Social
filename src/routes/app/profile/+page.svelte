<script>	
	import Profile from "../../../components/Profile.svelte";
    import { authHandlers, authStore } from "../../../stores/authStore";    

    let email;
    authStore.subscribe(curr => {
        email = curr.currentUser?.email
    });
</script>

<div class="profileContainer">

    {#if $authStore.currentUser}
    <div class="detailsContainer">    
        <h2 class="py-3">Профилна страница</h2>
        <h1><i class="bi bi-person-fill"></i></h1>
        <h3>{email}</h3>
        <Profile/>
        <!--<button on:click={authHandlers.logout}>Logout</button>-->
    </div>
    {:else}
    <div class="h2 d-flex h-100">
        <div class="mx-auto align-self-center">Зареждане.....</div>
    </div>
    {/if}
    
</div>

<style>
    .profileContainer{
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }
    .detailsContainer {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    h1 {
        text-align: center;
    }
    .bi-person-fill{
        font-size: 80pt;
    }
</style>