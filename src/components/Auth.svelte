<script>
	import { authStore, authHandlers } from "../stores/authStore"; 
    import { goto } from '$app/navigation';
    import { errorHandler } from '$lib/errorHandler/errorHandler';
    import ForgotPassword from "./ForgotPassword.svelte";

    let register = false;
    let email = '';
    let password = '';
    let confirmmPassword = '';
    let message = '';

    
    $: if($authStore.currentUser) {                
        goto("/app/dashboard");
    }   
    
    $: register, message = '';
    
    async function handleSubmit () {
        if(!email || !password) {
            return message = "Полетата за парола и имейл са празни";
        }
        
        if(register) {
            if(!confirmmPassword) {
                return message = "Липсва потвърждаване на паролата";
            }

            if(password === confirmmPassword) {
                const response = await (
                    await fetch('/api/getUserByEmail/', {
                        method: 'POST',
                        body: JSON.stringify({ email }),
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                ).json();
                
                const { exist } = await response;  

                if(!exist) {
                    try{
                        await authHandlers.signup(email, password);                    
                    } catch(err) {
                        console.log("error", err);
                        message = errorHandler(err);
                    }                    
                } else {          
                    message = "Потребител с този имейл вече съществува.";
                }   

            } else {
                return message = 'Паролите не съвпадат'; //Password missmatch
            }
        } else {
            try {
                await authHandlers.login(email, password);
            } catch(err) {
                console.log(err);
                message = errorHandler(err);
            }
        }                
    }
    /*
    async function handleForgotPassword() {        
        if(!email) {            
            return message = "Не сте въвели имейл"; //Missing email
        }
        
        return message = await authHandlers.resetPassword(email);
    }
    */
    
    let showForgotPasswordModal = false;
    
    const toggleForgotPasswordModal = () => {
        showForgotPasswordModal = !showForgotPasswordModal;
	}


</script>

<ForgotPassword showModal={showForgotPasswordModal} on:click={toggleForgotPasswordModal}/>
<div class="row h-100 w-100">
    <div class="col-md-5 col-sm-12 text-center my-auto">
        <img src="favicon.png" alt="" class="w-50">
        <p class="w-50 text-center h3 mx-auto my-0">Свържете се с <span style="color: blue;">колеги програмисти</span> и изследвайте света на програмирането с <span style="color: blue;">A&G Social</span></p>
        <div class="sectionDividerHorizontal d-sm-block d-md-none"></div>
    </div>
    <div class="sectionDividerVertical d-sm-none d-md-block"></div>
    <div class="container py-4">
        
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
        </svg>
        
        <h1>{register ? 'Регистрация' : 'Влизане'}</h1>
        <h2 class="text-center">{message}</h2>
        <form class="w-50">
            <input class="my-2 border-0 p-3" bind:value={email} type="email" placeholder="Имейл" required>
            <input class="my-2 border-0 p-3" bind:value={password} type="password" placeholder="Парола" required>
        {#if register}        
            <input class="my-2 border-0 p-3" bind:value={confirmmPassword} type="password" placeholder="Потвърди паролата" required>
        {/if}

        <button class="btn btn-dark py-3 my-3" on:click={handleSubmit}>{register ? 'Регистриране' : 'Влизане'}</button>
        </form>

        {#if register}
        <div on:click={() => {register = false;}} on:keydown={() => {}}>Вече имате профил? <span class="text-primary switchButton">Влизане</span></div>
        {:else}
        <div on:click={() => {register = true;}} on:keydown={() => {}}>Все още нямате профил? <span class="text-primary switchButton">Регистрация</span></div>
        <div on:click={toggleForgotPasswordModal} class="text-primary switchButton">Забравена парола?</div>
        {/if}

    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
    }

    .container form{
        display: flex;
        flex-direction: column;
    }

    .switchButton {
        cursor: pointer;
    }

    .sectionDividerVertical {
        width: 7px;
        background: white;
        padding: 0;
        border-radius: 50px;
        max-height: 60vh;
        display: flex;
        align-self: center;
        height: 400px;
    }

    .sectionDividerHorizontal {
        width: 75%;
        background: white;
        padding: 0;
        border-radius: 50px;               
        height: 7px;
        margin-inline: auto;
        margin-block: 100px;
    }
</style>