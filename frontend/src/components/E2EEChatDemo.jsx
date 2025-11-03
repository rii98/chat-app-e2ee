import React, { useState, useEffect, useRef } from 'react';
import SimpleRSA from '../lib/rsa';
import AESUtil from '../lib/aes';

const E2EEChatDemo = () => {
  // State management
  const [rsaKeys, setRsaKeys] = useState({ publicKey: null, privateKey: null });
  const [aesKey, setAesKey] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [encryptedAesKey, setEncryptedAesKey] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [processLog, setProcessLog] = useState([]);
  const [keySize, setKeySize] = useState(1024);
  const [messageInput, setMessageInput] = useState('Hello, secure world! 🔒');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [userAccount, setUserAccount] = useState(null);
  const [decryptionSteps, setDecryptionSteps] = useState({
    step1: false,
    step2: false,
    step3: false
  });
  
  const logContainerRef = useRef(null);

  // Log function with structured entries
  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      type,
      message,
      icon: getLogIcon(type)
    };
    
    setProcessLog(prev => [logEntry, ...prev]);
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'security': return '🔐';
      case 'key': return '🔑';
      case 'message': return '📨';
      case 'decrypt': return '🔓';
      default: return '📝';
    }
  };

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [processLog]);

  // Initialize component
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    addLog('info', 'Initializing E2EE Chat Demo...');
    // await generateRSAKeys();
    addLog('success', 'Ready to demonstrate secure messaging!');
  };

  // Step 1: Create User Account with RSA Keys
  const createUserAccount = async () => {
    setIsGenerating(true);
    setActiveStep(1);
    
    try {
      addLog('info', 'Generating RSA key pair...');
      const keys = SimpleRSA.generateKeys(keySize);
      setRsaKeys(keys);
      
      const userData = {
        username: `user_${Math.random().toString(36).substr(2, 5)}`,
        publicKey: keys.publicKey
      };
      
      localStorage.setItem('userPrivateKey', JSON.stringify(SimpleRSA.stringifyBigInt(keys.privateKey)));
      setUserAccount(userData);
      
      addLog('success', `Account created: ${userData.username}`);
      addLog('security', 'Private key securely stored in browser storage');
      addLog('security', 'Public key registered with server');
      
      await generateAESKey();
      
    } catch (error) {
      addLog('error', `Failed to create account: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AES Key
  const generateAESKey = async () => {
    try {
      const key = await AESUtil.generateKey();
      setAesKey(key);
      addLog('key', 'Generated new AES session key');
      return key;
    } catch (error) {
      addLog('error', `Failed to generate AES key: ${error.message}`);
      throw error;
    }
  };

  // Step 2: Send Encrypted Message
  const sendEncryptedMessage = async () => {
    if (!messageInput.trim()) {
      addLog('warning', 'Please enter a message to encrypt');
      return;
    }
    
    if (!rsaKeys?.publicKey) {
      addLog('warning', 'Please create an account first');
      return;
    }
    
    setActiveStep(2);
    setDecryptionSteps({ step1: false, step2: false, step3: false });
    
    try {
      addLog('info', 'Starting encryption process...');
      const sessionAesKey = await generateAESKey();
      
      addLog('security', 'Encrypting message with AES...');
      const encryptedMsg = await AESUtil.encrypt(messageInput, sessionAesKey);
      setEncryptedMessage(encryptedMsg);
      
      addLog('security', 'Encrypting AES key with RSA...');
      const encryptedAes = SimpleRSA.encrypt(sessionAesKey, rsaKeys.publicKey);
      setEncryptedAesKey(encryptedAes);
      
      addLog('success', 'Message encryption completed');
      addLog('message', 'Secure package ready for transmission');
      
    } catch (error) {
      addLog('error', `Encryption failed: ${error.message}`);
    }
  };

  // Step 3: Receive and Decrypt Message
  const receiveAndDecryptMessage = async () => {
    if (!encryptedAesKey || !encryptedMessage) {
      addLog('warning', 'Please send an encrypted message first');
      return;
    }
    
    setActiveStep(3);
    setDecryptionSteps({ step1: false, step2: false, step3: false });
    
    try {
      addLog('info', 'Starting decryption process...');
      
      // Step 3.1: Retrieve private key
      addLog('decrypt', 'Step 1: Retrieving private key from secure storage...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const storedPrivateKey = localStorage.getItem('userPrivateKey');
      if (!storedPrivateKey || !rsaKeys?.privateKey) {
        throw new Error('Private key not found');
      }
      setDecryptionSteps(prev => ({ ...prev, step1: true }));
      addLog('success', '✅ Private key retrieved from localStorage');
      
      // Step 3.2: Decrypt AES key with private key
      addLog('decrypt', 'Step 2: Decrypting AES key using RSA private key...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      const decryptedAesKey = SimpleRSA.decrypt(encryptedAesKey, rsaKeys.privateKey);
      setDecryptionSteps(prev => ({ ...prev, step2: true }));
      addLog('success', '✅ AES key successfully decrypted');
      addLog('key', `Decrypted AES Key: ${decryptedAesKey.substring(0, 20)}...`);
      
      // Step 3.3: Decrypt message with AES key
      addLog('decrypt', 'Step 3: Decrypting message using the AES key...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const decryptedMsg = await AESUtil.decrypt(encryptedMessage, decryptedAesKey);
      setDecryptedMessage(decryptedMsg);
      setDecryptionSteps(prev => ({ ...prev, step3: true }));
      addLog('success', '✅ Message successfully decrypted with AES');
      
      addLog('success', `📬 Decrypted message: "${decryptedMsg}"`);
      addLog('success', '🎉 End-to-end encryption successful!');
      
    } catch (error) {
      addLog('error', `Decryption failed: ${error.message}`);
    }
  };

  // Reset demo
  const resetDemo = () => {
    setRsaKeys({ publicKey: null, privateKey: null });
    setAesKey('');
    setEncryptedMessage('');
    setEncryptedAesKey('');
    setDecryptedMessage('');
    setProcessLog([]);
    setUserAccount(null);
    setActiveStep(0);
    setDecryptionSteps({ step1: false, step2: false, step3: false });
    localStorage.removeItem('userPrivateKey');
    addLog('info', 'Demo reset - ready to start over!');
  };

  // Format key for display
  const formatKey = (key, type) => {
    if (!key) return 'Not generated';
    
    if (type === 'public') {
      return `e: ${key.e?.toString(16).substring(0, 15)}..., n: ${key.n?.toString(16).substring(0, 15)}...`;
    } else {
      return `d: ${key.d?.toString(16).substring(0, 15)}..., n: ${key.n?.toString(16).substring(0, 15)}...`;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'security': return 'text-purple-400';
      case 'key': return 'text-cyan-400';
      case 'message': return 'text-orange-400';
      case 'decrypt': return 'text-teal-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 pt-16 font-sans">
      <div className="max-w-7xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🔒 E2EE Secure Chat
          </h1>
          <p className="text-xl text-gray-300 mb-2">End-to-End Encryption in Action</p>
          <p className="text-gray-400">RSA for key exchange + AES for message encryption</p>
        </header>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-6 left-20 right-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-0" />
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                activeStep >= step 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-700 border border-gray-600'
              }`}>
                {step}
              </div>
              <div className={`mt-3 text-sm font-medium transition-colors ${
                activeStep >= step ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {step === 1 && 'Create Account'}
                {step === 2 && 'Send Message'}
                {step === 3 && 'Receive & Decrypt'}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Process Flow */}
          <div className="space-y-6">
            
            {/* Step 1: Account Creation */}
            <div className={`bg-gray-900/50 rounded-xl p-6 border-2 transition-all duration-300 ${
              activeStep >= 1 ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-700'
            }`}>
              <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Step 1: Create Secure Account
              </h3>
              
              {!userAccount ? (
                <div>
                  <p className="text-gray-300 mb-4">
                    Generate your unique RSA key pair for secure communication
                  </p>
                  
                  {/* <div className="flex items-center mb-4">
                    <label className="text-gray-400 min-w-32">Key Strength:</label>
                    <select 
                      value={keySize}
                      onChange={(e) => setKeySize(Number(e.target.value))}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="512">512 bits (Fast)</option>
                      <option value="1024">1024 bits (Recommended)</option>
                      <option value="2048">2048 bits (Maximum Security)</option>
                    </select>
                  </div> */}

<div className="space-y-2 mb-4">
  <label className="text-gray-400 block">Key Strength:</label>
  <select 
    value={keySize}
    onChange={(e) => setKeySize(Number(e.target.value))}
    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
  >
    <option value="512">512 bits (Fast)</option>
    <option value="1024">1024 bits (Recommended)</option>
    <option value="2048">2048 bits (Maximum Security)</option>
  </select>
</div>
                  
                  <button 
                    onClick={createUserAccount}
                    disabled={isGenerating}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      isGenerating 
                        ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transform hover:scale-105'
                    }`}
                  >
                    {isGenerating ? '🔄 Creating Secure Account...' : '🔐 Create Secure Account'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <strong className="text-blue-400">✅ Account Created: {userAccount.username}</strong>
                  </div>
                  
                  <div>
                    <div className="text-blue-400 text-sm mb-2 flex items-center gap-2">
                      <span>🔑</span>
                      Your Public Key (Stored on Server):
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-sm font-mono break-all border border-gray-700">
                      {formatKey(rsaKeys?.publicKey, 'public')}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-red-400 text-sm mb-2 flex items-center gap-2">
                      <span>🔒</span>
                      Your Private Key (Local Storage Only):
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3 text-sm font-mono break-all border border-red-500/30">
                      {formatKey(rsaKeys?.privateKey, 'private')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Send Message */}
            <div className={`bg-gray-900/50 rounded-xl p-6 border-2 transition-all duration-300 ${
              activeStep >= 2 ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-gray-700'
            }`}>
              <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">📨</span>
                Step 2: Send Encrypted Message
              </h3>
              
              <div className="mb-4">
                <textarea 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 resize-none min-h-24"
                  placeholder="Type your secret message here..."
                />
              </div>
              
              <button 
                onClick={sendEncryptedMessage}
                disabled={!userAccount}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  !userAccount 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transform hover:scale-105'
                }`}
              >
                {userAccount ? '🔒 Encrypt & Send Message' : 'Create Account First'}
              </button>
              
              {encryptedMessage && (
                <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400 text-sm mb-2 flex items-center gap-2">
                    <span>📦</span>
                    Encrypted Package:
                  </div>
                  <div className="space-y-2 text-xs font-mono">
  <div className="bg-gray-800 rounded-lg p-2">
    <div className="text-orange-300">AES Key (RSA Encrypted):</div>
    <div className="text-gray-400 break-all">
      <span className="hidden sm:inline">{encryptedAesKey.substring(0, 50)}...</span>
      <span className="sm:hidden">{encryptedAesKey.substring(0, 25)}...</span>
    </div>
  </div>
  <div className="bg-gray-800 rounded-lg p-2">
    <div className="text-orange-300">Message (AES Encrypted):</div>
    <div className="text-gray-400 break-all">
      <span className="hidden sm:inline">{encryptedMessage.substring(0, 50)}...</span>
      <span className="sm:hidden">{encryptedMessage.substring(0, 25)}...</span>
    </div>
  </div>
</div>
                </div>
              )}
            </div>

            {/* Step 3: Receive Message - Enhanced Decryption Section */}
            <div className={`bg-gray-900/50 rounded-xl p-6 border-2 transition-all duration-300 ${
              activeStep >= 3 ? 'border-green-500 shadow-lg shadow-green-500/10' : 'border-gray-700'
            }`}>
              <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">📬</span>
                Step 3: Receive & Decrypt Message
              </h3>
              
              {/* Decryption Process Steps */}
              <div className="mb-6 space-y-4">
                <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  decryptionSteps.step1 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      decryptionSteps.step1 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      1
                    </div>
                    <span className="font-semibold text-teal-400">Retrieve Private Key</span>
                  </div>
                  <p className="text-sm text-gray-300 ml-11">
                    Access your private RSA key from secure local storage
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  decryptionSteps.step2 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      decryptionSteps.step2 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className="font-semibold text-teal-400">Decrypt AES Key</span>
                  </div>
                  <p className="text-sm text-gray-300 ml-11">
                    Use your private key to decrypt the AES session key
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  decryptionSteps.step3 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      decryptionSteps.step3 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      3
                    </div>
                    <span className="font-semibold text-teal-400">Decrypt Message</span>
                  </div>
                  <p className="text-sm text-gray-300 ml-11">
                    Use the decrypted AES key to decrypt the original message
                  </p>
                </div>
              </div>
              
              <button 
                onClick={receiveAndDecryptMessage}
                disabled={!encryptedMessage}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  !encryptedMessage 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 transform hover:scale-105'
                }`}
              >
                {encryptedMessage ? '🔓 Start Decryption Process' : 'Send Message First'}
              </button>
              
              {decryptedMessage && (
                <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <span>✅</span>
                    Successfully Decrypted Message:
                  </div>
                  <div className="text-white text-lg bg-gray-800 rounded-lg p-4 border border-green-500/30">
                    "{decryptedMessage}"
                  </div>
                  <div className="mt-3 p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
                    <div className="text-teal-400 text-sm font-semibold mb-1">🔐 Decryption Complete</div>
                    <div className="text-gray-300 text-xs">
                      The message was successfully decrypted using your private key and the AES session key.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visualization & Logs */}
          <div className="space-y-6">
            
            {/* Security Visualization */}
            <div className="bg-gray-900/50 rounded-xl p-6 h-80">
              <h3 className="text-xl font-semibold text-purple-400 mb-6 flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                Security Flow
              </h3>
              
              <div className="flex justify-between items-center h-48 relative">
                {/* Sender */}
                <div className="text-center z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-blue-500/25 mx-auto mb-2">
                    👤
                  </div>
                  <div className="text-sm">Sender</div>
                  <div className="text-xs text-blue-400">Uses Receiver's Public Key</div>
                </div>

                {/* Encryption Process */}
                <div className="text-center z-10">
                  <div className="w-16 h-16 bg-orange-500/20 border-2 border-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                    🔒
                  </div>
                  <div className="text-xs">Encrypts with</div>
                  <div className="text-xs text-orange-400">AES + RSA</div>
                </div>

                {/* Secure Transmission Line */}
                <div className="absolute left-20 right-20 top-10 h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-green-500 z-0" />

                {/* Receiver */}
                <div className="text-center z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-green-500/25 mx-auto mb-2">
                    👤
                  </div>
                  <div className="text-sm">Receiver</div>
                  <div className="text-xs text-green-400">Uses Private Key to Decrypt</div>
                </div>
              </div>

              {/* Enhanced Decryption Explanation */}
              <div className="mt-4 p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
                <div className="text-teal-400 text-sm font-semibold mb-1">🔓 How Decryption Works:</div>
                <div className="text-gray-300 text-xs space-y-1">
                  <div>1. <strong>Private Key Access:</strong> Only you can access your private key</div>
                  <div>2. <strong>AES Key Recovery:</strong> Private key decrypts the session key</div>
                  <div>3. <strong>Message Decryption:</strong> Session key decrypts the message</div>
                </div>
              </div>
            </div>

            {/* Process Log */}
            <div className="bg-gray-900/50 rounded-xl p-6 flex flex-col h-96">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2 mt-20 sm:mt-10">
                <span className="text-2xl">📋</span>
                Security Log
              </h3>
              
              <div 
                ref={logContainerRef}
                className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-2"
              >
                {processLog.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Waiting for actions...</div>
                ) : (
                  processLog.map((log) => (
                    <div 
                      key={log.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        log.type === 'success' ? 'border-l-green-500 bg-green-500/5' :
                        log.type === 'error' ? 'border-l-red-500 bg-red-500/5' :
                        log.type === 'warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
                        log.type === 'security' ? 'border-l-purple-500 bg-purple-500/5' :
                        log.type === 'decrypt' ? 'border-l-teal-500 bg-teal-500/5' :
                        'border-l-blue-500 bg-blue-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">{log.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${getLogColor(log.type)}`}>
                              {log.message}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {log.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={resetDemo}
                  className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                >
                  🔄 Reset Demo
                </button>
                
                <button 
                  onClick={() => setProcessLog([])}
                  className="flex-1 py-3 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  🧹 Clear Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p className="font-semibold">🔐 End-to-End Encryption Demo</p>
          <p>Your private keys never leave your device. Only encrypted data is transmitted.</p>
        </div>
      </div>
    </div>
  );
};

export default E2EEChatDemo;