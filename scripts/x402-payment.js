/**
 * x402 Payment Client for VOISSS Integration
 * 
 * x402 is a protocol for internet-native payments using ERC-3009
 */

const { ethers } = require('ethers')

class X402Payment {
  constructor(config) {
    this.paymasterAddress = config.paymasterAddress || '0xA6a8736f18f383f1cc2d938576933E5eA7Df01A1'
    this.chainId = config.chainId || 8453 // Base mainnet
    this.provider = config.provider
    this.wallet = config.wallet
  }
  
  /**
   * Create ERC-3009 transfer authorization
   */
  async createAuthorization(to, value, validAfter = 0, validUntil = 0) {
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: this.chainId,
      verifyingContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base USDC
    }
    
    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validUntil', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
        { name: 'creator', type: 'address' },
        { name: 'sigExpiry', type: 'uint256' }
      ]
    }
    
    const nonce = ethers.randomBytes(32)
    const now = Math.floor(Date.now() / 1000)
    
    const valueUSDC = ethers.parseUnits(value.toString(), 6)
    
    const message = {
      from: this.wallet.address,
      to,
      value: valueUSDC,
      validAfter: validAfter || now,
      validUntil: validUntil || (now + 3600),
      nonce,
      creator: this.wallet.address,
      sigExpiry: now + 86400 // 24 hours
    }
    
    const signature = await this.wallet.signTypedData(domain, types, message)
    
    return {
      ...message,
      signature,
      domain
    }
  }
  
  /**
   * Encode authorization for x402 header
   */
  encodePaymentHeader(auth) {
    // x402 expects base64 encoded authorization
    const data = JSON.stringify({
      domain: auth.domain,
      types: {
        TransferWithAuthorization: auth.domain.name === 'USDC' ? [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validUntil', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
          { name: 'creator', type: 'address' },
          { name: 'sigExpiry', type: 'uint256' }
        ] : []
      },
      primaryType: 'TransferWithAuthorization',
      message: {
        from: auth.from,
        to: auth.to,
        value: auth.value.toString(),
        validAfter: auth.validAfter.toString(),
        validUntil: auth.validUntil.toString(),
        nonce: '0x' + Buffer.from(auth.nonce).toString('hex'),
        creator: auth.creator,
        sigExpiry: auth.sigExpiry.toString()
      },
      signature: auth.signature
    })
    
    return Buffer.from(data).toString('base64')
  }
}

module.exports = X402Payment
