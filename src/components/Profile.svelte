<script>
	import { onDestroy } from "svelte";
	import { authStore, authHandlers } from "../stores/authStore";
    import { db } from "$lib/firebase/firebase.client";
    import { onSnapshot, doc, collection, query, where, getDocs, getDoc, updateDoc, arrayUnion, arrayRemove, orderBy} from "firebase/firestore";
	import ChangeUsername from "./ChangeUsername.svelte";
    import AddComment from "./AddComment.svelte";
    import { postsStore } from "../stores/postsStore";
	import FollowersFollowing from "./Followers-Following.svelte";
    

    

    let currentUser = $authStore.currentUser;

    $: if(!$authStore.currentUser) {                
        goto("/");
    }

    //---------------------------- Update Email/Password START ------------------\\
    let action = '';
    let newEmail = '';
    let newPassword = '';    

    async function handleSubmit () {
        if(!action) {
            return;
        }

        if(action === 'updatePass') {
            return await authHandlers.updatePassword(newPassword);
        }

        if(action === 'updateEmail') {
            console.log(newEmail);
            return await authHandlers.updateEmail(newEmail);
        }
    }
    //---------------------------- Update Email/Password END ------------------\\

    let profileDetailsDocRef = doc(db, "Users", currentUser.uid);
    let currentUserDetails = { username: "", bio: "", followers: [], following: []};
    
    const unsubscribeProfileDetails = onSnapshot(profileDetailsDocRef, (doc) => {
        console.log(doc.data());
        currentUserDetails = doc.data();
    });

    let showChangeUsernameOrBioModal = false;        
    //True - change username || False - change bio    
    let modalType = true;
    let modalTitle = "";
    let inputData = "";

    const toggleChangeUsernameModal = () => {
		showChangeUsernameOrBioModal = !showChangeUsernameOrBioModal;        
        modalTitle = "Ново потребителско име";
        inputData = currentUserDetails.username;
        modalType = true;
	}

    const toggleChangeBioModal = () => {
        showChangeUsernameOrBioModal = !showChangeUsernameOrBioModal;        
        modalTitle = "Нова биография";
        inputData = currentUserDetails.bio;
        modalType = false;
	}

    let showAddCommentModal = false;
    let addCommentToPostId = null;    

    const toggleAddComentModal = () => {
		showAddCommentModal = !showAddCommentModal;
	}

    let showFollowersFollowingModal = false;
    let followersOrFollowingUsers = [];
    let followersFollowingModalTitle = "";

    const toggleFollowersFollowingModal = (type) => {
        showFollowersFollowingModal = !showFollowersFollowingModal;        
        if(type == "Followers") {
            followersOrFollowingUsers = currentUserDetails.followers;
            followersFollowingModalTitle = "Последователи";
        } else if(type == "Following") {
            followersOrFollowingUsers = currentUserDetails.following;
            followersFollowingModalTitle = "Последвани";
        }        
    }
        
    let profilePostsColRef = query(collection(db, "User Posts"), where("UserEmail", "==", currentUser.email), orderBy("TimeStamp", "asc"));    
    var comments = [];
    
    const unsubscribeProfilePosts = async () => {
        postsStore.update(() => {
            return [];
        });

        let querySnapshot = await getDocs(profilePostsColRef);
        
        if(querySnapshot.empty) {
            console.log("Все още няма публикации");            
        } else {
            querySnapshot.forEach(async (doc) => {                              
                let commentsColRef = await getDocs(query(collection(db, "User Posts", doc.id,'Comments'), orderBy("CommentTime", "desc")));              
                comments = [];   
                commentsColRef.forEach(commentDoc => {                                             
                    var comment = {...commentDoc.data(), id: commentDoc.id};
                    comments = [...comments, comment];
                    //console.log("New Comment Loaded!");                                                   
                });
                
                let isItLikedFromTheUser = false;
                if(doc.data().Likes.includes(currentUser.email)) {
                    isItLikedFromTheUser = true;
                }

                let post = {...doc.data(), isItLikedFromTheUser: isItLikedFromTheUser, comments: comments, numCommentsDisplayed: 4, id: doc.id};                                                

                postsStore.update((currentPosts) => {
                    return [...currentPosts, post];
                });
                console.log("posts", $postsStore);            
                          
            });                
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
    
    onDestroy(() => {
        unsubscribeProfileDetails;
        unsubscribeProfilePosts;
    });
    unsubscribeProfilePosts();
</script>
<ChangeUsername showModal={showChangeUsernameOrBioModal} username={currentUserDetails.username} bio={currentUserDetails.bio} followers={currentUserDetails.followers} following={currentUserDetails.following} {modalTitle} {inputData} {modalType} on:click={toggleChangeUsernameModal} on:hideModal={toggleChangeUsernameModal}/>
<AddComment showModal={showAddCommentModal} {addCommentToPostId} on:click={toggleAddComentModal}/>
<FollowersFollowing showModal={showFollowersFollowingModal} title={followersFollowingModalTitle} usersList={followersOrFollowingUsers} on:click={toggleFollowersFollowingModal}/>
<div class="container">
    <div class="followersContainer w-100 d-flex justify-content-around">
        <div class="followersSection">
            <h5 class="text-center">Последователи</h5>
            <h5 class="text-center followers" on:click={() => toggleFollowersFollowingModal("Followers")}>{currentUserDetails.followers.length}</h5>
        </div>
        <div class="followingSection">
            <h5 class="text-center" >Последвани</h5>
            <h5 class="text-center following" on:click={() => toggleFollowersFollowingModal("Following")}>{currentUserDetails.following.length}</h5>
        </div>
    </div>

    <h5 class="Title">Мойте детайли</h5>    
    <div class="detailsContainer w-100 d-flex justify-content-center  my-3">
        <div class="username d-flex justify-content-between bg-light py-2 px-3">
            <div class="d-flex flex-column">
                <p class="my-2 text-secondary fw-bold">Потребителско име</p>
                <p class="my-2 fs-5">{currentUserDetails.username}</p>
            </div>
            <i class="bi bi-gear-fill" on:click={toggleChangeUsernameModal}></i>
        </div>
        <!--<button on:click={() => action = 'updateEmail'}>Update Email</button>
        <button on:click={() => action = 'updatePass'}>Update Password</button>-->
    </div>
    <div class="detailsContainer w-100 d-flex justify-content-center my-3">
        <div class="username d-flex justify-content-between bg-light py-2 px-3">
            <div class="d-flex flex-column">
                <p class="my-2 text-secondary fw-bold">Биография</p>
                <p class="my-2 fs-5">{currentUserDetails.bio}</p>
            </div>
            <i class="bi bi-gear-fill"  on:click={toggleChangeBioModal}></i>
        </div>
    </div>

    <h5 class="Title">Мойте публикации</h5>
    <div id="postsContainer">        
        {#each $postsStore as post}            
            <div class="post bg-light p-5 my-4" id="{post.id}">
                <div class="d-flex justify-content-between">
                    <div>
                        <div class="message">{post.Message}</div>
                        <div class="author-date text-secondary">{post.UserEmail} - {post.TimeStamp.toDate().toLocaleDateString("en-GB")}</div>
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
<!--
    {#if action === 'updatePass'}
        <form>
            <label>
                <input bind:value={newPassword} type="password" placeholder="New Password" required>
            </label>        

            <button on:click={handleSubmit}>Submit</button>
        </form>

    {:else if action === 'updateEmail'}
        <form>
            <label>
                <input bind:value={newEmail} type="email" placeholder="New Email" required>
            </label>    

            <button on:click={handleSubmit}>Submit</button>
        </form>
    {/if}-->
</div>

<style>    
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
    }
         
    .Title {
        text-align: left;
        width: 100%;
        padding-inline: 15%;
        padding-block: 1%;
    }

    .username {      
        min-width: 60%;        
        max-width: 80%;
        
        border-radius: 10px;
    }
        
    #postsContainer {
        width: 100%;
    }
    .post {
        min-width: 60%;        
        max-width: 80%;        
        border-radius: 10px;
        margin-inline: auto;
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
    
    .followers, .following {
        color: black;
        cursor: pointer;
    }
</style>