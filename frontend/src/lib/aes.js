export default class AESUtil {
    static async generateKey() {
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );
        
        const exported = await window.crypto.subtle.exportKey("raw", key);
        return Array.from(new Uint8Array(exported))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    static async encrypt(message, keyHex) {
        const key = await this.importKey(keyHex);
        const encoder = new TextEncoder();
        const encoded = encoder.encode(message);
        
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encoded
        );
        
        const encryptedArray = new Uint8Array(encrypted);
        const result = new Uint8Array(iv.length + encryptedArray.length);
        result.set(iv, 0);
        result.set(encryptedArray, iv.length);
        
        return Array.from(result)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    static async decrypt(encryptedHex, keyHex) {
        try {
            const key = await this.importKey(keyHex);
            const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            
            const iv = encryptedArray.slice(0, 12);
            const data = encryptedArray.slice(12);
            
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                key,
                data
            );
            
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error("Decryption error:", error);
            return "Decryption failed";
        }
    }
    
    static async importKey(keyHex) {
        const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        return await window.crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }
}