<script>
	import { onMount } from "svelte";
    import { auth } from '$lib/firebase/firebase.client';
    import { authStore } from '../stores/authStore';
    import { browser } from '$app/environment';    

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log("User", user);
            authStore.update((curr) => {
                console.log("Store", {...curr, isLoading: false, currentUser: user });
                return {...curr, isLoading: false, currentUser: user }
            });
          
            if(browser && !$authStore.currentUser && !$authStore.isLoading && window.location.pathname !== '/') {
                window.location.href = '/';
            }          
        });

        return unsubscribe;
    });

</script>

<slot/>
