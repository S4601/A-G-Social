<script>
    import { db } from "$lib/firebase/firebase.client";
    import { addDoc, collection } from "firebase/firestore";
    import { authStore } from "../stores/authStore";
    import { postsStore } from "../stores/postsStore";
    import { Timestamp } from "firebase/firestore";

    export let showModal = false;
    export let addCommentToPostId = null;
    let comment = "";

    const addComment = async () => {        
        if(comment != "" && addCommentToPostId) {
            let newComment = {
                CommentText: comment,
                CommentTime: Timestamp.now(),
                UserEmail: $authStore.currentUser.email
            };

            const docRef = await addDoc(collection(db, "User Posts", addCommentToPostId, 'Comments'), newComment);
            comment = "";
            console.log("NewWComment", docRef.id, docRef);
            postsStore.update((currentPosts) => {
                return currentPosts.map(post => {
                    if(post.id == addCommentToPostId)
                    {
                        console.log("the post is available!");
                        return {...post, comments: [newComment, ...post.comments]};
                    }
                    return post;
                });
            });

            console.log(newComment);
        } else {
            console.log("There is no comment!");
        }
    }    
</script>

{#if showModal}
    <div class="backdrop" on:click|self>
        <div class="commentModal">
            <h1>Добави коментар</h1>

            <input type="text form-control" bind:value={comment}>

            <div class="actions">
                <button on:click|self class="btn">Отказ</button>
                <button on:click={addComment} on:click|self class="btn">Публикувай</button>
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