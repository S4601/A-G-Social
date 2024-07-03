import { initializeApp, getApps, cert} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { json } from "@sveltejs/kit";
import { collection, query } from "firebase/firestore";
import { db } from "$lib/firebase/firebase.client";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";

const apps = getApps();

if(!apps.length) {
    initializeApp({
        credential: cert('./a-g-social-firebase-adminsdk-a5ds5-3c6625cb16.json'),
        databaseURL: "https://a-g-social-default-rtdb.firebaseio.com"
    });
}

export async function POST(requestEvent) {
    const { request } = requestEvent;
    const { username } = await request.json();

    let theUsernameExist = false;

    /*
    await getAuth().getUserByEmail(username).then((userRecord) => {
        isTheEmailExist = true;        
    }).catch((error) => {        
        isTheEmailExist = false;
    });
    */
 
    try {
        const usersCollection = collection(db, "Users");
        const q = query(usersCollection, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Потребителското име е свободно!");
            theUsernameExist = false;
        } else {
            console.log("Потребителското име е заето!");
            theUsernameExist = true;
        }
    } catch (error) {
        console.error("Error checking user existence: ", error);
        return false;
    }

    //let docs = await getDocs(query(collection(db, "Users"), where("username", "==", username)));

    const response = {
        username: username,
        exist: theUsernameExist
    };

    return json(response, { status: 201 });
}