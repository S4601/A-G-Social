<script>	
    import { authHandlers, authStore } from "../../../stores/authStore";
    import Posts from "../../../components/Posts.svelte";

    let email;
    authStore.subscribe(curr => {
        email = curr.currentUser?.email
    });

    

</script>
{#if $authStore.currentUser}
    <div class="">    
        <h2 class="pt-3">A&G Social</h2>
       
        <Posts/>        
    </div>
{:else}
    <div class="h2 d-flex h-100">
        <div class="mx-auto align-self-center">Зареждане.....</div>
    </div>
{/if}


<style>
    div {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        align-items: center;
    }
</style>