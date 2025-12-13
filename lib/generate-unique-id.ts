export function generateUniqueId() {
    const timestamp = new Date().getTime().toString(36);
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz-";
    
    const randomString = Array.from({ length: 12 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');

    return timestamp + "-" + randomString;
}