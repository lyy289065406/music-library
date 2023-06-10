// Get the modal and the content div
var modal = document.getElementById("myModal");
var content = document.getElementById("content");

// Display the modal
window.onload = function (event) {
    modal.style.display = "block";
}

async function getCredentials() {
    try {
        const response = await fetch("/static/pwd");
        const text = await response.text();
        const [username, passwordHash] = text.split(":");

        return {
            username,
            passwordHash
        };
    } catch (error) {
        console.error("Error fetching credentials:", error);
    }
}

async function checkAuthentication() {
    event.preventDefault();  // 阻止默认行为，避免刷新页面

    const credentials = await getCredentials();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // Hash the password entered by the user
    const passwordHash = await hashPassword(pass);

    console.log(passwordHash);
    if (credentials && user == credentials.username && passwordHash == credentials.passwordHash) {
        // alert("Access granted.");
        modal.style.display = "none";
        content.style.display = "block"; // 显示内容
    } else {
        alert("Access denied.");
    }
}

async function hashPassword(password) {
    // Encode the password as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Hash the password
    const hash = await window.crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a hexadecimal string
    let hashArray = Array.from(new Uint8Array(hash));
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}