export default class SimpleRSA {
    static generateKeys(bitLength = 1024) {
        // Generate two large prime numbers
        const p = SimpleRSA.generatePrime(bitLength / 2);
        const q = SimpleRSA.generatePrime(bitLength / 2);
        
        // Calculate modulus
        const n = p * q;
        
        // Calculate Euler's totient function
        const phi = (p - 1n) * (q - 1n);
        
        // Choose public exponent (common values are 3, 17, 65537)
        let e = 65537n;
        
        // Ensure e and phi are coprime
        if (SimpleRSA.gcd(e, phi) !== 1n) {
            e = 3n;
        }
        
        // Calculate private exponent
        const d = SimpleRSA.modInverse(e, phi);
        
        return {
            publicKey: { e, n },
            privateKey: { d, n }
        };
    }
    
    static encrypt(message, publicKey) {
        const { e, n } = publicKey;
        // Convert message to a big integer
        const m = SimpleRSA.textToBigInt(message);
        
        // Encrypt: c = m^e mod n
        const c = SimpleRSA.modPow(m, e, n);
        
        return c.toString(16);
    }
    
    static decrypt(encryptedHex, privateKey) {
        const { d, n } = privateKey;
        // Convert encrypted message to big integer
        const c = BigInt('0x' + encryptedHex);
        
        // Decrypt: m = c^d mod n
        const m = SimpleRSA.modPow(c, d, n);
        
        // Convert back to text
        return SimpleRSA.bigIntToText(m);
    }
    
    static generatePrime(bits) {
        // Generate a random bigint with the specified number of bits
        let min = 1n << BigInt(bits - 1);
        let max = (1n << BigInt(bits)) - 1n;
        
        while (true) {
            // Generate a random number in the range
            const num = SimpleRSA.randomBigInt(min, max);
            
            // Check if it's prime (using a simple test for demonstration)
            if (SimpleRSA.isPrime(num, 5)) {
                return num;
            }
        }
    }
    
    static randomBigInt(min, max) {
        // Generate a random bigint between min and max
        const range = max - min;
        const bits = range.toString(2).length;
        let result;
        
        do {
            result = BigInt('0b' + Array.from({length: bits}, 
                () => Math.random() > 0.5 ? '1' : '0').join(''));
        } while (result > range);
        
        return result + min;
    }
    
    static isPrime(n, k) {
        // Miller-Rabin primality test (simplified for demonstration)
        if (n === 2n || n === 3n) return true;
        if (n % 2n === 0n || n < 2n) return false;
        
        // Write n-1 as d*2^s
        let d = n - 1n;
        let s = 0n;
        
        while (d % 2n === 0n) {
            d /= 2n;
            s += 1n;
        }
        
        // Witness loop
        for (let i = 0; i < k; i++) {
            const a = SimpleRSA.randomBigInt(2n, n - 2n);
            let x = SimpleRSA.modPow(a, d, n);
            
            if (x === 1n || x === n - 1n) continue;
            
            let continueLoop = false;
            for (let j = 1n; j < s; j++) {
                x = SimpleRSA.modPow(x, 2n, n);
                if (x === n - 1n) {
                    continueLoop = true;
                    break;
                }
            }
            
            if (!continueLoop) return false;
        }
        
        return true;
    }
    
    static modPow(base, exponent, modulus) {
        // Modular exponentiation: (base^exponent) % modulus
        if (modulus === 1n) return 0n;
        
        let result = 1n;
        base = base % modulus;
        
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            
            exponent = exponent >> 1n;
            base = (base * base) % modulus;
        }
        
        return result;
    }
    
    static modInverse(a, m) {
        // Extended Euclidean Algorithm to find modular inverse
        let [oldR, r] = [a, m];
        let [oldS, s] = [1n, 0n];
        let [oldT, t] = [0n, 1n];
        
        while (r !== 0n) {
            const quotient = oldR / r;
            [oldR, r] = [r, oldR - quotient * r];
            [oldS, s] = [s, oldS - quotient * s];
            [oldT, t] = [t, oldT - quotient * t];
        }
        
        if (oldS < 0n) oldS += m;
        return oldS;
    }
    
    static gcd(a, b) {
        // Euclidean algorithm for greatest common divisor
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a;
    }
    
    static textToBigInt(text) {
        // Convert text to a big integer
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        
        let result = 0n;
        for (let i = 0; i < data.length; i++) {
            result = (result << 8n) + BigInt(data[i]);
        }
        
        return result;
    }
    
    static bigIntToText(bigInt) {
        // Convert a big integer back to text
        let n = bigInt;
        const bytes = [];
        
        while (n > 0n) {
            bytes.unshift(Number(n & 0xffn));
            n = n >> 8n;
        }
        
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(bytes));
    }
    static stringifyBigInt(obj) {
        return JSON.stringify(obj, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        );
      }
      
      static parseBigInt(json) {
        return JSON.parse(json, (key, value) => {
          // Detect numbers that look like BigInts and convert back
          if (typeof value === "string" && /^[0-9]+$/.test(value)) {
            try {
              return BigInt(value);
            } catch {
              return value;
            }
          }
          return value;
        });
      }
}



//   const { publicKey, privateKey } = SimpleRSA.generateKeys(1024);


// // const message = "Hello!";
// // console.log("Created Public key:",publicKey);
// // console.log("Created Private key:",publicKey);

// // const encrypted = SimpleRSA.encrypt(message, publicKey);
// // const decrypted = SimpleRSA.decrypt(encrypted, privateKey);

// // console.log("Encrypted:", encrypted);
// // console.log("Decrypted:", decrypted); // ✅ should be "Hello!"
// const sPublicKey = stringifyBigInt(publicKey);

// const body = {
//   username: "riyajbhaffff",
//   password: "123",
//   publicKey: sPublicKey
// };

// fetch("http://localhost:5001/register", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify(body)
// })
// .then(res => res.json())
// .then(data => {
//     console.log(data);
//     const {publicKey} = data.user;
//     console.log("Fine");
//     const publicKeyFromServer = parseBigInt(publicKey);
//     console.log("Fine1");
//     const message = "9144d49531571e807c97464c1305f504f4240a12df7e77a051c86e8f659dc835";
//     const encrypted = SimpleRSA.encrypt(message, publicKeyFromServer);
//     console.log("Encrypted message:", encrypted);

//     console.log("Decrypted message:", SimpleRSA.decrypt(encrypted,privateKey));
    
// })
// .catch(err => console.error("Error:", err));


// Send to backend
// Fetch the stored public key for a user
// fetch("http://localhost:5001/api/user/riyaj1235522/key")
//     .then(res => res.json())
//     .then(data => {
//         // data.publicKey is a string
//         console.log("Raw public key string from server:", data.publicKey);

//         // Parse string back to object with BigInt
//         const publicKey1 = parseBigInt(data.publicKey);

//         console.log("Parsed Public Key:", publicKey1);

//         // Now you can use it for encryption
//         // Example:
//         const message = "Hello!";
//         const encrypted = SimpleRSA.encrypt(message, publicKey1);
//         console.log("Encrypted message:", encrypted);

//         console.log("Decrypted message:", SimpleRSA.decrypt(encrypted,privateKey));
//     })
//     .catch(err => console.error(err));
