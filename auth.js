/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function handleGoogleLogin(response){

    try{

        const res = await fetch("http://localhost:8080/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ idToken: response.credential }),
        });

        if(!res.ok){
            throw new Error("Login request failed: "+res.status);
        }

        const user = await res.json();

        showLoggedInUser(user);

        toast("Signed in as "+(user.name||user.email||"user"));

    }catch(err){

        console.error(err);
        toast("Google sign-in failed. Please try again.");
    }
}

function showLoggedInUser(user){

    document.getElementById("googleSignInButton").style.display="none";

    const info=document.getElementById("userInfo");

    info.style.display="flex";

    document.getElementById("userAvatar").src=user.picture||"";
    document.getElementById("userName").textContent=user.name||user.email||"";
}

function logout(){

    fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
    }).finally(()=>{
        location.reload();
    });
}
