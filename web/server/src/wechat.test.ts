import assert from 'node:assert/strict'
import test from 'node:test'
import { createJsapiSignature } from './wechat.js'

test('creates the documented SHA-1 signature from canonical fields', () => {
  const signature = createJsapiSignature({
    ticket: 'ticket',
    nonceStr: 'nonce',
    timestamp: 1_234_567_890,
    url: 'https://wedding.nczkevin.com/',
  })

  assert.equal(signature, 'd31a91527175ae665dae857142809d663b8cdc2e')
})
