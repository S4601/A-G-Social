<script>
    import { db } from "$lib/firebase/firebase.client";    	
    import { collection, addDoc, orderBy, query, doc, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, Timestamp, where} from "firebase/firestore";
    import { authStore } from "../stores/authStore";
    import { postsStore } from "../stores/postsStore";
    import AddComment from "./AddComment.svelte";	

    import { Popover, Button } from 'flowbite-svelte';
            
    let currentUser = $authStore.currentUser;

    $: if(!$authStore.currentUser) {                
        goto("/");
    } 

    let message = "";    
    let comments = [];
    let showAddCommentModal = false;
    let addCommentToPostId = null;    

    const toggleAddComentModal = () => {
		showAddCommentModal = !showAddCommentModal;
	}

    var postsColRef = query(collection(db, "User Posts"), orderBy("TimeStamp", "asc"));    
    
    const unsubscribePosts = async () => {
        postsStore.update(() => {
            return [];
        });

        let querySnapshot = await getDocs(postsColRef);
        
        if(querySnapshot.empty) {
            console.log("Все още няма публикации");
        } else {
            querySnapshot.forEach(async (doc) => { 
                let getPostUser = await getDocs(query(collection(db, "Users"), where("email", "==", doc.data().UserEmail)));
                let commentsColRef = await getDocs(query(collection(db, "User Posts", doc.id,'Comments'), orderBy("CommentTime", "desc")));              
                comments = [];
                commentsColRef.forEach(commentDoc => {                                             
                    var comment = {...commentDoc.data(), id: commentDoc.id};
                    comments = [...comments, comment];                                                                    
                });
                
                console.log("Comments", comments);

                let isItLikedFromTheUser = false;
                if(doc.data().Likes.includes(currentUser.email)) {
                    isItLikedFromTheUser = true;
                }                
                                
                let post = {...doc.data(), isItLikedFromTheUser: isItLikedFromTheUser, comments: comments, numCommentsDisplayed: 4, id: doc.id, user: {...getPostUser.docs[0].data(), uid: getPostUser.docs[0].id}};                                                

                postsStore.update((currentPosts) => {
                    return [...currentPosts, post];
                });
                console.log("posts", $postsStore);            
                          
            });                
        }     
    };
       
    const addPost = async () => {        
        if(message !== "") {
            let newPost = {          
                Likes: [],                
                Message: message,
                TimeStamp: Timestamp.now(),
                UserEmail: currentUser.email
            };

            const docRef = await addDoc(collection(db, "User Posts"), newPost);
            
            let getPostUser = await getDocs(query(collection(db, "Users"), where("email", "==", $authStore.currentUser.email)));
            console.log(getPostUser);
            newPost = {...newPost, isItLikedFromTheUser: false, comments: [], numCommentsDisplayed: 4, id: docRef.id, user: {...getPostUser.docs[0].data()}};
            postsStore.update((currentPosts) => {
                    return [...currentPosts, newPost];
                });

            message = "";

            console.log(newPost);
        } else {
            console.log("There is no message!");
        }
    };    

    const likePost = async (id) => {        
        let post = await doc(db, "User Posts", id);
        let postData = (await getDoc(post)).data();
        
        if(postData.Likes.indexOf(currentUser.email) === -1) {
            document.getElementById(`likes-${id}`).textContent = parseInt(document.getElementById(`likes-${id}`).textContent) + 1;
            document.getElementById(`likeIcon-${id}`).innerHTML = '<i class="bi bi-suit-heart-fill text-danger lead"></i>';
            await updateDoc(post, {
                Likes: arrayUnion(currentUser.email)
            });
        } else {
            document.getElementById(`likes-${id}`).textContent = document.getElementById(`likes-${id}`).textContent - 1;
            document.getElementById(`likeIcon-${id}`).innerHTML = '<i class="bi bi-suit-heart lead"></i>';
            await updateDoc(post, {
                Likes: arrayRemove(currentUser.email)
            });            
        }
    }

    const loadMoreComments = (id, numCommentsDisplayed) => {
        postsStore.update(posts => {
            console.log(posts);
            return posts.map(post => {
                if(post.id === id) {
                    return {...post, numCommentsDisplayed: numCommentsDisplayed + 4}
                }

                return post;
            });
        });
    };

    const followers = async (uid) => {
        console.log(uid);
        let getPostUser = await doc(db, "Users", uid);
        let getPostUserData = (await getDoc(getPostUser)).data();
        console.log("Is it already followed",getPostUserData.followers.indexOf(currentUser.email));
        console.log("Followers - ", getPostUserData);
        if(getPostUserData.followers.indexOf(currentUser.email) === -1 && getPostUserData.uid !== currentUser.uid) {
            console.log("Follow");
            await updateDoc(getPostUser, {
                followers: arrayUnion(currentUser.email)
            });

           
            postsStore.update(posts => {
                return posts.map(post => {
                    if(post.user.uid === uid) {
                        let user = post.user;
                        user.followers = [...user.followers, currentUser.email];
                        return { ...post, user: user };
                    }

                    return post;
                });
            });

            let currUser = await doc(db, "Users", currentUser.uid);
            await updateDoc(currUser, {
                following: arrayUnion(getPostUserData.email)
            });

        } else if(getPostUserData.followers.indexOf(currentUser.email) !== -1 && getPostUserData.uid !== currentUser.uid) {
            
            await updateDoc(getPostUser, {
                followers: arrayRemove(currentUser.email)
            });
            
            postsStore.update(posts => {
                return posts.map(post => {
                    if (post.user.uid === uid) {
                        let user = post.user;
                        // Remove currentUser.email from the followers array
                        user.followers = user.followers.filter(email => email !== currentUser.email);
                        return { ...post, user: user };
                    }

                    return post;
                });
            });

            let currUser = await doc(db, "Users", currentUser.uid);
            await updateDoc(currUser, {
                following: arrayRemove(getPostUserData.email)
            });
        }
    }

    const scrollToBottom = () => {
        const element = document.getElementById("lastPost");
        if(element) {
            element.scrollTop = element.scrollHeight;
        }
    }    
    unsubscribePosts();        
</script>


<AddComment showModal={showAddCommentModal} {addCommentToPostId} on:click={toggleAddComentModal}/>
<div class="container h-100">
    <div class="posts" id="postsContainer">             
        {#each $postsStore as post, index}            
            <div class="post p-5 bg-light my-3" id="{post.id} {index == ($postsStore.length - 1) ? "lastPost": ""}">
                <div class="d-flex justify-content-between">
                    <div>
                        <div class="message">{post.Message}</div>
                        <div class="author-date text-secondary" id="post{index}">{post.UserEmail} - {post.TimeStamp.toDate().toLocaleDateString("en-GB")}</div>
                        <Popover triggeredBy="#post{index}" class="w-50 Popover">
                            <div class="p-3">
                              <div class="d-sm-flex gap-2 justify-content-between items-center mb-2">                                
                                    <div class="d-flex flex-column">
                                        <h5>{post.user.username}</h5>
                                        <h6 class="text-secondary">{post.user.email}</h6>
                                    </div>
                                    <Button size="xs" on:click={() => {followers(post.user.uid)}}>Последвай</Button>
                                </div>
                                <div class="d-sm-flex gap-2 justify-content-between">
                                    <div class="">
                                        <span class="font-semibold text-gray-900 dark:text-white">{post.user.following.length}</span>
                                        <span>Последвани</span>
                                    </div>
                                    <div class="">
                                        <span class="font-semibold text-gray-900 dark:text-white followers-{post.user.uid}">{post.user.followers.length}</span>
                                        <span>Последователи</span>
                                    </div>
                                </div>                             
                            </div>
                        </Popover>                        
                    </div>
                    <div class="actions">
                        <div class="like p-2" on:click={() => likePost(post.id)}>
                            <span id="likeIcon-{post.id}">
                                {#if post.isItLikedFromTheUser}
                                    <i class="bi bi-suit-heart-fill text-danger lead"></i>
                                {:else}
                                    <i class="bi bi-suit-heart lead"></i>
                                {/if}
                            </span>
                            <span id="likes-{post.id}">{post.Likes.length}</span>
                        </div>
                        <div class="commentsButton p-2" on:click={() => { addCommentToPostId = post.id; toggleAddComentModal();}}>
                            <span><i class="bi bi-chat-right-text-fill lead"></i><!--<i class="bi bi-chat-right-text lead"></i>--></span>
                            <span>{post.comments.length}</span>
                        </div>
                    </div>
                </div>
                {#if post.comments}
                    <div class="comments mt-2">
                        {#each post.comments.slice(0, post.numCommentsDisplayed) as comment}
                            <div id="{comment.id}" class="comment bg-secondary p-3 my-2">
                                <div class="message">{comment.CommentText}</div>
                                <div class="author-date text-dark">{comment.UserEmail} - {comment.CommentTime.toDate().toLocaleDateString("en-GB")}</div>
                            </div>
                        {/each}
                        {#if post.comments.length > post.numCommentsDisplayed}
                            <button class="btn w-100 moreCommentsButton" on:click={() => loadMoreComments(post.id, post.numCommentsDisplayed)}>Зареди още коментари</button>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
        
    </div>
    
    <div class="form d-flex w-100 mt-3 mb-2">
        <input class="w-100" type="text" bind:value={message} placeholder="Нова публикация">
        <button class="btn px-2 mx-3" on:click|preventDefault={addPost}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
            </svg>
        </button>
    </div>
</div>
<p class="registeredUserEmail mb-2">Регистриран като: {currentUser.email}</p>

<style>
    .container {
        position: relative;
        overflow-y: hidden;
        overflow-x: hidden;
    }
    .message{
        font-weight: bold;
        font-size: 18pt;
    }

    .posts {        
        max-height: 85%;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    @media screen and (max-width: 576px) {
        .form {
            position: static !important;
        }
        .posts {
            height: 70vh !important;
        }
    }

    .form{        
        position: absolute;
        bottom: 0;
    }

    .like{
        cursor: pointer;
    }
    
    .commentsButton{
        cursor: pointer;
    }

    .actions{
        min-width: 51px;
    }

    .bi-suit-heart-fill {
        color: red !important;
    }

    .bi-chat-right-text-fill {
        color: gray !important;
    }

    .moreCommentsButton:active{
        border-color: white;
    }
    .Popover {
        
    }
</style>