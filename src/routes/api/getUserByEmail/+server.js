import { initializeApp, getApps, cert} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { json } from "@sveltejs/kit";

const apps = getApps();

if(!apps.length) {
    initializeApp({
        credential: cert('./a-g-social-firebase-adminsdk-a5ds5-3c6625cb16.json'),
        databaseURL: "https://a-g-social-default-rtdb.firebaseio.com"
    });
}

export async function POST(requestEvent) {
    const { request } = requestEvent;
    const { email } = await request.json();

    let isTheEmailExist = false;

    await getAuth().getUserByEmail(email).then((userRecord) => {
        isTheEmailExist = true;        
    }).catch((error) => {        
        isTheEmailExist = false;
    });
    
    const response = {
        email: email,
        exist: isTheEmailExist
    };

    return json(response, { status: 201 });
}