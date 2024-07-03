import { writable } from "svelte/store";
import { auth, db } from "$lib/firebase/firebase.client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, verifyBeforeUpdateEmail, updatePassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";

export const authStore = writable({
    isLoading: true,
    currentUser: null
});

export const authHandlers = {
    login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);        
    },
    signup: async (email, password) => {
        let newUser = await createUserWithEmailAndPassword(auth, email, password);
        console.log("NewUSer: ", newUser.user.uid);
        const username = email.split('@')[0];
        const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        let userDetails = {
            username: capitalizedUsername,
            bio: "Все още няма биография",
            uid: newUser.user.uid,
            email: email,
            followers: [],
            following: []
        };

        await setDoc(doc(db, "Users", newUser.user.uid), userDetails);
    },
    logout: async () => {
        await signOut(auth);
    },
    resetPassword: async (email) => {            
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
            return "Потребител с този имейл не съществува.";//User with the specified email doesn't exist.
        } else {
            await sendPasswordResetEmail(auth, email);        
            return "Имейлът за възстановяване е изпратен!";//The reset email has been sent!
        }                           
    },
    updateEmail: async (email) => {
        await verifyBeforeUpdateEmail(auth.currentUser, email);
    },
    updatePassword: async (password) => {
        await updatePassword(auth.currentUser, password);
    }    
};